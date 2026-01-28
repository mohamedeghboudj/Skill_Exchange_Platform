<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: /auth.html");
    exit();
}

require_once 'db.php';

header('Content-Type: application/json');

// Get top 3 instructors by average rating of their courses using prepared statement
$sql = "SELECT 
    u.user_id,
    u.email,
    u.full_name,
    u.profile_picture,
    u.bio,
    u.skill,
    COUNT(DISTINCT c.course_id) as course_count,
    COUNT(DISTINCT e.student_id) as total_students,
    COALESCE(AVG(c.rating), 0) as avg_rating,
    COUNT(DISTINCT CASE WHEN c.rating > 0 THEN c.course_id END) as rated_courses
FROM USER u
LEFT JOIN COURSE c ON u.user_id = c.teacher_id
LEFT JOIN ENROLLMENT e ON c.course_id = e.course_id
WHERE u.is_teacher = 1 AND c.course_id IS NOT NULL
GROUP BY u.user_id, u.email, u.full_name, u.profile_picture, u.bio, u.skill
HAVING course_count > 0
ORDER BY avg_rating DESC, rated_courses DESC, course_count DESC
LIMIT 3";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    exit();
}

$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $instructors = [];
    while($row = $result->fetch_assoc()) {
        $instructors[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'count' => count($instructors),
        'data' => $instructors
    ]);
} else {
    echo json_encode([
        'success' => true,
        'count' => 0,
        'data' => [],
        'message' => 'No instructors found'
    ]);
}

$stmt->close();
$conn->close();
?>
