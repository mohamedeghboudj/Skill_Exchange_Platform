<?php
// File: /api/process_payment.php
session_start();
header('Content-Type: application/json');

require_once '../config/db.php'; // uses $conn MySQLi

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Authentication required',
        'redirect' => true
    ]);
    exit;
}

$student_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true);
$course_id = isset($data['course_id']) ? (int)$data['course_id'] : 0;
$request_id = isset($data['request_id']) ? (int)$data['request_id'] : 0;

if ($course_id <= 0 || $request_id <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request data'
    ]);
    exit;
}

try {
    $conn->begin_transaction();

    // 1️⃣ Check if request exists and is accepted
    $checkRequest = "
        SELECT request_id 
        FROM ENROLLMENT_REQUEST 
        WHERE request_id = ? 
          AND student_id = ? 
          AND course_id = ? 
          AND status = 'accepted'
        LIMIT 1
    ";
    $stmt = $conn->prepare($checkRequest);
    $stmt->bind_param("iii", $request_id, $student_id, $course_id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 0) {
        $stmt->close();
        $conn->rollback();
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Request not found or not accepted']);
        exit;
    }
    $stmt->close();

    // 2️⃣ Check if already enrolled
    $checkEnrollment = "
        SELECT enrollment_id 
        FROM ENROLLMENT 
        WHERE student_id = ? 
          AND course_id = ?
        LIMIT 1
    ";
    $stmt = $conn->prepare($checkEnrollment);
    $stmt->bind_param("ii", $student_id, $course_id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->close();
        $conn->rollback();
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Already enrolled in this course']);
        exit;
    }
    $stmt->close();

    // 3️⃣ Create enrollment
    $insertEnrollment = "
        INSERT INTO ENROLLMENT
        (student_id, course_id, progress_percentage, videos_watched, assignments_completed, is_active)
        VALUES (?, ?, 0, 0, 0, 1)
    ";
    $stmt = $conn->prepare($insertEnrollment);
    $stmt->bind_param("ii", $student_id, $course_id);
    $stmt->execute();
    $enrollment_id = $conn->insert_id;
    $stmt->close();

    // 4️⃣ Update course enrolled count
    $updateCourse = "
        UPDATE COURSE 
        SET enrolled_count = enrolled_count + 1 
        WHERE course_id = ?
    ";
    $stmt = $conn->prepare($updateCourse);
    $stmt->bind_param("i", $course_id);
    $stmt->execute();
    $stmt->close();

    // 5️⃣ Update request status to 'completed'
    $updateRequest = "
        UPDATE ENROLLMENT_REQUEST 
        SET status = 'completed' 
        WHERE request_id = ?
    ";
    $stmt = $conn->prepare($updateRequest);
    $stmt->bind_param("i", $request_id);
    $stmt->execute();
    $stmt->close();

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Payment processed successfully. You are now enrolled in the course.',
        'enrollment_id' => $enrollment_id
    ]);

} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
