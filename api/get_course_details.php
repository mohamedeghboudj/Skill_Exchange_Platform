<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config/db.php'; // already has $conn

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
                course_id,
                teacher_id,
                course_title,
                course_description,
                category,
                price,
                duration,
                rating,
                enrolled_count
              FROM COURSE
              WHERE course_id = ?";

    $stmt = $conn->prepare($query);
    if (!$stmt) throw new Exception($conn->error);

    $stmt->bind_param('i', $course_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $course = $result->fetch_assoc();

    if ($course) {
        echo json_encode(['success' => true, 'data' => $course]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Course not found']);
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}

$conn->close();
?>
