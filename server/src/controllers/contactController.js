import pool from '../config/db.js';

export const submitInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, channel = 'website' } = req.body;

    if (!name || (!message && channel === 'website')) {
      return res.status(400).json({
        success: false,
        message: 'Name and message are required.',
      });
    }

    await pool.query(
      `INSERT INTO inquiries (name, email, phone, subject, message, channel, status)
       VALUES (?, ?, ?, ?, ?, ?, 'new')`,
      [
        name.trim(),
        email ? email.trim().toLowerCase() : null,
        phone ? phone.trim() : null,
        subject ? subject.trim() : null,
        message ? message.trim() : 'WhatsApp direct outreach',
        channel,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. Our client care team will respond promptly.',
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT setting_key AS `key`, setting_value AS `value`, description FROM store_settings'
    );

    const settings = rows.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        ...settings,
        free_shipping_threshold: Number(settings.free_shipping_threshold || 25000),
        standard_shipping_fee: Number(settings.standard_shipping_fee || 450),
      },
    });
  } catch (error) {
    next(error);
  }
};
