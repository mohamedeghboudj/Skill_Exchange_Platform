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

// Check if user is a teacher
$role = $_SESSION['user_role'] ?? '';
if (strtolower($role) !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Only teachers can access this']);
    exit();
}

$teacher_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// Get POST/GET parameters
$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? $data['action'] ?? '';

/**
 * Get student assignment progress for a course
 * Teacher can see all student assignments and grades
 */
function getStudentAssignmentProgress($student_id, $course_id) {
    global $teacher_id, $conn;
    
    // Verify teacher owns this course
    $sql = "SELECT course_id, course_title FROM COURSE WHERE course_id = ? AND teacher_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $course_id, $teacher_id);
    $stmt->execute();
    $course = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if (!$course) {
        return ['success' => false, 'message' => 'Course not found or access denied'];
    }
    
    // Get student info and enrollment progress
    $sql = "SELECT u.user_id as id, u.full_name as username, u.email, e.progress_percentage
            FROM USER u
            LEFT JOIN ENROLLMENT e ON e.student_id = u.user_id AND e.course_id = ?
            WHERE u.user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $course_id, $student_id);
    $stmt->execute();
    $student = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if (!$student) {
        return ['success' => false, 'message' => 'Student not found'];
    }
    
    $student['progress_percentage'] = $student['progress_percentage'] ?? 0;
    
    // Get video progress for stepper
    $sql = "SELECT v.video_id, v.video_title,
            CASE WHEN vw.video_id IS NOT NULL AND vw.is_watched = 1 THEN 1 ELSE 0 END as watched
            FROM VIDEO v
            LEFT JOIN VIDEO_WATCH vw ON v.video_id = vw.video_id AND vw.student_id = ?
            WHERE v.course_id = ?
            ORDER BY v.video_id";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    $stmt->execute();
    $video_result = $stmt->get_result();
    $videos = [];
    while ($v = $video_result->fetch_assoc()) {
        $videos[] = [
            'video_id' => (int)$v['video_id'],
            'video_title' => $v['video_title'],
            'watched' => (int)$v['watched'] === 1
        ];
    }
    $stmt->close();
    
    $watched_videos = count(array_filter($videos, fn($x) => $x['watched']));
    
    // Get all assignments with student submissions (pick latest submission if duplicates exist)
    $sql = "SELECT 
        a.assignment_id,
        a.assignment_title,
        a.max_score,
        s.submission_id,
        s.submission_url,
        s.score,
        CASE 
            WHEN s.submission_id IS NULL THEN 'not_submitted'
            WHEN s.submission_status = 'submitted' THEN 'submitted'
            WHEN s.submission_status = 'marked' THEN 'graded'
            ELSE 'submitted'
        END as status
    FROM ASSIGNMENT a
    LEFT JOIN (
        SELECT s1.* FROM ASSIGNMENT_SUBMISSION s1
        INNER JOIN (
            SELECT assignment_id, student_id, MAX(submission_id) as max_id
            FROM ASSIGNMENT_SUBMISSION
            WHERE student_id = ?
            GROUP BY assignment_id, student_id
        ) latest ON s1.assignment_id = latest.assignment_id 
            AND s1.student_id = latest.student_id AND s1.submission_id = latest.max_id
    ) s ON a.assignment_id = s.assignment_id
    WHERE a.course_id = ?
    ORDER BY a.assignment_id";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $assignments = [];
    $submitted_count = 0;
    $graded_count = 0;
    $missed_count = 0;
    $total_score = 0;
    $max_total_score = 0;
    
    while ($assignment = $result->fetch_assoc()) {
        $max_total_score += (float)$assignment['max_score'];
        
        if ($assignment['score'] !== null && $assignment['status'] === 'graded') {
            $total_score += (float)$assignment['score'];
            $graded_count++;
        } elseif ($assignment['status'] === 'not_submitted') {
            $missed_count++;
        }
        
        if ($assignment['submission_id'] !== null) {
            $submitted_count++;
        }
        
        $percentage = null;
        if ($assignment['score'] !== null && $assignment['max_score'] > 0) {
            $percentage = round(((float)$assignment['score'] / (float)$assignment['max_score']) * 100, 2);
        }
        
        $assignments[] = [
            'assignment_id' => (int)$assignment['assignment_id'],
            'assignment_title' => $assignment['assignment_title'],
            'max_score' => (float)$assignment['max_score'],
            'submission_id' => $assignment['submission_id'] ? (int)$assignment['submission_id'] : null,
            'submission_url' => $assignment['submission_url'],
            'score' => $assignment['score'] !== null ? (float)$assignment['score'] : null,
            'status' => $assignment['status'],
            'percentage' => $percentage
        ];
    }
    
    $stmt->close();
    
    $average_mark = $graded_count > 0 ? round($total_score / $graded_count, 2) : 0;
    
    return [
        'success' => true,
        'course_id' => (int)$course_id,
        'course_title' => $course['course_title'],
        'student_id' => (int)$student_id,
        'student' => [
            'student_id' => (int)$student_id,
            'student_name' => $student['username'],
            'progress_percentage' => (float)$student['progress_percentage']
        ],
        'student_email' => $student['email'],
        'videos' => $videos,
        'stats' => [
            'watched_videos' => $watched_videos,
            'total_videos' => count($videos),
            'graded_assignments' => $graded_count,
            'done_count' => $graded_count,
            'missed_count' => $missed_count,
            'average_mark' => $average_mark
        ],
        'total_assignments' => count($assignments),
        'submitted_count' => $submitted_count,
        'graded_count' => $graded_count,
        'assignments' => $assignments
    ];
}

