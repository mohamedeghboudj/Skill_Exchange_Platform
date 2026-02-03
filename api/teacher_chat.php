<?php


// THIS IS NOT WORKING YET 



// Start output buffering and session
ob_start();
session_start();

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

// Clear output buffer
ob_clean();

// Include your current connection file
require_once '../config/db.php'; 

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Not authenticated'
        ]);
        exit;
    }

    $teacher_id = $_SESSION['user_id'];

    // Prepare the SQL query
    $query = "
        SELECT 
            c.course_title,
            c.course_id,
            u.full_name AS student_name,
            u.profile_picture AS student_picture,
            u.user_id AS student_id,
            e.enrollment_id
        FROM ENROLLMENT e
        JOIN COURSE c ON e.course_id = c.course_id
        JOIN USER u ON e.student_id = u.user_id
        WHERE c.teacher_id = ? AND e.is_active = 1
        ORDER BY c.course_title, u.full_name
    ";

    $stmt = mysqli_prepare($conn, $query);
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . mysqli_error($conn));
    }

    mysqli_stmt_bind_param($stmt, "i", $teacher_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $chats = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Fix the profile picture path
        $profilePic = $row['student_picture'];
        
        // If profile picture exists and doesn't already start with /assets or http
        if ($profilePic && strpos($profilePic, '/') !== 0 && strpos($profilePic, 'http') !== 0) {
            // Construct the full path - adjust this based on where your images are stored
            $profilePic = '/assets/images/' . $profilePic;
        } elseif (empty($profilePic)) {
            // Use default image if no profile picture
            $profilePic = '/assets/images/profilePic.png';
        }
        
        $row['student_picture'] = $profilePic;
        $chats[] = $row;
    }

    mysqli_stmt_close($stmt);

    echo json_encode([
        'success' => true,
        'chats' => $chats,
        'count' => count($chats)
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching chats',
        'error' => $e->getMessage()
    ]);
}

// Close output buffer
ob_end_flush();
?>

