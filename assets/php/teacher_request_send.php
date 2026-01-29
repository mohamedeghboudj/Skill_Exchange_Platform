<?php
session_start();
header('Content-Type: application/json');// setting the response to json
require_once '../config/db.php';

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


if (!$primary_skill || !$bio || !$certificate) {
    echo json_encode([
        'status' => 'error',
        'message' => 'All fields are required'
    ]);
    exit;
}
// allowed types :
$allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
if (!in_array($certificate['type'], $allowedTypes)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid file type. Allowed: PDF, JPG, PNG'
    ]);
    exit;
} 
// Max file size 5MB
if ($certificate['size'] > 5 * 1024 * 1024) {
    echo json_encode([
        'status' => 'error',
        'message' => 'File too large (max 5MB).'
    ]);
    exit;
}

// uploading file to server :
$targetDir = "../../uploads/certificates/"; 
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}
$fileName = uniqid() . "_" . basename($certificate['name']); // give the a unique name to avoid overwriting 
// uniqid() generates a unique string based on time
$targetFile = $targetDir . $fileName;
//moving the uploaded file
if (!move_uploaded_file($certificate['tmp_name'], $targetFile)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'File upload failed.'
    ]);
    exit;
}
// path to store in db 
$filePath = "uploads/certificates/" . $fileName;

// inserting the request in the teacher request table db 

$stmt = $conn->prepare("
    INSERT INTO TEACHER_REQUEST (user_id, primary_skill, bio, teacher_status)
    VALUES (?, ?, ?, 'pending')
");
$stmt->bind_param("iss", $user_id, $primary_skill, $bio);

if (!$stmt->execute()) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Could not create teacher request.'
    ]);
    exit;
}
// Get the new teacher_request_id
$teacher_request_id = $conn->insert_id;
$stmt->close();

// storing the certificate in the certificate table :
    $stmt2 = $conn->prepare("
    INSERT INTO CERTIFICATE (teacher_id, certificate_name, certificate_url)
    VALUES (?, ?, ?)
");
$stmt2->bind_param("iss", $teacher_request_id, $certificate['name'], $filePath);

if (!$stmt2->execute()) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Certificate record failed.'
    ]);
    exit;
}

$stmt2->close();
$conn->close();
echo json_encode([
    'status' => 'success',
    'message' => 'Teacher request submitted successfully!',
    'teacher_request_id' => $teacher_request_id,
    'certificate_path' => $filePath
]);
?>