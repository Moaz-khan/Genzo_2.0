import pool from '../config/db.js';

const getCartOwnerClause = (req) => {
  if (req.user && req.user.id) {
    return { clause: 'user_id = ?', param: req.user.id, isUser: true };
  }
  const sessionId = req.sessionId || req.headers['x-session-id'] || 'guest-session-default';
  return { clause: 'session_id = ?', param: sessionId, isUser: false };
};

/**
 * GET /api/v1/cart
 * Returns cart lines with live product details, subtotal, and shipping fee
 */
export const getCart = async (req, res, next) => {
  try {
    const owner = getCartOwnerClause(req);

    const query = `
      SELECT 
        ci.id AS cartItemId,
        ci.product_id AS id,
        p.name,
        p.slug,
        c.name AS category,
        pt.name AS type,
        pf.name AS finish,
        p.price,
        ci.size,
        ci.quantity,
        (p.price * ci.quantity) AS lineTotal,
        p.in_stock AS inStock,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1),
          ''
        ) AS image
      FROM cart_items ci
      INNER JOIN products p ON ci.product_id = p.id
      INNER JOIN categories c ON p.category_id = c.id
      INNER JOIN product_types pt ON p.type_id = pt.id
      INNER JOIN product_finishes pf ON p.finish_id = pf.id
      WHERE ${owner.clause}
      ORDER BY ci.id DESC
    `;

    const [items] = await pool.query(query, [owner.param]);

    const formattedItems = items.map((item) => ({
      ...item,
      price: Number(item.price),
      lineTotal: Number(item.lineTotal),
      quantity: Number(item.quantity),
      inStock: Boolean(item.inStock),
    }));

    const itemCount = formattedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = formattedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const shipping = subtotal >= 25000 || subtotal === 0 ? 0 : 450;
    const total = subtotal + shipping;

    res.json({
      success: true,
      data: {
        items: formattedItems,
        itemCount,
        subtotal,
        shipping,
        total,
        freeShippingThreshold: 25000,
        currency: 'PKR',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/cart
 * Add an item or increment quantity
 */
export const addToCart = async (req, res, next) => {
  try {
    const { productId, size = 'One size', quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const qty = Math.max(1, Number(quantity) || 1);
    const owner = getCartOwnerClause(req);

    // Verify product exists and is in stock
    const [prodRows] = await pool.query('SELECT id, name, in_stock FROM products WHERE id = ?', [
      productId,
    ]);
    if (prodRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (!prodRows[0].in_stock) {
      return res.status(400).json({ success: false, message: 'This piece is currently out of stock.' });
    }

    // Check if item with same product and size already exists in user's/session's cart
    const checkQuery = `
      SELECT id, quantity FROM cart_items 
      WHERE ${owner.clause} AND product_id = ? AND size = ?
    `;
    const [existing] = await pool.query(checkQuery, [owner.param, productId, size]);

    if (existing.length > 0) {
      const newQuantity = existing[0].quantity + qty;
      await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [
        newQuantity,
        existing[0].id,
      ]);
    } else {
      if (owner.isUser) {
        await pool.query(
          `INSERT INTO cart_items (user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)`,
          [owner.param, productId, size, qty]
        );
      } else {
        await pool.query(
          `INSERT INTO cart_items (session_id, product_id, size, quantity) VALUES (?, ?, ?, ?)`,
          [owner.param, productId, size, qty]
        );
      }
    }

    // Return updated cart
    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/cart/:cartItemId
 * Update item quantity or remove if quantity <= 0
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const { cartItemId } = req.params;
    const { delta, quantity } = req.body;
    const owner = getCartOwnerClause(req);

    const [rows] = await pool.query(
      `SELECT id, quantity FROM cart_items WHERE id = ? AND ${owner.clause}`,
      [cartItemId, owner.param]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    let newQty;
    if (quantity !== undefined) {
      newQty = Number(quantity);
    } else if (delta !== undefined) {
      newQty = rows[0].quantity + Number(delta);
    } else {
      newQty = rows[0].quantity;
    }

    if (newQty <= 0) {
      await pool.query('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
    } else {
      await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, cartItemId]);
    }

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/cart/:cartItemId
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const { cartItemId } = req.params;
    const owner = getCartOwnerClause(req);

    await pool.query(`DELETE FROM cart_items WHERE id = ? AND ${owner.clause}`, [
      cartItemId,
      owner.param,
    ]);

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/cart
 * Clear whole bag
 */
export const clearCart = async (req, res, next) => {
  try {
    const owner = getCartOwnerClause(req);
    await pool.query(`DELETE FROM cart_items WHERE ${owner.clause}`, [owner.param]);

    res.json({
      success: true,
      message: 'Cart cleared.',
      data: {
        items: [],
        itemCount: 0,
        subtotal: 0,
        shipping: 0,
        total: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
