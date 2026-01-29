<?php
$host = "mysql-3050642e-learnland63.k.aivencloud.com";
$user = "avnadmin";
$pass = "AVNS_L5dWdIuG88yYHyxP7RE";
$db   = "learland_db";
$port = 19985;
// Initialize connection with SSL
$conn = mysqli_init();
if (!$conn) {
    http_response_code(500);
    die(json_encode(['success' => false, 'message' => 'Connection initialization failed']));
}

// Configure SSL (required for Aiven)
mysqli_ssl_set($conn, NULL, NULL, NULL, NULL, NULL);

// Connect
if (!mysqli_real_connect($conn, $host, $user, $pass, $db, $port, NULL, MYSQLI_CLIENT_SSL)) {
    http_response_code(500);
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . mysqli_connect_error()]));
}
?>