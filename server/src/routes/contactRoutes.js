import express from 'express';
import { submitInquiry, getStoreSettings } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', submitInquiry);
router.post('/inquiry', submitInquiry);
router.get('/settings', getStoreSettings);

export default router;
