<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-API-KEY");

// Handle Preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "127.0.0.1";
$db_name = "u562139744_bangaliapp";
$username = "u562139744_bangaliapp";
$password = "Bangaliadmin@2025.!?";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8");

    // --- SECURITY CHECK ---
    $headers = apache_request_headers();
    $apiKey = isset($headers['X-API-KEY']) ? $headers['X-API-KEY'] : (isset($_GET['api_key']) ? $_GET['api_key'] : '');

    if (empty($apiKey)) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized: API Key missing"]);
        exit;
    }

    // Verify Key in Database
    $stmt = $conn->prepare("SELECT id FROM api_keys WHERE api_key = :key AND status = 'active' LIMIT 1");
    $stmt->bindParam(':key', $apiKey);
    $stmt->execute();

    if ($stmt->rowCount() == 0) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden: Invalid API Key"]);
        exit;
    }

    // Update last_used_at
    $updateStmt = $conn->prepare("UPDATE api_keys SET last_used_at = NOW() WHERE api_key = :key");
    $updateStmt->bindParam(':key', $apiKey);
    $updateStmt->execute();
    
    // --- END SECURITY CHECK ---

    // Simple health check
    if (isset($_GET['health'])) {
        echo json_encode([
            "status" => "success", 
            "message" => "Database Connected & Authenticated Successfully",
            "timestamp" => date('Y-m-d H:i:s')
        ]);
        exit;
    }

} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Connection error: " . $exception->getMessage()]);
    exit;
}
?>