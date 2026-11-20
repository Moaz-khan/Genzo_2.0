import pool from '../config/db.js';

function generateOrderNumber() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `GZ-2026-${random}`;
}

/**
 * POST /api/v1/orders
 * Place a new checkout order
 */
export const createOrder = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      fullName,
      email,
      phone,
      streetAddress,
      city,
      postalCode,
      deliveryNotes,
      paymentMethod = 'card',
      couponCode,
      items, // optional if cart in DB or passed directly
    } = req.body;

    if (!fullName || !email || !phone || !streetAddress || !city || !postalCode) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'All contact and delivery address fields are required.',
      });
    }

    let lineItems = [];

    // If items provided in request body, use them; otherwise pull from user/session cart in DB
    if (items && Array.isArray(items) && items.length > 0) {
      lineItems = items;
    } else {
      const ownerClause = req.user ? 'ci.user_id = ?' : 'ci.session_id = ?';
      const ownerParam = req.user ? req.user.id : (req.sessionId || 'guest-session-default');

      const [cartRows] = await connection.query(
        `SELECT ci.product_id, ci.size, ci.quantity, p.name, p.price,
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
         FROM cart_items ci
         INNER JOIN products p ON ci.product_id = p.id
         WHERE ${ownerClause}`,
        [ownerParam]
      );
      lineItems = cartRows;
    }

    if (lineItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Your shopping bag is empty. Add pieces before checking out.',
      });
    }

    // Calculate subtotal
    let subtotal = 0;
    const verifiedOrderItems = [];

    for (const item of lineItems) {
      const [prodRows] = await connection.query(
        `SELECT p.id, p.name, p.price,
          COALESCE(
            (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
            ''
          ) as image
         FROM products p WHERE p.id = ?`,
        [item.productId || item.product_id || item.id]
      );

      if (prodRows.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Product ID ${item.productId || item.id} no longer exists.`,
        });
      }

      const prod = prodRows[0];
      const qty = Math.max(1, Number(item.quantity) || 1);
      const price = Number(prod.price);
      const lineTotal = price * qty;
      subtotal += lineTotal;

      verifiedOrderItems.push({
        productId: prod.id,
        name: prod.name,
        price,
        image: prod.image || item.image || '',
        size: item.size || 'One size',
        quantity: qty,
        lineTotal,
      });
    }

    // Handle coupon code discount verification
    let discountAmount = 0;
    let verifiedCoupon = null;
    if (couponCode && typeof couponCode === 'string') {
      const [couponRows] = await connection.query(
        'SELECT * FROM coupons WHERE code = ? AND is_active = TRUE',
        [couponCode.toUpperCase().trim()]
      );
      if (couponRows.length > 0) {
        const c = couponRows[0];
        if (!c.expires_at || new Date(c.expires_at) >= new Date()) {
          if (subtotal >= Number(c.min_order_amount)) {
            if (c.discount_type === 'percent') {
              discountAmount = (subtotal * Number(c.discount_value)) / 100;
              if (c.max_discount && discountAmount > Number(c.max_discount)) {
                discountAmount = Number(c.max_discount);
              }
            } else {
              discountAmount = Number(c.discount_value);
            }
            discountAmount = Math.min(discountAmount, subtotal);
            verifiedCoupon = c.code;
            await connection.query('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?', [c.id]);
          }
        }
      }
    }

    // Shipping rules: free if effective subtotal >= 25,000 PKR, else 450 PKR
    const effectiveSubtotal = Math.max(0, subtotal - discountAmount);
    const shippingFee = effectiveSubtotal >= 25000 ? 0 : 450;
    const totalAmount = effectiveSubtotal + shippingFee;
    const orderNumber = generateOrderNumber();
    const userId = req.user ? req.user.id : null;

    // Create Order Record
    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        order_number, user_id, customer_name, customer_phone, customer_email,
        street_address, city, postal_code, delivery_notes, payment_method,
        coupon_code, discount_amount,
        payment_status, subtotal, shipping_fee, total_amount, order_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        fullName.trim(),
        phone.trim(),
        email.toLowerCase().trim(),
        streetAddress.trim(),
        city.trim(),
        postalCode.trim(),
        deliveryNotes ? deliveryNotes.trim() : null,
        paymentMethod,
        verifiedCoupon,
        discountAmount,
        subtotal,
        shippingFee,
        totalAmount,
        paymentMethod === 'cod' ? 'confirmed' : 'pending_verification',
      ]
    );

    const orderId = orderResult.insertId;

    // Insert Order Line Items
    for (const line of verifiedOrderItems) {
      await connection.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_price, product_image,
          size, quantity, line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          line.productId,
          line.name,
          line.price,
          line.image,
          line.size,
          line.quantity,
          line.lineTotal,
        ]
      );
    }

    // Clear cart if user/session was saved
    if (req.user) {
      await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    } else if (req.sessionId) {
      await connection.query('DELETE FROM cart_items WHERE session_id = ?', [req.sessionId]);
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: paymentMethod === 'cod'
        ? 'Cash on Delivery order confirmed! Dispatched within 24–48 hours.'
        : 'Order created successfully. Awaiting payment verification.',
      data: {
        orderId,
        orderNumber,
        subtotal,
        discountAmount,
        couponCode: verifiedCoupon,
        shippingFee,
        totalAmount,
        currency: 'PKR',
        paymentMethod,
        orderStatus: paymentMethod === 'cod' ? 'confirmed' : 'pending_verification',
        paymentStatus: 'pending',
        items: verifiedOrderItems,
        customerName: fullName.trim(),
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * POST /api/v1/orders/:orderId/receipt
 * Attach payment receipt file to order
 */
export const uploadPaymentReceipt = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No receipt file provided. Please upload a PNG, JPG, or PDF file.',
      });
    }

    const receiptUrl = `/uploads/receipts/${req.file.filename}`;

    const [result] = await pool.query(
      `UPDATE orders 
       SET receipt_url = ?, order_status = 'pending_verification' 
       WHERE id = ? OR order_number = ?`,
      [receiptUrl, orderId, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({
      success: true,
      message: 'Payment receipt uploaded successfully. Our team will verify your transfer shortly.',
      receiptUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/track
 * Client care order tracking by order number & phone or email
 */
export const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber, phone, email } = req.query;

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your order number (e.g. GZ-2026-1234).',
      });
    }

    let query = `
      SELECT 
        o.id,
        o.order_number AS orderNumber,
        o.customer_name AS customerName,
        o.customer_email AS customerEmail,
        o.customer_phone AS customerPhone,
        o.street_address AS streetAddress,
        o.city,
        o.postal_code AS postalCode,
        o.payment_method AS paymentMethod,
        o.payment_status AS paymentStatus,
        o.order_status AS orderStatus,
        o.tracking_code AS trackingCode,
        o.subtotal,
        o.discount_amount AS discountAmount,
        o.shipping_fee AS shippingFee,
        o.total_amount AS totalAmount,
        o.created_at AS createdAt
      FROM orders o
      WHERE o.order_number = ?
    `;

    const params = [orderNumber.trim()];

    if (phone) {
      query += ` AND o.customer_phone LIKE ?`;
      params.push(`%${phone.trim()}%`);
    } else if (email) {
      query += ` AND o.customer_email = ?`;
      params.push(email.trim().toLowerCase());
    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching order found. Please verify your order number and contact details.',
      });
    }

    const order = rows[0];

    const [items] = await pool.query(
      `SELECT product_name AS name, product_price AS price, product_image AS image,
              size, quantity, line_total AS lineTotal
       FROM order_items WHERE order_id = ?`,
      [order.id]
    );

    res.json({
      success: true,
      data: {
        ...order,
        subtotal: Number(order.subtotal || order.totalAmount),
        discountAmount: Number(order.discountAmount || 0),
        shippingFee: Number(order.shippingFee || 0),
        totalAmount: Number(order.totalAmount),
        items: items.map((i) => ({ ...i, price: Number(i.price), lineTotal: Number(i.lineTotal) })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/my-orders
 * List orders for logged-in customer with line items
 */
export const getMyOrders = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const [orders] = await pool.query(
      `SELECT id, order_number AS orderNumber, total_amount AS totalAmount,
              subtotal, discount_amount AS discountAmount, shipping_fee AS shippingFee,
              payment_method AS paymentMethod, order_status AS orderStatus,
              payment_status AS paymentStatus, tracking_code AS trackingCode,
              street_address AS streetAddress, city, created_at AS createdAt
       FROM orders
       WHERE user_id = ?
       ORDER BY id DESC`,
      [req.user.id]
    );

    // Fetch items for each order
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT product_name AS name, product_price AS price, product_image AS image,
                size, quantity, line_total AS lineTotal
         FROM order_items WHERE order_id = ?`,
        [order.id]
      );
      order.items = items.map((i) => ({ ...i, price: Number(i.price), lineTotal: Number(i.lineTotal) }));
      order.totalAmount = Number(order.totalAmount);
    }

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};
