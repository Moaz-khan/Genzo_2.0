import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './src/app.js';
import pool from './src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('Missing required environment variable: JWT_SECRET');
}

const PORT = process.env.PORT || 5000;

async function checkDatabaseConnection(retries = 3, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[Database] Connecting to TiDB Cloud (Attempt ${attempt}/${retries})...`);
      const [rows] = await pool.query('SELECT 1 as connected, DATABASE() as db');
      console.log(`[Database] ✓ Connected to TiDB Cloud (${rows[0].db}) successfully.`);
      return true;
    } catch (error) {
      console.warn(`[Database Warning] Attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`[Database] Retrying in ${delayMs / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.error(`\n======================================================`);
        console.error(`[Database Error] Could not connect to TiDB Cloud: ${error.message}`);
        console.error(`Possible causes for connect ETIMEDOUT:`);
        console.error(`1. TiDB Cloud IP Access List: Your IP might need to be allowed in the TiDB Cloud console (add 0.0.0.0/0).`);
        console.error(`2. Network / Firewall: Outbound Port 4000 might be blocked by your ISP, router, or Windows Firewall.`);
        console.error(`3. Slow connection: International latency to AWS Tokyo (ap-northeast-1).`);
        console.error(`======================================================\n`);
        return false;
      }
    }
  }
}

async function startServer() {
  const isDbConnected = await checkDatabaseConnection();

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  GENZO SILVER Backend API Server`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Listening on: http://localhost:${PORT}`);
    console.log(`  API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`  Health Check: http://localhost:${PORT}/health`);
    console.log(`  Database Status: ${isDbConnected ? 'CONNECTED (TiDB Cloud)' : 'PENDING CONNECTION'}`);
    console.log(`===============================================`);
  });
}

startServer();
