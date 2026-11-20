import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../../../server/.env') });
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
  port: Number(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER || '44i85yZnWWhMnDD.root',
  password: process.env.DB_PASSWORD || 'oJPkHKIlK3FO69y2',
  database: process.env.DB_NAME || 'genzo_silver',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 60000, // 60 seconds timeout to prevent ETIMEDOUT on cross-region latency
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
});

export default pool;
