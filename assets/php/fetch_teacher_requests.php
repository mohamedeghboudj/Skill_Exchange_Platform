<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Content-Type: application/json");
require_once "config.php";

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

if ($conn->connect_error) {
    echo json_encode(["error" => $conn->connect_error]);
    exit;
}

// Fetch pending teacher requests with user information
$sql = "SELECT 
            tr.teacher_request_id,
            tr.user_id,
            tr.primary_skill,
            tr.bio,
            tr.teacher_status,
            tr.certificate_url,
            u.full_name,
            u.email,
            u.profile_picture
        FROM TEACHER_REQUEST tr
        JOIN USER u ON tr.user_id = u.user_id
        WHERE tr.teacher_status = 'pending'
        ORDER BY tr.teacher_request_id ASC";

$result = $conn->query($sql);

$requests = [];
while ($row = $result->fetch_assoc()) {
    $requests[] = [
        'id' => $row['teacher_request_id'],
        'user_id' => $row['user_id'],
        'name' => $row['full_name'],
        'email' => $row['email'],
        'profile_picture' => $row['profile_picture'],
        'skill' => $row['primary_skill'],
        'bio' => $row['bio'],
        'certificate_url' => $row['certificate_url'],
        'status' => $row['teacher_status']
    ];
}

echo json_encode($requests);

$conn->close();
?>