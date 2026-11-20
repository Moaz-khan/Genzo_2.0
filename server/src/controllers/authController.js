import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/db.js';

const generateToken = (userId, email, role) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId, email, role }, secret, { expiresIn });
};

/**
 * POST /api/v1/auth/signup
 */
export const signup = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role)
       VALUES (?, ?, ?, ?, 'customer')`,
      [fullName.trim(), email.toLowerCase().trim(), passwordHash, phone || null]
    );

    const userId = result.insertId;
    const token = generateToken(userId, email.toLowerCase(), 'customer');

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to Genzo Silver.',
      token,
      user: {
        id: userId,
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone || null,
        role: 'customer',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const [rows] = await pool.query(
      'SELECT id, full_name, email, password_hash, phone, role FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user.id, user.email, user.role);

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 */
export const getProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/auth/me
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password.',
        });
      }
      const [userRows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
      const valid = await bcrypt.compare(currentPassword, userRows[0].password_hash);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match.',
        });
      }
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
    }

    await pool.query(
      'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?',
      [fullName ? fullName.trim() : null, phone ? phone.trim() : null, userId]
    );

    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: rows[0].id,
        fullName: rows[0].full_name,
        email: rows[0].email,
        phone: rows[0].phone,
        role: rows[0].role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const [rows] = await pool.query('SELECT id, full_name FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (rows.length === 0) {
      // Return success for security so emails cannot be scraped
      return res.json({
        success: true,
        message: 'If an atelier account exists with that email, a password reset authorization code has been issued.',
        resetToken: 'GZ-' + Math.floor(100000 + Math.random() * 900000), // Simulation code for instant demo
      });
    }

    // Generate 6-digit or random hex token
    const resetToken = 'GZ-' + Math.floor(100000 + Math.random() * 900000);
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, expires, rows[0].id]
    );

    res.json({
      success: true,
      message: 'Password reset code generated and sent to email.',
      resetToken, // Returned in response for rapid testing in dev environment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset code, and new password are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.',
      });
    }

    const [rows] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()',
      [email.toLowerCase().trim(), resetToken.trim()]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset authorization code.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [passwordHash, rows[0].id]
    );

    res.json({
      success: true,
      message: 'Password has been successfully reset. You may now sign in.',
    });
  } catch (error) {
    next(error);
  }
};
