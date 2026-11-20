import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(optionalAuth);

router.get('/', getCart);
router.post('/', addToCart);
router.patch('/:cartItemId', updateCartItem);
router.delete('/:cartItemId', removeFromCart);
router.delete('/', clearCart);

export default router;
