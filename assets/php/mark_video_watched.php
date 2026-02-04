<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

require_once '../config/db.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$student_id = isset($input['student_id']) ? intval($input['student_id']) : 0;
$video_id = isset($input['video_id']) ? intval($input['video_id']) : 0;
$course_id = isset($input['course_id']) ? intval($input['course_id']) : 0;

if ($student_id === 0 || $video_id === 0 || $course_id === 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'student_id, video_id, and course_id are required'
    ]);
    exit();
}

try {
    // Start transaction
    mysqli_begin_transaction($conn);
    
    // Update or insert video watch record
    $update_video_query = "
        INSERT INTO VIDEO_WATCH (student_id, video_id, is_watched, is_current, watched_at)
        VALUES (?, ?, 1, 0, NOW())
        ON DUPLICATE KEY UPDATE is_watched = 1, is_current = 0, watched_at = NOW()
    ";
    
    $stmt = mysqli_prepare($conn, $update_video_query);
    mysqli_stmt_bind_param($stmt, "ii", $student_id, $video_id);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    
    // Get next video and mark as current
    $next_video_query = "
        SELECT video_id FROM VIDEO 
        WHERE course_id = ? AND video_id > ? 
        ORDER BY video_id ASC LIMIT 1
    ";
    
    $stmt = mysqli_prepare($conn, $next_video_query);
    mysqli_stmt_bind_param($stmt, "ii", $course_id, $video_id);
    mysqli_stmt_execute($stmt);
    $next_video_result = mysqli_stmt_get_result($stmt);
    
    if ($next_video = mysqli_fetch_assoc($next_video_result)) {
        $next_video_id = $next_video['video_id'];
        mysqli_stmt_close($stmt);
        
        $set_current_query = "
            INSERT INTO VIDEO_WATCH (student_id, video_id, is_watched, is_current)
            VALUES (?, ?, 0, 1)
            ON DUPLICATE KEY UPDATE is_current = 1
        ";
        
        $stmt = mysqli_prepare($conn, $set_current_query);
        mysqli_stmt_bind_param($stmt, "ii", $student_id, $next_video_id);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
    } else {
        mysqli_stmt_close($stmt);
    }
    
    // Get watched count
    $watched_count_query = "
        SELECT COUNT(*) as count FROM VIDEO_WATCH 
        WHERE student_id = ? AND is_watched = 1 
        AND video_id IN (SELECT video_id FROM VIDEO WHERE course_id = ?)
    ";
    
    $stmt = mysqli_prepare($conn, $watched_count_query);
    mysqli_stmt_bind_param($stmt, "ii", $student_id, $course_id);
    mysqli_stmt_execute($stmt);
    $watched_result = mysqli_stmt_get_result($stmt);
    $watched_count = mysqli_fetch_assoc($watched_result)['count'];
    mysqli_stmt_close($stmt);
    
    // Get total videos
    $total_videos_query = "SELECT COUNT(*) as total FROM VIDEO WHERE course_id = ?";
    $stmt = mysqli_prepare($conn, $total_videos_query);
    mysqli_stmt_bind_param($stmt, "i", $course_id);
    mysqli_stmt_execute($stmt);
    $total_videos_result = mysqli_stmt_get_result($stmt);
    $total_videos = mysqli_fetch_assoc($total_videos_result)['total'];
    mysqli_stmt_close($stmt);
    
    // Get assignments completed
    $assignments_completed_query = "
        SELECT COUNT(DISTINCT a.assignment_id) as count
        FROM ASSIGNMENT a
        JOIN ASSIGNMENT_SUBMISSION asub ON a.assignment_id = asub.assignment_id
        WHERE a.course_id = ? AND asub.student_id = ? AND asub.submission_status = 'done'
    ";
    
    $stmt = mysqli_prepare($conn, $assignments_completed_query);
    mysqli_stmt_bind_param($stmt, "ii", $course_id, $student_id);
    mysqli_stmt_execute($stmt);
    $assignments_result = mysqli_stmt_get_result($stmt);
    $assignments_completed = mysqli_fetch_assoc($assignments_result)['count'];
    mysqli_stmt_close($stmt);
    
    // Get total assignments
    $total_assignments_query = "SELECT COUNT(*) as total FROM ASSIGNMENT WHERE course_id = ?";
    $stmt = mysqli_prepare($conn, $total_assignments_query);
    mysqli_stmt_bind_param($stmt, "i", $course_id);
    mysqli_stmt_execute($stmt);
    $total_assignments_result = mysqli_stmt_get_result($stmt);
    $total_assignments = mysqli_fetch_assoc($total_assignments_result)['total'];
    mysqli_stmt_close($stmt);
    
    // Calculate progress percentage
    $total_items = $total_videos + $total_assignments;
    $completed_items = $watched_count + $assignments_completed;
    $progress_percentage = $total_items > 0 ? ($completed_items / $total_items * 100) : 0;
    $progress_percentage = round($progress_percentage, 2);
    
    // Update enrollment
    $update_enrollment_query = "
        UPDATE ENROLLMENT 
        SET videos_watched = ?, 
            assignments_completed = ?,
            progress_percentage = ?
        WHERE student_id = ? AND course_id = ?
    ";
    
    $stmt = mysqli_prepare($conn, $update_enrollment_query);
    mysqli_stmt_bind_param($stmt, "iidii", $watched_count, $assignments_completed, $progress_percentage, $student_id, $course_id);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    
    // Commit transaction
    mysqli_commit($conn);
    
    echo json_encode([
        'success' => true,
        'message' => 'Video marked as watched',
        'data' => [
            'videos_watched' => intval($watched_count),
            'progress_percentage' => floatval($progress_percentage)
        ]
    ]);
    
} catch (Exception $e) {
    mysqli_rollback($conn);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

mysqli_close($conn);
?>