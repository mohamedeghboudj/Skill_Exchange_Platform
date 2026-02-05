<?php
// api/auth_login.php - CLEAN VERSION
session_start();
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email and password required']);
    exit;
}

$email = $data['email'];
$password = $data['password'];

// Connect to database - adjust path as needed
require_once '../config/db.php';

// Query user
$stmt = $conn->prepare("SELECT * FROM USER WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    exit;
}

$user = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    exit;
}

// ✅ Set ALL session variables
$_SESSION['user_id'] = $user['user_id'];
$_SESSION['user_email'] = $user['email'];
$_SESSION['user_name'] = $user['full_name'];
$_SESSION['is_teacher'] = (int)$user['is_teacher']; // Store as integer
$_SESSION['user_role'] = $user['is_teacher'] ? 'Teacher' : 'Student';

$stmt->close();

// Return success
echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'user' => [
        'id' => $user['user_id'],
        'email' => $user['email'],
        'name' => $user['full_name'],
        'is_teacher' => (int)$user['is_teacher'],
        'role' => $user['is_teacher'] ? 'Teacher' : 'Student'
    ]
]);
?>