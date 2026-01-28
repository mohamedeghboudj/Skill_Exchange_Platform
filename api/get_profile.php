<?php
error_reporting(0);
ini_set('display_errors', 0);

session_start();
require_once '../config/db.php';

if (ob_get_level()) ob_end_clean();

if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json', true, 401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $sql = "SELECT user_id, full_name, email, skill, age, bio FROM USER WHERE user_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    
    if (!$stmt) {
        throw new Exception('Query preparation failed');
    }
    
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($result && mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        header('Content-Type: application/json');
        echo json_encode($user, JSON_UNESCAPED_UNICODE);
    } else {
        header('Content-Type: application/json', true, 404);
        echo json_encode(['error' => 'User not found']);
    }
    
    mysqli_stmt_close($stmt);
} catch (Exception $e) {
    header('Content-Type: application/json', true, 500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}

mysqli_close($conn);
exit;
?>