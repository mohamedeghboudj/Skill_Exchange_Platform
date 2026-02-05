<?php
/**
 * Test script for teacher progress - bypasses session to verify API response
 * Run: php test_teacher_progress.php  OR  http://localhost:8000/assets/php/test_teacher_progress.php
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'db.php';

header('Content-Type: application/json');

// Get test course and student from setup_test_data
$course_title = 'Full-Stack Web Development';
$teacher_email = 'teacher_v2@test.com';
$student_email = 'student_v2@test.com';

$course_id = null;
$student_id = null;
$teacher_id = null;

// Get course
$stmt = $conn->prepare("SELECT course_id, teacher_id FROM COURSE WHERE course_title = ?");
$stmt->bind_param("s", $course_title);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();
if ($row) {
    $course_id = $row['course_id'];
    $teacher_id = $row['teacher_id'];
}
// Get student
$stmt = $conn->prepare("SELECT user_id FROM USER WHERE email = ?");
$stmt->bind_param("s", $student_email);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();
if ($row) $student_id = $row['user_id'];

if (!$course_id || !$student_id || !$teacher_id) {
    echo json_encode([
        'error' => 'Test data not found. Run setup_test_data.php first.',
        'course_id' => $course_id,
        'student_id' => $student_id,
        'teacher_id' => $teacher_id
    ], JSON_PRETTY_PRINT);
    exit;
}

// Simulate getStudentAssignmentProgress
$teacher_id_var = $teacher_id;

$sql = "SELECT course_id, course_title FROM COURSE WHERE course_id = ? AND teacher_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ii', $course_id, $teacher_id_var);
$stmt->execute();
$course = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$course) {
    echo json_encode(['error' => 'Course not found']);
    exit;
}

$sql = "SELECT u.user_id as id, u.full_name as username, u.email, e.progress_percentage
        FROM USER u
        LEFT JOIN ENROLLMENT e ON e.student_id = u.user_id AND e.course_id = ?
        WHERE u.user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ii', $course_id, $student_id);
$stmt->execute();
$student = $stmt->get_result()->fetch_assoc();
$stmt->close();

$student['progress_percentage'] = $student['progress_percentage'] ?? 0;

// Videos
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
    $videos[] = ['video_id' => (int)$v['video_id'], 'video_title' => $v['video_title'], 'watched' => (int)$v['watched'] === 1];
}
$stmt->close();
$watched_videos = count(array_filter($videos, fn($x) => $x['watched']));

// Assignments (pick latest submission per assignment to avoid duplicates)
$sql = "SELECT a.assignment_id, a.assignment_title, a.max_score,
        s.submission_id, s.submission_url, s.score,
        CASE WHEN s.submission_id IS NULL THEN 'not_submitted'
             WHEN s.submission_status = 'submitted' THEN 'submitted'
             WHEN s.submission_status = 'marked' THEN 'graded' ELSE 'submitted' END as status
        FROM ASSIGNMENT a
        LEFT JOIN (
            SELECT s1.* FROM ASSIGNMENT_SUBMISSION s1
            INNER JOIN (
                SELECT assignment_id, student_id, MAX(submission_id) as max_id
                FROM ASSIGNMENT_SUBMISSION WHERE student_id = ? GROUP BY assignment_id, student_id
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
$graded_count = 0;
$missed_count = 0;
$total_score = 0;

while ($a = $result->fetch_assoc()) {
    if ($a['score'] !== null && $a['status'] === 'graded') {
        $total_score += (float)$a['score'];
        $graded_count++;
    } elseif ($a['status'] === 'not_submitted') $missed_count++;
    $assignments[] = $a;
}
$stmt->close();

$average_mark = $graded_count > 0 ? round($total_score / $graded_count, 2) : 0;

$output = [
    'success' => true,
    'course_id' => (int)$course_id,
    'course_title' => $course['course_title'],
    'student' => [
        'student_id' => (int)$student_id,
        'student_name' => $student['username'],
        'progress_percentage' => (float)$student['progress_percentage']
    ],
    'stats' => [
        'watched_videos' => $watched_videos,
        'total_videos' => count($videos),
        'done_count' => $graded_count,
        'missed_count' => $missed_count,
        'average_mark' => $average_mark
    ],
    'videos_count' => count($videos),
    'assignments_count' => count($assignments),
    'assignments' => $assignments
];

echo json_encode($output, JSON_PRETTY_PRINT);
$conn->close();
