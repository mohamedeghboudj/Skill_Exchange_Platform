<?php
session_start();
require_once '../config/db.php';

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

try {
    // Check if user is logged in
    $user_id = $_SESSION['user_id'] ?? null;
    if (!$user_id) {
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit;
    }

    // Get certificate_id from query parameter
    $certificate_id = intval($_GET['certificate_id'] ?? 0);
    
    if (!$certificate_id) {
        echo json_encode(['success' => false, 'error' => 'Invalid certificate ID']);
        exit;
    }

    // Query the database
    $sql = "SELECT certificate_id, file_name, file_url, file_type 
            FROM CERTIFICATE 
            WHERE certificate_id = ? AND teacher_id = ?";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $certificate_id, $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        echo json_encode([
            'success' => true,
            'certificate' => $row
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'error' => 'Certificate not found'
        ]);
    }
    
    mysqli_stmt_close($stmt);

} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'error' => 'Server error'
    ]);
}

mysqli_close($conn);
exit;
?>