<?php
// api/get_courses.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

require_once '../assets/php/db.php';

$teacher_id = $_SESSION['user_id'];

$stmt = $conn->prepare("
    SELECT course_id, course_title, duration, price, category, course_description, rating, enrolled_count
    FROM COURSE
    WHERE teacher_id = ?
    ORDER BY course_id ASC
");
$stmt->bind_param("i", $teacher_id);
$stmt->execute();

$result  = $stmt->get_result();
$courses = [];

while ($row = $result->fetch_assoc()) {
    $courses[] = $row;
}

$stmt->close();

echo json_encode($courses);
?>