<?php
session_start();
require_once '../config/api_helpers.php';
require_once '../config/db.php';

setCorsHeaders();
setJsonHeader();
requireAuth();

if (!isset($_GET['course_id']) || !is_numeric($_GET['course_id'])) {
    sendError('Missing or invalid course_id parameter', 400);
}

$course_id = (int)$_GET['course_id'];

try {
    $stmt = $conn->prepare("
        SELECT assignment_id, assignment_title, assignment_url, assignment_status
        FROM ASSIGNMENT
        WHERE course_id = ?
        ORDER BY assignment_id ASC
    ");

    if (!$stmt) {
        handleDbError($conn);
    }

    $stmt->bind_param("i", $course_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $assignments = [];

    while ($row = $result->fetch_assoc()) {
        if (!empty($row['assignment_url']) && $row['assignment_url'][0] !== '/' && !str_starts_with($row['assignment_url'], 'http')) {
            $row['assignment_url'] = '/' . $row['assignment_url'];
        }
        $assignments[] = $row;
    }

    $stmt->close();
    $conn->close();

    sendSuccess($assignments, 'Assignments retrieved successfully');
} catch (Exception $e) {
    logError($e->getMessage(), 'get_assignments.php');
    if (isset($conn)) {
        $conn->close();
    }
    sendError('Failed to retrieve assignments', 500);
}
?>
