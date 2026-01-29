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
$video_ids = isset($data['video_ids']) ? $data['video_ids'] : [];

if (empty($video_ids) || !is_array($video_ids)) {
    echo json_encode(['success' => false, 'message' => 'Invalid video IDs']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Convert all IDs to integers
$video_ids = array_map('intval', $video_ids);
$placeholders = implode(',', array_fill(0, count($video_ids), '?'));

// Verify all videos belong to this teacher
$check_sql = "SELECT v.video_id, v.video_url 
              FROM VIDEO v 
              JOIN COURSE c ON v.course_id = c.course_id 
              WHERE v.video_id IN ($placeholders) AND c.teacher_id = ?";
$check_stmt = $conn->prepare($check_sql);

// Bind parameters: video_ids + user_id
$types = str_repeat('i', count($video_ids)) . 'i';
$params = array_merge($video_ids, [$user_id]);
$check_stmt->bind_param($types, ...$params);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

$videos_to_delete = [];
while ($row = $check_result->fetch_assoc()) {
    $videos_to_delete[] = $row;
}

if (count($videos_to_delete) != count($video_ids)) {
    echo json_encode(['success' => false, 'message' => 'Some videos not found or unauthorized']);
    exit;
}
$check_stmt->close();

// Delete video files
foreach ($videos_to_delete as $video) {
    if (!empty($video['video_url'])) {
        $file_path = '../' . ltrim($video['video_url'], '/');
        if (file_exists($file_path)) {
            unlink($file_path);
        }
    }
}

// Delete from database
$delete_sql = "DELETE FROM VIDEO WHERE video_id IN ($placeholders)";
$delete_stmt = $conn->prepare($delete_sql);
$delete_stmt->bind_param($types, ...$video_ids);

if ($delete_stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Videos deleted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}

$delete_stmt->close();
$conn->close();
?>