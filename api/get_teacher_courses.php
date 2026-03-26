<?php
// api/get_teacher_courses.php - TEACHER'S COURSES
session_start();
require_once '../config/api_helpers.php';
require_once '../config/db.php';

// Set CORS headers
setCorsHeaders();
setJsonHeader();

// Check authentication
$teacher_id = requireAuth();

try {
    // Select course information
    $stmt = $conn->prepare("
        SELECT 
            course_id,
            course_title,
            enrolled_count,
            rating,
            category,
            price,
            duration
        FROM COURSE
        WHERE teacher_id = ?
        ORDER BY course_id DESC
    ");

    if (!$stmt) {
        handleDbError($conn);
    }

    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $courses = [];
    while ($row = $result->fetch_assoc()) {
        $courses[] = $row;
    }

    $stmt->close();
    $conn->close();

    sendSuccess($courses, 'Courses retrieved successfully');

} catch (Exception $e) {
    logError($e->getMessage(), 'get_teacher_courses.php');
    if (isset($conn)) $conn->close();
    sendError('Failed to retrieve courses', 500);
}
?>
