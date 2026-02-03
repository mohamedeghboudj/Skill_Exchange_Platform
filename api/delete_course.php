<?php
// api/delete_course.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

require_once '../assets/php/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['course_id']) || !is_numeric($data['course_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing or invalid course_id']);
    exit;
}

$course_id  = (int)$data['course_id'];
$teacher_id = $_SESSION['user_id'];

try {
    $conn->begin_transaction();

    // 1. Verify this course belongs to the logged-in teacher
    $check = $conn->prepare("SELECT teacher_id FROM COURSE WHERE course_id = ?");
    $check->bind_param("i", $course_id);
    $check->execute();
    $check->bind_result($owner_id);

    if (!$check->fetch() || $owner_id !== $teacher_id) {
        $check->close();
        $conn->rollback();
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Not your course']);
        exit;
    }
    $check->close();

    // 2. Delete assignments for this course
    $delAssign = $conn->prepare("DELETE FROM ASSIGNMENT WHERE course_id = ?");
    $delAssign->bind_param("i", $course_id);
    $delAssign->execute();
    $delAssign->close();

    // 3. Delete videos for this course
    $delVideos = $conn->prepare("DELETE FROM VIDEO WHERE course_id = ?");
    $delVideos->bind_param("i", $course_id);
    $delVideos->execute();
    $delVideos->close();

    // 4. Delete the course itself
    $delCourse = $conn->prepare("DELETE FROM COURSE WHERE course_id = ?");
    $delCourse->bind_param("i", $course_id);
    $delCourse->execute();
    $delCourse->close();

    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'Course deleted']);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>