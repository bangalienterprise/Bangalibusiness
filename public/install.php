<?php
// Simple Installation Script for Shared Hosting
// Access this via https://bangalienterprise.com/install.php

$host = "127.0.0.1";
$db_name = "u562139744_bangaliapp";
$username = "u562139744_bangaliapp";
$password = "Bangaliadmin@2025.!?";

echo "<h1>Bangali Enterprise Installer</h1>";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<p style='color:green'>✅ Database Connection Successful!</p>";

    // Read the SQL file (assuming it was uploaded to root or src/sql)
    // Since we are in public_html (dist), the sql file might not be here unless uploaded.
    // For safety, we will hardcode the critical fixes here.
    
    $sql_commands = [
        // Fix Profiles
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS system_role ENUM('global_admin', 'user') DEFAULT 'user' AFTER avatar_url",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at DATETIME DEFAULT NULL",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45) DEFAULT NULL",
        
        // Ensure Admin Exists
        "INSERT IGNORE INTO profiles (id, email, full_name, system_role) VALUES ('user-admin-001', 'admin@bangalienterprise.com', 'Super Admin', 'global_admin')",
        
        // Force Update Admin Role
        "UPDATE profiles SET system_role = 'global_admin' WHERE email = 'admin@bangalienterprise.com'"
    ];

    foreach ($sql_commands as $sql) {
        try {
            $conn->exec($sql);
            echo "<p>Executed: " . htmlspecialchars($sql) . "</p>";
        } catch (PDOException $e) {
            echo "<p style='color:orange'>Warning: " . $e->getMessage() . "</p>";
        }
    }

    echo "<p style='color:blue'>🚀 Setup Complete. Please delete this file for security.</p>";

} catch(PDOException $exception) {
    echo "<p style='color:red'>❌ Connection Failed: " . $exception->getMessage() . "</p>";
}
?>