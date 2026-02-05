<?php
// File: /api/get_teacher_requests.php
require_once '../config/db.php';

session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$teacher_id = $_SESSION['user_id'];

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $query = "
        SELECT 
            er.request_id,
            er.student_id,
            er.course_id,
            er.status as request_status,
            er.request_date,
            er.student_message,
            c.course_title,
            c.price,
            c.category,
            u.full_name as student_name,
            u.email as student_email,
            u.profile_picture as student_picture
        FROM ENROLLMENT_REQUEST er
        JOIN COURSE c ON er.course_id = c.course_id
        JOIN USER u ON er.student_id = u.user_id
        WHERE c.teacher_id = :teacher_id
        AND er.status IN ('pending', 'accepted')
        ORDER BY 
            CASE er.status 
                WHEN 'pending' THEN 1 
                WHEN 'accepted' THEN 2 
                ELSE 3 
            END,
            er.request_date DESC
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([':teacher_id' => $teacher_id]);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format dates
    foreach ($requests as &$request) {
        $date = new DateTime($request['request_date']);
        $request['formatted_date'] = $date->format('M d, Y');
        $request['formatted_time'] = $date->format('h:i A');
    }
    
    echo json_encode(['success' => true, 'data' => $requests]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>