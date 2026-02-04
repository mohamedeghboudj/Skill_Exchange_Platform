<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config/db.php'; // this file already creates $conn

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

    $query = "SELECT 
                u.user_id,
                u.full_name,
                u.profile_picture,
                u.bio,
                u.insta_link,
                u.whatsapp_link,
                u.linkedIn_link
              FROM COURSE c
              INNER JOIN USER u ON c.teacher_id = u.user_id
              WHERE c.course_id = ? AND u.is_teacher = 1";

    $stmt = $conn->prepare($query);

    if (!$stmt) {
        throw new Exception($conn->error);
    }

    $stmt->bind_param('i', $course_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $teacher = $result->fetch_assoc();

    if ($teacher) {
        echo json_encode([
            'success' => true,
            'data' => $teacher
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Teacher not found for this course'
        ]);
    }

    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error'
        // don't expose raw DB errors in production
    ]);
}

$conn->close();
?>
