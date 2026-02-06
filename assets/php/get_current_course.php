<?php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

// Check if course_id is in session
if (!isset($_SESSION['current_course_id'])) {
    // Try to get the most recent enrolled course
    $user_id = $_SESSION['user_id'];
    
    $stmt = $conn->prepare("
        SELECT course_id 
        FROM ENROLLMENT 
        WHERE student_id = ? AND is_active = 1 
        ORDER BY enrollment_id DESC 
        LIMIT 1
    ");
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $_SESSION['current_course_id'] = $row['course_id'];
    } else {
        $stmt->close();
        $conn->close();
        echo json_encode(['success' => false, 'message' => 'No enrolled courses found']);
        exit;
    }
    $stmt->close();
}

$course_id = intval($_SESSION['current_course_id']);

// Get course details
$stmt = $conn->prepare("SELECT course_id, course_title FROM COURSE WHERE course_id = ?");
$stmt->bind_param('i', $course_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $course = $result->fetch_assoc();
    $stmt->close();
    $conn->close();
    
    echo json_encode([
        'success' => true,
        'course_id' => (int)$course['course_id'],
        'course_title' => $course['course_title']
    ]);
} else {
    $stmt->close();
    $conn->close();
    echo json_encode(['success' => false, 'message' => 'Course not found']);
}