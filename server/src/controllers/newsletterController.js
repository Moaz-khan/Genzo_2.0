import pool from '../config/db.js';

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required to join the inner circle.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if already subscribed
    const [existing] = await pool.query(
      'SELECT id, status FROM newsletter_subscribers WHERE email = ?',
      [cleanEmail]
    );

    if (existing.length > 0) {
      if (existing[0].status === 'unsubscribed') {
        await pool.query("UPDATE newsletter_subscribers SET status = 'active' WHERE id = ?", [
          existing[0].id,
        ]);
        return res.json({
          success: true,
          message: 'Welcome back to the Genzo inner circle.',
        });
      }
      return res.json({
        success: true,
        message: 'You are already a valued member of our inner circle.',
      });
    }

    await pool.query('INSERT INTO newsletter_subscribers (email) VALUES (?)', [cleanEmail]);

    res.status(201).json({
      success: true,
      message: 'Welcome to the Genzo inner circle.',
    });
  } catch (error) {
    next(error);
  }
};
