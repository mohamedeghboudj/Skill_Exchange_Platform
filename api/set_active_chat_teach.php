<?php
// api/set_active_student.php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

require_once '../config/db.php';

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Not authenticated'
        ]);
        exit;
    }

    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    
    $course_id = isset($input['course_id']) ? intval($input['course_id']) : 0;
    $student_id = isset($input['student_id']) ? intval($input['student_id']) : 0;

    if (!$course_id || !$student_id) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing course_id or student_id'
        ]);
        exit;
    }

    // Verify teacher owns the course
    $verify_query = "SELECT course_id FROM COURSE 
                     WHERE course_id = ? AND teacher_id = ?";
    $stmt = mysqli_prepare($conn, $verify_query);
    mysqli_stmt_bind_param($stmt, "ii", $course_id, $_SESSION['user_id']);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($result) === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access to course'
        ]);
        exit;
    }

    // Verify student is enrolled
    $verify_enrollment = "SELECT enrollment_id FROM ENROLLMENT 
                          WHERE student_id = ? AND course_id = ? AND is_active = 1";
    $stmt2 = mysqli_prepare($conn, $verify_enrollment);
    mysqli_stmt_bind_param($stmt2, "ii", $student_id, $course_id);
    mysqli_stmt_execute($stmt2);
    $result2 = mysqli_stmt_get_result($stmt2);
    
    if (mysqli_num_rows($result2) === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Student not enrolled in this course'
        ]);
        exit;
    }

    // Store in session
    $_SESSION['active_course_id'] = $course_id;
    $_SESSION['active_student_id'] = $student_id;

    echo json_encode([
        'success' => true,
        'message' => 'Active student chat set successfully',
        'data' => [
            'course_id' => $course_id,
            'student_id' => $student_id
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error setting active student chat',
        'error' => $e->getMessage()
    ]);
}

mysqli_close($conn);
?>