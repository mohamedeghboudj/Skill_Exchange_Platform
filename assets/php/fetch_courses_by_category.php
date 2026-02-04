<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Content-Type: application/json");
require_once "config.php";

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
if ($conn->connect_error) {
    echo json_encode(["error" => $conn->connect_error]);
    exit;
}

$category = trim($_GET['category'] ?? '');

if ($category === '') {
    // Return all courses
    $sql = "SELECT 
                c.course_id AS id,
                c.course_title AS title,
                c.course_description AS description,
                c.category,
                c.price,
                c.duration,
                c.rating,
                u.full_name AS instructor
            FROM COURSE c
            JOIN USER u ON u.user_id = c.teacher_id";
    $stmt = $conn->prepare($sql);
} else {
    // Filter by category
    $sql = "SELECT 
                c.course_id AS id,
                c.course_title AS title,
                c.course_description AS description,
                c.category,
                c.price,
                c.duration,
                c.rating,
                u.full_name AS instructor
            FROM COURSE c
            JOIN USER u ON u.user_id = c.teacher_id
            WHERE c.category LIKE ?";
    $stmt = $conn->prepare($sql);
    $like = "%$category%";
    $stmt->bind_param("s", $like);
}

$stmt->execute();
$result = $stmt->get_result();

$courses = [];
while ($row = $result->fetch_assoc()) {
    $courses[] = $row;
}

echo json_encode($courses);

$stmt->close();
$conn->close();
?>