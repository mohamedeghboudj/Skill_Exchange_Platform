<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "db.php";

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// Get request ID from POST data
$data = json_decode(file_get_contents('php://input'), true);
$requestId = intval($data['request_id'] ?? 0);

if ($requestId <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid request ID"]);
    exit;
}

// Start transaction
$conn->begin_transaction();

try {
    // Get user_id from teacher request
    $getUserQuery = "SELECT user_id FROM TEACHER_REQUEST WHERE teacher_request_id = ? AND teacher_status = 'pending'";
    $stmt = $conn->prepare($getUserQuery);
    $stmt->bind_param("i", $requestId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Teacher request not found or already processed");
    }
    
    $row = $result->fetch_assoc();
    $userId = $row['user_id'];
    
    // Update teacher request status to 'rejected'
    $updateRequestQuery = "UPDATE TEACHER_REQUEST SET teacher_status = 'rejected' WHERE teacher_request_id = ?";
    $stmt = $conn->prepare($updateRequestQuery);
    $stmt->bind_param("i", $requestId);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to update teacher request status");
    }
    
    // Make sure user is_teacher remains 0 (false)
    $updateUserQuery = "UPDATE USER SET is_teacher = 0 WHERE user_id = ?";
    $stmt = $conn->prepare($updateUserQuery);
    $stmt->bind_param("i", $userId);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to update user teacher status");
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        "success" => true, 
        "message" => "Teacher request rejected",
        "user_id" => $userId,
        "request_id" => $requestId
    ]);
    
} catch (Exception $e) {
    // Rollback on error
    $conn->rollback();
    echo json_encode([
        "success" => false, 
        "message" => "Error rejecting teacher: " . $e->getMessage()
    ]);
}

$stmt->close();
$conn->close();
?>
