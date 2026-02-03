<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
require_once "config.php";

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
if ($conn->connect_error) {
    echo json_encode(["error" => $conn->connect_error]);
    exit;
}

$category = trim($_GET['category'] ?? '');

// ✅ If no category → return ALL courses
if ($category === '') {
    $sql = "SELECT 
    c.courseid AS id,
    c.coursetitle AS title,
    c.coursedescription AS description,
    c.category,
    c.price,
    c.duration,
    c.rating,
    u.fullname AS instructor
FROM COURSE c
JOIN USER u ON u.userid = c.teacherid;";
    $stmt = $conn->prepare($sql);
} else {
    $sql = "SELECT 
    c.courseid AS id,
    c.coursetitle AS title,
    c.coursedescription AS description,
    c.category,
    c.price,
    c.duration,
    c.rating,
    u.fullname AS instructor
FROM COURSE c
JOIN USER u ON u.userid = c.teacherid
WHERE c.category LIKE ? ;";
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

