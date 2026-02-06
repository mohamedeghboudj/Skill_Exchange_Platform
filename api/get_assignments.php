<?php
// api/get_assignments.php - FIXED VERSION
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

// FIX: Use correct config file
require_once '../config/db.php';

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
    // FIX: Ensure assignment_url starts with / if it's a local file
    if (!empty($row['assignment_url'])) {
        $url = $row['assignment_url'];
        // Add leading slash for local paths that don't have it
        if ($url[0] !== '/' && !str_starts_with($url, 'http')) {
            $row['assignment_url'] = '/' . $url;
        }
    }
    $assignments[] = $row;
}

$stmt->close();

// Returns plain array - CORRECT FORMAT
echo json_encode($assignments);
?>