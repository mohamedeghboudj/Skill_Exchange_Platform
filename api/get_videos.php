<?php
// api/get_videos.php - Get course videos
session_start();
require_once '../config/api_helpers.php';
require_once '../config/db.php';

// Set CORS headers
setCorsHeaders();
setJsonHeader();

// Check authentication
requireAuth();

// Validate course_id parameter
if (!isset($_GET['course_id']) || !is_numeric($_GET['course_id'])) {
    sendError('Missing or invalid course_id parameter', 400);
}

$course_id = (int)$_GET['course_id'];

try {
    // Get video information
    $stmt = $conn->prepare("
        SELECT video_id, video_title, video_url 
        FROM VIDEO 
        WHERE course_id = ?
        ORDER BY video_id ASC
    ");
    
    if (!$stmt) {
        handleDbError($conn);
    }
    
    $stmt->bind_param("i", $course_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $videos = [];
    while ($row = $result->fetch_assoc()) {
        // Normalize video URL path
        if (!empty($row['video_url'])) {
            if ($row['video_url'][0] !== '/' && !str_starts_with($row['video_url'], 'http')) {
                $row['video_url'] = '/' . $row['video_url'];
            }
        }
        $videos[] = $row;
    }
    
    $stmt->close();
    $conn->close();
    
    sendSuccess($videos, 'Videos retrieved successfully');
    
} catch (Exception $e) {
    logError($e->getMessage(), 'get_videos.php');
    if (isset($conn)) $conn->close();
    sendError('Failed to retrieve videos', 500);
}
?>