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
    // Get enrollment information
    $enrollment_query = "
        SELECT 
            e.enrollment_id,
            e.progress_percentage,
            e.videos_watched,
            e.assignments_completed,
            c.course_title,
            u.full_name AS teacher_name
        FROM ENROLLMENT e
        JOIN COURSE c ON e.course_id = c.course_id
        JOIN USER u ON c.teacher_id = u.user_id
        WHERE e.student_id = ? AND e.course_id = ? AND e.is_active = 1
    ";
    
    $stmt = mysqli_prepare($conn, $enrollment_query);
    mysqli_stmt_bind_param($stmt, "ii", $student_id, $course_id);
    mysqli_stmt_execute($stmt);
    $enrollment_result = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($enrollment_result) === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Enrollment not found'
        ]);
        exit();
    }
    
    $enrollment = mysqli_fetch_assoc($enrollment_result);
    mysqli_stmt_close($stmt);
    
    // Get total videos count
    $video_count_query = "SELECT COUNT(*) as total FROM VIDEO WHERE course_id = ?";
    $stmt = mysqli_prepare($conn, $video_count_query);
    mysqli_stmt_bind_param($stmt, "i", $course_id);
    mysqli_stmt_execute($stmt);
    $video_result = mysqli_stmt_get_result($stmt);
    $video_count = mysqli_fetch_assoc($video_result)['total'];
    mysqli_stmt_close($stmt);
    
    // Get assignment statistics
    $assignment_stats_query = "
        SELECT 
            COUNT(DISTINCT a.assignment_id) as total_assignments,
            COUNT(DISTINCT CASE WHEN asub.submission_status = 'done' THEN a.assignment_id END) as done_count,
            COUNT(DISTINCT CASE WHEN asub.submission_status = 'missed' THEN a.assignment_id END) as missed_count,
            AVG(CASE WHEN asub.score IS NOT NULL THEN (asub.score / a.max_score) * 100 END) as average_mark
        FROM ASSIGNMENT a
        LEFT JOIN ASSIGNMENT_SUBMISSION asub ON a.assignment_id = asub.assignment_id AND asub.student_id = ?
        WHERE a.course_id = ?
    ";
    
    $stmt = mysqli_prepare($conn, $assignment_stats_query);
    mysqli_stmt_bind_param($stmt, "ii", $student_id, $course_id);
    mysqli_stmt_execute($stmt);
    $assignment_result = mysqli_stmt_get_result($stmt);
    $assignment_stats = mysqli_fetch_assoc($assignment_result);
    mysqli_stmt_close($stmt);
    
    // Prepare response
    $response = [
        'success' => true,
        'data' => [
            'enrollment' => [
                'enrollment_id' => $enrollment['enrollment_id'],
                'progress_percentage' => floatval($enrollment['progress_percentage']),
                'videos_watched' => intval($enrollment['videos_watched']),
                'assignments_completed' => intval($enrollment['assignments_completed']),
                'course_title' => $enrollment['course_title'],
                'teacher_name' => $enrollment['teacher_name']
            ],
            'total_videos' => intval($video_count),
            'assignment_stats' => [
                'total' => intval($assignment_stats['total_assignments'] ?? 0),
                'done' => intval($assignment_stats['done_count'] ?? 0),
                'missed' => intval($assignment_stats['missed_count'] ?? 0),
                'average_mark' => round(floatval($assignment_stats['average_mark'] ?? 0))
            ]
        ]
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

mysqli_close($conn);
?>