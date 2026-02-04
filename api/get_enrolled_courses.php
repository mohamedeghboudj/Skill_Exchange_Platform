<?php
// /api/get_enrolled_courses.php
require_once '../config/db.php';

session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$student_id = $_SESSION['user_id'];

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $query = "
        SELECT 
            c.course_id,
            c.course_title,
            c.course_description,
            c.category,
            c.price,
            c.duration,
            c.rating,
            c.enrolled_count,
            e.enrollment_id,
            e.progress_percentage,
            e.videos_watched,
            e.assignments_completed,
            e.is_active,
            u.full_name as teacher_name,
            u.profile_picture as teacher_picture
        FROM ENROLLMENT e
        JOIN COURSE c ON e.course_id = c.course_id
        JOIN USER u ON c.teacher_id = u.user_id
        WHERE e.student_id = :student_id 
        AND e.is_active = 1
        ORDER BY e.enrollment_id DESC
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([':student_id' => $student_id]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $courses]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>