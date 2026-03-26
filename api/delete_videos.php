<?php
// api/delete_videos.php
session_start();
require_once '../config/api_helpers.php';
require_once '../config/db.php';

// Set CORS headers
setCorsHeaders();
setJsonHeader();

// Check authentication
$teacher_id = requireAuth();

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['video_ids']) || !is_array($data['video_ids'])) {
    sendError('Missing or invalid video_ids array', 400);
}
$video_ids  = array_map('intval', $data['video_ids']);

try {
    $conn->begin_transaction();

    // Build a safe IN clause using placeholders
    $placeholders = implode(',', array_fill(0, count($video_ids), '?'));

    // Only delete videos that belong to courses owned by this teacher
    $query = "
        DELETE FROM VIDEO
        WHERE video_id IN ($placeholders)
        AND course_id IN (SELECT course_id FROM COURSE WHERE teacher_id = ?)
    ";

    $stmt = $conn->prepare($query);

    // Bind: all the video_ids (integers) + teacher_id (integer)
    $types  = str_repeat('i', count($video_ids)) . 'i';
    $params = array_merge($video_ids, [$teacher_id]);
    $stmt->bind_param($types, ...$params);

    $stmt->execute();
    $deleted = $stmt->affected_rows;
    $stmt->close();

    $conn->commit();
    $conn->close();

    sendSuccess(['deleted' => $deleted], "Successfully deleted $deleted video(s)");

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollback();
        $conn->close();
    }
    logError($e->getMessage(), 'delete_videos.php');
    sendError('Failed to delete videos', 500);
}
?>