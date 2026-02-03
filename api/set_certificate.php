<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
require_once '../config/db.php';

header('Content-Type: application/json');

if (ob_get_level()) ob_end_clean();

try {
    
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not logged in', 401);
    }

    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }

    $user_id = $_SESSION['user_id'];

    // Check if user is a teacher
    $check_sql = "SELECT is_teacher FROM USER WHERE user_id = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    mysqli_stmt_bind_param($check_stmt, "i", $user_id);
    mysqli_stmt_execute($check_stmt);
    mysqli_stmt_bind_result($check_stmt, $is_teacher);
    mysqli_stmt_fetch($check_stmt);
    mysqli_stmt_close($check_stmt);

    if ($is_teacher != 1) {
        throw new Exception('Only teachers can upload certificates', 403);
    }

    // Check if files were uploaded
    if (!isset($_FILES['certificates']) || empty($_FILES['certificates']['name'][0])) {
        throw new Exception('No files uploaded');
    }

    // Create upload directory if it doesn't exist
    $upload_dir = '../uploads/certificates/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    $uploaded_certificates = [];
    $files = $_FILES['certificates'];
    $file_count = count($files['name']);

    // Allowed file types
    $allowed_types = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        'application/pdf' => 'pdf'
    ];

    for ($i = 0; $i < $file_count; $i++) {
        // Check for upload errors
        if ($files['error'][$i] !== UPLOAD_ERR_OK) {
            continue; // Skip this file
        }

        // Validate file size (max 10MB per file)
        if ($files['size'][$i] > 10 * 1024 * 1024) {
            throw new Exception('File too large: ' . $files['name'][$i] . '. Maximum size is 10MB');
        }

        // Validate MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $files['tmp_name'][$i]);
        finfo_close($finfo);

        if (!array_key_exists($mime_type, $allowed_types)) {
            throw new Exception('Invalid file type for: ' . $files['name'][$i] . '. Only JPG, PNG, GIF, WEBP, and PDF allowed');
        }

        $extension = $allowed_types[$mime_type];

        // Generate unique filename
        $original_name = pathinfo($files['name'][$i], PATHINFO_FILENAME);
        $safe_name = preg_replace('/[^a-zA-Z0-9_-]/', '_', $original_name); // sanitize filename
        $filename = 'cert_' . $user_id . '_' . time() . '_' . $i . '.' . $extension;
        $filepath = $upload_dir . $filename;

        // Move uploaded file
        if (!move_uploaded_file($files['tmp_name'][$i], $filepath)) {
            throw new Exception('Failed to save uploaded file: ' . $files['name'][$i]);
        }

        // Save to database
        $relative_path = 'uploads/certificates/' . $filename;
        $certificate_name = $files['name'][$i]; // Keep original filename for display
        
        $sql = "INSERT INTO CERTIFICATE (teacher_id, certificate_name, certificate_url) VALUES (?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "iss", $user_id, $certificate_name, $relative_path);

        if (!mysqli_stmt_execute($stmt)) {
            // Rollback: delete the uploaded file if DB insert fails
            @unlink($filepath);
            throw new Exception('Failed to save certificate to database: ' . $certificate_name);
        }

        $certificate_id = mysqli_insert_id($conn);
        mysqli_stmt_close($stmt);

        // Add to response array
        $uploaded_certificates[] = [
            'certificate_id' => $certificate_id,
            'file_name' => $certificate_name,
            'file_url' => $relative_path,
            'file_type' => $mime_type
        ];
    }

    if (empty($uploaded_certificates)) {
        throw new Exception('No valid certificates were uploaded');
    }

    echo json_encode([
        'success' => true,
        'message' => count($uploaded_certificates) . ' certificate(s) uploaded successfully',
        'certificates' => $uploaded_certificates
    ]);

} catch (Exception $e) {
    $code = $e->getCode() ?: 400;
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

mysqli_close($conn);
exit;
?>