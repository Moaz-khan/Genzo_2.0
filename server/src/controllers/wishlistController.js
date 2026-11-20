import pool from '../config/db.js';

const getWishlistOwnerClause = (req) => {
  if (req.user && req.user.id) {
    return { clause: 'user_id = ?', param: req.user.id, isUser: true };
  }
  const sessionId = req.sessionId || req.headers['x-session-id'] || 'guest-session-default';
  return { clause: 'session_id = ?', param: sessionId, isUser: false };
};

/**
 * GET /api/v1/wishlist
 * Returns wishlist product IDs and full product cards
 */
export const getWishlist = async (req, res, next) => {
  try {
    const owner = getWishlistOwnerClause(req);

    const query = `
      SELECT 
        w.id AS wishlistId,
        p.id,
        p.name,
        p.slug,
        c.name AS category,
        pt.name AS type,
        pf.name AS finish,
        p.price,
        p.badge,
        p.description,
        p.in_stock AS inStock,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1),
          ''
        ) AS image
      FROM wishlist_items w
      INNER JOIN products p ON w.product_id = p.id
      INNER JOIN categories c ON p.category_id = c.id
      INNER JOIN product_types pt ON p.type_id = pt.id
      INNER JOIN product_finishes pf ON p.finish_id = pf.id
      WHERE ${owner.clause}
      ORDER BY w.id DESC
    `;

    const [items] = await pool.query(query, [owner.param]);

    const formatted = items.map((item) => ({
      ...item,
      price: Number(item.price),
      inStock: Boolean(item.inStock),
    }));

    res.json({
      success: true,
      count: formatted.length,
      productIds: formatted.map((item) => item.id),
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/wishlist/toggle
 * Toggle product saved state
 */
export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const owner = getWishlistOwnerClause(req);

    const checkQuery = `SELECT id FROM wishlist_items WHERE ${owner.clause} AND product_id = ?`;
    const [existing] = await pool.query(checkQuery, [owner.param, productId]);

    let wished = false;

    if (existing.length > 0) {
      await pool.query('DELETE FROM wishlist_items WHERE id = ?', [existing[0].id]);
      wished = false;
    } else {
      if (owner.isUser) {
        await pool.query(
          'INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)',
          [owner.param, productId]
        );
      } else {
        await pool.query(
          'INSERT INTO wishlist_items (session_id, product_id) VALUES (?, ?)',
          [owner.param, productId]
        );
      }
      wished = true;
    }

    // Get all current wishlist IDs
    const [allRows] = await pool.query(
      `SELECT product_id FROM wishlist_items WHERE ${owner.clause}`,
      [owner.param]
    );

    res.json({
      success: true,
      wished,
      message: wished ? 'Saved to your wishlist.' : 'Removed from wishlist.',
      productIds: allRows.map((r) => r.product_id),
    });
  } catch (error) {
    next(error);
  }
};
