<?php
// api/get_videos.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

if (!isset($_GET['course_id']) || !is_numeric($_GET['course_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing or invalid course_id']);
    exit;
}

require_once '../assets/php/db.php';

$course_id = (int)$_GET['course_id'];

$stmt = $conn->prepare("
    SELECT video_id, video_title, video_url
    FROM VIDEO
    WHERE course_id = ?
    ORDER BY video_id ASC
");
$stmt->bind_param("i", $course_id);
$stmt->execute();

$result = $stmt->get_result();
$videos = [];

while ($row = $result->fetch_assoc()) {
    $videos[] = $row;
}

$stmt->close();

echo json_encode($videos);
?>