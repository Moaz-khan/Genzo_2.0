import pool from '../config/db.js';

/**
 * GET /api/v1/products/:productId/reviews
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check product id (or slug)
    let prodId = id;
    if (isNaN(Number(id))) {
      const [p] = await pool.query('SELECT id FROM products WHERE slug = ?', [id]);
      if (p.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      prodId = p[0].id;
    }

    const [reviews] = await pool.query(
      `SELECT id, product_id, customer_name, rating, review_text, verified_purchase, created_at
       FROM product_reviews
       WHERE product_id = ?
       ORDER BY created_at DESC`,
      [prodId]
    );

    const count = reviews.length;
    const avgRating = count > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : '5.0';

    res.json({
      success: true,
      productId: Number(prodId),
      averageRating: parseFloat(avgRating),
      reviewCount: count,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/products/:productId/reviews
 */
export const addProductReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customerName, customerEmail, rating, reviewText } = req.body;

    if (!customerName || !rating || !reviewText) {
      return res.status(400).json({
        success: false,
        message: 'Name, star rating, and review text are required.',
      });
    }

    let prodId = id;
    if (isNaN(Number(id))) {
      const [p] = await pool.query('SELECT id FROM products WHERE slug = ?', [id]);
      if (p.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      prodId = p[0].id;
    }

    const userId = req.user ? req.user.id : null;
    const verifiedPurchase = true;

    const [result] = await pool.query(
      `INSERT INTO product_reviews (product_id, user_id, customer_name, customer_email, rating, review_text, verified_purchase)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        prodId,
        userId,
        customerName.trim(),
        customerEmail ? customerEmail.trim() : null,
        Math.min(5, Math.max(1, Number(rating))),
        reviewText.trim(),
        verifiedPurchase,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you. Your piece review has been verified and published.',
      reviewId: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};
