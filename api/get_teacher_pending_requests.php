<?php
header('Content-Type: application/json');
session_start();

// Authentication check
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Not authenticated',
        'redirect' => '/auth.html'
    ]);
    exit;
}

$teacher_id = $_SESSION['user_id'];

// Use shared DB connection
require_once __DIR__ . '/../config/db.php';

try {
    // Verify teacher
    $verifyTeacher = "SELECT is_teacher FROM USER WHERE user_id = ?";
    $stmt = mysqli_prepare($conn, $verifyTeacher);
    mysqli_stmt_bind_param($stmt, "i", $teacher_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $user_data = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);

    if (!$user_data || $user_data['is_teacher'] != 1) {
        echo json_encode([
            'success' => false,
            'error' => 'Not a teacher',
            'is_teacher' => false
        ]);
        mysqli_close($conn);
        exit;
    }

    // Fetch enrollment requests
    $query = "SELECT 
                er.request_id,
                er.student_id,
                er.course_id,
                er.status as request_status,
                er.request_date,
                er.student_message,
                er.teacher_decision_date,
                c.course_title,
                c.price,
                c.category,
                c.duration,
                u.full_name as student_name,
                u.email as student_email,
                u.profile_picture as student_picture,
                u.bio as student_bio,
                u.skill as student_skill,
                (SELECT COUNT(*) FROM ENROLLMENT_REQUEST er2 
                 WHERE er2.course_id = c.course_id 
                 AND er2.status = 'pending') as pending_count,
                (SELECT COUNT(*) FROM ENROLLMENT e 
                 WHERE e.course_id = c.course_id 
                 AND e.is_active = 1) as enrolled_count
              FROM ENROLLMENT_REQUEST er
              INNER JOIN COURSE c ON er.course_id = c.course_id
              INNER JOIN USER u ON er.student_id = u.user_id
              WHERE c.teacher_id = ?
              AND er.status IN ('pending','approved','rejected')
              ORDER BY 
                CASE er.status 
                    WHEN 'pending' THEN 1 
                    WHEN 'approved' THEN 2 
                    ELSE 3 
                END,
                er.request_date DESC";

    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "i", $teacher_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $requests = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $requests[] = $row;
    }
    mysqli_stmt_close($stmt);

    // Format data
    $formatted_requests = [];
    foreach ($requests as $request) {
        $date = new DateTime($request['request_date']);
        $now = new DateTime();
        $interval = $now->diff($date);

        if ($interval->y > 0) {
            $time_ago = $interval->y . ' year' . ($interval->y > 1 ? 's' : '') . ' ago';
        } elseif ($interval->m > 0) {
            $time_ago = $interval->m . ' month' . ($interval->m > 1 ? 's' : '') . ' ago';
        } elseif ($interval->d > 0) {
            $time_ago = $interval->d . ' day' . ($interval->d > 1 ? 's' : '') . ' ago';
        } elseif ($interval->h > 0) {
            $time_ago = $interval->h . 'h ago';
        } elseif ($interval->i > 0) {
            $time_ago = $interval->i . 'm ago';
        } else {
            $time_ago = 'Just now';
        }

        $formatted_requests[] = [
            'request_id' => (int)$request['request_id'],
            'student_id' => (int)$request['student_id'],
            'course_id' => (int)$request['course_id'],
            'course_title' => $request['course_title'],
            'course_category' => $request['category'],
            'course_price' => $request['price'],
            'course_duration' => $request['duration'],
            'student_name' => $request['student_name'],
            'student_email' => $request['student_email'],
            'student_picture' => $request['student_picture'] ?: '../assets/images/pf4.jpg',
            'student_bio' => $request['student_bio'],
            'student_skill' => $request['student_skill'],
            'student_message' => $request['student_message'],
            'request_status' => $request['request_status'],
            'request_date' => $request['request_date'],
            'formatted_date' => $date->format('M d, Y'),
            'formatted_time' => $date->format('h:i A'),
            'time_ago' => $time_ago,
            'pending_count' => (int)$request['pending_count'],
            'enrolled_count' => (int)$request['enrolled_count'],
            'teacher_decision_date' => $request['teacher_decision_date']
        ];
    }

    // Group by course
    $grouped_by_course = [];
    foreach ($formatted_requests as $request) {
        $course_id = $request['course_id'];
        if (!isset($grouped_by_course[$course_id])) {
            $grouped_by_course[$course_id] = [
                'course_id' => $course_id,
                'course_title' => $request['course_title'],
                'course_category' => $request['course_category'],
                'pending_count' => $request['pending_count'],
                'enrolled_count' => $request['enrolled_count'],
                'requests' => []
            ];
        }
        $grouped_by_course[$course_id]['requests'][] = $request;
    }

    echo json_encode([
        'success' => true,
        'data' => array_values($formatted_requests),
        'grouped' => array_values($grouped_by_course),
        'total_requests' => count($formatted_requests),
        'total_pending' => count(array_filter($formatted_requests, fn($r) => $r['request_status'] === 'pending'))
    ]);

    mysqli_close($conn);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
    mysqli_close($conn);
}
?>
