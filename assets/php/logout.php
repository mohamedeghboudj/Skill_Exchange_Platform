<?php
session_start();

// Explicitly clear the session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// Destroy the session
session_destroy();
$_SESSION = [];

// Return JSON response (frontend will handle redirect)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8000'); // CHANGED: from * for credentials support
header('Access-Control-Allow-Credentials: true'); // ADDED: to allow cookies/sessions
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]);
exit();
?>