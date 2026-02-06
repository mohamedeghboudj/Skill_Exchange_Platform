<?php
// NO SPACES BEFORE THIS LINE!
session_start();
error_reporting(0); // Suppress PHP errors from breaking JSON
ini_set('display_errors', 0);

header('Content-Type: application/json');

require_once  '../config/db.php';

// Check login
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

if (!isset($_GET['course_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Course ID required']);
    exit;
}

$user_id = intval($_SESSION['user_id']);
$course_id = intval($_GET['course_id']);

$stmt = $conn->prepare("SELECT rating FROM RATING WHERE user_id = ? AND course_id = ?");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}

$stmt->bind_param("ii", $user_id, $course_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode([
        'success' => true, 
        'has_rated' => true, 
        'rating' => floatval($row['rating'])
    ]);
} else {
    echo json_encode([
        'success' => true, 
        'has_rated' => false, 
        'rating' => 0
    ]);
}

$stmt->close();
$conn->close();
exit;
?>