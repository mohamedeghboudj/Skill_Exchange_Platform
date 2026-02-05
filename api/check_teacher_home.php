<?php
// assets/php/check_teacher_home.php
// API to check if user can access teach mode from home page

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

require_once '../config/db.php';

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Not authenticated',
            'redirect' => '/auth.html'
        ]);
        exit;
    }

    $user_id = $_SESSION['user_id'];

    // First, check if user is already a teacher in USER table
    $check_user = "SELECT is_teacher FROM USER WHERE user_id = ?";
    $stmt = mysqli_prepare($conn, $check_user);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $user = mysqli_fetch_assoc($result);

    // If user is already a teacher, redirect to teach page
    if ($user && $user['is_teacher'] == 1) {
        echo json_encode([
            'status' => 'already_teacher',
            'message' => 'User is already a teacher',
            'redirect' => '/html/teach.html'
        ]);
        exit;
    }

    // Check if there's a teacher request
    $check_request = "SELECT teacher_status FROM TEACHER_REQUEST 
                      WHERE user_id = ? 
                      ORDER BY teacher_request_id DESC 
                      LIMIT 1";
    
    $stmt2 = mysqli_prepare($conn, $check_request);
    mysqli_stmt_bind_param($stmt2, "i", $user_id);
    mysqli_stmt_execute($stmt2);
    $result2 = mysqli_stmt_get_result($stmt2);
    $request = mysqli_fetch_assoc($result2);

    if (!$request) {
        // No request exists - redirect to teacher request form
        echo json_encode([
            'status' => 'no_request',
            'message' => 'No teacher request found',
            'redirect' => '/pages/teacherrequest.html'
        ]);
        exit;
    }

    // Handle based on request status
    switch ($request['teacher_status']) {
        case 'pending':
            // Request is pending - show message and redirect to request page
            echo json_encode([
                'status' => 'pending',
                'message' => 'Your teacher request is under review',
                'redirect' => '/pages/teacherrequest.html'
            ]);
            break;
        
        case 'approved':
            // Request approved - update user table and redirect to teach page
            $update_user = "UPDATE USER SET is_teacher = 1 WHERE user_id = ?";
            $stmt3 = mysqli_prepare($conn, $update_user);
            mysqli_stmt_bind_param($stmt3, "i", $user_id);
            mysqli_stmt_execute($stmt3);
            
            echo json_encode([
                'status' => 'approved',
                'message' => 'Your teacher request was approved',
                'redirect' => '/html/teach.html'
            ]);
            break;
        
        case 'rejected':
            // Request rejected - allow new submission
            echo json_encode([
                'status' => 'rejected',
                'message' => 'Your previous request was rejected. You can submit a new one.',
                'redirect' => '/pages/teacherrequest.html'
            ]);
            break;
        
        default:
            echo json_encode([
                'status' => 'error',
                'message' => 'Unknown request status',
                'redirect' => '/pages/teacherrequest.html'
            ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage(),
        'redirect' => '/pages/teacherrequest.html'
    ]);
}

mysqli_close($conn);
?>