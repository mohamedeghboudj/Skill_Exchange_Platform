<?php
session_start();
header('Content-Type: application/json'); //informs client bli respose will be in json
header('Access-Control-Allow-Origin: *');//to allow requests from any domain
header('Access-Control-Allow-Methods: POST');//allows post requests only 
header('Access-Control-Allow-Headers: Content-Type'); //allows requests that include the Content-Type header.

require_once 'db.php';

// get POST data
$data = json_decode(file_get_contents('php://input'), true); //json insto array

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password required']); //into json
    exit();
}

$email = $data['email'];
$password = $data['password'];

// Query user by email using prepared statement
$sql = "SELECT * FROM user WHERE email = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit();
}

$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    // Verify password
    if ($password === $user['password']) { 
        // Store user data in session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['username'];
        $_SESSION['user_role'] = $user['role'] ?? 'Student';
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Login successful'
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    }
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
}

$stmt->close();
$conn->close();
?>
