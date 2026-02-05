<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit();
}

//Check if user is a teacher
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Only teachers can access this']);
    exit();
}

$teacher_id = $_SESSION['user_id'];
$action = $_GET['action'] ?? '';

/**
 * Get all students enrolled in a specific course with their progress
 */
if ($action === 'get_students_progress') {
    $course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : 0;
    
    if ($course_id === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'course_id is required']);
        exit();
    }
    
    try {
        // Verify teacher owns this course
        $course_query = "SELECT course_id, course_title FROM COURSE WHERE course_id = ? AND teacher_id = ?";
        $stmt = mysqli_prepare($conn, $course_query);
        mysqli_stmt_bind_param($stmt, "ii", $course_id, $teacher_id);
        mysqli_stmt_execute($stmt);
        $course_result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($course_result) === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Course not found or access denied']);
            exit();
        }
        
        $course = mysqli_fetch_assoc($course_result);
        mysqli_stmt_close($stmt);
        
        // Get all enrolled students with their progress
        $students_query = "
            SELECT 
                u.user_id,
                u.full_name as student_name,
                u.email,
                e.enrollment_id,
                e.progress_percentage,
                e.videos_watched,
                e.assignments_completed,
                (SELECT COUNT(*) FROM VIDEO WHERE course_id = ?) as total_videos,
                (SELECT COUNT(*) FROM ASSIGNMENT WHERE course_id = ?) as total_assignments
            FROM ENROLLMENT e
            JOIN USER u ON e.student_id = u.user_id
            WHERE e.course_id = ? AND e.is_active = 1
            ORDER BY u.full_name ASC
        ";
        
        $stmt = mysqli_prepare($conn, $students_query);
        mysqli_stmt_bind_param($stmt, "iii", $course_id, $course_id, $course_id);
        mysqli_stmt_execute($stmt);
        $students_result = mysqli_stmt_get_result($stmt);
        
        $students = [];
        while ($student = mysqli_fetch_assoc($students_result)) {
            $students[] = [
                'student_id' => intval($student['user_id']),
                'student_name' => $student['student_name'],
                'email' => $student['email'],
                'progress_percentage' => floatval($student['progress_percentage']),
                'videos_watched' => intval($student['videos_watched']),
                'total_videos' => intval($student['total_videos']),
                'assignments_completed' => intval($student['assignments_completed']),
                'total_assignments' => intval($student['total_assignments'])
            ];
        }
        
        mysqli_stmt_close($stmt);
        
        echo json_encode([
            'success' => true,
            'course_id' => intval($course_id),
            'course_title' => $course['course_title'],
            'total_students' => count($students),
            'students' => $students
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ]);
    }
}

/**
 * Get detailed progress for a specific student in a course
 */
elseif ($action === 'get_student_details') {
    $student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;
    $course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : 0;
    
    if ($student_id === 0 || $course_id === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'student_id and course_id are required']);
        exit();
    }
    
    try {
        // Verify teacher owns this course
        $course_query = "SELECT course_id, course_title FROM COURSE WHERE course_id = ? AND teacher_id = ?";
        $stmt = mysqli_prepare($conn, $course_query);
        mysqli_stmt_bind_param($stmt, "ii", $course_id, $teacher_id);
        mysqli_stmt_execute($stmt);
        $course_result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($course_result) === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Course not found or access denied']);
            exit();
        }
        
        $course = mysqli_fetch_assoc($course_result);
        mysqli_stmt_close($stmt);
        
        // Get student info and enrollment
        $student_query = "
            SELECT 
                u.user_id,
                u.full_name as student_name,
                u.email,
                e.progress_percentage,
                e.videos_watched,
                e.assignments_completed
            FROM USER u
            JOIN ENROLLMENT e ON u.user_id = e.student_id
            WHERE u.user_id = ? AND e.course_id = ? AND e.is_active = 1
        ";
        
        $stmt = mysqli_prepare($conn, $student_query);
        mysqli_stmt_bind_param($stmt, "ii", $student_id, $course_id);
        mysqli_stmt_execute($stmt);
        $student_result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($student_result) === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Student not found or not enrolled']);
            exit();
        }
        
        $student = mysqli_fetch_assoc($student_result);
        mysqli_stmt_close($stmt);
        
        // Get video progress
        $video_query = "
            SELECT 
                v.video_id,
                v.video_title,
                CASE WHEN vw.video_id IS NOT NULL THEN 1 ELSE 0 END as watched
            FROM VIDEO v
            LEFT JOIN VIDEO_WATCH vw ON v.video_id = vw.video_id AND vw.student_id = ?
            WHERE v.course_id = ?
            ORDER BY v.video_id ASC
        ";
        
        $stmt = mysqli_prepare($conn, $video_query);
        mysqli_stmt_bind_param($stmt, "ii", $student_id, $course_id);
        mysqli_stmt_execute($stmt);
        $video_result = mysqli_stmt_get_result($stmt);
        
        $videos = [];
        while ($video = mysqli_fetch_assoc($video_result)) {
            $videos[] = [
                'video_id' => intval($video['video_id']),
                'video_title' => $video['video_title'],
                'watched' => intval($video['watched']) === 1
            ];
        }
        
        mysqli_stmt_close($stmt);
        
        // Get assignment progress
        $assignment_query = "
            SELECT 
                a.assignment_id,
                a.assignment_title,
                a.max_score,
                COALESCE(asub.score, NULL) as score,
                COALESCE(asub.submission_status, 'not_submitted') as status
            FROM ASSIGNMENT a
            LEFT JOIN ASSIGNMENT_SUBMISSION asub ON a.assignment_id = asub.assignment_id AND asub.student_id = ?
            WHERE a.course_id = ?
            ORDER BY a.assignment_id ASC
        ";
        
        $stmt = mysqli_prepare($conn, $assignment_query);
        mysqli_stmt_bind_param($stmt, "ii", $student_id, $course_id);
        mysqli_stmt_execute($stmt);
        $assignment_result = mysqli_stmt_get_result($stmt);
        
        $assignments = [];
        $total_score = 0;
        $graded_count = 0;
        
        while ($assignment = mysqli_fetch_assoc($assignment_result)) {
            $score = $assignment['score'] !== null ? floatval($assignment['score']) : null;
            
            if ($score !== null) {
                $total_score += $score;
                $graded_count++;
            }
            
            $assignments[] = [
                'assignment_id' => intval($assignment['assignment_id']),
                'assignment_title' => $assignment['assignment_title'],
                'max_score' => floatval($assignment['max_score']),
                'score' => $score,
                'status' => $assignment['status']
            ];
        }
        
        mysqli_stmt_close($stmt);
        
        $average_mark = $graded_count > 0 ? round($total_score / $graded_count, 2) : 0;
        
        echo json_encode([
            'success' => true,
            'course_id' => intval($course_id),
            'course_title' => $course['course_title'],
            'student' => [
                'student_id' => intval($student['user_id']),
                'student_name' => $student['student_name'],
                'email' => $student['email'],
                'progress_percentage' => floatval($student['progress_percentage']),
                'videos_watched' => intval($student['videos_watched']),
                'assignments_completed' => intval($student['assignments_completed'])
            ],
            'videos' => $videos,
            'assignments' => $assignments,
            'stats' => [
                'total_videos' => count($videos),
                'watched_videos' => count(array_filter($videos, fn($v) => $v['watched'])),
                'total_assignments' => count($assignments),
                'graded_assignments' => $graded_count,
                'average_mark' => $average_mark
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ]);
    }
}

else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action. Use: get_students_progress or get_student_details']);
}

mysqli_close($conn);
?>
