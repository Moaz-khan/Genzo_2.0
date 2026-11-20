import express from 'express';
import {
  createOrder,
  uploadPaymentReceipt,
  trackOrder,
  getMyOrders,
} from '../controllers/orderController.js';
import { validateCoupon } from '../controllers/couponController.js';
import { optionalAuth, verifyToken } from '../middlewares/authMiddleware.js';
import { uploadReceipt } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.post('/validate-coupon', validateCoupon);
router.post('/:orderId/receipt', uploadReceipt.single('receipt'), uploadPaymentReceipt);
router.get('/track', trackOrder);
router.get('/my-orders', verifyToken, getMyOrders);

export default router;
