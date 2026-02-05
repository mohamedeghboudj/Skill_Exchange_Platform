<?php
// File: /api/get_teacher_pending_requests.php
session_start();
header('Content-Type: application/json');

// Turn off error display
error_reporting(0);
ini_set('display_errors', 0);

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$teacher_id = $_SESSION['user_id'];

// Use MySQLi (like your other files)
require_once '../assets/php/db.php'; // Your existing MySQLi connection

try {
    // Check if user is teacher
    $checkStmt = $conn->prepare("SELECT is_teacher FROM USER WHERE user_id = ?");
    $checkStmt->bind_param("i", $teacher_id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    $user = $checkResult->fetch_assoc();
    
    if (!$user || !$user['is_teacher']) {
        echo json_encode(['success' => false, 'error' => 'User is not a teacher']);
        exit;
    }
    
    // Get requests - SIMPLIFIED VERSION FIRST
    // Check if ENROLLMENT_REQUEST table exists
    $query = "
        SELECT 
            er.request_id,
            er.student_id,
            er.course_id,
            er.status as request_status,
            er.request_date,
            c.course_title,
            u.full_name as student_name,
            u.profile_picture as student_picture
        FROM ENROLLMENT_REQUEST er
        JOIN COURSE c ON er.course_id = c.course_id
        JOIN USER u ON er.student_id = u.user_id
        WHERE c.teacher_id = ?
        ORDER BY er.request_date DESC
        LIMIT 20
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $requests = [];
    while ($row = $result->fetch_assoc()) {
        $requests[] = $row;
    }
    
    $stmt->close();
    
    // If no requests or table doesn't exist, return empty array
    if (empty($requests)) {
        echo json_encode([
            'success' => true,
            'data' => [],
            'message' => 'No requests found'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'data' => $requests
        ]);
    }
    
} catch (Exception $e) {
    // Return empty array instead of error for now
    echo json_encode([
        'success' => true,
        'data' => [],
        'debug' => 'Table might not exist: ' . $e->getMessage()
    ]);
}

$conn->close();
?>