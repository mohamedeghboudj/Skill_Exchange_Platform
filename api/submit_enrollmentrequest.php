<?php
session_start();
require_once '../c.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$student_id = $_SESSION['user_id'];

// Get POST data - handle both old and new field names
$course_id = isset($_POST['course_id']) ? intval($_POST['course_id']) : 0;
$current_level = isset($_POST['current_level']) ? $_POST['current_level'] : 'beginner';
$available_days = isset($_POST['available_days']) ? $_POST['available_days'] : '';
$available_time = isset($_POST['available_time']) ? $_POST['available_time'] : '';
$student_message = isset($_POST['student_message']) ? trim($_POST['student_message']) : '';

// Optional fields from old form
$student_name = isset($_POST['student_name']) ? trim($_POST['student_name']) : null;
$student_skill = isset($_POST['student_skill']) ? trim($_POST['student_skill']) : null;

// Validate required fields
if ($course_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid course']);
    exit;
}

if (empty($available_days) || empty($available_time) || empty($student_message)) {
    echo json_encode(['success' => false, 'message' => 'Please fill all required fields']);
    exit;
}

// Validate message length (50 chars minimum from frontend validation)
if (strlen($student_message) < 50) {
    echo json_encode(['success' => false, 'message' => 'Message must be at least 50 characters']);
    exit;
}

// Check if user exists and is a student
$check_user_sql = "SELECT full_name, is_teacher FROM USER WHERE user_id = ?";
$check_stmt = $conn->prepare($check_user_sql);
$check_stmt->bind_param("i", $student_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$user_data = $check_result->fetch_assoc();
if ($user_data['is_teacher']) {
    echo json_encode(['success' => false, 'message' => 'Teachers cannot enroll as students']);
    exit;
}
$check_stmt->close();

// Use database name if no name provided
if (!$student_name) {
    $student_name = $user_data['full_name'];
}

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
               (student_id, course_id, current_level, available_days, available_time, student_message, status) 
               VALUES (?, ?, ?, ?, ?, ?, 'pending')";
$insert_stmt = $conn->prepare($insert_sql);
$insert_stmt->bind_param("iissss", $student_id, $course_id, $current_level, $available_days, $available_time, $student_message);

if ($insert_stmt->execute()) {
    $request_id = $insert_stmt->insert_id;
    
    // Log the request (optional)
    error_log("Enrollment request submitted: Student $student_id for Course $course_id");
    
    echo json_encode([
        'success' => true,
        'message' => 'Enrollment request submitted successfully',
        'request_id' => $request_id,
        'student_name' => $student_name
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to submit request: ' . $conn->error]);
}

$insert_stmt->close();
$conn->close();
?>