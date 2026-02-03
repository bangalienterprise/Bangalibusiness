USE `u562139744_bangaliapp`;

-- 1. Add the missing column 'system_role' if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = "profiles";
SET @columnname = "system_role";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE profiles ADD COLUMN system_role ENUM('global_admin', 'user') DEFAULT 'user' AFTER avatar_url"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Add 'last_login_at' and 'last_login_ip' if missing (for advanced security)
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'profiles' AND column_name = 'last_login_at') > 0,
  "SELECT 1",
  "ALTER TABLE profiles ADD COLUMN last_login_at DATETIME DEFAULT NULL"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'profiles' AND column_name = 'last_login_ip') > 0,
  "SELECT 1",
  "ALTER TABLE profiles ADD COLUMN last_login_ip VARCHAR(45) DEFAULT NULL"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;

-- 3. Now try to Insert the Admin again
INSERT IGNORE INTO `profiles` (`id`, `email`, `full_name`, `system_role`) VALUES
('user-admin-001', 'admin@bangalienterprise.com', 'Super Admin', 'global_admin');

-- 4. Double check Admin status (Force update just in case user exists but role is wrong)
UPDATE `profiles` SET `system_role` = 'global_admin' WHERE `email` = 'admin@bangalienterprise.com';
