<?php
// NO SPACES BEFORE THIS LINE!
session_start();
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

require_once  '../config/db.php';

// Check login
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

// Read JSON body
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['course_id'], $data['rating'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

$user_id = intval($_SESSION['user_id']);
$course_id = intval($data['course_id']);
$rating = floatval($data['rating']);

// Validate rating
if ($rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Rating must be between 1 and 5']);
    exit;
}

// Check enrollment
$stmt = $conn->prepare("SELECT enrollment_id FROM ENROLLMENT WHERE student_id = ? AND course_id = ? AND is_active = 1");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}

$stmt->bind_param("ii", $user_id, $course_id);
$stmt->execute();
$enrollment_result = $stmt->get_result();
$stmt->close();

if ($enrollment_result->num_rows === 0) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'You must be enrolled in this course to rate it']);
    exit;
}

// Check if rating exists
$stmt = $conn->prepare("SELECT rating FROM RATING WHERE user_id = ? AND course_id = ?");
$stmt->bind_param("ii", $user_id, $course_id);
$stmt->execute();
$existing = $stmt->get_result();
$stmt->close();

if ($existing->num_rows > 0) {
    // Update existing rating
    $stmt = $conn->prepare("UPDATE RATING SET rating = ? WHERE user_id = ? AND course_id = ?");
    $stmt->bind_param("dii", $rating, $user_id, $course_id);
    $message = 'Rating updated successfully!';
} else {
    // Insert new rating
    $stmt = $conn->prepare("INSERT INTO RATING (user_id, course_id, rating) VALUES (?, ?, ?)");
    $stmt->bind_param("iid", $user_id, $course_id, $rating);
    $message = 'Thank you for rating this course!';
}

if ($stmt->execute()) {
    $stmt->close();
    
    // Update course average rating
    $stmt = $conn->prepare("UPDATE COURSE SET rating = (SELECT AVG(rating) FROM RATING WHERE course_id = ?) WHERE course_id = ?");
    $stmt->bind_param("ii", $course_id, $course_id);
    $stmt->execute();
    $stmt->close();
    
    echo json_encode(['success' => true, 'message' => $message, 'rating' => $rating]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}

$conn->close();
exit;
?>