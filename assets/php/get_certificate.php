<?php

error_reporting(E_ALL);
ini_set('display_errors', 0); // Turn off display, only log errors

session_start();
require_once '../../config/db.php';

// Clear any output buffer BEFORE setting headers
if (ob_get_level()) ob_end_clean();

header('Content-Type: application/json');

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Not logged in']);
        exit();
    }

    $user_id = $_SESSION['user_id'];

    // First, check if user is a teacher
    $check_sql = "SELECT is_teacher FROM USER WHERE user_id = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    
    if (!$check_stmt) {
        throw new Exception('Database error: ' . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($check_stmt, "i", $user_id);
    mysqli_stmt_execute($check_stmt);
    mysqli_stmt_bind_result($check_stmt, $is_teacher);
    mysqli_stmt_fetch($check_stmt);
    mysqli_stmt_close($check_stmt);

    // If not a teacher, return empty array
    if ($is_teacher != 1) {
        echo json_encode(['certificates' => []]);
        mysqli_close($conn);
        exit();
    }

    // Get certificates for the teacher
    $sql = "SELECT certificate_id, certificate_name, certificate_url FROM CERTIFICATE WHERE teacher_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    
    if (!$stmt) {
        throw new Exception('Database error: ' . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $certificates = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Determine file type based on extension
        $extension = strtolower(pathinfo($row['certificate_url'], PATHINFO_EXTENSION));
        
        $file_type = 'application/octet-stream'; // default
        if ($extension === 'pdf') {
            $file_type = 'application/pdf';
        } elseif (in_array($extension, ['jpg', 'jpeg'])) {
            $file_type = 'image/jpeg';
        } elseif ($extension === 'png') {
            $file_type = 'image/png';
        } elseif ($extension === 'gif') {
            $file_type = 'image/gif';
        } elseif ($extension === 'webp') {
            $file_type = 'image/webp';
        }
        
        $certificates[] = [
            'certificate_id' => (int)$row['certificate_id'],
            'file_name' => $row['certificate_name'],
            'file_url' => $row['certificate_url'],
            'file_type' => $file_type
        ];
    }
    
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
    
    echo json_encode(['certificates' => $certificates]);
    exit();
    
} catch (Exception $e) {
    if (isset($conn)) {
        mysqli_close($conn);
    }
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit();
}
?>
