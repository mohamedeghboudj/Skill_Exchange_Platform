<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

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
$role = 'Student'; // Default role

// Check if email already exists using prepared statement
$checkSql = "SELECT id FROM user WHERE email = ?";
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

// Insert new user using prepared statement
$sql = "INSERT INTO user (username, email, password, role) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit();
}

$stmt->bind_param('ssss', $name, $email, $password, $role);

if ($stmt->execute()) {
    $userId = $conn->insert_id;
    
    // Store user data in session
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_role'] = $role;
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'User registered successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error registering user']);
}

$stmt->close();
$conn->close();
?>
