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

$student_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// Get POST/GET parameters
$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? $data['action'] ?? '';

/**
 * Get course progress overview
 * Returns videos watched, assignments completed, overall completion
 */
function getCourseProgressOverview($course_id) {
    global $student_id, $conn;
    
    // Get course info
    $sql = "SELECT id, title FROM course WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $course_id);
    $stmt->execute();
    $course_result = $stmt->get_result();
    $course = $course_result->fetch_assoc();
    $stmt->close();
    
    if (!$course) {
        return null;
    }
    
    // Get video statistics
    $sql = "SELECT 
        COUNT(v.video_id) as total_videos,
        COUNT(CASE WHEN vw.is_watched = 1 THEN 1 END) as videos_watched
    FROM VIDEO v
    LEFT JOIN VIDEO_WATCH vw ON v.video_id = vw.video_id AND vw.student_id = ?
    WHERE v.course_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    $stmt->execute();
    $video_stats = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    $total_videos = (int)($video_stats['total_videos'] ?? 0);
    $videos_watched = (int)($video_stats['videos_watched'] ?? 0);
    $video_completion = $total_videos > 0 ? ($videos_watched / $total_videos * 100) : 0;
    
    // Calculate overall completion
    $overall_completion = $video_completion;
    
    // Update enrollment record
    $sql = "UPDATE ENROLLMENT 
            SET progress_percentage = ?,
                videos_watched = ?
            WHERE student_id = ? AND course_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('diii', $overall_completion, $videos_watched, $student_id, $course_id);
    $stmt->execute();
    $stmt->close();
    
    return [
        'success' => true,
        'student_id' => $student_id,
        'course_id' => (int)$course_id,
        'course_title' => $course['title'],
        'overall_completion' => round($overall_completion, 2),
        'videos_watched' => $videos_watched,
        'total_videos' => $total_videos,
        'video_completion' => round($video_completion, 2)
    ];
}

/**
 * Get course video timeline (stepper)
 * Returns all videos with their status: watched, not yet, or locked
 */
function getCourseVideoTimeline($course_id) {
    global $student_id, $conn;
    
    // Get course info
    $sql = "SELECT id, title FROM course WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $course_id);
    $stmt->execute();
    $course_result = $stmt->get_result();
    $course = $course_result->fetch_assoc();
    $stmt->close();
    
    if (!$course) {
        return null;
    }
    
    // Get all videos with progress
    $sql = "SELECT 
        v.video_id,
        v.title as video_title,
        v.sequence_number,
        CASE WHEN vw.is_watched = 1 THEN 'watched' ELSE 'not_yet' END as status
    FROM VIDEO v
    LEFT JOIN VIDEO_WATCH vw ON v.video_id = vw.video_id 
        AND vw.student_id = ?
    WHERE v.course_id = ?
    ORDER BY v.sequence_number";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    $stmt->execute();
    $videos_result = $stmt->get_result();
    
    $video_steps = [];
    $videos_watched = 0;
    
    while ($video = $videos_result->fetch_assoc()) {
        $status = $video['status']; // 'watched', 'not_yet'
        
        if ($status === 'watched') {
            $videos_watched++;
        }
        
        $video_steps[] = [
            'video_id' => (int)$video['video_id'],
            'video_title' => $video['video_title'],
            'sequence_number' => (int)$video['sequence_number'],
            'status' => $status
        ];
    }
    
    $stmt->close();
    
    return [
        'success' => true,
        'course_id' => (int)$course_id,
        'course_title' => $course['title'],
        'total_videos' => count($video_steps),
        'videos_watched' => $videos_watched,
        'video_steps' => $video_steps
    ];
}

/**
 * Update video progress
 * Sets status to: watched, not_yet, or locked
 */
function updateVideoProgress($video_id, $status) {
    global $student_id, $conn;
    
    // Validate status
    if (!in_array($status, ['watched', 'not_yet', 'locked'])) {
        return ['success' => false, 'message' => 'Invalid status'];
    }
    
    // Get course_id from video
    $sql = "SELECT course_id FROM video WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $video_id);
    $stmt->execute();
    $video = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if (!$video) {
        return ['success' => false, 'message' => 'Video not found'];
    }
    
    $course_id = $video['course_id'];
    
    // Check if progress record exists
    $sql = "SELECT video_id FROM VIDEO_WATCH 
            WHERE student_id = ? AND video_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $video_id);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    $now = date('Y-m-d H:i:s');
    $is_watched = ($status === 'watched') ? 1 : 0;
    
    if ($existing) {
        // Update existing record
        $sql = "UPDATE VIDEO_WATCH
                SET is_watched = ?,
                    watched_at = CASE WHEN ? = 1 THEN ? ELSE watched_at END
                WHERE student_id = ? AND video_id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iisii', $is_watched, $is_watched, $now, $student_id, $video_id);
        $stmt->execute();
        $stmt->close();
    } else {
        // Create new record
        $watched_at = ($is_watched === 1) ? $now : null;
        
        $sql = "INSERT INTO VIDEO_WATCH 
                (student_id, video_id, is_watched, watched_at)
                VALUES (?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iiis', $student_id, $video_id, $is_watched, $watched_at);
        $stmt->execute();
        $stmt->close();
    }
    
    return [
        'success' => true,
        'message' => 'Video progress updated',
        'video_id' => $video_id,
        'status' => $status
    ];
}

