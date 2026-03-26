<?php
// api/delete_videos.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

require_once '../assets/php/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['video_ids']) || !is_array($data['video_ids'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing or invalid video_ids array']);
    exit;
}

$teacher_id = $_SESSION['user_id'];
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

    echo json_encode(['success' => true, 'deleted' => $deleted]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>