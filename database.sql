-- -------------------------------------------------------------
-- DATABASE: clothing_store
-- -------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS clothing_store;
USE clothing_store;

-- -------------------------------------------------------------
-- ADMIN ACCOUNTS
-- -------------------------------------------------------------
CREATE TABLE admin_accounts (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','super_admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_accounts (name, email, password_hash, role)
VALUES ('Super Admin', 'admin@ultras.com', '$2y$10$hguk19w9jCsERlWZA2aVNOzRwQnew2PAB20uBiXvEQH50lB0bztBu', 'super_admin');

-- -------------------------------------------------------------
-- USERS
-- -------------------------------------------------------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- BRANDS
-- -------------------------------------------------------------
CREATE TABLE brands (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(120) NOT NULL,
    brand_code VARCHAR(10) UNIQUE NOT NULL  -- B100, B200, B300
);

INSERT INTO brands (brand_name, brand_code)
VALUES ('Nike', 'B100'), ('Adidas', 'B200'), ('Puma', 'B300');

-- -------------------------------------------------------------
-- CATEGORIES
-- -------------------------------------------------------------
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(120) NOT NULL,
    category_prefix INT NOT NULL UNIQUE  -- 1000 shoes, 2000 tshirts...
);

INSERT INTO categories (category_name, category_prefix)
VALUES 
('Shoes', 1000),
('T-Shirts', 2000),
('Pants', 3000),
('Jackets', 4000);

-- -------------------------------------------------------------
-- PRODUCTS
-- -------------------------------------------------------------
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_unique_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., 1001, 2005 etc.
    name VARCHAR(200) NOT NULL,
    description TEXT,
    brand_id INT,
    category_id INT,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    colors JSON, -- e.g. ["Red", "Blue"]
    sizes JSON,  -- [NEW] e.g. ["S", "M", "L", "XL"]
    gender ENUM('men','women','kids','unisex') DEFAULT 'unisex',
    is_feature BOOLEAN DEFAULT 0,
    is_sale BOOLEAN DEFAULT 0,
    main_image VARCHAR(255) NOT NULL, -- uploaded image URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id)
        ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- PRODUCT IMAGES (multiple images per product)
-- -------------------------------------------------------------
CREATE TABLE product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    image_url VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- INVENTORY LOG (admin updates stock)
-- -------------------------------------------------------------
CREATE TABLE inventory_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    previous_quantity INT,
    updated_quantity INT,
    updated_by INT,
    update_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (updated_by) REFERENCES admin_accounts(admin_id)
);

-- -------------------------------------------------------------
-- ORDERS
-- -------------------------------------------------------------
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending','processing','shipped','completed','cancelled') 
        DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- -------------------------------------------------------------
-- ORDER ITEMS
-- -------------------------------------------------------------
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    product_unique_id VARCHAR(20),
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    color VARCHAR(50),
    size VARCHAR(20), -- [NEW] Selected size for this item
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- CART
-- -------------------------------------------------------------
CREATE TABLE cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    color VARCHAR(50),
    size VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE
);


-- -------------------------------------------------------------
-- AUTH TOKENS (Remember Me)
-- -------------------------------------------------------------
CREATE TABLE auth_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('user', 'admin') NOT NULL,
    selector VARCHAR(255) NOT NULL,
    hashed_validator VARCHAR(255) NOT NULL,
    expiry DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
