<?php
// File: /api/get_my_requests.php
require_once '../config/db.php'; // Adjust path based on your actual connection

header('Content-Type: application/json');

// Start session
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Authentication required',
        'redirect' => true
    ]);
    exit;
}

$student_id = $_SESSION['user_id'];

try {
    // Get database connection
    $db = new Database();
    $conn = $db->getConnection();
    
    // Query to get enrollment requests with course and teacher details
    $query = "
        SELECT 
            er.request_id,
            er.course_id,
            er.status as request_status,
            er.request_date,
            er.student_message,
            c.course_title,
            c.price,
            c.category,
            u.user_id as teacher_id,
            u.full_name as teacher_name,
            u.profile_picture as teacher_profile_picture
        FROM ENROLLMENT_REQUEST er
        JOIN COURSE c ON er.course_id = c.course_id
        JOIN USER u ON c.teacher_id = u.user_id
        WHERE er.student_id = :student_id
        ORDER BY er.request_date DESC
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([':student_id' => $student_id]);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format dates for display
    foreach ($requests as &$request) {
        $date = new DateTime($request['request_date']);
        $request['formatted_date'] = $date->format('M d, Y');
        $request['formatted_time'] = $date->format('h:i A');
    }
    
    echo json_encode([
        'success' => true,
        'data' => $requests
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>