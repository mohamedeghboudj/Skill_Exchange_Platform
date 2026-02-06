<?php
session_start();
require_once '../config/db.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];

// DEBUG: Log who's trying to submit
error_log("=== Enrollment Request Attempt ===");
error_log("User ID: " . $user_id);
error_log("Session data: " . print_r($_SESSION, true));

// Get POST data
$course_id = isset($_POST['course_id']) ? intval($_POST['course_id']) : 0;
$student_message = isset($_POST['student_message']) ? trim($_POST['student_message']) : '';

// DEBUG: Log form data
error_log("Course ID: " . $course_id);
error_log("Message length: " . strlen($student_message));

// Validate required fields
if ($course_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid course']);
    exit;
}

if (empty($student_message)) {
    echo json_encode(['success' => false, 'message' => 'Please provide a message']);
    exit;
}

// Validate message length (50 chars minimum)
if (strlen($student_message) < 50) {
    echo json_encode(['success' => false, 'message' => 'Message must be at least 50 characters']);
    exit;
}

// Check if user exists
$check_user_sql = "SELECT user_id, full_name FROM USER WHERE user_id = ?";
$check_stmt = $conn->prepare($check_user_sql);

if (!$check_stmt) {
    error_log("Prepare failed: " . $conn->error);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}

$check_stmt->bind_param("i", $user_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows === 0) {
    error_log("User not found in database: " . $user_id);
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$user_data = $check_result->fetch_assoc();
$check_stmt->close();

// Student info
$student_id = $user_id;
$student_name = $user_data['full_name'];

// Check if course exists
$course_sql = "SELECT course_id FROM COURSE WHERE course_id = ?";
$course_stmt = $conn->prepare($course_sql);
$course_stmt->bind_param("i", $course_id);
$course_stmt->execute();
$course_result = $course_stmt->get_result();

if ($course_result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Course not found']);
    exit;
}
$course_stmt->close();

// Check if already enrolled
$enrollment_sql = "SELECT enrollment_id FROM ENROLLMENT WHERE student_id = ? AND course_id = ?";
$enrollment_stmt = $conn->prepare($enrollment_sql);
$enrollment_stmt->bind_param("ii", $student_id, $course_id);
$enrollment_stmt->execute();
$enrollment_result = $enrollment_stmt->get_result();

if ($enrollment_result->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Already enrolled in this course']);
    exit;
}
$enrollment_stmt->close();

// Check if pending request already exists
$request_sql = "SELECT request_id FROM ENROLLMENT_REQUEST WHERE student_id = ? AND course_id = ? AND status = 'pending'";
$request_stmt = $conn->prepare($request_sql);
$request_stmt->bind_param("ii", $student_id, $course_id);
$request_stmt->execute();
$request_result = $request_stmt->get_result();

if ($request_result->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'You already have a pending request for this course']);
    exit;
}
$request_stmt->close();

// Insert enrollment request
$insert_sql = "INSERT INTO ENROLLMENT_REQUEST 
               (student_id, course_id, request_date, status, student_message) 
               VALUES (?, ?, NOW(), 'pending', ?)";
$insert_stmt = $conn->prepare($insert_sql);
$insert_stmt->bind_param("iis", $student_id, $course_id, $student_message);

if ($insert_stmt->execute()) {
    $request_id = $insert_stmt->insert_id;
    
    error_log("SUCCESS: Enrollment request submitted. Student $student_id for Course $course_id");
    
    echo json_encode([
        'success' => true,
        'message' => 'Enrollment request submitted successfully',
        'request_id' => $request_id,
        'student_name' => $student_name
    ]);
} else {
    error_log("FAILED: " . $conn->error);
    echo json_encode(['success' => false, 'message' => 'Failed to submit request: ' . $conn->error]);
}

$insert_stmt->close();
$conn->close();
?>