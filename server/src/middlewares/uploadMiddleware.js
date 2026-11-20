import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const receiptDir = path.resolve(__dirname, '../../../server/uploads/receipts');
const productDir = path.resolve(__dirname, '../../../server/uploads/products');

if (!fs.existsSync(receiptDir)) {
  fs.mkdirSync(receiptDir, { recursive: true });
}
if (!fs.existsSync(productDir)) {
  fs.mkdirSync(productDir, { recursive: true });
}

// Receipts Storage
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, receiptDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `receipt-${uniqueSuffix}${ext}`);
  },
});

// Products Image Storage
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `genzo-silver-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG, JPG, JPEG, WEBP, and PDF are allowed.'), false);
  }
};

export const uploadReceipt = multer({
  storage: receiptStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter,
});

export const uploadProductMedia = multer({
  storage: productStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter,
});
