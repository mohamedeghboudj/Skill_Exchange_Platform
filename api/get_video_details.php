<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

if (!isset($_GET['video_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Video ID is required']);
    exit;
}

$video_id = intval($_GET['video_id']);

try {
    $query = "SELECT 
                v.video_id,
                v.course_id,
                v.video_title,
                v.video_url,
                c.course_title,
                u.full_name as instructor_name
              FROM VIDEO v
              INNER JOIN COURSE c ON v.course_id = c.course_id
              INNER JOIN USER u ON c.teacher_id = u.user_id
              WHERE v.video_id = ?";
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception($conn->error);
    }
    
    $stmt->bind_param('i', $video_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $video = $result->fetch_assoc();
    
    if ($video) {
        echo json_encode([
            'success' => true,
            'data' => $video
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Video not found'
        ]);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>