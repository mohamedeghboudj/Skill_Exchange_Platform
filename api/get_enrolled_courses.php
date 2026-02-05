<?php
// api/get_enrolled_courses.php - OOP MySQLi version
session_start();
header('Content-Type: application/json');

require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$student_id = $_SESSION['user_id'];

try {
    $sql = "
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
            u.full_name AS teacher_name,
            u.profile_picture AS teacher_picture
        FROM ENROLLMENT e
        JOIN COURSE c ON e.course_id = c.course_id
        JOIN USER u ON c.teacher_id = u.user_id
        WHERE e.student_id = ?
          AND e.is_active = 1
        ORDER BY e.enrollment_id DESC
    ";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("i", $student_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $courses = [];
    while ($row = $result->fetch_assoc()) {
        $courses[] = $row;
    }

    $stmt->close();
    $conn->close();

    echo json_encode([
        'success' => true,
        'data' => $courses
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
