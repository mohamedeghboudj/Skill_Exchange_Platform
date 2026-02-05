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

$stmt = $conn->prepare("
    SELECT 
        course_id, 
        course_title, 
        course_description, 
        category, 
        price, 
        duration, 
        rating, 
        enrolled_count,
        teacher_id
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

// Returns plain array
echo json_encode($courses);
?>