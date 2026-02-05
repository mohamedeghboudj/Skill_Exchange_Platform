<?php
// api/get_assignments.php - TEACHER VERSION (returns plain array)
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([]);
    exit;
}

if (!isset($_GET['course_id']) || !is_numeric($_GET['course_id'])) {
    echo json_encode([]);
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

$result = $stmt->get_result();
$assignments = [];

while ($row = $result->fetch_assoc()) {
    $assignments[] = $row;
}

$stmt->close();

// Returns plain array - CORRECT FORMAT
echo json_encode($assignments);
?>