<?php
session_start();
require_once '../config.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Check if user is a teacher
$check_teacher_sql = "SELECT is_teacher FROM USER WHERE user_id = ?";
$check_stmt = $conn->prepare($check_teacher_sql);
$check_stmt->bind_param("i", $user_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$user_data = $check_result->fetch_assoc();
if (!$user_data['is_teacher']) {
    echo json_encode(['success' => false, 'message' => 'User is not a teacher']);
    exit;
}

// Get courses for this teacher
$sql = "SELECT 
            course_id, 
            course_title, 
            course_description,
            category,
            price,
            duration,
            rating,
            enrolled_count
        FROM COURSE 
        WHERE teacher_id = ? 
        ORDER BY course_id DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$courses = [];
while ($row = $result->fetch_assoc()) {
    $course_id = $row['course_id'];
    
    // Get videos for this course
    $video_sql = "SELECT video_id, video_title, video_url 
                  FROM VIDEO 
                  WHERE course_id = ? 
                  ORDER BY video_id";
    $video_stmt = $conn->prepare($video_sql);
    $video_stmt->bind_param("i", $course_id);
    $video_stmt->execute();
    $video_result = $video_stmt->get_result();
    
    $videos = [];
    while ($video_row = $video_result->fetch_assoc()) {
        $videos[] = [
            'id' => $video_row['video_id'],
            'courseId' => $course_id,
            'title' => $video_row['video_title'],
            'videoUrl' => $video_row['video_url'],
            'thumbnail' => '../assets/images/webdev.jpg' // Default or from database
        ];
    }
    $video_stmt->close();
    
    // Get assignments for this course
    $assignment_sql = "SELECT assignment_id, assignment_title, assignment_url 
                       FROM ASSIGNMENT 
                       WHERE course_id = ?";
    $assignment_stmt = $conn->prepare($assignment_sql);
    $assignment_stmt->bind_param("i", $course_id);
    $assignment_stmt->execute();
    $assignment_result = $assignment_stmt->get_result();
    
    $assignments = [];
    while ($assignment_row = $assignment_result->fetch_assoc()) {
        $assignments[] = [
            'id' => $assignment_row['assignment_id'],
            'courseId' => $course_id,
            'title' => $assignment_row['assignment_title'],
            'fileUrl' => $assignment_row['assignment_url'],
            'fileName' => basename($assignment_row['assignment_url'])
        ];
    }
    $assignment_stmt->close();
    
    $courses[] = [
        'id' => $course_id,
        'title' => $row['course_title'],
        'description' => $row['course_description'],
        'category' => $row['category'],
        'price' => $row['price'],
        'duration' => $row['duration'],
        'rating' => $row['rating'],
        'enrolled_count' => $row['enrolled_count'],
        'videos' => $videos,
        'assignments' => $assignments
    ];
}

echo json_encode(['success' => true, 'courses' => $courses]);

$stmt->close();
$conn->close();
?>