import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function seedAdmin() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 4000,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
      connectTimeout: 60000,
    });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Rohan0313', salt);

    await conn.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role)
       VALUES (?, ?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE 
         password_hash = VALUES(password_hash),
         role = 'admin',
         full_name = VALUES(full_name)`,
      ['Rohan Admin', 'rohan@genzopk.com', hash, '+92 300 0000000']
    );

    console.log('Admin user rohan@genzopk.com created/updated successfully with role: admin!');

    const [rows] = await conn.query('SELECT id, full_name, email, role, created_at FROM users WHERE email = ?', [
      'rohan@genzopk.com',
    ]);
    console.log('Verified Admin in TiDB:', rows[0]);

    await conn.end();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

seedAdmin();
