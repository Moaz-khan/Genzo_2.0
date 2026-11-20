import pool from '../config/db.js';

/**
 * POST /api/v1/orders/validate-coupon
 */
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const cleanCode = code.toUpperCase().trim();
    const subtotalAmount = Number(subtotal) || 0;

    const [rows] = await pool.query(
      `SELECT id, code, discount_type, discount_value, min_order_amount, max_discount, expires_at, is_active
       FROM coupons
       WHERE code = ? AND is_active = TRUE`,
      [cleanCode]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive promotional voucher code.',
      });
    }

    const coupon = rows[0];

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This promotional code has expired.',
      });
    }

    // Check minimum order amount
    if (subtotalAmount < Number(coupon.min_order_amount)) {
      return res.status(400).json({
        success: false,
        message: `This voucher requires a minimum order of PKR ${Number(coupon.min_order_amount).toLocaleString()}.`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percent') {
      discount = (subtotalAmount * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount && discount > Number(coupon.max_discount)) {
        discount = Number(coupon.max_discount);
      }
    } else {
      discount = Number(coupon.discount_value);
    }

    // Don't let discount exceed subtotal
    discount = Math.min(discount, subtotalAmount);
    const newTotal = Math.max(0, subtotalAmount - discount);

    res.json({
      success: true,
      message: `Voucher applied: ${coupon.code}`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value),
        discountAmount: Math.round(discount),
        newSubtotal: Math.round(newTotal),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/coupons (Admin only)
 */
export const getAdminCoupons = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM coupons ORDER BY created_at DESC'
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/coupons (Admin only)
 */
export const createAdminCoupon = async (req, res, next) => {
  try {
    const { code, discount_type, discount_value, min_order_amount, max_discount, expires_at } = req.body;

    if (!code || !discount_value) {
      return res.status(400).json({ success: false, message: 'Code and discount value are required.' });
    }

    const cleanCode = code.toUpperCase().trim();

    const [result] = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount, expires_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [
        cleanCode,
        discount_type || 'percent',
        Number(discount_value),
        Number(min_order_amount) || 0,
        max_discount ? Number(max_discount) : null,
        expires_at || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: `Coupon ${cleanCode} created successfully.`,
      couponId: result.insertId,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Coupon code already exists.' });
    }
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/coupons/:id (Admin only)
 */
export const deleteAdminCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
    res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
