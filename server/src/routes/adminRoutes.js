import express from 'express';
import {
  getStats,
  getAllOrders,
  updateOrder,
  deleteOrder,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStock,
  getCustomers,
  getSubscribers,
  getInquiries,
  updateInquiryStatus,
  getSettings,
  updateSettings,
} from '../controllers/adminController.js';
import {
  getAdminCoupons,
  createAdminCoupon,
  deleteAdminCoupon,
} from '../controllers/couponController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';
import { uploadProductMedia } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Require both Token and Admin Role for all /admin routes
router.use(verifyToken, verifyAdmin);

// Dashboard
router.get('/stats', getStats);

// Orders
router.get('/orders', getAllOrders);
router.patch('/orders/:id', updateOrder);
router.delete('/orders/:id', deleteOrder);

// Products (admin — includes out-of-stock)
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/toggle-stock', toggleProductStock);

// Product Image Upload
router.post('/upload-product-image', uploadProductMedia.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded.' });
  }
  const imageUrl = `/uploads/products/${req.file.filename}`;
  res.json({
    success: true,
    message: 'Product image uploaded successfully.',
    imageUrl,
  });
});

// Coupons Management
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createAdminCoupon);
router.delete('/coupons/:id', deleteAdminCoupon);

// Customers, Inquiries, Newsletter
router.get('/customers', getCustomers);
router.get('/subscribers', getSubscribers);
router.get('/inquiries', getInquiries);
router.patch('/inquiries/:id', updateInquiryStatus);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
