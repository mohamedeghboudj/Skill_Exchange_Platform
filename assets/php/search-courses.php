<?php
ini_set('display_errors', 1);
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

$sql = "SELECT 
            courseid AS id,
            coursetitle AS title,
            coursedescription AS description,
            category,
            price,
            duration,
            rating
        FROM COURSE
        WHERE course_title LIKE ?
           OR course_description LIKE ?
           OR category LIKE ?";

$stmt = $conn->prepare($sql);

$like = "%$search%";
$stmt->bind_param("sss", $like, $like, $like);

$stmt->execute();
$result = $stmt->get_result();

$courses = [];
while ($row = $result->fetch_assoc()) {
    $courses[] = $row;
}

echo json_encode($courses);

$stmt->close();
$conn->close();
