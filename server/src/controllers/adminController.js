import pool from '../config/db.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * GET /api/v1/admin/stats
 * Dashboard metrics
 */
export const getStats = async (req, res, next) => {
  try {
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ totalRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue 
       FROM orders 
       WHERE payment_status = 'verified' OR order_status IN ('confirmed', 'processing', 'dispatched', 'delivered')`
    );
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products');
    const [[{ totalCustomers }]] = await pool.query(
      "SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'customer'"
    );
    const [[{ pendingOrders }]] = await pool.query(
      "SELECT COUNT(*) AS pendingOrders FROM orders WHERE order_status = 'pending_verification'"
    );
    const [[{ completedOrders }]] = await pool.query(
      "SELECT COUNT(*) AS completedOrders FROM orders WHERE order_status = 'delivered'"
    );
    const [[{ lowStockProducts }]] = await pool.query(
      `SELECT COUNT(*) AS lowStockProducts
       FROM products p
       WHERE COALESCE(
         (SELECT SUM(ps.stock_quantity) FROM product_sizes ps WHERE ps.product_id = p.id),
         p.stock_quantity
       ) <= 5`
    );

    // Recent 5 orders
    const [recentOrders] = await pool.query(
      `SELECT id, order_number AS orderNumber, customer_name AS customerName, customer_phone AS customerPhone,
              total_amount AS totalAmount, payment_method AS paymentMethod, payment_status AS paymentStatus,
              order_status AS orderStatus, created_at AS createdAt
       FROM orders 
       ORDER BY id DESC LIMIT 6`
    );

    // Status breakdown
    const [statusBreakdown] = await pool.query(
      `SELECT order_status AS status, COUNT(*) AS count FROM orders GROUP BY order_status`
    );

    // Weekly sales (last 7 days) — real data from DB
    const [weeklySales] = await pool.query(
      `SELECT 
         DATE(created_at) AS day,
         DAYNAME(created_at) AS dayName,
         COUNT(*) AS orderCount,
         COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(created_at), DAYNAME(created_at)
       ORDER BY day ASC`
    );

    // Build a full 7-day array (fill gaps with 0)
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const shortDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date();
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayIdx = d.getDay();
      const found = weeklySales.find(r => {
        const rStr = new Date(r.day).toISOString().split('T')[0];
        return rStr === dateStr;
      });
      weekData.push({
        day: shortDays[dayIdx],
        date: dateStr,
        orderCount: found ? Number(found.orderCount) : 0,
        revenue: found ? Number(found.revenue) : 0,
      });
    }

    // Top-selling products (by order_items quantity)
    const [topProducts] = await pool.query(
      `SELECT 
         oi.product_name AS name,
         SUM(oi.quantity) AS sold,
         oi.product_price AS price
       FROM order_items oi
       GROUP BY oi.product_name, oi.product_price
       ORDER BY sold DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        totalOrders: Number(totalOrders || 0),
        totalRevenue: Number(totalRevenue || 0),
        totalProducts: Number(totalProducts || 0),
        totalCustomers: Number(totalCustomers || 0),
        pendingOrders: Number(pendingOrders || 0),
        completedOrders: Number(completedOrders || 0),
        lowStockProducts: Number(lowStockProducts || 0),
        recentOrders: recentOrders.map((o) => ({ ...o, totalAmount: Number(o.totalAmount) })),
        statusBreakdown: statusBreakdown.reduce((acc, curr) => ({ ...acc, [curr.status]: curr.count }), {}),
        weeklySales: weekData,
        topProducts: topProducts.map(p => ({
          name: p.name,
          category: 'Silver Piece',
          sold: Number(p.sold),
          price: Number(p.price),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/orders
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT 
        o.id,
        o.order_number AS orderNumber,
        o.customer_name AS customerName,
        o.customer_email AS customerEmail,
        o.customer_phone AS customerPhone,
        o.city,
        o.street_address AS streetAddress,
        o.postal_code AS postalCode,
        o.delivery_notes AS deliveryNotes,
        o.payment_method AS paymentMethod,
        o.payment_status AS paymentStatus,
        o.receipt_url AS receiptUrl,
        o.subtotal,
        o.shipping_fee AS shippingFee,
        o.total_amount AS totalAmount,
        o.order_status AS orderStatus,
        o.tracking_code AS trackingCode,
        o.created_at AS createdAt
      FROM orders o
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND o.order_status = ?`;
      params.push(status);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query += ` AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ? OR o.customer_email LIKE ?)`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY o.id DESC`;

    const [orders] = await pool.query(query, params);

    // Fetch items for each order
    const orderIds = orders.map((o) => o.id);
    let itemsMap = {};
    if (orderIds.length > 0) {
      const [items] = await pool.query(
        `SELECT order_id, product_name, product_price, product_image, size, quantity, line_total 
         FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
      );
      items.forEach((item) => {
        if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
        itemsMap[item.order_id].push({
          name: item.product_name,
          price: Number(item.product_price),
          image: item.product_image,
          size: item.size,
          quantity: item.quantity,
          lineTotal: Number(item.line_total),
        });
      });
    }

    // Fetch status counts across all orders for badge counts and overview
    const [statusRows] = await pool.query(
      `SELECT order_status AS status, COUNT(*) AS count FROM orders GROUP BY order_status`
    );
    const statusCounts = {
      all: 0,
      pending_verification: 0,
      confirmed: 0,
      processing: 0,
      dispatched: 0,
      delivered: 0,
      cancelled: 0,
    };
    let totalAll = 0;
    statusRows.forEach((r) => {
      statusCounts[r.status] = Number(r.count);
      totalAll += Number(r.count);
    });
    statusCounts.all = totalAll;

    const [[{ totalVolume }]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS totalVolume FROM orders`
    );

    res.json({
      success: true,
      count: orders.length,
      totalAll,
      totalVolume: Number(totalVolume || 0),
      statusCounts,
      data: orders.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal),
        shippingFee: Number(o.shippingFee),
        totalAmount: Number(o.totalAmount),
        items: itemsMap[o.id] || [],
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/orders/:id
 */
export const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, trackingCode } = req.body;

    const updates = [];
    const params = [];

    if (orderStatus !== undefined) {
      updates.push('order_status = ?');
      params.push(orderStatus);
    }
    if (paymentStatus !== undefined) {
      updates.push('payment_status = ?');
      params.push(paymentStatus);
    }
    if (trackingCode !== undefined) {
      updates.push('tracking_code = ?');
      params.push(trackingCode);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No update fields provided.' });
    }

    params.push(id);
    await pool.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, params);

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Order updated successfully.',
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/orders/:id
 */
export const deleteOrder = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    await connection.query('DELETE FROM order_items WHERE order_id = ?', [id]);
    const [result] = await connection.query('DELETE FROM orders WHERE id = ?', [id]);
    await connection.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully.',
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * POST /api/v1/admin/products
 */
export const createProduct = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name,
      category,
      categoryId: catIdInput,
      type,
      typeId: typeIdInput,
      finish,
      finishId: finishIdInput,
      price,
      badge,
      description,
      inStock = true,
      stockQuantity = 50,
      isFeatured = false,
      purity = '925 Sterling Silver',
      warrantyPeriod = 'One-Year Care Warranty',
      image,
      gallery = [],
      sizes = ['One size'],
    } = req.body;

    if (!name || price === undefined) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Name and price are required.',
      });
    }

    // Lookup or validate Category ID
    let categoryId = catIdInput;
    if (!categoryId && category) {
      if (typeof category === 'number' || /^\d+$/.test(category)) {
        categoryId = Number(category);
      } else {
        const [cats] = await connection.query('SELECT id FROM categories WHERE name = ?', [category]);
        if (cats.length > 0) categoryId = cats[0].id;
      }
    }
    if (!categoryId) {
      const [defaultCats] = await connection.query('SELECT id FROM categories LIMIT 1');
      categoryId = defaultCats[0]?.id || 1;
    }

    // Lookup or validate Type ID
    let typeId = typeIdInput;
    if (!typeId && type) {
      if (typeof type === 'number' || /^\d+$/.test(type)) {
        typeId = Number(type);
      } else {
        const [types] = await connection.query('SELECT id FROM product_types WHERE name = ?', [type]);
        if (types.length > 0) typeId = types[0].id;
      }
    }
    if (!typeId) {
      const [defaultTypes] = await connection.query('SELECT id FROM product_types LIMIT 1');
      typeId = defaultTypes[0]?.id || 1;
    }

    // Lookup or validate Finish ID
    let finishId = finishIdInput;
    if (!finishId && finish) {
      if (typeof finish === 'number' || /^\d+$/.test(finish)) {
        finishId = Number(finish);
      } else {
        const [finishes] = await connection.query('SELECT id FROM product_finishes WHERE name = ?', [finish]);
        if (finishes.length > 0) finishId = finishes[0].id;
      }
    }
    if (!finishId) {
      const [defaultFinishes] = await connection.query('SELECT id FROM product_finishes LIMIT 1');
      finishId = defaultFinishes[0]?.id || 1;
    }

    let baseSlug = slugify(name);
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (true) {
      const [existing] = await connection.query('SELECT id FROM products WHERE slug = ?', [uniqueSlug]);
      if (existing.length === 0) break;
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    const cleanBadge = badge && badge !== '' && badge !== 'None' && badge !== 'none' ? badge : null;

    const [prodResult] = await connection.query(
      `INSERT INTO products (name, slug, category_id, type_id, finish_id, price, badge, description, in_stock, stock_quantity, is_featured, purity, warranty_period)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        uniqueSlug,
        categoryId,
        typeId,
        finishId,
        Number(price),
        cleanBadge,
        description || '',
        inStock ? 1 : 0,
        Number(stockQuantity) || 50,
        isFeatured ? 1 : 0,
        purity || '925 Sterling Silver',
        warrantyPeriod || 'One-Year Care Warranty',
      ]
    );

    const productId = prodResult.insertId;

    // Collect all image URLs
    let imgList = [];
    if (Array.isArray(gallery) && gallery.length > 0) {
      imgList = [...gallery.filter(Boolean)];
      if (image && !imgList.includes(image)) {
        imgList.unshift(image);
      }
    } else if (image) {
      imgList = [image];
    } else {
      imgList = ['https://images.unsplash.com/photo-1656010280162-772358d9f4ed?auto=format&fit=crop&w=900&q=85'];
    }

    for (let i = 0; i < imgList.length; i++) {
      await connection.query(
        `INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
         VALUES (?, ?, ?, ?, ?)`,
        [productId, imgList[i], i === 0 ? 1 : 0, i, `${name} view ${i + 1}`]
      );
    }

    // Sizes
    const sizeList = Array.isArray(sizes) && sizes.length > 0
      ? sizes
      : typeof sizes === 'string'
      ? sizes.split(',').map((s) => s.trim()).filter(Boolean)
      : ['One size'];

    for (let sIdx = 0; sIdx < sizeList.length; sIdx++) {
      await connection.query(
        `INSERT INTO product_sizes (product_id, size_name, stock_quantity, display_order)
         VALUES (?, ?, 20, ?)`,
        [productId, sizeList[sIdx], sIdx]
      );
    }

    await connection.commit();

    // Fetch created product
    const [rows] = await connection.query(
      `SELECT p.id, p.name, p.slug, p.price, p.badge, p.description,
              p.in_stock AS inStock, p.stock_quantity AS stockQuantity,
              p.is_featured AS isFeatured, p.purity, p.warranty_period AS warrantyPeriod,
              p.created_at AS createdAt,
              c.name AS category, pt.name AS type, pf.name AS finish,
              COALESCE(
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
                (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1),
                ''
              ) AS image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_types pt ON p.type_id = pt.id
       LEFT JOIN product_finishes pf ON p.finish_id = pf.id
       WHERE p.id = ?`,
      [productId]
    );

    const createdProduct = {
      ...rows[0],
      price: Number(rows[0].price),
      inStock: Boolean(rows[0].inStock),
      isFeatured: Boolean(rows[0].isFeatured),
      gallery: imgList,
      sizes: sizeList,
    };

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      productId,
      slug: uniqueSlug,
      data: createdProduct,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * GET /api/v1/admin/products/:id
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.price, p.badge, p.description,
              p.in_stock AS inStock, p.stock_quantity AS stockQuantity,
              p.is_featured AS isFeatured, p.purity, p.warranty_period AS warrantyPeriod,
              p.created_at AS createdAt, p.updated_at AS updatedAt,
              c.name AS category, c.id AS categoryId,
              pt.name AS type, pt.id AS typeId,
              pf.name AS finish, pf.id AS finishId,
              COALESCE(
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
                (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1),
                ''
              ) AS image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_types pt ON p.type_id = pt.id
       LEFT JOIN product_finishes pf ON p.finish_id = pf.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const [imgs] = await pool.query(
      'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC',
      [id]
    );
    const [szs] = await pool.query(
      'SELECT size_name FROM product_sizes WHERE product_id = ? ORDER BY display_order ASC',
      [id]
    );

    const product = {
      ...rows[0],
      price: Number(rows[0].price),
      inStock: Boolean(rows[0].inStock),
      isFeatured: Boolean(rows[0].isFeatured),
      gallery: imgs.map((img) => img.image_url),
      sizes: szs.map((s) => s.size_name),
    };

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT / PATCH /api/v1/admin/products/:id
 * Edit / Update product details, images, sizes, categories
 */
export const updateProduct = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;

    // Verify product exists
    const [existing] = await connection.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    const current = existing[0];

    const {
      name,
      slug,
      category,
      categoryId,
      type,
      typeId,
      finish,
      finishId,
      price,
      badge,
      description,
      inStock,
      stockQuantity,
      isFeatured,
      purity,
      warrantyPeriod,
      image,
      gallery,
      sizes,
    } = req.body;

    const updates = [];
    const params = [];

    // 1. Name & optional Slug
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name.trim());
    }

    if (slug !== undefined && slug.trim() !== '') {
      let uniqueSlug = slugify(slug);
      const [slugMatches] = await connection.query(
        'SELECT id FROM products WHERE slug = ? AND id != ?',
        [uniqueSlug, id]
      );
      if (slugMatches.length > 0) {
        uniqueSlug = `${uniqueSlug}-${Date.now().toString().slice(-4)}`;
      }
      updates.push('slug = ?');
      params.push(uniqueSlug);
    }

    // 2. Category
    if (categoryId !== undefined) {
      updates.push('category_id = ?');
      params.push(Number(categoryId));
    } else if (category !== undefined) {
      if (typeof category === 'number' || /^\d+$/.test(category)) {
        updates.push('category_id = ?');
        params.push(Number(category));
      } else {
        const [cats] = await connection.query('SELECT id FROM categories WHERE name = ?', [category]);
        if (cats.length > 0) {
          updates.push('category_id = ?');
          params.push(cats[0].id);
        }
      }
    }

    // 3. Type
    if (typeId !== undefined) {
      updates.push('type_id = ?');
      params.push(Number(typeId));
    } else if (type !== undefined) {
      if (typeof type === 'number' || /^\d+$/.test(type)) {
        updates.push('type_id = ?');
        params.push(Number(type));
      } else {
        const [types] = await connection.query('SELECT id FROM product_types WHERE name = ?', [type]);
        if (types.length > 0) {
          updates.push('type_id = ?');
          params.push(types[0].id);
        }
      }
    }

    // 4. Finish
    if (finishId !== undefined) {
      updates.push('finish_id = ?');
      params.push(Number(finishId));
    } else if (finish !== undefined) {
      if (typeof finish === 'number' || /^\d+$/.test(finish)) {
        updates.push('finish_id = ?');
        params.push(Number(finish));
      } else {
        const [finishes] = await connection.query('SELECT id FROM product_finishes WHERE name = ?', [finish]);
        if (finishes.length > 0) {
          updates.push('finish_id = ?');
          params.push(finishes[0].id);
        }
      }
    }

    // 5. Price
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(Number(price));
    }

    // 6. Badge
    if (badge !== undefined) {
      const cleanBadge = (badge === '' || badge === 'None' || badge === 'none') ? null : badge;
      updates.push('badge = ?');
      params.push(cleanBadge);
    }

    // 7. Description
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    // 8. inStock
    if (inStock !== undefined) {
      updates.push('in_stock = ?');
      params.push(inStock ? 1 : 0);
    }

    // 9. stockQuantity
    if (stockQuantity !== undefined) {
      updates.push('stock_quantity = ?');
      params.push(Number(stockQuantity));
    }

    // 10. isFeatured
    if (isFeatured !== undefined) {
      updates.push('is_featured = ?');
      params.push(isFeatured ? 1 : 0);
    }

    // 11. Purity
    if (purity !== undefined) {
      updates.push('purity = ?');
      params.push(purity);
    }

    // 12. Warranty Period
    if (warrantyPeriod !== undefined) {
      updates.push('warranty_period = ?');
      params.push(warrantyPeriod);
    }

    if (updates.length > 0) {
      params.push(id);
      await connection.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    // 13. Update Product Images if image or gallery is supplied
    if (image !== undefined || gallery !== undefined) {
      let imgList = [];
      if (Array.isArray(gallery) && gallery.length > 0) {
        imgList = [...gallery.filter(Boolean)];
        if (image && !imgList.includes(image)) {
          imgList.unshift(image);
        }
      } else if (image) {
        imgList = [image];
      }

      if (imgList.length > 0) {
        await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
        for (let i = 0; i < imgList.length; i++) {
          await connection.query(
            `INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
             VALUES (?, ?, ?, ?, ?)`,
            [
              id,
              imgList[i],
              i === 0 ? 1 : 0,
              i,
              `${name || current.name} view ${i + 1}`,
            ]
          );
        }
      }
    }

    // 14. Update Sizes if supplied
    if (sizes !== undefined) {
      const sizeArr = Array.isArray(sizes)
        ? sizes
        : typeof sizes === 'string'
        ? sizes.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      if (sizeArr.length > 0) {
        await connection.query('DELETE FROM product_sizes WHERE product_id = ?', [id]);
        for (let sIdx = 0; sIdx < sizeArr.length; sIdx++) {
          await connection.query(
            `INSERT INTO product_sizes (product_id, size_name, stock_quantity, display_order)
             VALUES (?, ?, 20, ?)`,
            [id, sizeArr[sIdx], sIdx]
          );
        }
      }
    }

    await connection.commit();

    // Fetch full updated product
    const [updatedRows] = await connection.query(
      `SELECT p.id, p.name, p.slug, p.price, p.badge, p.description,
              p.in_stock AS inStock, p.stock_quantity AS stockQuantity,
              p.is_featured AS isFeatured, p.purity, p.warranty_period AS warrantyPeriod,
              p.created_at AS createdAt, p.updated_at AS updatedAt,
              c.name AS category, pt.name AS type, pf.name AS finish,
              COALESCE(
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
                (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1),
                ''
              ) AS image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_types pt ON p.type_id = pt.id
       LEFT JOIN product_finishes pf ON p.finish_id = pf.id
       WHERE p.id = ?`,
      [id]
    );

    const [imgs] = await connection.query(
      'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC',
      [id]
    );
    const [szs] = await connection.query(
      'SELECT size_name FROM product_sizes WHERE product_id = ? ORDER BY display_order ASC',
      [id]
    );

    const fullProduct = {
      ...updatedRows[0],
      price: Number(updatedRows[0].price),
      inStock: Boolean(updatedRows[0].inStock),
      isFeatured: Boolean(updatedRows[0].isFeatured),
      gallery: imgs.map((img) => img.image_url),
      sizes: szs.map((s) => s.size_name),
    };

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: fullProduct,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * DELETE /api/v1/admin/products/:id
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/products/:id/toggle-stock
 */
export const toggleProductStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE products SET in_stock = NOT in_stock WHERE id = ?', [id]);
    const [rows] = await pool.query('SELECT id, in_stock FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({
      success: true,
      message: `Product stock toggled to ${rows[0].in_stock ? 'In Stock' : 'Out of Stock'}.`,
      inStock: Boolean(rows[0].in_stock),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/customers
 */
export const getCustomers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name AS fullName, u.email, u.phone, u.created_at AS createdAt,
              COUNT(o.id) AS orderCount, COALESCE(SUM(o.total_amount), 0) AS totalSpent
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id
       WHERE u.role = 'customer'
       GROUP BY u.id
       ORDER BY u.id DESC`
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows.map((r) => ({
        ...r,
        orderCount: Number(r.orderCount || 0),
        totalSpent: Number(r.totalSpent || 0),
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/subscribers
 */
export const getSubscribers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, status, subscribed_at AS subscribedAt FROM newsletter_subscribers ORDER BY id DESC'
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/inquiries
 */
export const getInquiries = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, subject, message, channel, status, created_at AS createdAt FROM inquiries ORDER BY id DESC'
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/inquiries/:id
 */
export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE inquiries SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Inquiry status updated.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/settings
 */
export const getSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM store_settings');
    const settings = rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/products
 * Returns all products for admin (including out-of-stock, with full search and category filtering)
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const { search = '', category = '', inStock, page = 1, limit = 100 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereConditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      whereConditions.push('(p.name LIKE ? OR p.slug LIKE ? OR p.description LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (category && category !== 'All') {
      whereConditions.push('c.name = ?');
      params.push(category);
    }

    if (inStock !== undefined && inStock !== '' && inStock !== 'all') {
      whereConditions.push('p.in_stock = ?');
      params.push(inStock === 'true' || inStock === true || inStock === '1' ? 1 : 0);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.price,
              p.badge, p.description, p.stock_quantity AS stockQuantity,
              p.in_stock AS inStock, p.is_featured AS isFeatured, p.purity,
              p.warranty_period AS warrantyPeriod,
              p.created_at AS createdAt, p.updated_at AS updatedAt,
              c.name AS category, c.id AS categoryId,
              pt.name AS type, pt.id AS typeId,
              pf.name AS finish, pf.id AS finishId,
              COALESCE(
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
                (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1),
                ''
              ) AS image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_types pt ON p.type_id = pt.id
       LEFT JOIN product_finishes pf ON p.finish_id = pf.id
       ${whereClause}
       ORDER BY p.id DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`,
      params
    );

    // Fetch sizes for these products
    const productIds = rows.map((r) => r.id);
    let sizesMap = {};
    let galleryMap = {};

    if (productIds.length > 0) {
      const [allSizes] = await pool.query(
        `SELECT product_id, size_name FROM product_sizes WHERE product_id IN (${productIds.map(() => '?').join(',')}) ORDER BY display_order ASC`,
        productIds
      );
      allSizes.forEach((s) => {
        if (!sizesMap[s.product_id]) sizesMap[s.product_id] = [];
        sizesMap[s.product_id].push(s.size_name);
      });

      const [allImages] = await pool.query(
        `SELECT product_id, image_url FROM product_images WHERE product_id IN (${productIds.map(() => '?').join(',')}) ORDER BY is_primary DESC, display_order ASC`,
        productIds
      );
      allImages.forEach((img) => {
        if (!galleryMap[img.product_id]) galleryMap[img.product_id] = [];
        galleryMap[img.product_id].push(img.image_url);
      });
    }

    const data = rows.map((r) => ({
      ...r,
      price: Number(r.price),
      inStock: Boolean(r.inStock),
      isFeatured: Boolean(r.isFeatured),
      primaryImage: r.image,
      gallery: galleryMap[r.id] || (r.image ? [r.image] : []),
      sizes: sizesMap[r.id] || ['One size'],
    }));

    res.json({
      success: true,
      data,
      pagination: {
        total: Number(total),
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(Number(total) / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/admin/settings
 */
export const updateSettings = async (req, res, next) => {
  try {
    const settings = req.body; // { free_shipping_threshold, standard_shipping_fee, ... }
    for (const [key, val] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, String(val)]
      );
    }
    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error) {
    next(error);
  }
};
