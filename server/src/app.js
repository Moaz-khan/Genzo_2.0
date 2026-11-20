import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded receipts statically
const serverUploadsPath = path.resolve(__dirname, '../uploads');
const rootUploadsPath = path.resolve(__dirname, '../../uploads');
app.use('/uploads', express.static(serverUploadsPath));
app.use('/uploads', express.static(rootUploadsPath));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'GENZO SILVER API',
    database: 'TiDB Cloud (MySQL)',
    timestamp: new Date().toISOString(),
  });
});

// Mount All V1 API Routes
app.use('/api/v1', apiRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
