<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
require_once '../config/db.php';

header('Content-Type: application/json');

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not logged in', 401);
    }

    // Only POST requests allowed
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }

    $user_id = $_SESSION['user_id'];

    // Check if file was uploaded
    if (!isset($_FILES['profile_picture']) || $_FILES['profile_picture']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('No file uploaded or upload error');
    }

    $file = $_FILES['profile_picture'];

    // Validate file size (max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        throw new Exception('File too large. Maximum size is 5MB');
    }

    // Validate MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    // Map MIME types to safe extensions
    $allowed_types = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp'
    ];

    if (!array_key_exists($mime_type, $allowed_types)) {
        throw new Exception('Invalid file type. Only JPG, PNG, GIF, and WEBP allowed');
    }

    $extension = $allowed_types[$mime_type];

    // Create upload directory if it doesn't exist
    $upload_dir = '../uploads/profile_pictures/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    // Generate unique filename
    $filename = 'profile_' . $user_id . '_' . time() . '.' . $extension;
    $filepath = $upload_dir . $filename;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('Failed to save uploaded file');
    }

    // Delete old profile picture if exists
    $sql_old = "SELECT profile_picture FROM USER WHERE user_id = ?";
    $stmt_old = mysqli_prepare($conn, $sql_old);
    mysqli_stmt_bind_param($stmt_old, "i", $user_id);
    mysqli_stmt_execute($stmt_old);
    mysqli_stmt_bind_result($stmt_old, $old_picture);
    mysqli_stmt_fetch($stmt_old);
    mysqli_stmt_close($stmt_old);

    if ($old_picture && file_exists('../' . $old_picture)) {
        @unlink('../' . $old_picture);
    }

    // Update database with new profile picture
    $relative_path = 'uploads/profile_pictures/' . $filename;
    $sql = "UPDATE USER SET profile_picture = ? WHERE user_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "si", $relative_path, $user_id);

    if (!mysqli_stmt_execute($stmt)) {
        @unlink($filepath); // rollback file if DB fails
        throw new Exception('Failed to update database');
    }

    mysqli_stmt_close($stmt);
    mysqli_close($conn);

    // Optional: build full URL (if your frontend needs it)
    $base_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") 
                . "://" . $_SERVER['HTTP_HOST'] . "/";
    $full_url = $base_url . $relative_path;

    echo json_encode([
        'success' => true,
        'message' => 'Profile picture uploaded successfully',
        'profile_picture' => $relative_path,
        'full_url' => $full_url
    ]);

} catch (Exception $e) {
    $code = $e->getCode() ?: 400;
    http_response_code($code);
    mysqli_close($conn);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
exit;
?>
