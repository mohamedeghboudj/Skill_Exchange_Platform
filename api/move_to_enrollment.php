<?php
// File: ../assets/php/api/create-enrollment.php
require_once '../db.php';

$db = new Database();
$connection = $db->getConnection();
requireLogin();

$data = json_decode(file_get_contents("php://input"), true);
$student_id = getCurrentUserId();
$course_id = $data['course_id'] ?? null;

if (!$course_id) {
    echo json_encode(["error" => "Course ID is required"]);
    exit;
}

try {
    // Start transaction
    $connection->beginTransaction();
    
    // 1. Check if request exists and is accepted
    $checkRequest = "
        SELECT request_id FROM ENROLLMENT_REQUEST 
        WHERE student_id = :student_id 
        AND course_id = :course_id 
        AND status = 'accepted'
    ";
    
    $stmt = $connection->prepare($checkRequest);
    $stmt->bindParam(':student_id', $student_id);
    $stmt->bindParam(':course_id', $course_id);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        echo json_encode(["error" => "No accepted request found for this course"]);
        exit;
    }
    
    // 2. Check if already enrolled
    $checkEnrollment = "
        SELECT enrollment_id FROM ENROLLMENT 
        WHERE student_id = :student_id 
        AND course_id = :course_id
    ";
    
    $stmt = $connection->prepare($checkEnrollment);
    $stmt->bindParam(':student_id', $student_id);
    $stmt->bindParam(':course_id', $course_id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(["error" => "Already enrolled in this course"]);
        exit;
    }
    
    // 3. Create enrollment
    $insertEnrollment = "
        INSERT INTO ENROLLMENT 
        (student_id, course_id, progress_percentage, videos_watched, assignments_completed, is_active) 
        VALUES (:student_id, :course_id, 0, 0, 0, 1)
    ";
    
    $stmt = $connection->prepare($insertEnrollment);
    $stmt->bindParam(':student_id', $student_id);
    $stmt->bindParam(':course_id', $course_id);
    $stmt->execute();
    
    $enrollment_id = $connection->lastInsertId();
    
    // 4. Update course enrolled count
    $updateCourse = "
        UPDATE COURSE 
        SET enrolled_count = enrolled_count + 1 
        WHERE course_id = :course_id
    ";
    
    $stmt = $connection->prepare($updateCourse);
    $stmt->bindParam(':course_id', $course_id);
    $stmt->execute();
    
    $connection->commit();
    
    echo json_encode([
        "success" => true,
        "message" => "Enrollment successful",
        "enrollment_id" => $enrollment_id
    ]);
    
} catch(PDOException $e) {
    $connection->rollBack();
    echo json_encode([
        "error" => "Database error: " . $e->getMessage()
    ]);
}
?>