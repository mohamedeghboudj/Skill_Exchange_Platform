<?php //authenticate.php
session_start();
header('Content-Type: application/json'); //informs client bli response will be in json
// hadil touched this   header('Access-Control-Allow-Origin: *');//to allow requests from any domain
header('Access-Control-Allow-Origin: http://localhost:8000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');//allows post requests only 
header('Access-Control-Allow-Headers: Content-Type'); //allows requests that include the Content-Type header.


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

// get POST data
$data = json_decode(file_get_contents('php://input'), true); //json insto array

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password required']); //into json
    exit();
}

$email = $data['email'];
$password = $data['password'];

// Query user by email using prepared statement - match actual schema
$sql = "SELECT * FROM USER WHERE email = ?";
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
    
    // Verify password using password_hash
    if (password_verify($password, $user['password_hash'])) { 
        // Store user data in session - use correct column names
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['full_name'];
        $_SESSION['user_role'] = $user['is_teacher'] ? 'Teacher' : 'Student';
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user['user_id'],
                'name' => $user['full_name'],
                'role' => $user['is_teacher'] ? 'Teacher' : 'Student'
            ]
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
