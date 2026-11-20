import express from 'express';
import {
  signup,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', verifyToken, getProfile);
router.put('/me', verifyToken, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
