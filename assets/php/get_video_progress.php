<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

$student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;
$course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : 0;

if ($student_id === 0 || $course_id === 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'student_id and course_id are required'
    ]);
    exit();
}

try {
    // Get all videos for the course with watch status
    $query = "
        SELECT 
            v.video_id,
            v.video_title,
            CASE 
                WHEN vw.video_id IS NOT NULL THEN 'done'
                ELSE 'active'
            END as status
        FROM VIDEO v
        LEFT JOIN VIDEO_WATCH vw ON v.video_id = vw.video_id AND vw.student_id = ?
        WHERE v.course_id = ?
        ORDER BY v.video_id ASC
    ";
    
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "ii", $student_id, $course_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $videos = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $videos[] = [
            'video_id' => intval($row['video_id']),
            'video_title' => $row['video_title'],
            'status' => $row['status']
        ];
    }
    
    mysqli_stmt_close($stmt);
    
    echo json_encode([
        'success' => true,
        'data' => $videos
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

mysqli_close($conn);
?>