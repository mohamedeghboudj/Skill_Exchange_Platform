<?php
// api/add_assignment.php - FIXED VERSION
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

if (!isset($_FILES['assignment']) || $_FILES['assignment']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No valid assignment file uploaded']);
    exit;
}

require_once '../config/db.php';

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

// Save file
$upload_dir = '../uploads/assignments/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$original_name   = basename($_FILES['assignment']['name']);
$safe_name       = preg_replace('/[^a-zA-Z0-9._-]/', '_', $original_name);
$file_name       = uniqid() . '_' . $safe_name;
$file_path       = $upload_dir . $file_name;

if (!move_uploaded_file($_FILES['assignment']['tmp_name'], $file_path)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save assignment file']);
    exit;
}

// Insert into DB - FIXED LINE
$assignment_title = pathinfo($original_name, PATHINFO_FILENAME);
$assignment_url   = '/uploads/assignments/' . $file_name;  // CHANGED: Added leading slash

$stmt = $conn->prepare("
    INSERT INTO ASSIGNMENT (course_id, assignment_title, assignment_url, assignment_status)
    VALUES (?, ?, ?, 'pending')
");
$stmt->bind_param("iss", $course_id, $assignment_title, $assignment_url);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to insert assignment: ' . $stmt->error]);
    exit;
}

$assignment_id = $conn->insert_id;
$stmt->close();

echo json_encode([
    'success'    => true,
    'assignment' => [
        'assignment_id'    => $assignment_id,
        'assignment_title' => $assignment_title,
        'assignment_url'   => $assignment_url,
        'assignment_status'=> 'pending'
    ]
]);
?>