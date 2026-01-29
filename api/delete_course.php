<?php
session_start();
require_once '../config.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$video_id = isset($data['video_id']) ? intval($data['video_id']) : 0;

if ($video_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid video ID']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get video info and verify ownership
$check_sql = "SELECT v.video_id, v.video_url, c.teacher_id 
              FROM VIDEO v 
              JOIN COURSE c ON v.course_id = c.course_id 
              WHERE v.video_id = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("i", $video_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Video not found']);
    exit;
}

$video_data = $check_result->fetch_assoc();
if ($video_data['teacher_id'] != $user_id) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}
$check_stmt->close();

// Delete video file if exists
if (!empty($video_data['video_url'])) {
    $file_path = '../' . ltrim($video_data['video_url'], '/');
    if (file_exists($file_path)) {
        unlink($file_path);
    }
}

// Delete from database
$delete_sql = "DELETE FROM VIDEO WHERE video_id = ?";
$delete_stmt = $conn->prepare($delete_sql);
$delete_stmt->bind_param("i", $video_id);

if ($delete_stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Video deleted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}

$delete_stmt->close();
$conn->close();
?>