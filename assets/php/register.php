<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting to JSON
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Use POST.']);
    exit();
}

require_once 'db.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name, email, and password required']);
    exit();
}

$name = $data['name'];
$email = $data['email'];
$password = $data['password'];

// Hash the password
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

// Check if email already exists using prepared statement
$checkSql = "SELECT user_id FROM USER WHERE email = ?";
$checkStmt = $conn->prepare($checkSql);

if (!$checkStmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit();
}

$checkStmt->bind_param('s', $email);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    $checkStmt->close();
    exit();
}

$checkStmt->close();

// Insert new user using prepared statement - match actual schema
$sql = "INSERT INTO USER (full_name, email, password_hash, is_teacher) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    exit();
}

$isTeacher = 0; // Default Student
$stmt->bind_param('sssi', $name, $email, $passwordHash, $isTeacher);

if ($stmt->execute()) {
    $userId = $conn->insert_id;
    
    // Store user data in session
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_role'] = 'Student';
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'User registered successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error registering user: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
