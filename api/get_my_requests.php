<?php
// File: /api/get_my_requests.php
require_once '../config/db.php';
//this is the file responsible of getting the enrollemnt request for the logged in student
header('Content-Type: application/json');
session_start();

// Check authentication
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Authentication required',
        'redirect' => true
    ]);
    exit;
}

$student_id = $_SESSION['user_id'];

try {

    $query = "
        SELECT 
            er.request_id,
            er.course_id,
            er.status AS request_status,
            er.request_date,
            er.student_message,
            c.course_title,
            c.price,
            c.category,
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
        throw new Exception($conn->error);
    }

    // Bind student_id
    $stmt->bind_param("i", $student_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $requests = $result->fetch_all(MYSQLI_ASSOC);

    // Format dates
    foreach ($requests as &$request) {
        if (!empty($request['request_date'])) {
            $date = new DateTime($request['request_date']);
            $request['formatted_date'] = $date->format('M d, Y');
            $request['formatted_time'] = $date->format('h:i A');
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $requests
    ]);

} catch (Exception $e) {

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'details' => $e->getMessage()
    ]);
}
