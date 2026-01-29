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
$certificate = $_FILES['certificate'] ?? null;// wait not yet 
// making sure the inputs are not empty 
if (!$primary_skill || !$bio || !$certificate) {
    echo json_encode([
        'status' => 'error',
        'message' => 'All fields are required'
    ]);
    exit;
}
// allowed types are : pdf , jpeg and png only 
$allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
if (!in_array($certificate['type'], $allowedTypes)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid file type. Allowed: PDF, JPG, PNG'
    ]);
    exit;
} 
// check it !! and continue from here
/*<?php
// Start the session to access user session variables
session_start();

// Set the response type to JSON (so the frontend can parse it easily)
header('Content-Type: application/json');

// Include your database connection
require_once '../config/db.php'; // <-- change path to your actual db.php

// Ensure the user is logged in before submitting a teacher request
if (!isset($_SESSION['user_id'])) {
    // User not logged in: return JSON error
    echo json_encode([
        'status' => 'error',
        'message' => 'User not logged in'
    ]);
    exit; // stop executing the rest of the code
}

// Get the logged-in user's ID from the session
$user_id = $_SESSION['user_id'];

// Retrieve POST data from the form
$primary_skill = $_POST['primary_skill'] ?? '';
$bio = $_POST['bio'] ?? '';
$certificate = $_FILES['certificate'] ?? null;

// Basic validation: ensure all fields are filled
if (!$primary_skill || !$bio || !$certificate) {
    echo json_encode([
        'status' => 'error',
        'message' => 'All fields are required'
    ]);
    exit;
}

// Optional: Validate file type (only PDF/JPG/PNG allowed)
$allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
if (!in_array($certificate['type'], $allowedTypes)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid file type. Allowed: PDF, JPG, PNG'
    ]);
    exit;
}

// Optional: Limit file size (5MB max)
if ($certificate['size'] > 5 * 1024 * 1024) {
    echo json_encode([
        'status' => 'error',
        'message' => 'File too large. Max size is 5MB'
    ]);
    exit;
}

// Prepare upload directory
$targetDir = "../uploads/certificates/"; // where files will be stored
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true); // create folder if it doesn't exist
}

// Generate a unique filename to prevent overwriting
$fileName = uniqid() . "_" . basename($certificate['name']);
$targetFile = $targetDir . $fileName;

// Move the uploaded file from temp folder to our uploads folder
if (move_uploaded_file($certificate['tmp_name'], $targetFile)) {
    // Store the relative path in DB
    $filePath = "uploads/certificates/" . $fileName;

    // Prepare the SQL statement to prevent SQL injection
    $stmt = $conn->prepare("
        INSERT INTO TEACHER_REQUEST (user_id, primary_skill, bio, certificate)
        VALUES (?, ?, ?, ?)
    ");

    // Bind parameters to the SQL statement
    // "isss" means: integer, string, string, string
    $stmt->bind_param("isss", $user_id, $primary_skill, $bio, $filePath);

    // Execute the query
    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Request submitted successfully!'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Database insert failed: ' . $stmt->error
        ]);
    }

    // Close the prepared statement
    $stmt->close();
} else {
    // File upload failed
    echo json_encode([
        'status' => 'error',
        'message' => 'File upload failed'
    ]);
}

// Close the DB connection
$conn->close();
?>*/
