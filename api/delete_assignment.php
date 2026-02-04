<?php
// api/delete_assignment.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

require_once '../assets/php/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['assignment_id']) || !is_numeric($data['assignment_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing or invalid assignment_id']);
    exit;
}

$assignment_id = (int)$data['assignment_id'];
$teacher_id    = $_SESSION['user_id'];

// Only delete if this assignment belongs to a course owned by the teacher
$stmt = $conn->prepare("
    DELETE FROM ASSIGNMENT
    WHERE assignment_id = ?
    AND course_id IN (SELECT course_id FROM COURSE WHERE teacher_id = ?)
");
$stmt->bind_param("ii", $assignment_id, $teacher_id);
$stmt->execute();
$deleted = $stmt->affected_rows;
$stmt->close();

if ($deleted > 0) {
    echo json_encode(['success' => true, 'message' => 'Assignment deleted']);
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Assignment not found or not yours']);
}
?>