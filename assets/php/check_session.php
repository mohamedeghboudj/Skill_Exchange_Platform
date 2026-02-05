<?php
session_start();

header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    // User is logged in
    echo json_encode([
        'isLoggedIn' => true,
        'user' => [
            'user_id' => $_SESSION['user_id'],
            'full_name' => $_SESSION['full_name'] ?? 'User',
            'profile_picture' => $_SESSION['profile_picture'] ?? '../assets/images/default-avatar.png',
            'is_teacher' => $_SESSION['is_teacher'] ?? 0
        ]
    ]);
} else {
    // User is not logged in
    echo json_encode([
        'isLoggedIn' => false
    ]);
}
?>