/**
 * Get student dashboard
 * Returns all enrolled courses with progress
 */
function getStudentDashboard() {
    global $student_id, $conn;
    
    $sql = "SELECT 
        c.course_id,
        c.course_title,
        e.progress_percentage,
        e.videos_watched,
        (SELECT COUNT(*) FROM VIDEO WHERE course_id = c.course_id) as total_videos
    FROM ENROLLMENT e
    JOIN COURSE c ON e.course_id = c.course_id
    WHERE e.student_id = ? AND e.is_active = 1";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $student_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $courses = [];
    while ($course = $result->fetch_assoc()) {
        $courses[] = [
            'course_id' => (int)$course['course_id'],
            'course_title' => $course['course_title'],
            'progress_percentage' => (float)$course['progress_percentage'],
            'videos_watched' => (int)$course['videos_watched'],
            'total_videos' => (int)$course['total_videos']
        ];
    }
    
    $stmt->close();
    
    return [
        'success' => true,
        'student_id' => $student_id,
        'total_courses' => count($courses),
        'courses' => $courses
    ];
}

/**
 * Enroll student in course
 */
function enrollStudent($course_id) {
    global $student_id, $conn;
    
    // Check if already enrolled
    $sql = "SELECT id FROM enrollment WHERE student_id = ? AND course_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if ($existing) {
        return ['success' => false, 'message' => 'Already enrolled in this course'];
    }
    
    // Create enrollment
    $sql = "INSERT INTO enrollment (student_id, course_id, progress_percentage, videos_watched, is_active)
            VALUES (?, ?, 0, 0, 1)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    
    if ($stmt->execute()) {
        $stmt->close();
        return [
            'success' => true,
            'message' => 'Enrolled successfully',
            'course_id' => $course_id
        ];
    } else {
        $stmt->close();
        return ['success' => false, 'message' => 'Enrollment failed'];
    }
}

/**
 * Submit assignment with file upload
 */
function submitAssignment($assignment_id, $file) {
    global $student_id, $conn;
    
    // Validate assignment exists and is not locked/graded
    // Note: We might want more robust checks (e.g. is it active?) but basic check for now
    
    // File upload configuration
    $target_dir = "../../uploads/assignments/";
    
    // Create directory if it doesn't exist
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }
    
    $file_extension = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
    $allowed_extensions = ["pdf", "doc", "docx", "zip"];
    
    if (!in_array($file_extension, $allowed_extensions)) {
        return ['success' => false, 'message' => 'Invalid file type. Only PDF, DOC, DOCX, ZIP allowed.'];
    }
    
    // Generate unique filename: studentID_assignmentID_timestamp.ext
    $new_filename = $student_id . "_" . $assignment_id . "_" . time() . "." . $file_extension;
    $target_file = $target_dir . $new_filename;
    $db_path = "/uploads/assignments/" . $new_filename; // Path to store in DB
    
    if (move_uploaded_file($file["tmp_name"], $target_file)) {
        // Check if submission already exists
        $sql = "SELECT submission_id FROM ASSIGNMENT_SUBMISSION WHERE student_id = ? AND assignment_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $student_id, $assignment_id);
        $stmt->execute();
        $existing = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        
        $now = date('Y-m-d H:i:s');
        
        if ($existing) {
            // Update existing submission
            $sql = "UPDATE ASSIGNMENT_SUBMISSION 
                    SET submission_url = ?, submitted_at = ?, submission_status = 'submitted' 
                    WHERE submission_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('ssi', $db_path, $now, $existing['submission_id']);
        } else {
            // New submission
            $sql = "INSERT INTO ASSIGNMENT_SUBMISSION (student_id, assignment_id, submission_url, submitted_at, submission_status)
                    VALUES (?, ?, ?, ?, 'submitted')";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('iiss', $student_id, $assignment_id, $db_path, $now);
        }
        
        if ($stmt->execute()) {
            $stmt->close();
            return ['success' => true, 'message' => 'Assignment submitted successfully'];
        } else {
            $stmt->close();
            return ['success' => false, 'message' => 'Database error'];
        }
    } else {
        return ['success' => false, 'message' => 'Error uploading file'];
    }
}

