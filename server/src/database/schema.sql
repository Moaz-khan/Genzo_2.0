-- ==============================================================================
-- GENZO SILVER STORE - TiDB / MySQL Database Schema
-- Certified 925 Sterling Silver E-Commerce Platform
-- Compatible with MySQL 8.0+ and TiDB Cloud Serverless
-- ==============================================================================

-- 1. Store & System Settings
CREATE TABLE IF NOT EXISTS store_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description VARCHAR(255) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Product Categories (Men, Women, Unisex)
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Product Types (Rings, Necklaces, Earrings, Bracelets, Chains)
CREATE TABLE IF NOT EXISTS product_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Product Finishes (High Polish, Oxidized Silver, Brushed Matte, Textured)
CREATE TABLE IF NOT EXISTS product_finishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Products Catalog
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category_id INT NOT NULL,
  type_id INT NOT NULL,
  finish_id INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  badge ENUM('Bestseller', 'New', 'Limited') NULL,
  description TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INT DEFAULT 50,
  is_featured BOOLEAN DEFAULT FALSE,
  purity VARCHAR(50) DEFAULT '925 Sterling Silver',
  warranty_period VARCHAR(100) DEFAULT 'One-Year Care Warranty',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (type_id) REFERENCES product_types(id) ON DELETE RESTRICT,
  FOREIGN KEY (finish_id) REFERENCES product_finishes(id) ON DELETE RESTRICT,
  INDEX idx_prod_category (category_id),
  INDEX idx_prod_type (type_id),
  INDEX idx_prod_finish (finish_id),
  INDEX idx_prod_price (price),
  INDEX idx_prod_badge (badge),
  INDEX idx_prod_instock (in_stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Product Gallery Images
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(1000) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  alt_text VARCHAR(255) NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_prod_img (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Product Sizes (e.g., Rings: 16, 18, 20, 22 or One size)
CREATE TABLE IF NOT EXISTS product_sizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  size_name VARCHAR(50) NOT NULL,
  stock_quantity INT DEFAULT 20,
  display_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uk_prod_size (product_id, size_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Product Editorial Accordions (Materials & care, Delivery & returns, Warranty)
CREATE TABLE IF NOT EXISTS product_accordions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  display_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_prod_acc (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Shopping Bag / Cart Items (supports authenticated users & guest session)
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(100) NULL,
  product_id INT NOT NULL,
  size VARCHAR(50) DEFAULT 'One size',
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_cart_user (user_id),
  INDEX idx_cart_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Wishlist Items
CREATE TABLE IF NOT EXISTS wishlist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(100) NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uk_wish_user_prod (user_id, product_id),
  UNIQUE KEY uk_wish_sess_prod (session_id, product_id),
  INDEX idx_wish_user (user_id),
  INDEX idx_wish_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Checkout Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(191) NOT NULL,
  street_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  delivery_notes TEXT NULL,
  payment_method ENUM('card', 'jazzcash', 'easypaisa', 'bank') NOT NULL,
  payment_status ENUM('pending', 'verified', 'failed') DEFAULT 'pending',
  receipt_url VARCHAR(1000) NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  order_status ENUM('pending_verification', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled') DEFAULT 'pending_verification',
  tracking_code VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_order_num (order_number),
  INDEX idx_order_phone (customer_phone),
  INDEX idx_order_email (customer_email),
  INDEX idx_order_status (order_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Order Line Items (Historical snapshot of purchased products)
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  product_image VARCHAR(1000) NULL,
  size VARCHAR(50) DEFAULT 'One size',
  quantity INT NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_order_line (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Newsletter Inner Circle Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  status ENUM('active', 'unsubscribed') DEFAULT 'active',
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Customer Inquiries & WhatsApp Logs
CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NULL,
  phone VARCHAR(50) NULL,
  subject VARCHAR(255) NULL,
  message TEXT NOT NULL,
  channel ENUM('website', 'whatsapp') DEFAULT 'website',
  status ENUM('new', 'in_progress', 'resolved') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