/**
 * Get all students in teacher's course with their progress
 */
function getStudentsProgress($course_id) {
    global $teacher_id, $conn;
    
    // Verify teacher owns this course
    $sql = "SELECT course_id, course_title FROM COURSE WHERE course_id = ? AND teacher_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $course_id, $teacher_id);
    $stmt->execute();
    $course = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if (!$course) {
        return ['success' => false, 'message' => 'Course not found or access denied'];
    }
    
    // Get all enrolled students with their assignment progress
    $sql = "SELECT 
        u.user_id as student_id,
        u.full_name as student_name,
        u.email,
        COUNT(a.assignment_id) as total_assignments,
        COUNT(CASE WHEN s.submission_id IS NOT NULL THEN 1 END) as submitted_count,
        COUNT(CASE WHEN s.submission_status IN ('marked', 'graded') THEN 1 END) as graded_count,
        COALESCE(AVG(CASE WHEN s.submission_status IN ('marked', 'graded') THEN s.score END), 0) as average_score,
        COALESCE(SUM(s.score), 0) as total_score
    FROM ENROLLMENT e
    JOIN USER u ON e.student_id = u.user_id
    LEFT JOIN ASSIGNMENT a ON e.course_id = a.course_id
    LEFT JOIN ASSIGNMENT_SUBMISSION s ON a.assignment_id = s.assignment_id 
        AND s.student_id = u.user_id
    WHERE e.course_id = ? AND e.is_active = 1
    GROUP BY u.user_id, u.full_name, u.email";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $course_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $students = [];
    while ($student = $result->fetch_assoc()) {
        $students[] = [
            'student_id' => (int)$student['student_id'],
            'student_name' => $student['student_name'],
            'student_email' => $student['email'],
            'total_assignments' => (int)$student['total_assignments'],
            'submitted_count' => (int)$student['submitted_count'],
            'graded_count' => (int)$student['graded_count'],
            'average_score' => round((float)$student['average_score'], 2),
            'total_score' => round((float)$student['total_score'], 2)
        ];
    }
    
    $stmt->close();
    
    return [
        'success' => true,
        'course_id' => (int)$course_id,
        'course_title' => $course['course_title'] ?? 'Course',
        'total_students' => count($students),
        'students' => $students
    ];
}

/**
 * Grade an assignment submission
 * Teacher can set/update the mark
 */
function gradeAssignment($submission_id, $score) {
    global $teacher_id, $conn;
    
    // Verify submission exists and belongs to teacher's course
    $sql = "SELECT s.submission_id as id, a.max_score, a.course_id, c.teacher_id
            FROM ASSIGNMENT_SUBMISSION s
            JOIN ASSIGNMENT a ON s.assignment_id = a.assignment_id
            JOIN COURSE c ON a.course_id = c.course_id
            WHERE s.submission_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $submission_id);
    $stmt->execute();
    $submission = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if (!$submission) {
        return ['success' => false, 'message' => 'Submission not found'];
    }
    
    if ($submission['teacher_id'] != $teacher_id) {
        return ['success' => false, 'message' => 'Access denied'];
    }
    
    // Validate score
    if ($score < 0 || $score > $submission['max_score']) {
        return ['success' => false, 'message' => 'Score must be between 0 and ' . $submission['max_score']];
    }
    
    // Update score
    $sql = "UPDATE ASSIGNMENT_SUBMISSION 
            SET score = ?, submission_status = 'marked'
            WHERE submission_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('di', $score, $submission_id);
    
    if ($stmt->execute()) {
        $stmt->close();
        return [
            'success' => true,
            'message' => 'Assignment graded successfully',
            'submission_id' => $submission_id,
            'score' => (float)$score
        ];
    } else {
        $stmt->close();
        return ['success' => false, 'message' => 'Failed to grade assignment'];
    }
}

