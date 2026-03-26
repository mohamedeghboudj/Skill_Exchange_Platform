<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Content-Type: application/json");
require_once "db.php";

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
                u.full_name AS instructor,
                u.profile_picture AS teacher_profile
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
                u.full_name AS instructor,
                u.profile_picture AS teacher_profile
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
