<?php
/**
 * File: /api/get_student_requests.php
 * Purpose: Fetch all enrollment requests for the logged-in student
 * Returns requests grouped by course with student and course details
 * 
 * ADDED BY: Backend Implementation for Dynamic Student Requests Display
 */

require_once '../config/db.php';

// Start session to get student ID
session_start();

// Check if user is authenticated
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false, 
        'error' => 'Not authenticated',
        'redirect' => true
    ]);
    exit;
}

$student_id = $_SESSION['user_id'];

try {
    // Get database connection using procedural approach
    $db = new Database();
    $conn = $db->getConnection();
    
    /**
     * Query to fetch all enrollment requests for the student
     * Including course details and teacher information
     * Ordered by: pending first, then by request date (newest first)
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
            c.teacher_id,
            u.full_name as teacher_name,
            u.email as teacher_email,
            u.profile_picture as teacher_picture
        FROM ENROLLMENT_REQUEST er
        JOIN COURSE c ON er.course_id = c.course_id
        JOIN USER u ON c.teacher_id = u.user_id
        WHERE er.student_id = :student_id
        ORDER BY 
            CASE er.status 
                WHEN 'pending' THEN 1 
                WHEN 'accepted' THEN 2
                WHEN 'rejected' THEN 3
                WHEN 'declined' THEN 4
                WHEN 'completed' THEN 5
                ELSE 6
            END,
            er.request_date DESC
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([':student_id' => $student_id]);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    /**
     * Format the data for frontend consumption
     * Group requests by course and add formatted dates
     */
    $grouped_requests = [];
    
    foreach ($requests as $request) {
        $course_title = $request['course_title'];
        
        // Format dates for display
        $request_date = new DateTime($request['request_date']);
        $request['formatted_date'] = $request_date->format('M d, Y');
        $request['formatted_time'] = $request_date->format('h:i A');
        $request['formatted_full'] = $request_date->format('F d, Y \a\t h:i A');
        
        // Format teacher decision date if exists
        if ($request['teacher_decision_date']) {
            $decision_date = new DateTime($request['teacher_decision_date']);
            $request['formatted_decision_date'] = $decision_date->format('M d, Y');
            $request['formatted_decision_time'] = $decision_date->format('h:i A');
        } else {
            $request['formatted_decision_date'] = null;
            $request['formatted_decision_time'] = null;
        }
        
        // Add status badge info for frontend
        $request['status_badge'] = [
            'pending' => 'Pending',
            'accepted' => 'Accepted',
            'rejected' => 'Rejected',
            'declined' => 'Declined',
            'completed' => 'Enrolled'
        ][$request['status']] ?? 'Unknown';
        
        $request['status_color'] = [
            'pending' => 'orange',
            'accepted' => 'green',
            'rejected' => 'red',
            'declined' => 'red',
            'completed' => 'blue'
        ][$request['status']] ?? 'gray';
        
        // Group by course title
        if (!isset($grouped_requests[$course_title])) {
            $grouped_requests[$course_title] = [
                'course_title' => $course_title,
                'course_id' => $request['course_id'],
                'category' => $request['category'],
                'price' => $request['price'],
                'teacher_name' => $request['teacher_name'],
                'teacher_picture' => $request['teacher_picture'],
                'requests' => []
            ];
        }
        
        $grouped_requests[$course_title]['requests'][] = $request;
    }
    
    // Convert associative array to indexed array for JSON
    $result = array_values($grouped_requests);
    
    echo json_encode([
        'success' => true,
        'data' => $result,
        'total_requests' => count($requests),
        'pending_count' => count(array_filter($requests, function($r) { 
            return $r['status'] === 'pending'; 
        })),
        'accepted_count' => count(array_filter($requests, function($r) { 
            return $r['status'] === 'accepted'; 
        }))
    ]);
    
} catch (PDOException $e) {
    // Handle database errors
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    // Handle other errors
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
// hadil 
?> 