/**
 * Get assignment submission details
 */
function getSubmissionDetails($submission_id) {
    global $teacher_id, $conn;
    
    // Verify submission belongs to teacher
    $sql = "SELECT 
        s.submission_id,
        s.student_id,
        s.assignment_id,
        s.submission_url,
        s.score,
        s.submission_status,
        u.full_name as student_name,
        u.email as student_email,
        a.assignment_title,
        a.max_score,
        c.teacher_id
    FROM ASSIGNMENT_SUBMISSION s
    JOIN USER u ON s.student_id = u.user_id
    JOIN ASSIGNMENT a ON s.assignment_id = a.assignment_id
    JOIN COURSE c ON a.course_id = c.course_id
    WHERE s.submission_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $submission_id);
    $stmt->execute();
    $submission = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if (!$submission) {
        return ['success' => false, 'message' => 'Submission not found'];
    }
    
    if ($submission['teacher_id'] != $teacher_id) {
        return ['success' => false, 'message' => 'Access denied'];
    }
    
    $percentage = null;
    if ($submission['score'] !== null && $submission['max_score'] > 0) {
        $percentage = round(((float)$submission['score'] / (float)$submission['max_score']) * 100, 2);
    }
    
    return [
        'success' => true,
        'submission_id' => (int)$submission['submission_id'],
        'student_id' => (int)$submission['student_id'],
        'student_name' => $submission['student_name'],
        'student_email' => $submission['student_email'],
        'assignment_id' => (int)$submission['assignment_id'],
        'assignment_title' => $submission['assignment_title'],
        'submission_url' => $submission['submission_url'],
        'score' => $submission['score'] !== null ? (float)$submission['score'] : null,
        'status' => $submission['submission_status'],
        'max_score' => (float)$submission['max_score'],
        'percentage' => $percentage
    ];
}

// Route actions
if ($method === 'GET') {
    switch ($action) {
        case 'get_enrolled_students':
        // Get all students enrolled in any course taught by this teacher
        $teacher_id = $_SESSION['user_id'];
        
        $sql = "
            SELECT 
                u.user_id as student_id,
                u.full_name as student_name,
                u.profile_picture,
                c.course_id,
                c.course_title
            FROM ENROLLMENT e
            JOIN USER u ON e.student_id = u.user_id
            JOIN COURSE c ON e.course_id = c.course_id
            WHERE c.teacher_id = ?
            ORDER BY u.full_name ASC
        ";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $teacher_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $students = [];
        while ($row = $result->fetch_assoc()) {
            $students[] = $row;
        }

        echo json_encode(['success' => true, 'students' => $students]);
        break;

    case 'students-progress':
            $course_id = $_GET['course_id'] ?? null;
            if (!$course_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'course_id required']);
                exit();
            }
            echo json_encode(getStudentsProgress($course_id));
            break;
            
        case 'student-assignments':
            $student_id = $_GET['student_id'] ?? null;
            $course_id = $_GET['course_id'] ?? null;
            
            if (!$student_id || !$course_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'student_id and course_id required']);
                exit();
            }
            
            echo json_encode(getStudentAssignmentProgress($student_id, $course_id));
            break;
            
        case 'submission':
            $submission_id = $_GET['submission_id'] ?? null;
            
            if (!$submission_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'submission_id required']);
                exit();
            }
            
            echo json_encode(getSubmissionDetails($submission_id));
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} elseif ($method === 'POST') {
    switch ($action) {
        case 'grade-assignment':
            $submission_id = $data['submission_id'] ?? null;
            $score = $data['score'] ?? null;
            
            if ($submission_id === null || $score === null) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'submission_id and score required']);
                exit();
            }
            
            echo json_encode(gradeAssignment($submission_id, (float)$score));
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

$conn->close();
?>
