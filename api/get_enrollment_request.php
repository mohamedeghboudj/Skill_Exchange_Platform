<?php
// File: ../assets/php/api/enrollment-requests.php
session_start();
header('Content-Type: application/json');
//resposible of illing the form
require_once '../config/db.php'; // MySQLi SSL connection with $conn

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$student_id = $_SESSION['user_id'];

try {
    $query = "
        SELECT 
            er.request_id,
            er.course_id,
            er.status,
            er.request_date,
            er.student_message,
            c.course_title,
            c.price,
            u.user_id AS teacher_id,
            u.full_name AS teacher_name,
            u.profile_picture AS teacher_profile_picture
        FROM ENROLLMENT_REQUEST er
        JOIN COURSE c ON er.course_id = c.course_id
        JOIN USER u ON c.teacher_id = u.user_id
        WHERE er.student_id = ?
        ORDER BY er.request_date DESC
    ";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("i", $student_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $requests = [];
    while ($row = $result->fetch_assoc()) {
        $requests[] = $row;
    }

    $stmt->close();
    $conn->close();

    echo json_encode([
        'success' => true,
        'data' => $requests
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
