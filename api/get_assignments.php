<?php
// api/get_assignments.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

if (!isset($_GET['course_id']) || !is_numeric($_GET['course_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing or invalid course_id']);
    exit;
}

require_once '../assets/php/db.php';

$course_id = (int)$_GET['course_id'];

$stmt = $conn->prepare("
    SELECT assignment_id, assignment_title, assignment_url, assignment_status
    FROM ASSIGNMENT
    WHERE course_id = ?
    ORDER BY assignment_id ASC
");
$stmt->bind_param("i", $course_id);
$stmt->execute();

$result      = $stmt->get_result();
$assignments = [];

while ($row = $result->fetch_assoc()) {
    $assignments[] = $row;
}

$stmt->close();

echo json_encode($assignments);
?>