<?php
header('Content-Type: application/json');

include __DIR__ . './config.php';

$conn = mysqli_connect(
    DB_HOST,
    DB_USER,
    DB_PASS,
    DB_NAME,
    DB_PORT
);

if (!$conn) {
    http_response_code(500);
    echo json_encode([
        "error" => "Database connection failed",
        "details" => mysqli_connect_error()
    ]);
    exit;
}

$sql = "SELECT category, COUNT(*) AS course_count FROM COURSE GROUP BY category";
$result = mysqli_query($conn, $sql);

$counts = [];
while ($row = mysqli_fetch_assoc($result)) {
    $counts[$row['category']] = (int)$row['course_count'];
}

mysqli_close($conn);
echo json_encode($counts);
