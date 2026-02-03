<?php
// File: ../assets/php/api/enrollment-requests.php
require_once '../db.php';

$db = new Database();
$connection = $db->getConnection();
requireLogin();

$student_id = getCurrentUserId();

try {
    $query = "
        SELECT 
            er.request_id,
            er.course_id,
            er.status,
            er.request_date,
            er.student_message,
            c.course_title,
            c.price,
            u.user_id as teacher_id,
            u.full_name as teacher_name,
            u.profile_picture as teacher_profile_picture
        FROM ENROLLMENT_REQUEST er
        JOIN COURSE c ON er.course_id = c.course_id
        JOIN USER u ON c.teacher_id = u.user_id
        WHERE er.student_id = :student_id
        ORDER BY er.request_date DESC
    ";
    
    $stmt = $connection->prepare($query);
    $stmt->bindParam(':student_id', $student_id);
    $stmt->execute();
    
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "data" => $requests
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        "error" => "Database error: " . $e->getMessage()
    ]);
}
?>