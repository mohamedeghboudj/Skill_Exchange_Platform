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
    $query = "
        SELECT 
            a.assignment_id,
            a.assignment_title,
            a.max_score,
            a.assignment_url,
            COALESCE(asub.score, 0) as score,
            CASE 
                WHEN asub.submission_status IS NULL THEN 
                    CASE WHEN a.assignment_status = 'locked' THEN 'locked' ELSE 'pending' END
                ELSE asub.submission_status
            END as status,
            CASE 
                WHEN asub.score IS NOT NULL THEN 
                    CASE WHEN (asub.score / a.max_score * 100) >= 50 THEN 'green' ELSE 'red' END
                ELSE NULL
            END as color
        FROM ASSIGNMENT a
        LEFT JOIN ASSIGNMENT_SUBMISSION asub ON a.assignment_id = asub.assignment_id AND asub.student_id = ?
        WHERE a.course_id = ?
        ORDER BY a.assignment_id ASC
    ";
    
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "ii", $student_id, $course_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $assignments = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $assignments[] = [
            'assignment_id' => intval($row['assignment_id']),
            'assignment_title' => $row['assignment_title'],
            'max_score' => floatval($row['max_score']),
            'assignment_url' => $row['assignment_url'],
            'score' => floatval($row['score']),
            'status' => $row['status'],
            'color' => $row['color']
        ];
    }
    
    mysqli_stmt_close($stmt);
    
    echo json_encode([
        'success' => true,
        'data' => $assignments
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