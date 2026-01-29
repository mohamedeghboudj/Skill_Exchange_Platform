<?php
session_start();
require_once '../config.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];
$course_id = isset($_POST['course_id']) ? intval($_POST['course_id']) : 0;
$title = isset($_POST['title']) ? trim($_POST['title']) : '';

if ($course_id <= 0 || empty($title)) {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

// Verify course belongs to teacher
$check_sql = "SELECT teacher_id FROM COURSE WHERE course_id = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("i", $course_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows === 0 || $check_result->fetch_assoc()['teacher_id'] != $user_id) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}
$check_stmt->close();

// Handle file upload
$video_url = '';
if (isset($_FILES['video_file']) && $_FILES['video_file']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = '../uploads/videos/' . $course_id . '/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    $file_name = uniqid() . '_' . basename($_FILES['video_file']['name']);
    $target_path = $upload_dir . $file_name;
    
    if (move_uploaded_file($_FILES['video_file']['tmp_name'], $target_path)) {
        $video_url = '/uploads/videos/' . $course_id . '/' . $file_name;
    }
}

// Insert video
$sql = "INSERT INTO VIDEO (course_id, video_title, video_url) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iss", $course_id, $title, $video_url);

if ($stmt->execute()) {
    $video_id = $stmt->insert_id;
    echo json_encode([
        'success' => true,
        'video' => [
            'id' => $video_id,
            'courseId' => $course_id,
            'title' => $title,
            'videoUrl' => $video_url,
            'thumbnail' => '../assets/images/webdev.jpg'
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}

$stmt->close();
$conn->close();
?>