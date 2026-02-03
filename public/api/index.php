<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

echo json_encode([
    "status" => "ok",
    "service" => "Bangali Enterprise API",
    "version" => "1.0",
    "message" => "API is running. Use /api/db.php?health=1 for health check.",
    "endpoints" => [
        "GET /api/db.php" => "Database connectivity check"
    ]
]);
?>