<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Content-Type: application/json");
require_once "config.php";

$conn = new mysqli(
    DB_HOST,
    DB_USER,
    DB_PASS,
    DB_NAME,
    DB_PORT
);

if ($conn->connect_error) {
    die(json_encode(["error" => $conn->connect_error]));
}

$search = trim($_GET['q'] ?? '');

// If search is empty, return all courses
if ($search === '') {
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
            WHERE c.course_title LIKE ?
               OR c.course_description LIKE ?
               OR c.category LIKE ?
               OR u.full_name LIKE ?";
    $stmt = $conn->prepare($sql);
    $like = "%$search%";
    $stmt->bind_param("ssss", $like, $like, $like, $like);
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