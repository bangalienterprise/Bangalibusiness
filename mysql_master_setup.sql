-- ==========================================================
-- 🚀 MASTER PRODUCTION SCRIPT: BANGALI ENTERPRISE (ALL-IN-ONE)
-- Database: u562139744_bangaliapp
-- Supports: Retail, Restaurant, Service, Agency, Education, Freelancer
-- Includes: Auth, SaaS Billing, Notifications, & Full Data Safety
-- ==========================================================

USE `u562139744_bangaliapp`;

-- Disable checks for smooth installation
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+06:00"; 

-- ==========================================================
-- 1. CORE SECURITY & USERS
-- ==========================================================

-- 1.1 USERS (Profiles)
CREATE TABLE IF NOT EXISTS `profiles` (
  `id` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NULL,
  `full_name` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `avatar_url` VARCHAR(255) NULL,
  `system_role` ENUM('global_admin', 'user') DEFAULT 'user',
  `last_login_at` DATETIME DEFAULT NULL,
  `last_login_ip` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.2 PASSWORD RESETS (Critical for "Never Lost Data")
CREATE TABLE IF NOT EXISTS `password_resets` (
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.3 SYSTEM SETTINGS (Admin Config)
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` CHAR(36) NOT NULL,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.4 NOTIFICATIONS (System Alerts)
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notif_fk_user` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.5 API KEYS (Secure Access)
CREATE TABLE IF NOT EXISTS `api_keys` (
  `id` CHAR(36) NOT NULL,
  `api_key` VARCHAR(255) NOT NULL,
  `label` VARCHAR(255) DEFAULT NULL,
  `database_url` TEXT,
  `status` ENUM('active', 'revoked') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_used_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_key` (`api_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 2. SAAS INFRASTRUCTURE (Business & Plans)
-- ==========================================================

-- 2.1 BUSINESS TYPES (The 6 Pillars)
CREATE TABLE IF NOT EXISTS `business_types` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.2 BUSINESSES (Tenants)
CREATE TABLE IF NOT EXISTS `businesses` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type_id` CHAR(36) DEFAULT NULL,
  `address` TEXT,
  `phone` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `logo_url` VARCHAR(255) DEFAULT NULL,
  `currency` VARCHAR(10) DEFAULT 'BDT',
  `is_active` TINYINT(1) DEFAULT 1,
  `settings` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `type_id` (`type_id`),
  CONSTRAINT `biz_fk_type` FOREIGN KEY (`type_id`) REFERENCES `business_types` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.3 SAAS SUBSCRIPTIONS (Billing)
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` CHAR(36) NOT NULL,
  `business_id` CHAR(36) NOT NULL,
  `plan_name` VARCHAR(50) DEFAULT 'Free',
  `start_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `end_date` TIMESTAMP NULL,
  `status` ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  PRIMARY KEY (`id`),
  KEY `business_id` (`business_id`),
  CONSTRAINT `sub_fk_biz` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.4 TEAM MEMBERS (Access Control)
CREATE TABLE IF NOT EXISTS `organization_members` (
  `id` CHAR(36) NOT NULL,
  `business_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `role` ENUM('owner', 'manager', 'seller') NOT NULL,
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_membership` (`business_id`,`user_id`),
  CONSTRAINT `org_fk_biz` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `org_fk_user` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 3. RETAIL & COMMERCE MODULE
-- ==========================================================

CREATE TABLE IF NOT EXISTS `categories` (
  `id` CHAR(36) NOT NULL,
  `business_id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `cat_fk_biz` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` CHAR(36) NOT NULL,
  `business_id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `contact_person` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `address` TEXT,
  PRIMARY KEY (`id`),
  CONSTRAINT `sup_fk_biz` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `products` (
  `id` CHAR(36) NOT NULL,
  `business_id` CHAR(36) NOT NULL,
  `category_id` CHAR(36) DEFAULT NULL,
  `supplier_id` CHAR(36) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) DEFAULT NULL,
  `purchase_price` DECIMAL(12,2) DEFAULT '0.00',
  `selling_price` DECIMAL(12,2) NOT NULL,
  `stock_quantity` INT DEFAULT 0,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `is_service` TINYINT(1) DEFAULT 0, -- 0=Product, 1=Service (Agency/Freelancer)
  `is_active` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT `prod_fk_biz` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prod_fk_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `prod_fk_sup` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `customers` (
  `id` CHAR(36) NOT NULL,
  `business_id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `address` TEXT,
  PRIMARY KEY (`id`),
  CONSTRAINT `cust_fk_biz` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `sales` (
  `id` CHAR(36) NOT NULL,
  `business_id` CHAR(36) NOT NULL,
  `customer_id` CHAR(36) DEFAULT NULL,
  `seller_id` CHAR(36) DEFAULT NULL,
  `sub_total` DECIMAL(12,2) NOT NULL,
  `grand_total` DECIMAL(12,2) NOT NULL,
  `paid_amount` DECIMAL(12,2) DEFAULT '0.00',
  `payment_method` VARCHAR(50) DEFAULT 'cash',
  `status` VARCHAR(50) DEFAULT 'completed',
  `sale_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `sale_fk_biz` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sale_fk_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sale_fk_user` FOREIGN KEY (`seller_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `sale_items` (
  `id` CHAR(36) NOT NULL,
  `sale_id` CHAR(36) NOT NULL,
  `product_id` CHAR(36) DEFAULT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `sub_total` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `item_fk_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `item_fk_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` CHAR(36) NOT NULL,
  `business_id` CHAR(36) NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `description` TEXT,
  `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `exp_fk_biz` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- 4. RESTAURANT MODULE
-- ==========================================================

CREATE TABLE IF NOT EXISTS `restaurant_tables` (
  `id` CHAR(36) NOT NULL,
  `business_id` CHAR(36) NOT NULL,
  `table_number` VARCHAR(50) NOT NULL,
  `seats` INT DEFAULT 4,
  `status` ENUM('available', 'occupied', 'reserved', 'cleaning') DEFAULT 'available',
  PRIMARY KEY (`id`),
  CONSTRAINT `table_fk_biz` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- 5. SERVICE / AGENCY / APPOINTMENTS MODULE
-- ==========================================================

CREATE TABLE IF NOT EXISTS `appointments` (
  `id` CHAR(36) NOT NULL,
  `business_id` CHAR(36) NOT NULL,
  `customer_id` CHAR(36) DEFAULT NULL,
  `staff_id` CHAR(36) DEFAULT NULL,
  `appointment_time` DATETIME NOT NULL,
  `status` ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  `notes` TEXT,
  PRIMARY KEY (`id`),
  CONSTRAINT `appt_fk_biz` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appt_fk_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `appt_fk_staff` FOREIGN KEY (`staff_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==========================================================
-- 6. EDUCATION MODULE (Schools)
-- ==========================================================

CREATE TABLE IF NOT EXISTS `edu_students` (
  `id` CHAR(36) NOT NULL,
  `business_id` CHAR(36) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `roll_number` VARCHAR(50) DEFAULT NULL,
  `guardian_phone` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `edu_st_fk_biz` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `edu_courses` (
  `id` CHAR(36) NOT NULL,
  `business_id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `fee` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `schedule` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `edu_cs_fk_biz` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `edu_enrollments` (
  `id` CHAR(36) NOT NULL,
  `business_id` CHAR(36) NOT NULL,
  `student_id` CHAR(36) NOT NULL,
  `course_id` CHAR(36) NOT NULL,
  `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `edu_en_fk_biz` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `edu_en_fk_st` FOREIGN KEY (`student_id`) REFERENCES `edu_students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `edu_en_fk_cs` FOREIGN KEY (`course_id`) REFERENCES `edu_courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- 7. FREELANCER MODULE
-- ==========================================================

CREATE TABLE IF NOT EXISTS `freelance_projects` (
  `id` CHAR(36) NOT NULL,
  `business_id` CHAR(36) NOT NULL,
  `client_name` VARCHAR(255) NOT NULL,
  `project_title` VARCHAR(255) NOT NULL,
  `budget` DECIMAL(12,2) DEFAULT '0.00',
  `deadline` DATE DEFAULT NULL,
  `status` ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  PRIMARY KEY (`id`),
  CONSTRAINT `free_pj_fk_biz` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `freelance_tasks` (
  `id` CHAR(36) NOT NULL,
  `project_id` CHAR(36) NOT NULL,
  `task_name` VARCHAR(255) NOT NULL,
  `is_completed` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `free_tk_fk_pj` FOREIGN KEY (`project_id`) REFERENCES `freelance_projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- 8. FINAL DATA SEEDING
-- ==========================================================

-- Seed All 6 Business Types
INSERT IGNORE INTO `business_types` (`id`, `name`, `slug`, `icon`) VALUES
('type-ret-001', 'Retail Store', 'retail', 'shopping-cart'),
('type-rest-001', 'Restaurant', 'restaurant', 'coffee'),
('type-serv-001', 'Service Provider', 'service', 'wrench'),
('type-agency-001', 'Agency', 'agency', 'briefcase'),
('type-edu-001', 'Education', 'education', 'graduation-cap'),
('type-free-001', 'Freelancer', 'freelancer', 'user');

-- Seed Admin
INSERT IGNORE INTO `profiles` (`id`, `email`, `full_name`, `system_role`) VALUES
('user-admin-001', 'admin@bangalienterprise.com', 'Super Admin', 'global_admin');

-- Seed API Key
INSERT IGNORE INTO `api_keys` (`id`, `api_key`, `label`, `database_url`, `status`) VALUES
(UUID(), 'BANGALI_APP_KEY_v1_SECURE', 'Main Application Key', 'mysql://u562139744_bangaliapp:Bangaliadmin@2025.!?@127.0.0.1:3306/u562139744_bangaliapp', 'active');

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- STATUS: FULL PRODUCTION READY
-- ==========================================================