/**
 * Get assignments for student in a course
 */
function getAssignments($student_id, $course_id) {
    global $conn;
    
    // Get assignments with submission status
    $sql = "SELECT 
        a.assignment_id,
        a.assignment_title,
        a.max_score,
        a.due_date,
        s.score,
        s.submission_url,
        CASE 
            WHEN s.submission_status = 'graded' THEN 'done'
            WHEN s.submission_status = 'submitted' THEN 'pending'
            WHEN a.due_date < NOW() THEN 'missed'
            ELSE 'pending'
        END as status
    FROM ASSIGNMENT a
    LEFT JOIN ASSIGNMENT_SUBMISSION s ON a.assignment_id = s.assignment_id 
        AND s.student_id = ?
    WHERE a.course_id = ?
    ORDER BY a.sequence_number";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $assignments = [];
    $assignment_stats = [
        'done' => 0,
        'missed' => 0,
        'average_mark' => 0
    ];
    $total_score = 0;
    $graded_count = 0;
    
    while ($row = $result->fetch_assoc()) {
        if ($row['status'] === 'done') {
            $assignment_stats['done']++;
            $total_score += $row['score'];
            $graded_count++;
        } elseif ($row['status'] === 'missed') {
            $assignment_stats['missed']++;
        }
        
        $assignments[] = [
            'id' => $row['assignment_id'],
            'assignment_title' => $row['assignment_title'],
            'score' => $row['score'],
            'max_score' => (float)$row['max_score'],
            'status' => $row['status']
        ];
    }
    
    if ($graded_count > 0) {
        $assignment_stats['average_mark'] = round(($total_score / ($graded_count * 100)) * 100); // Rough average calc
        // Better average calc: Sum(score/max_score) / count * 100
    }
    
    $stmt->close();
    
    return [
        'success' => true,
        'data' => $assignments,
        'stats' => $assignment_stats
    ];
}

// Route actions
if ($method === 'GET') {
    switch ($action) {
        case 'get_my_instructors':
            global $student_id;
            $sql = "SELECT 
                c.course_id, c.course_title, 
                u.user_id as teacher_id, u.full_name as teacher_name, u.profile_picture
            FROM ENROLLMENT e
            JOIN COURSE c ON e.course_id = c.course_id
            JOIN USER u ON c.teacher_id = u.user_id
            WHERE e.student_id = ? AND e.is_active = 1";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $student_id);
            $stmt->execute();
            $msg_result = $stmt->get_result();
            
            $instructors = [];
            while ($row = $msg_result->fetch_assoc()) {
                $instructors[] = $row;
            }
            
            echo json_encode(['success' => true, 'instructors' => $instructors]);
            break;

        case 'dashboard':
            echo json_encode(getStudentDashboard());
            break;
            
        case 'course-progress':
            $course_id = $_GET['course_id'] ?? null;
            if (!$course_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'course_id required']);
                exit();
            }
            echo json_encode(getCourseProgressOverview($course_id));
            break;
            
        case 'video-timeline':
            $course_id = $_GET['course_id'] ?? null;
            if (!$course_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'course_id required']);
                exit();
            }
            echo json_encode(getCourseVideoTimeline($course_id));
            break;

        case 'get-assignments':
            $student_id = $_GET['student_id'] ?? null; // Optionally allow passing student_id if admin/teacher calls this? 
            // Better to use session student_id for security for student view
            $student_id = $_SESSION['user_id'];
            
            $course_id = $_GET['course_id'] ?? null;
            if (!$course_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'course_id required']);
                exit();
            }
            echo json_encode(getAssignments($student_id, $course_id));
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} elseif ($method === 'POST') {
    switch ($action) {
        case 'update-video-progress':
            $video_id = $data['video_id'] ?? null;
            $status = $data['status'] ?? null;
            
            if (!$video_id || !$status) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'video_id and status required']);
                exit();
            }
            
            echo json_encode(updateVideoProgress($video_id, $status));
            break;
            
        case 'enroll':
            $course_id = $data['course_id'] ?? null;
            
            if (!$course_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'course_id required']);
                exit();
            }
            
            echo json_encode(enrollStudent($course_id));
            break;
            
        case 'submit-assignment':
            $assignment_id = $_POST['assignment_id'] ?? null;
            
            if (!$assignment_id || !isset($_FILES['file'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'assignment_id and file required']);
                exit();
            }
            
            echo json_encode(submitAssignment($assignment_id, $_FILES['file']));
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
