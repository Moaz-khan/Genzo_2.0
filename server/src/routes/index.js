import express from 'express';
import productRoutes from './productRoutes.js';
import authRoutes from './authRoutes.js';
import cartRoutes from './cartRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import orderRoutes from './orderRoutes.js';
import newsletterRoutes from './newsletterRoutes.js';
import contactRoutes from './contactRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use('/products', productRoutes);
router.use('/auth', authRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/contact', contactRoutes);
router.use('/admin', adminRoutes);

export default router;
