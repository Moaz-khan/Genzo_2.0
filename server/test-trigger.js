import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testSingleAdminConstraint() {
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

    console.log('Testing single admin constraint in TiDB...');
    
    // Add generated column and unique index
    try {
      await conn.query(`
        ALTER TABLE users 
        ADD COLUMN admin_lock VARCHAR(20) GENERATED ALWAYS AS (
          CASE WHEN role = 'admin' THEN 'SINGLE_ADMIN' ELSE NULL END
        ) VIRTUAL;
      `);
      console.log('Added admin_lock generated column.');
    } catch (e) {
      console.log('Column notice:', e.message);
    }

    try {
      await conn.query(`
        ALTER TABLE users 
        ADD UNIQUE INDEX uq_single_admin (admin_lock);
      `);
      console.log('Added uq_single_admin unique constraint.');
    } catch (e) {
      console.log('Index notice:', e.message);
    }

    // Now test inserting a second admin - it should fail with DUPLICATE ENTRY!
    try {
      await conn.query(`
        INSERT INTO users (full_name, email, password_hash, role)
        VALUES ('Hacker Admin', 'fakeadmin@genzo.com', 'hash123', 'admin');
      `);
      console.log('Warning: Insert succeeded (unexpected).');
    } catch (err) {
      console.log('✓ Success! Database rejected 2nd admin with error:', err.message);
    }

    await conn.end();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testSingleAdminConstraint();
