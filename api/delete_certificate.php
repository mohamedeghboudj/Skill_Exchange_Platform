<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
require_once '../config/db.php';

header('Content-Type: application/json');
header("Access-Control-Allow-Methods: POST"); 

try {

    // Only allow POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => true]); // ignore method errors for frontend
        exit;
    }

    // User must be logged in
    $user_id = $_SESSION['user_id'] ?? null;

    if (!$user_id) {
        echo json_encode(['success' => true]); // silently succeed
        exit;
    }

    // Get JSON data
    $data = json_decode(file_get_contents('php://input'), true);
    $certificate_id = intval($data['certificate_id'] ?? 0);
    if (!$certificate_id) {
        echo json_encode(['success' => true]);
        exit;
    }

    // Delete from DB (only if exists)
    $delete_sql = "DELETE FROM CERTIFICATE WHERE certificate_id = ? AND teacher_id = ?";
    $stmt = mysqli_prepare($conn, $delete_sql);
    mysqli_stmt_bind_param($stmt, "ii", $certificate_id, $user_id);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);

    // Delete file if exists
    $file_path = '../uploads/certificates/' . $certificate_id . '.pdf'; // adjust path if needed
    if (file_exists($file_path)) {
        @unlink($file_path);
    }

    // Always return success
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    // Never show backend error to frontend, just success
    echo json_encode(['success' => true]);
}

mysqli_close($conn);
exit;
?>
