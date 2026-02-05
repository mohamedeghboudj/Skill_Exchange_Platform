<?php
// api/teacher_chat.php
ob_start();
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

ob_clean();

require_once '../config/db.php';

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Not authenticated'
        ]);
        exit;
    }

    $teacher_id = $_SESSION['user_id'];

    // Query to get all students enrolled in teacher's courses
    $query = "
        SELECT 
            c.course_id,
            c.course_title,
            s.user_id as student_id,
            s.full_name as student_name,
            s.profile_picture as student_picture
        FROM COURSE c
        INNER JOIN ENROLLMENT e ON c.course_id = e.course_id
        INNER JOIN USER s ON e.student_id = s.user_id
        WHERE c.teacher_id = ? AND e.is_active = 1
        ORDER BY c.course_title, s.full_name
    ";

    $stmt = mysqli_prepare($conn, $query);
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . mysqli_error($conn));
    }

    mysqli_stmt_bind_param($stmt, "i", $teacher_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $chats = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $chats[] = $row;
    }

    echo json_encode([
        'success' => true,
        'chats' => $chats,
        'count' => count($chats)
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching chats',
        'error' => $e->getMessage()
    ]);
}

ob_end_flush();
?>