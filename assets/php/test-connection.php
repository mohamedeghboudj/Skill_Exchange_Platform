<?php
header('Content-Type: application/json');

echo json_encode(['step' => 'Starting connection test']);

require_once 'config.php';

echo json_encode(['step' => 'Config loaded', 'host' => DB_HOST]);

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'error' => $conn->connect_error,
        'host' => DB_HOST,
        'port' => DB_PORT,
        'db' => DB_NAME
    ]);
} else {
    // Test if USER table exists
    $result = $conn->query("SELECT COUNT(*) as count FROM USER");
    if ($result) {
        $row = $result->fetch_assoc();
        echo json_encode([
            'success' => true,
            'message' => 'Connected!',
            'user_table_rows' => $row['count']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => $conn->error
        ]);
    }
    $conn->close();
}
?>
