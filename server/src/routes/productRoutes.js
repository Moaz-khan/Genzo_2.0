import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductByIdOrSlug,
  getFilterFacets,
} from '../controllers/productController.js';
import {
  getProductReviews,
  addProductReview,
} from '../controllers/reviewController.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStock,
} from '../controllers/adminController.js';
import { verifyToken, verifyAdmin, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/facets', getFilterFacets);
router.get('/:idOrSlug', getProductByIdOrSlug);

// Product Reviews routes
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', optionalAuth, addProductReview);

// Admin-protected product routes on /products
router.post('/', verifyToken, verifyAdmin, createProduct);
router.put('/:id', verifyToken, verifyAdmin, updateProduct);
router.patch('/:id', verifyToken, verifyAdmin, updateProduct);
router.delete('/:id', verifyToken, verifyAdmin, deleteProduct);
router.patch('/:id/toggle-stock', verifyToken, verifyAdmin, toggleProductStock);

export default router;
