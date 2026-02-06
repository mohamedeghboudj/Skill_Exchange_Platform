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
 */
function getCourseProgressOverview($course_id) {
    global $student_id, $conn;
    
    // Get course info
    $sql = "SELECT course_id, course_title FROM COURSE WHERE course_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $course_id);
    $stmt->execute();
    $course = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if (!$course) {
        return ['success' => false, 'message' => 'Course not found'];
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
    
    // Update enrollment record
    $sql = "UPDATE ENROLLMENT 
            SET progress_percentage = ?,
                videos_watched = ?
            WHERE student_id = ? AND course_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('diii', $video_completion, $videos_watched, $student_id, $course_id);
    $stmt->execute();
    $stmt->close();
    
    return [
        'success' => true,
        'student_id' => $student_id,
        'course_id' => (int)$course_id,
        'course_title' => $course['course_title'],
        'overall_completion' => round($video_completion, 2),
        'videos_watched' => $videos_watched,
        'total_videos' => $total_videos,
        'video_completion' => round($video_completion, 2)
    ];
}

/**
 * Get course video timeline
 */
function getCourseVideoTimeline($course_id) {
    global $student_id, $conn;
    
    $sql = "SELECT course_id, course_title FROM COURSE WHERE course_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $course_id);
    $stmt->execute();
    $course = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if (!$course) return ['success' => false, 'message' => 'Course not found'];
    
    $sql = "SELECT 
        v.video_id,
        v.video_title,
        CASE WHEN vw.is_watched = 1 THEN 'watched' ELSE 'not_yet' END as status
    FROM VIDEO v
    LEFT JOIN VIDEO_WATCH vw ON v.video_id = vw.video_id AND vw.student_id = ?
    WHERE v.course_id = ?
    ORDER BY v.video_id";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $video_steps = [];
    $videos_watched = 0;
    
    while ($video = $result->fetch_assoc()) {
        if ($video['status'] === 'watched') $videos_watched++;
        $video_steps[] = [
            'video_id' => (int)$video['video_id'],
            'video_title' => $video['video_title'],
            'status' => $video['status']
        ];
    }
    $stmt->close();
    
    return [
        'success' => true,
        'course_id' => (int)$course_id,
        'course_title' => $course['course_title'],
        'total_videos' => count($video_steps),
        'videos_watched' => $videos_watched,
        'video_steps' => $video_steps
    ];
}

/**
 * Update video progress
 */
function updateVideoProgress($video_id, $status) {
    global $student_id, $conn;
    
    if (!in_array($status, ['watched', 'not_yet', 'locked'])) {
        return ['success' => false, 'message' => 'Invalid status'];
    }
    
    $sql = "SELECT course_id FROM VIDEO WHERE video_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $video_id);
    $stmt->execute();
    $video = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if (!$video) return ['success' => false, 'message' => 'Video not found'];
    
    $sql = "SELECT video_id FROM VIDEO_WATCH WHERE student_id = ? AND video_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $video_id);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    $is_watched = ($status === 'watched') ? 1 : 0;
    
    if ($existing) {
        $sql = "UPDATE VIDEO_WATCH SET is_watched = ? WHERE student_id = ? AND video_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iii', $is_watched, $student_id, $video_id);
    } else {
        $sql = "INSERT INTO VIDEO_WATCH (student_id, video_id, is_watched) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iii', $student_id, $video_id, $is_watched);
    }
    $stmt->execute();
    $stmt->close();
    
    return ['success' => true, 'video_id' => $video_id, 'status' => $status];
}

/**
 * Get student dashboard
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
    return ['success' => true, 'courses' => $courses];
}

/**
 * Submit assignment
 */
function submitAssignment($assignment_id, $file) {
    global $student_id, $conn;
    $target_dir = "../../uploads/assignments/";
    if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);
    
    $file_extension = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
    $new_filename = $student_id . "_" . $assignment_id . "_" . time() . "." . $file_extension;
    $target_file = $target_dir . $new_filename;
    $db_path = "/uploads/assignments/" . $new_filename;
    
    if (move_uploaded_file($file["tmp_name"], $target_file)) {
        $sql = "SELECT submission_id FROM ASSIGNMENT_SUBMISSION WHERE student_id = ? AND assignment_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $student_id, $assignment_id);
        $stmt->execute();
        $existing = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        
        if ($existing) {
            $sql = "UPDATE ASSIGNMENT_SUBMISSION SET submission_url = ?, submission_status = 'submitted' WHERE submission_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('si', $db_path, $existing['submission_id']);
        } else {
            $sql = "INSERT INTO ASSIGNMENT_SUBMISSION (student_id, assignment_id, submission_url, score, submission_status) VALUES (?, ?, ?, 0, 'submitted')";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('iis', $student_id, $assignment_id, $db_path);
        }
        $stmt->execute();
        $stmt->close();
        return ['success' => true];
    }
    return ['success' => false, 'message' => 'File upload failed'];
}

/**
 * Get assignments for student
 */
