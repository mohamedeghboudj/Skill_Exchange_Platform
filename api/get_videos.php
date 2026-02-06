<?php
// api/get_videos.php - TEACHER VERSION (FIXED)
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([]);
    exit;
}

if (!isset($_GET['course_id']) || !is_numeric($_GET['course_id'])) {
    echo json_encode([]);
    exit;
}

require_once '../config/db.php';

$course_id = (int)$_GET['course_id'];

try {
    // Simple query for teach page - just get basic video info
    $stmt = $conn->prepare("
        SELECT video_id, video_title, video_url 
        FROM VIDEO 
        WHERE course_id = ?
        ORDER BY video_id ASC
    ");
    
    if (!$stmt) {
        echo json_encode([]);
        exit;
    }
    
    $stmt->bind_param("i", $course_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $videos = [];
    while ($row = $result->fetch_assoc()) {
        // FIX: Add leading slash to make path absolute from root
        if (!empty($row['video_url'])) {
            // If it doesn't start with / or http, add /
            if ($row['video_url'][0] !== '/' && !str_starts_with($row['video_url'], 'http')) {
                $row['video_url'] = '/' . $row['video_url'];
            }
        }
        $videos[] = $row;
    }
    
    $stmt->close();
    
    // Return plain array for consistency with get_assignments.php
    echo json_encode($videos);
    
} catch (Exception $e) {
    echo json_encode([]);
}
?>