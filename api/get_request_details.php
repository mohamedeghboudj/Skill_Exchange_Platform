<?php
/**
 * File: /api/get_request_details.php
 * Purpose: Get detailed information for a specific enrollment request
 * Used when student clicks on a request to view details
 * 
 * ADDED BY: Backend Implementation for Dynamic Student Requests Display
 */




require_once '../config/db.php';

session_start();

// Check authentication
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Not authenticated',
        'redirect' => true
    ]);
    exit;
}

$student_id = $_SESSION['user_id'];
$request_id = isset($_GET['request_id']) ? intval($_GET['request_id']) : 0;

if ($request_id <= 0) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request ID'
    ]);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    

    /**
     * Fetch complete request details including:
     * - Request information
     * - Course details
     * - Teacher information
     * - Enrollment status if exists
     */



   
    
    $query = "
        SELECT 
            er.request_id,
            er.student_id,
            er.course_id,
            er.status,
            er.request_date,
            er.student_message,
            er.teacher_decision_date,
            er.teacher_message,
            c.course_title,
            c.course_description,
            c.category,
            c.price,
            c.duration,
            c.rating,
            c.enrolled_count,
            c.teacher_id,
            u.full_name as teacher_name,
            u.email as teacher_email,
            u.profile_picture as teacher_picture,
            u.bio as teacher_bio,
            u.skill as teacher_skill,
            e.enrollment_id,
            e.progress_percentage,
            e.videos_watched,
            e.is_active as is_enrolled
        FROM ENROLLMENT_REQUEST er
        JOIN COURSE c ON er.course_id = c.course_id
        JOIN USER u ON c.teacher_id = u.user_id
        LEFT JOIN ENROLLMENT e ON (e.student_id = er.student_id AND e.course_id = er.course_id)
        WHERE er.request_id = :request_id 
        AND er.student_id = :student_id
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([
        ':request_id' => $request_id,
        ':student_id' => $student_id
    ]);
    
    $request = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$request) {
        echo json_encode([
            'success' => false,
            'error' => 'Request not found or access denied'
        ]);
        exit;
    }
    
    // Format dates
    $request_date = new DateTime($request['request_date']);
    $request['formatted_request_date'] = $request_date->format('F d, Y');
    $request['formatted_request_time'] = $request_date->format('h:i A');
    $request['formatted_request_full'] = $request_date->format('F d, Y \a\t h:i A');
    
    if ($request['teacher_decision_date']) {
        $decision_date = new DateTime($request['teacher_decision_date']);
        $request['formatted_decision_date'] = $decision_date->format('F d, Y');
        $request['formatted_decision_time'] = $decision_date->format('h:i A');
        $request['formatted_decision_full'] = $decision_date->format('F d, Y \a\t h:i A');
    }
    
    // Add status information
    $request['status_display'] = ucfirst($request['status']);
    $request['can_pay'] = ($request['status'] === 'accepted' && !$request['is_enrolled']);
    $request['is_pending'] = ($request['status'] === 'pending');
    $request['is_rejected'] = in_array($request['status'], ['rejected', 'declined']);
    
    // Format price
    $request['formatted_price'] = number_format($request['price'], 2);
    
    // Format duration (assuming it's in minutes)
    if ($request['duration']) {
        $hours = floor($request['duration'] / 60);
        $minutes = $request['duration'] % 60;
        $request['formatted_duration'] = $hours > 0 
            ? "{$hours}h " . ($minutes > 0 ? "{$minutes}m" : "") 
            : "{$minutes}m";
    } else {
        $request['formatted_duration'] = 'N/A';
    }
    
    echo json_encode([
        'success' => true,
        'data' => $request
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>

