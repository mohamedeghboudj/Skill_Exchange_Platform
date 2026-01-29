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
if ($_SESSION['user_role'] !== 'Teacher') {
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
    $sql = "SELECT id, title FROM course WHERE id = ? AND teacher_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $course_id, $teacher_id);
    $stmt->execute();
    $course = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if (!$course) {
        return ['success' => false, 'message' => 'Course not found or access denied'];
    }
    
    // Get student info
    $sql = "SELECT id, username, email FROM user WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $student_id);
    $stmt->execute();
    $student = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if (!$student) {
        return ['success' => false, 'message' => 'Student not found'];
    }
    
    // Get all assignments with student submissions and grades
    $sql = "SELECT 
        a.id as assignment_id,
        a.title as assignment_title,
        a.max_score,
        a.due_date,
        COALESCE(s.id, NULL) as submission_id,
        COALESCE(s.submission_url, NULL) as submission_url,
        COALESCE(s.submitted_at, NULL) as submitted_at,
        COALESCE(s.score, NULL) as score,
        COALESCE(s.graded_at, NULL) as graded_at,
        CASE 
            WHEN s.id IS NULL THEN 'not_submitted'
            WHEN s.score IS NULL THEN 'submitted'
            ELSE 'graded'
        END as status
    FROM assignment a
    LEFT JOIN student_assignment_submission s ON a.id = s.assignment_id 
        AND s.student_id = ?
    WHERE a.course_id = ?
    ORDER BY a.sequence_number";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $assignments = [];
    $submitted_count = 0;
    $graded_count = 0;
    $total_score = 0;
    $max_total_score = 0;
    
    while ($assignment = $result->fetch_assoc()) {
        $max_total_score += (float)$assignment['max_score'];
        
        if ($assignment['score'] !== null) {
            $total_score += (float)$assignment['score'];
            $graded_count++;
        }
        
        if ($assignment['submitted_at'] !== null) {
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
            'due_date' => $assignment['due_date'],
            'submission_id' => $assignment['submission_id'] ? (int)$assignment['submission_id'] : null,
            'submission_url' => $assignment['submission_url'],
            'submitted_at' => $assignment['submitted_at'],
            'score' => $assignment['score'] ? (float)$assignment['score'] : null,
            'graded_at' => $assignment['graded_at'],
            'status' => $assignment['status'],
            'percentage' => $percentage
        ];
    }
    
    $stmt->close();
    
    $average_score = $graded_count > 0 ? round($total_score / $graded_count, 2) : null;
    
    return [
        'success' => true,
        'course_id' => (int)$course_id,
        'course_title' => $course['title'],
        'student_id' => (int)$student_id,
        'student_name' => $student['username'],
        'student_email' => $student['email'],
        'total_assignments' => count($assignments),
        'submitted_count' => $submitted_count,
        'graded_count' => $graded_count,
        'average_score' => $average_score,
        'total_score' => round($total_score, 2),
        'max_total_score' => round($max_total_score, 2),
        'assignments' => $assignments
    ];
}

/**
 * Get all students in teacher's course with their progress
 */
function getStudentsProgress($course_id) {
    global $teacher_id, $conn;
    
    // Verify teacher owns this course
    $sql = "SELECT id, title FROM course WHERE id = ? AND teacher_id = ?";
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
        u.id as student_id,
        u.username as student_name,
        u.email,
        COUNT(a.id) as total_assignments,
        COUNT(CASE WHEN s.id IS NOT NULL THEN 1 END) as submitted_count,
        COUNT(CASE WHEN s.score IS NOT NULL THEN 1 END) as graded_count,
        COALESCE(AVG(CASE WHEN s.score IS NOT NULL THEN s.score END), 0) as average_score,
        COALESCE(SUM(s.score), 0) as total_score
    FROM enrollment e
    JOIN user u ON e.student_id = u.id
    LEFT JOIN assignment a ON e.course_id = a.course_id
    LEFT JOIN student_assignment_submission s ON a.id = s.assignment_id 
        AND s.student_id = u.id
    WHERE e.course_id = ? AND e.is_active = 1
    GROUP BY u.id, u.username, u.email";
    
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
        'course_title' => $course['title'],
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
    $sql = "SELECT s.id, a.max_score, a.course_id, c.teacher_id
            FROM student_assignment_submission s
            JOIN assignment a ON s.assignment_id = a.id
            JOIN course c ON a.course_id = c.id
            WHERE s.id = ?";
    
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
    $now = date('Y-m-d H:i:s');
    $sql = "UPDATE student_assignment_submission 
            SET score = ?, graded_at = ?
            WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('dsi', $score, $now, $submission_id);
    
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
        s.id as submission_id,
        s.student_id,
        s.assignment_id,
        s.submission_url,
        s.submitted_at,
        s.score,
        s.graded_at,
        u.username as student_name,
        u.email as student_email,
        a.title as assignment_title,
        a.max_score,
        c.teacher_id
    FROM student_assignment_submission s
    JOIN user u ON s.student_id = u.id
    JOIN assignment a ON s.assignment_id = a.id
    JOIN course c ON a.course_id = c.id
    WHERE s.id = ?";
    
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
        'submitted_at' => $submission['submitted_at'],
        'score' => $submission['score'] ? (float)$submission['score'] : null,
        'graded_at' => $submission['graded_at'],
        'max_score' => (float)$submission['max_score'],
        'percentage' => $percentage
    ];
}

// Route actions
if ($method === 'GET') {
    switch ($action) {
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
