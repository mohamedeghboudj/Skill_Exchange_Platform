<?php
session_start();
require_once '../config.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$assignment_id = isset($data['assignment_id']) ? intval($data['assignment_id']) : 0;

if ($assignment_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid assignment ID']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get assignment info and verify ownership
$check_sql = "SELECT a.assignment_id, a.assignment_url, c.teacher_id 
              FROM ASSIGNMENT a 
              JOIN COURSE c ON a.course_id = c.course_id 
              WHERE a.assignment_id = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("i", $assignment_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Assignment not found']);
    exit;
}

$assignment_data = $check_result->fetch_assoc();
if ($assignment_data['teacher_id'] != $user_id) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}
$check_stmt->close();

// Delete file if exists
if (!empty($assignment_data['assignment_url'])) {
    $file_path = '../' . ltrim($assignment_data['assignment_url'], '/');
    if (file_exists($file_path)) {
        unlink($file_path);
    }
}

// Delete from database
$delete_sql = "DELETE FROM ASSIGNMENT WHERE assignment_id = ?";
$delete_stmt = $conn->prepare($delete_sql);
$delete_stmt->bind_param("i", $assignment_id);

if ($delete_stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Assignment deleted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}

$delete_stmt->close();
$conn->close();
?>