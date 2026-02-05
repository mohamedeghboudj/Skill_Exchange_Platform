<?php
// /api/get_enrolled_courses.php
header('Content-Type: application/json');
session_start();

require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$student_id = $_SESSION['user_id'];

$sql = "
    SELECT 
        c.course_id,
        c.course_title,
        c.course_description,
        c.category,
        c.price,
        c.duration,
        c.rating,
        c.enrolled_count,
        e.enrollment_id,
        e.progress_percentage,
        e.videos_watched,
        e.assignments_completed,
        e.is_active,
        u.full_name AS teacher_name,
        u.profile_picture AS teacher_picture
    FROM ENROLLMENT e
    JOIN COURSE c ON e.course_id = c.course_id
    JOIN USER u ON c.teacher_id = u.user_id
    WHERE e.student_id = ?
      AND e.is_active = 1
    ORDER BY e.enrollment_id DESC
";

$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Query preparation failed']);
    exit;
}

mysqli_stmt_bind_param($stmt, "i", $student_id);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);
$courses = [];

while ($row = mysqli_fetch_assoc($result)) {
    $courses[] = $row;
}

mysqli_stmt_close($stmt);
mysqli_close($conn);

echo json_encode(['success' => true, 'data' => $courses]);
