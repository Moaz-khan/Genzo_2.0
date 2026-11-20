import express from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(optionalAuth);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

export default router;
