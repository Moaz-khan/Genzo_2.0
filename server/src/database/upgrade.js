import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

async function runUpgrade() {
  console.log('--- Upgrading TiDB Database for GENZO SILVER ---');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
    connectTimeout: 60000,
  });

  try {
    // 1. Create Coupons table
    console.log('Creating coupons table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_type ENUM('percent', 'fixed') NOT NULL DEFAULT 'percent',
        discount_value DECIMAL(10, 2) NOT NULL,
        min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
        max_discount DECIMAL(10, 2) NULL,
        expires_at DATETIME NULL,
        usage_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Create Product Reviews table
    console.log('Creating product_reviews table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT NULL,
        customer_name VARCHAR(150) NOT NULL,
        customer_email VARCHAR(191) NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT NOT NULL,
        verified_purchase BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_review_prod (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Update orders table to support 'cod' and coupon discount
    console.log('Checking orders table columns...');
    try {
      await connection.query(`
        ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(50) NOT NULL;
      `);
    } catch (e) {
      console.log('Notice on orders payment_method:', e.message);
    }

    try {
      await connection.query(`
        ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50) NULL AFTER payment_method;
      `);
    } catch (e) {
      // Column may already exist
    }

    try {
      await connection.query(`
        ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0.00 AFTER coupon_code;
      `);
    } catch (e) {
      // Column may already exist
    }

    // 4. Update users table for password reset
    console.log('Checking users table for password reset...');
    try {
      await connection.query(`
        ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL,
        ADD COLUMN reset_token_expires DATETIME NULL;
      `);
    } catch (e) {
      // Columns may already exist
    }

    // 5. Seed coupons
    console.log('Seeding initial coupons...');
    const seedCoupons = [
      { code: 'GENZO10', discount_type: 'percent', discount_value: 10, min_order_amount: 5000, max_discount: 3000 },
      { code: 'SILVER2026', discount_type: 'fixed', discount_value: 1500, min_order_amount: 15000, max_discount: 1500 },
      { code: 'WELCOME5', discount_type: 'percent', discount_value: 5, min_order_amount: 0, max_discount: 1000 },
    ];

    for (const c of seedCoupons) {
      await connection.query(`
        INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount, is_active)
        VALUES (?, ?, ?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE discount_value = VALUES(discount_value)
      `, [c.code, c.discount_type, c.discount_value, c.min_order_amount, c.max_discount]);
    }

    // 6. Seed sample reviews for products (IDs 1-4)
    console.log('Seeding sample reviews...');
    const seedReviews = [
      { product_id: 1, customer_name: 'Farhan Tariq', rating: 5, review_text: 'Sublime craftsmanship. The solid 925 weight feels substantial and the mirror polish hallmark is authentic.', verified_purchase: true },
      { product_id: 1, customer_name: 'Zubair K.', rating: 5, review_text: 'Ordered size 20, fits seamlessly. Delivery to Islamabad was prompt in signature tamper-proof box.', verified_purchase: true },
      { product_id: 2, customer_name: 'Ayesha Malik', rating: 5, review_text: 'The Celeste pendant has an ethereal luster. Wear it daily with no tarnishing. Highly recommended.', verified_purchase: true },
      { product_id: 3, customer_name: 'Bilal Ahmad', rating: 4, review_text: 'Understated matte finish, very comfortable beveled interior band.', verified_purchase: true },
    ];

    const [existingCount] = await connection.query('SELECT COUNT(*) as count FROM product_reviews');
    if (existingCount[0].count === 0) {
      for (const r of seedReviews) {
        await connection.query(`
          INSERT INTO product_reviews (product_id, customer_name, rating, review_text, verified_purchase)
          VALUES (?, ?, ?, ?, ?)
        `, [r.product_id, r.customer_name, r.rating, r.review_text, r.verified_purchase]);
      }
    }

    console.log('--- TiDB Database Upgrade Completed Successfully ---');
  } catch (err) {
    console.error('Database upgrade error:', err);
  } finally {
    await connection.end();
  }
}

runUpgrade();
