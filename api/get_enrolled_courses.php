<?php
// api/get_enrolled_courses.php - Get student's enrolled courses with progress
session_start();
require_once '../config/api_helpers.php';
require_once '../config/db.php';

// Set CORS headers
setCorsHeaders();
setJsonHeader();

// Check authentication
$student_id = requireAuth();

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
        handleDbError($conn);
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

    sendSuccess($courses, 'Enrolled courses retrieved successfully');

} catch (Exception $e) {
    logError($e->getMessage(), 'get_enrolled_courses.php');
    if (isset($conn)) $conn->close();
    sendError('Failed to retrieve enrolled courses', 500);
}
?>
