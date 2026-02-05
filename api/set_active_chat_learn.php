<?php
// api/set_active_chat.php
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
    $teacher_id = isset($input['teacher_id']) ? intval($input['teacher_id']) : 0;

    if (!$course_id || !$teacher_id) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing course_id or teacher_id'
        ]);
        exit;
    }

    // Verify enrollment exists
    $verify_query = "SELECT enrollment_id FROM ENROLLMENT 
                     WHERE student_id = ? AND course_id = ? AND is_active = 1";
    $stmt = mysqli_prepare($conn, $verify_query);
    mysqli_stmt_bind_param($stmt, "ii", $_SESSION['user_id'], $course_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($result) === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid enrollment'
        ]);
        exit;
    }

    // Store in session
    $_SESSION['active_course_id'] = $course_id;
    $_SESSION['active_teacher_id'] = $teacher_id;

    echo json_encode([
        'success' => true,
        'message' => 'Active chat set successfully',
        'data' => [
            'course_id' => $course_id,
            'teacher_id' => $teacher_id
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error setting active chat',
        'error' => $e->getMessage()
    ]);
}

mysqli_close($conn);
?>