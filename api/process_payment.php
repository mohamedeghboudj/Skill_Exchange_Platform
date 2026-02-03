<?php
// File: /api/process_payment.php
require_once '../config/db.php'; // Adjust path based on your actual connection

header('Content-Type: application/json');

// Start session
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Authentication required',
        'redirect' => true
    ]);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$course_id = isset($data['course_id']) ? intval($data['course_id']) : 0;
$request_id = isset($data['request_id']) ? intval($data['request_id']) : 0;
$student_id = $_SESSION['user_id'];

if ($course_id <= 0 || $request_id <= 0) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request data'
    ]);
    exit;
}

try {
    // Get database connection
    $db = new Database();
    $conn = $db->getConnection();
    
    // Start transaction
    $conn->beginTransaction();
    
    // 1. Check if request exists and is accepted
    $checkRequest = $conn->prepare("
        SELECT * FROM ENROLLMENT_REQUEST 
        WHERE request_id = :request_id 
        AND student_id = :student_id 
        AND course_id = :course_id 
        AND status = 'accepted'
    ");
    
    $checkRequest->execute([
        ':request_id' => $request_id,
        ':student_id' => $student_id,
        ':course_id' => $course_id
    ]);
    
    if ($checkRequest->rowCount() === 0) {
        throw new Exception('Request not found or not accepted');
    }
    
    // 2. Check if already enrolled
    $checkEnrollment = $conn->prepare("
        SELECT * FROM ENROLLMENT 
        WHERE student_id = :student_id 
        AND course_id = :course_id
    ");
    
    $checkEnrollment->execute([
        ':student_id' => $student_id,
        ':course_id' => $course_id
    ]);
    
    if ($checkEnrollment->rowCount() > 0) {
        throw new Exception('Already enrolled in this course');
    }
    
    // 3. Create enrollment record
    $createEnrollment = $conn->prepare("
        INSERT INTO ENROLLMENT 
        (student_id, course_id, progress_percentage, videos_watched, assignments_completed, is_active) 
        VALUES (:student_id, :course_id, 0, 0, 0, 1)
    ");
    
    $createEnrollment->execute([
        ':student_id' => $student_id,
        ':course_id' => $course_id
    ]);
    
    $enrollment_id = $conn->lastInsertId();
    
    // 4. Update course enrolled count
    $updateCourse = $conn->prepare("
        UPDATE COURSE 
        SET enrolled_count = enrolled_count + 1 
        WHERE course_id = :course_id
    ");
    
    $updateCourse->execute([':course_id' => $course_id]);
    
    // 5. Update request status to 'completed' or similar
    $updateRequest = $conn->prepare("
        UPDATE ENROLLMENT_REQUEST 
        SET status = 'completed' 
        WHERE request_id = :request_id
    ");
    
    $updateRequest->execute([':request_id' => $request_id]);
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Payment processed successfully. You are now enrolled in the course.',
        'enrollment_id' => $enrollment_id
    ]);
    
} catch (Exception $e) {
    // Rollback on error
    if (isset($conn)) {
        $conn->rollBack();
    }
    
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>