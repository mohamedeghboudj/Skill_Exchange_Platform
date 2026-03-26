<?php
// api/get_courses.php - TEACHER'S COURSES
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([]);
    exit;
}

require_once '../config/db.php';

$teacher_id = $_SESSION['user_id'];

// Select only course_title, enrolled_count, and rating
$stmt = $conn->prepare("
    SELECT 
        course_id,
        course_title,
        enrolled_count,
        rating
    FROM COURSE
    WHERE teacher_id = ?
    ORDER BY course_id DESC
");

if (!$stmt) {
    echo json_encode([]);
    exit;
}

$stmt->bind_param("i", $teacher_id);
$stmt->execute();
$result = $stmt->get_result();

$courses = [];
while ($row = $result->fetch_assoc()) {
    $courses[] = $row;
}

$stmt->close();

echo json_encode($courses);
?>
