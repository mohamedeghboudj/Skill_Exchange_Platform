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
        COUNT(id) as total_videos,
        COUNT(CASE WHEN status = 'watched' THEN 1 END) as videos_watched
    FROM student_video_progress
    WHERE student_id = ? AND course_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    $stmt->execute();
    $video_stats = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    $total_videos = (int)$video_stats['total_videos'];
    $videos_watched = (int)$video_stats['videos_watched'];
    $video_completion = $total_videos > 0 ? ($videos_watched / $total_videos * 100) : 0;
    
    // Calculate overall completion
    $overall_completion = $video_completion;
    
    // Update enrollment record
    $sql = "UPDATE enrollment 
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
        v.id as video_id,
        v.title as video_title,
        v.sequence_number,
        COALESCE(svp.status, 'not_yet') as status
    FROM video v
    LEFT JOIN student_video_progress svp ON v.id = svp.video_id 
        AND svp.student_id = ?
    WHERE v.course_id = ?
    ORDER BY v.sequence_number";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $course_id);
    $stmt->execute();
    $videos_result = $stmt->get_result();
    
    $video_steps = [];
    $videos_watched = 0;
    
    while ($video = $videos_result->fetch_assoc()) {
        $status = $video['status']; // 'watched', 'not_yet', or 'locked'
        
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
    $sql = "SELECT id FROM student_video_progress 
            WHERE student_id = ? AND video_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $student_id, $video_id);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    $now = date('Y-m-d H:i:s');
    
    if ($existing) {
        // Update existing record
        $sql = "UPDATE student_video_progress
                SET status = ?,
                    watched_at = CASE WHEN ? = 'watched' THEN ? ELSE watched_at END,
                    last_updated = ?
                WHERE student_id = ? AND video_id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('sssiii', $status, $status, $now, $now, $student_id, $video_id);
        $stmt->execute();
        $stmt->close();
    } else {
        // Create new record
        $watched_at = ($status === 'watched') ? $now : null;
        
        $sql = "INSERT INTO student_video_progress 
                (student_id, video_id, course_id, status, watched_at, last_updated)
                VALUES (?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iisiss', $student_id, $video_id, $course_id, $status, $watched_at, $now);
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
        c.id as course_id,
        c.title as course_title,
        e.progress_percentage,
        e.videos_watched,
        COUNT(DISTINCT v.id) as total_videos
    FROM enrollment e
    JOIN course c ON e.course_id = c.id
    LEFT JOIN video v ON c.id = v.course_id
    WHERE e.student_id = ? AND e.is_active = 1
    GROUP BY c.id, c.title, e.progress_percentage, e.videos_watched";
    
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

// Route actions
if ($method === 'GET') {
    switch ($action) {
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
