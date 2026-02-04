<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config/db.php'; // your existing DB connection with $conn

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
$student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : null;

try {
    // Get teacher info for instructor name
    $teacherQuery = "SELECT u.full_name 
                     FROM COURSE c
                     INNER JOIN USER u ON c.teacher_id = u.user_id
                     WHERE c.course_id = ?";
    $teacherStmt = $conn->prepare($teacherQuery);
    if (!$teacherStmt) throw new Exception($conn->error);
    $teacherStmt->bind_param('i', $course_id);
    $teacherStmt->execute();
    $teacherResult = $teacherStmt->get_result();
    $teacher = $teacherResult->fetch_assoc();
    $instructor_name = $teacher ? $teacher['full_name'] : 'Unknown';
    $teacherStmt->close();

    // Fetch videos
    if ($student_id) {
        $query = "SELECT 
                    v.video_id,
                    v.video_title,
                    v.video_url,
                    COALESCE(vw.is_watched, 0) as is_watched,
                    COALESCE(vw.is_current, 0) as is_current
                  FROM VIDEO v
                  LEFT JOIN VIDEO_WATCH vw ON v.video_id = vw.video_id AND vw.student_id = ?
                  WHERE v.course_id = ?
                  ORDER BY v.video_id ASC";
        $stmt = $conn->prepare($query);
        if (!$stmt) throw new Exception($conn->error);
        $stmt->bind_param('ii', $student_id, $course_id);
    } else {
        $query = "SELECT 
                    video_id,
                    video_title,
                    video_url,
                    0 as is_watched,
                    0 as is_current
                  FROM VIDEO
                  WHERE course_id = ?
                  ORDER BY video_id ASC";
        $stmt = $conn->prepare($query);
        if (!$stmt) throw new Exception($conn->error);
        $stmt->bind_param('i', $course_id);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $videos = [];
    $index = 0;
    while ($row = $result->fetch_assoc()) {
        $is_unlocked = $index < 2; // first 2 videos unlocked
        $videos[] = [
            'video_id' => $row['video_id'],
            'video_title' => $row['video_title'],
            'video_url' => $row['video_url'],
            'is_watched' => (bool)$row['is_watched'],
            'is_current' => (bool)$row['is_current'],
            'is_unlocked' => $is_unlocked,
            'instructor_name' => $instructor_name,
            'duration' => '53:02' // optional, can be updated if stored in DB
        ];
        $index++;
    }

    $stmt->close();
    $conn->close();

    echo json_encode([
        'success' => true,
        'data' => $videos
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
