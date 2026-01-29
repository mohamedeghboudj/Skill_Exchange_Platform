<?php
session_start();
header('Content-Type: application/json');
require_once '../../config/db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'User not logged in'
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];

$primary_skill = $_POST['primary_skill'] ?? '';
$bio = $_POST['bio'] ?? '';
$certificate = $_FILES['certificate'] ?? null;

// Validate all fields
if (!$primary_skill || !$bio || !$certificate) {
    echo json_encode([
        'status' => 'error',
        'message' => 'All fields are required'
    ]);
    exit;
}

// Validate file type
$allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
if (!in_array($certificate['type'], $allowedTypes)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid file type. Allowed: PDF, JPG, PNG'
    ]);
    exit;
}

// Validate file size (5MB max)
if ($certificate['size'] > 5 * 1024 * 1024) {
    echo json_encode([
        'status' => 'error',
        'message' => 'File too large (max 5MB).'
    ]);
    exit;
}

// Check for upload errors
if ($certificate['error'] !== UPLOAD_ERR_OK) {
    echo json_encode([
        'status' => 'error',
        'message' => 'File upload error occurred.'
    ]);
    exit;
}

// Create upload directory if it doesn't exist
$targetDir = "../../uploads/certificates/";
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

// Generate unique filename
$fileName = uniqid() . "_" . basename($certificate['name']);
$targetFile = $targetDir . $fileName;

// Move uploaded file
if (!move_uploaded_file($certificate['tmp_name'], $targetFile)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'File upload failed.'
    ]);
    exit;
}

// Path to store in database (relative path)
$filePath = "/uploads/certificates/" . $fileName;

// Insert teacher request with certificate URL
$stmt = $conn->prepare("
    INSERT INTO TEACHER_REQUEST (user_id, primary_skill, bio, teacher_status, certificate_url)
    VALUES (?, ?, ?, 'pending', ?)
");
$stmt->bind_param("isss", $user_id, $primary_skill, $bio, $filePath);

if (!$stmt->execute()) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Could not create teacher request: ' . $stmt->error
    ]);
    exit;
}

$teacher_request_id = $conn->insert_id;
$stmt->close();
$conn->close();

echo json_encode([
    'status' => 'success',
    'message' => 'Teacher request submitted successfully!',
    'teacher_request_id' => $teacher_request_id,
    'certificate_path' => $filePath
]);
?>