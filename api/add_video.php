<?php
// api/add_video.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

if (empty($_POST['course_id']) || !is_numeric($_POST['course_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing or invalid course_id']);
    exit;
}

if (!isset($_FILES['video']) || $_FILES['video']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No valid video file uploaded']);
    exit;
}

require_once '../assets/php/db.php';

$course_id  = (int)$_POST['course_id'];
$teacher_id = $_SESSION['user_id'];

// Verify course belongs to this teacher
$check = $conn->prepare("SELECT teacher_id FROM COURSE WHERE course_id = ?");
$check->bind_param("i", $course_id);
$check->execute();
$check->bind_result($owner_id);

if (!$check->fetch() || $owner_id !== $teacher_id) {
    $check->close();
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Not your course']);
    exit;
}
$check->close();

// Validate file type
$allowed_types = ['video/mp4', 'video/webm', 'video/mov'];
$file_type     = mime_content_type($_FILES['video']['tmp_name']);

if (!in_array($file_type, $allowed_types)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid video format. Allowed: mp4, webm, mov']);
    exit;
}

// Save file
$upload_dir = '../uploads/videos/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$original_name = basename($_FILES['video']['name']);
$safe_name     = preg_replace('/[^a-zA-Z0-9._-]/', '_', $original_name);
$file_name     = uniqid() . '_' . $safe_name;
$file_path     = $upload_dir . $file_name;

if (!move_uploaded_file($_FILES['video']['tmp_name'], $file_path)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save video file']);
    exit;
}

// Insert into DB
$video_title = pathinfo($original_name, PATHINFO_FILENAME);
$video_url   = 'uploads/videos/' . $file_name;

$stmt = $conn->prepare("INSERT INTO VIDEO (course_id, video_title, video_url) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $course_id, $video_title, $video_url);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to insert video: ' . $stmt->error]);
    exit;
}

$video_id = $conn->insert_id;
$stmt->close();

echo json_encode([
    'success' => true,
    'video'   => [
        'video_id'    => $video_id,
        'video_title' => $video_title,
        'video_url'   => $video_url
    ]
]);
?>