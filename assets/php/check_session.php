<?php
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8000'); // ADDED: for credentials support
header('Access-Control-Allow-Credentials: true'); // ADDED: to allow cookies/sessions

if (isset($_SESSION['user_id'])) {
    // User is logged in
    echo json_encode([
        'isLoggedIn' => true,
        'user' => [
            'user_id' => $_SESSION['user_id'],
            'full_name' => $_SESSION['full_name'] ?? 'User',
            'email' => $_SESSION['user_email'] ?? '', // ADDED: for potential future use
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