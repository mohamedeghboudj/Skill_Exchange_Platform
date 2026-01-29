<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';


if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Not logged in'
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get latest request of this user
$stmt = $conn->prepare("
    SELECT teacher_status 
    FROM TEACHER_REQUEST 
    WHERE user_id = ? 
    ORDER BY teacher_request_id DESC 
    LIMIT 1
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    echo json_encode([
        'status' => 'no_request'
    ]);
    exit;
}
$row = $result->fetch_assoc();

echo json_encode([
    'status' => 'success',
    'teacher_status' => $row['teacher_status']
]);
$stmt->close();
$conn->close();
?>

// displaying or redirecting based on the respose : 
