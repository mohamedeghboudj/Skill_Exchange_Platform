<?php
session_start();
require_once '../assets/php/db.php';

header('Content-Type: application/json');

// Get course ID from query parameter
$course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : 0;

if ($course_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid course ID']);
    exit;
}

// Get course details with teacher info
$sql = "SELECT 
            c.course_id,
            c.course_title,
            c.course_description,
            c.category,
            c.price,
            c.duration,
            c.rating,
            c.enrolled_count,
            u.user_id as teacher_id,
            u.full_name as teacher_name,
            u.profile_picture as teacher_avatar,
            u.bio as teacher_bio,
            u.insta_link,
            u.whatsapp_link,
            u.linkedIn_link
        FROM COURSE c
        JOIN USER u ON c.teacher_id = u.user_id
        WHERE c.course_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $course_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Course not found']);
    exit;
}

$course_data = $result->fetch_assoc();

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
        'title' => $video_row['video_title'],
        'url' => $video_row['video_url']
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
        'title' => $assignment_row['assignment_title'],
        'url' => $assignment_row['assignment_url']
    ];
}
$assignment_stmt->close();

// Prepare response
$response = [
    'success' => true,
    'course' => [
        'id' => $course_data['course_id'],
        'title' => $course_data['course_title'],
        'description' => $course_data['course_description'],
        'category' => $course_data['category'],
        'price' => $course_data['price'],
        'duration' => $course_data['duration'],
        'rating' => $course_data['rating'],
        'enrolled_count' => $course_data['enrolled_count'],
        'teacher' => [
            'id' => $course_data['teacher_id'],
            'name' => $course_data['teacher_name'],
            'avatar' => $course_data['teacher_avatar'],
            'bio' => $course_data['teacher_bio'],
            'social_links' => [
                'instagram' => $course_data['insta_link'],
                'whatsapp' => $course_data['whatsapp_link'],
                'linkedin' => $course_data['linkedIn_link']
            ]
        ],
        'videos' => $videos,
        'assignments' => $assignments
    ]
];

echo json_encode($response);

$stmt->close();
$conn->close();
?>