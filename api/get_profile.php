<?php
session_start();
require_once '../config/api_helpers.php';
require_once '../config/db.php';

// Set CORS headers
setCorsHeaders();
setJsonHeader();

// Check authentication
$user_id = requireAuth();

try {
    $sql = "SELECT 
            user_id, 
            email, 
            full_name, 
            profile_picture, 
            age, 
            skill, 
            bio, 
            is_teacher, 
            date_registered,
            insta_link,
            whatsapp_link,
            linkedIn_link
        FROM USER
        WHERE user_id = ?";

    $stmt = mysqli_prepare($conn, $sql);

    if (!$stmt) {
        handleDbError($conn);
    }

    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if ($result && mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);
        mysqli_close($conn);
        sendSuccess($user, 'Profile retrieved successfully');
    } else {
        mysqli_stmt_close($stmt);
        mysqli_close($conn);
        sendError('User not found', 404);
    }

} catch (Exception $e) {
    logError($e->getMessage(), 'get_profile.php');
    if (isset($conn)) mysqli_close($conn);
    sendError('Server error', 500);
}
?>
