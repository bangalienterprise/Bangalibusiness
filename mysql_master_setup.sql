-- =============================================================================
-- MYSQL MASTER SETUP SCRIPT FOR BANGALI ENTERPRISE
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- -----------------------------------------------------------------------------
-- 1. SYSTEM & CONFIGURATION
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS api_keys;
CREATE TABLE api_keys (
    id CHAR(36) PRIMARY KEY,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    label VARCHAR(255),
    database_url TEXT,
    status ENUM('active', 'revoked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NULL
);

DROP TABLE IF EXISTS system_settings;
CREATE TABLE system_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    settings JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. CORE ENTITIES
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS business_types;
CREATE TABLE business_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS businesses;
CREATE TABLE businesses (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'retail_store',
    owner_id CHAR(36),
    subscription_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS profiles;
CREATE TABLE profiles (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'viewer',
    business_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL
);

ALTER TABLE businesses ADD CONSTRAINT fk_business_owner FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE SET NULL;

DROP TABLE IF EXISTS business_users;
CREATE TABLE business_users (
    id CHAR(36) PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_business (business_id, user_id),
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS business_settings;
CREATE TABLE business_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_business_settings (business_id),
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 3. INVENTORY & CRM
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS suppliers;
CREATE TABLE suppliers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    current_due DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) DEFAULT 0,
    cost_price DECIMAL(15,2) DEFAULT 0,
    stock_qty INT DEFAULT 0,
    category VARCHAR(255),
    supplier VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 4. SALES & ORDERS
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    customer_id BIGINT,
    order_number VARCHAR(100),
    total_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(15,2) DEFAULT 0,
    total_price DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

DROP TABLE IF EXISTS sales_transactions;
CREATE TABLE sales_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    customer_id BIGINT,
    invoice_number VARCHAR(100),
    subtotal DECIMAL(15,2) DEFAULT 0,
    discount DECIMAL(15,2) DEFAULT 0,
    tax DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'completed',
    served_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (served_by) REFERENCES profiles(id)
);

DROP TABLE IF EXISTS sales_items;
CREATE TABLE sales_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    product_id BIGINT,
    product_name VARCHAR(255),
    quantity INT DEFAULT 1,
    unit_price DECIMAL(15,2) DEFAULT 0,
    total_price DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (transaction_id) REFERENCES sales_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

DROP TABLE IF EXISTS expenses;
CREATE TABLE expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    amount DECIMAL(15,2) DEFAULT 0,
    category VARCHAR(255),
    description TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS commissions;
CREATE TABLE commissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    amount DECIMAL(15,2) DEFAULT 0,
    source_type VARCHAR(50),
    source_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 5. OPERATIONS
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS projects;
CREATE TABLE projects (
    id CHAR(36) PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    client_id BIGINT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    budget DECIMAL(15,2) DEFAULT 0,
    deadline TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES customers(id) ON DELETE SET NULL
);

DROP TABLE IF EXISTS time_entries;
CREATE TABLE time_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    project_id CHAR(36),
    user_id CHAR(36) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    duration_minutes INT,
    is_billable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS appointments;
CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    customer_id BIGINT,
    service_id BIGINT,
    staff_id CHAR(36),
    appointment_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES profiles(id)
);

DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    fee DECIMAL(15,2) DEFAULT 0,
    instructor_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES profiles(id)
);

DROP TABLE IF EXISTS students;
CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    user_id CHAR(36),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    enrollment_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profiles(id)
);

DROP TABLE IF EXISTS price_tiers;
CREATE TABLE price_tiers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    min_quantity INT DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS production_orders;
CREATE TABLE production_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    product_id BIGINT,
    quantity INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'planned',
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    actor_id CHAR(36),
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES profiles(id)
);

-- -----------------------------------------------------------------------------
-- 6. DATA SEEDING
-- -----------------------------------------------------------------------------

INSERT INTO business_types (id, name) VALUES
    ('retail_store', 'Retail Store'),
    ('service_provider', 'Service Provider'),
    ('agency', 'Agency'),
    ('freelancer', 'Freelancer'),
    ('education', 'Education'),
    ('other_business', 'Other Business');

INSERT INTO system_settings (settings) VALUES ('{"platform_name": "Bangali Enterprise", "currency": "BDT", "session_timeout": 60}');

INSERT INTO api_keys (id, api_key, label, database_url, status)
VALUES (
    'cbf03978-004e-11f1-b7d3-4d24cd9a9a36', 
    'BANGALI_APP_KEY_v1_SECURE', 
    'Main Application Key', 
    'mysql://u562139744_bangaliapp:Bangaliadmin@2025.!?@127.0.0.1:3306/u562139744_bangaliapp',
    'active'
);

-- Use consistent UUIDs for seeding
INSERT INTO businesses (id, name, type, subscription_status)
VALUES ('b0610360-1111-2222-3333-444455556666', 'Abul Khayer Consumers', 'retail_store', 'active');

INSERT INTO profiles (id, full_name, email, role)
VALUES ('a0000001-0000-0000-0000-000000000000', 'Platform CEO', 'admin@bangalienterprise.com', 'global_admin');

INSERT INTO profiles (id, full_name, email, role, business_id)
VALUES ('o0000002-0000-0000-0000-000000000000', 'Arif Hossen Rakib', 'enterprisebangali@gmail.com', 'owner', 'b0610360-1111-2222-3333-444455556666');

INSERT INTO profiles (id, full_name, email, role, business_id)
VALUES ('m0000003-0000-0000-0000-000000000000', 'Retail Manager', 'arifhossenrakib001@gmail.com', 'manager', 'b0610360-1111-2222-3333-444455556666');

INSERT INTO profiles (id, full_name, email, role, business_id)
VALUES ('s0000004-0000-0000-0000-000000000000', 'Retail Seller', 'mrak@virgilian.com', 'seller', 'b0610360-1111-2222-3333-444455556666');

UPDATE businesses SET owner_id = 'o0000002-0000-0000-0000-000000000000' WHERE id = 'b0610360-1111-2222-3333-444455556666';

INSERT INTO business_users (id, business_id, user_id, role) VALUES 
(UUID(), 'b0610360-1111-2222-3333-444455556666', 'o0000002-0000-0000-0000-000000000000', 'owner'),
(UUID(), 'b0610360-1111-2222-3333-444455556666', 'm0000003-0000-0000-0000-000000000000', 'manager'),
(UUID(), 'b0610360-1111-2222-3333-444455556666', 's0000004-0000-0000-0000-000000000000', 'seller');

SET FOREIGN_KEY_CHECKS = 1;
