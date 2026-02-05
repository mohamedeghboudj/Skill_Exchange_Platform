<?php
// api/get_chat_info.php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

require_once '../config/db.php';

try {
    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Not authenticated'
        ]);
        exit;
    }

    $action = isset($_GET['action']) ? $_GET['action'] : '';

    // Get student chat info from session
    if ($action === 'get_student_chat_info') {
        $student_id = $_SESSION['user_id'];
        $course_id = isset($_SESSION['active_course_id']) ? intval($_SESSION['active_course_id']) : 0;
        
        if (!$course_id) {
            echo json_encode([
                'success' => false,
                'message' => 'No active course selected'
            ]);
            exit;
        }
        
        // Query to get student, teacher, and course information
        $sql = "SELECT 
                    c.course_title,
                    c.course_id,
                    student.user_id as student_id,
                    student.full_name as student_name,
                    teacher.user_id as teacher_id,
                    teacher.full_name as teacher_name,
                    e.progress_percentage
                FROM ENROLLMENT e
                INNER JOIN COURSE c ON e.course_id = c.course_id
                INNER JOIN USER student ON e.student_id = student.user_id
                INNER JOIN USER teacher ON c.teacher_id = teacher.user_id
                WHERE e.student_id = ? AND e.course_id = ? AND e.is_active = 1";
        
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ii", $student_id, $course_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if ($row = mysqli_fetch_assoc($result)) {
            echo json_encode([
                'success' => true,
                'data' => [
                    'course_title' => $row['course_title'],
                    'course_id' => $row['course_id'],
                    'student_name' => $row['student_name'],
                    'student_id' => $row['student_id'],
                    'teacher_name' => $row['teacher_name'],
                    'teacher_id' => $row['teacher_id'],
                    'progress_percentage' => $row['progress_percentage']
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No enrollment found'
            ]);
        }
        mysqli_stmt_close($stmt);
    }
    
    // Get teacher chat info from session
    elseif ($action === 'get_teacher_chat_info') {
        $teacher_id = $_SESSION['user_id'];
        $student_id = isset($_SESSION['active_student_id']) ? intval($_SESSION['active_student_id']) : 0;
        $course_id = isset($_SESSION['active_course_id']) ? intval($_SESSION['active_course_id']) : 0;
        
        if (!$student_id || !$course_id) {
            echo json_encode([
                'success' => false,
                'message' => 'No active chat selected'
            ]);
            exit;
        }
        
        // Query for teacher view
        $sql = "SELECT 
                    c.course_title,
                    c.course_id,
                    student.user_id as student_id,
                    student.full_name as student_name,
                    teacher.user_id as teacher_id,
                    teacher.full_name as teacher_name,
                    e.progress_percentage
                FROM COURSE c
                INNER JOIN USER teacher ON c.teacher_id = teacher.user_id
                INNER JOIN ENROLLMENT e ON c.course_id = e.course_id
                INNER JOIN USER student ON e.student_id = student.user_id
                WHERE c.teacher_id = ? AND e.student_id = ? AND c.course_id = ?";
        
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "iii", $teacher_id, $student_id, $course_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if ($row = mysqli_fetch_assoc($result)) {
            echo json_encode([
                'success' => true,
                'data' => [
                    'course_title' => $row['course_title'],
                    'course_id' => $row['course_id'],
                    'student_name' => $row['student_name'],
                    'student_id' => $row['student_id'],
                    'teacher_name' => $row['teacher_name'],
                    'teacher_id' => $row['teacher_id'],
                    'progress_percentage' => $row['progress_percentage']
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No data found'
            ]);
        }
        mysqli_stmt_close($stmt);
    }
    
    else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching chat info',
        'error' => $e->getMessage()
    ]);
}

mysqli_close($conn);
?>