function getAssignments($student_id, $course_id) {
    global $conn;
    $sql = "SELECT 
        a.assignment_id,
        a.assignment_title,
        a.max_score,
        s.score,
        s.submission_url,
        CASE 
            WHEN s.submission_status = 'marked' THEN 'done'
            WHEN s.submission_status = 'submitted' THEN 'pending'
            ELSE 'pending'
        END as status
    FROM ASSIGNMENT a
    LEFT JOIN ASSIGNMENT_SUBMISSION s ON a.assignment_id = s.assignment_id AND s.student_id = ?
    WHERE a.course_id = ?
    ORDER BY a.assignment_id";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $assignments = [];
    $total_score = 0;
    $done_count = 0;
    $missed_count = 0;
    
    while ($row = $result->fetch_assoc()) {
        $score = $row['score'] !== null ? (float)$row['score'] : null;
        if ($row['status'] === 'done' && $score !== null) {
            $total_score += $score;
            $done_count++;
        } elseif ($row['status'] !== 'done' && $row['status'] !== 'pending') {
            $missed_count++;
        }
        $assignments[] = [
            'id' => $row['assignment_id'],
            'assignment_title' => $row['assignment_title'],
            'score' => $row['score'],
            'max_score' => (float)$row['max_score'],
            'status' => $row['status']
        ];
    }
    $stmt->close();
    
    $average_mark = $done_count > 0 ? round($total_score / $done_count, 1) : 0;
    $stats = [
        'done' => $done_count,
        'missed' => $missed_count,
        'pending' => count($assignments) - $done_count - $missed_count,
        'average_mark' => $average_mark
    ];
    return ['success' => true, 'data' => $assignments, 'stats' => $stats, 'total_score' => $total_score];
}

/**
 * Get existing rating for a course
 */
function getRating($course_id) {
    global $student_id, $conn;
    
    $sql = "SELECT rating FROM RATING WHERE user_id = ? AND course_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $stmt->close();
        return [
            'success' => true,
            'has_rated' => true,
            'rating' => (float)$row['rating']
        ];
    } else {
        $stmt->close();
        return [
            'success' => true,
            'has_rated' => false,
            'rating' => 0
        ];
    }
}

/**
 * Submit a rating
 */
function submitRating($course_id, $rating) {
    global $student_id, $conn;
    
    // Validate rating
    if ($rating < 1 || $rating > 5) {
        return ['success' => false, 'message' => 'Rating must be between 1 and 5'];
    }
    
    // Check enrollment
    $sql = "SELECT enrollment_id FROM ENROLLMENT WHERE student_id = ? AND course_id = ? AND is_active = 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    $stmt->execute();
    $enrollment = $stmt->get_result();
    
    if ($enrollment->num_rows === 0) {
        $stmt->close();
        return ['success' => false, 'message' => 'You must be enrolled in this course to rate it'];
    }
    $stmt->close();
    
    // Check if rating exists
    $sql = "SELECT rating FROM RATING WHERE user_id = ? AND course_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    $stmt->execute();
    $existing = $stmt->get_result();
    
    if ($existing->num_rows > 0) {
        $stmt->close();
        // Update existing rating
        $sql = "UPDATE RATING SET rating = ? WHERE user_id = ? AND course_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('dii', $rating, $student_id, $course_id);
        $message = 'Rating updated successfully!';
    } else {
        $stmt->close();
        // Insert new rating
        $sql = "INSERT INTO RATING (user_id, course_id, rating) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iid', $student_id, $course_id, $rating);
        $message = 'Thank you for rating this course!';
    }
    
    if ($stmt->execute()) {
        $stmt->close();
        
        // Update course average rating
        $sql = "UPDATE COURSE SET rating = (SELECT AVG(rating) FROM RATING WHERE course_id = ?) WHERE course_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $course_id, $course_id);
        $stmt->execute();
        $stmt->close();
        
        return ['success' => true, 'message' => $message, 'rating' => $rating];
    } else {
        $stmt->close();
        return ['success' => false, 'message' => 'Database error'];
    }
}

// ==================== ROUTE ACTIONS ====================

if ($method === 'GET') {
    switch ($action) {
        case 'get_my_instructors':
            $sql = "SELECT c.course_id, c.course_title, u.user_id as teacher_id, u.full_name as teacher_name, u.profile_picture
                    FROM ENROLLMENT e
                    JOIN COURSE c ON e.course_id = c.course_id
                    JOIN USER u ON c.teacher_id = u.user_id
                    WHERE e.student_id = ? AND e.is_active = 1";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $student_id);
            $stmt->execute();
            $res = $stmt->get_result();
            $instructors = [];
            while ($row = $res->fetch_assoc()) $instructors[] = $row;
            $stmt->close();
            echo json_encode(['success' => true, 'instructors' => $instructors]);
            break;
            
        case 'dashboard':
            echo json_encode(getStudentDashboard());
            break;
            
        case 'course-progress':
            echo json_encode(getCourseProgressOverview($_GET['course_id'] ?? 0));
            break;
            
        case 'video-timeline':
            echo json_encode(getCourseVideoTimeline($_GET['course_id'] ?? 0));
            break;
            
        case 'get-assignments':
            echo json_encode(getAssignments($student_id, $_GET['course_id'] ?? 0));
            break;
            
        case 'get-rating':
            echo json_encode(getRating($_GET['course_id'] ?? 0));
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
    
} elseif ($method === 'POST') {
    switch ($action) {
        case 'update-video-progress':
            echo json_encode(updateVideoProgress($data['video_id'] ?? 0, $data['status'] ?? ''));
            break;
            
        case 'submit-assignment':
            echo json_encode(submitAssignment($_POST['assignment_id'] ?? 0, $_FILES['file'] ?? []));
            break;
            
        case 'submit-rating':
            echo json_encode(submitRating($data['course_id'] ?? 0, $data['rating'] ?? 0));
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}

$conn->close();
?>