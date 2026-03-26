<?php
session_start();
require_once '../config/api_helpers.php';
require_once '../config/db.php';

// Set CORS headers
setCorsHeaders();
setJsonHeader();

// Check authentication
$user_id = requireAuth();

// Read JSON body
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['course_id'], $data['rating'])) {
    sendError('Invalid data: course_id and rating required', 400);
}

$user_id = intval($user_id);
$course_id = intval($data['course_id']);
$rating = floatval($data['rating']);

// Validate rating
if ($rating < 1 || $rating > 5) {
    sendError('Rating must be between 1 and 5', 400);
}

try {
    // Check enrollment
    $stmt = $conn->prepare("SELECT enrollment_id FROM ENROLLMENT WHERE student_id = ? AND course_id = ? AND is_active = 1");
    if (!$stmt) {
        handleDbError($conn);
    }
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}

$stmt->bind_param("ii", $user_id, $course_id);
    $stmt->bind_param("ii", $user_id, $course_id);
    $stmt->execute();
    $enrollment_result = $stmt->get_result();
    $stmt->close();

    if ($enrollment_result->num_rows === 0) {
        $conn->close();
        sendError('You must be enrolled in this course to rate it', 403);
    }

    // Check if rating exists
    $stmt = $conn->prepare("SELECT rating FROM RATING WHERE user_id = ? AND course_id = ?");
    $stmt->bind_param("ii", $user_id, $course_id);
    $stmt->execute();
    $existing = $stmt->get_result();
    $stmt->close();

    if ($existing->num_rows > 0) {
        // Update existing rating
        $stmt = $conn->prepare("UPDATE RATING SET rating = ? WHERE user_id = ? AND course_id = ?");
        $stmt->bind_param("dii", $rating, $user_id, $course_id);
        $message = 'Rating updated successfully!';
    } else {
        // Insert new rating
        $stmt = $conn->prepare("INSERT INTO RATING (user_id, course_id, rating) VALUES (?, ?, ?)");
        $stmt->bind_param("iid", $user_id, $course_id, $rating);
        $message = 'Thank you for rating this course!';
    }

    if (!$stmt->execute()) {
        throw new Exception('Failed to save rating');
    }
    $stmt->close();
    
    // Update course average rating
    $stmt = $conn->prepare("UPDATE COURSE SET rating = (SELECT AVG(rating) FROM RATING WHERE course_id = ?) WHERE course_id = ?");
    $stmt->bind_param("ii", $course_id, $course_id);
    $stmt->execute();
    $stmt->close();
    
    $conn->close();
    sendSuccess(['rating' => $rating], $message);

} catch (Exception $e) {
    logError($e->getMessage(), 'set_rating.php');
    if (isset($conn)) $conn->close();
    sendError('Failed to set rating', 500);
}
?>