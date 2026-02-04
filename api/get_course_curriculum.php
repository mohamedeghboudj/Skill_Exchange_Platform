<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Include your db connection
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

if (!isset($_GET['course_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Course ID is required']);
    exit;
}

$course_id = intval($_GET['course_id']);

try {
    // ===================== FETCH VIDEOS =====================
    $videoQuery = "SELECT video_id, video_title, video_url
                   FROM VIDEO
                   WHERE course_id = ?
                   ORDER BY video_id ASC";
    
    $videoStmt = $conn->prepare($videoQuery);
    if (!$videoStmt) throw new Exception($conn->error);
    
    $videoStmt->bind_param('i', $course_id);
    $videoStmt->execute();
    $videoResult = $videoStmt->get_result();

    $videos = [];
    while ($row = $videoResult->fetch_assoc()) {
        $videos[] = $row;
    }
    $videoStmt->close();

    // ===================== FETCH ASSIGNMENTS =====================
    $assignmentQuery = "SELECT assignment_id, assignment_title, assignment_url, max_score, is_first_assignment, assignment_status
                        FROM ASSIGNMENT
                        WHERE course_id = ?
                        ORDER BY assignment_id ASC";
    
    $assignmentStmt = $conn->prepare($assignmentQuery);
    if (!$assignmentStmt) throw new Exception($conn->error);
    
    $assignmentStmt->bind_param('i', $course_id);
    $assignmentStmt->execute();
    $assignmentResult = $assignmentStmt->get_result();

    $assignments = [];
    while ($row = $assignmentResult->fetch_assoc()) {
        $assignments[] = $row;
    }
    $assignmentStmt->close();

    // Close connection
    $conn->close();

    // ===================== RETURN JSON =====================
    echo json_encode([
        'success' => true,
        'data' => [
            'videos' => $videos,
            'assignments' => $assignments
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
