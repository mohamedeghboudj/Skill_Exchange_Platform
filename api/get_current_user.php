<?php
// api/get_current_user.php - FIXED VERSION
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

// DEBUG: Log what we have
error_log("DEBUG: User ID in session: " . $_SESSION['user_id']);

require_once '../assets/php/db.php';

// First, check if is_teacher is in session
if (!isset($_SESSION['is_teacher'])) {
    error_log("DEBUG: is_teacher not in session, fetching from DB");
    
    $user_id = $_SESSION['user_id'];
    $query = "SELECT is_teacher FROM USER WHERE user_id = ?";
    
    error_log("DEBUG: Query: $query, User ID: $user_id");
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        error_log("DEBUG: Prepare failed: " . $conn->error);
        $_SESSION['is_teacher'] = 0;
    } else {
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            error_log("DEBUG: Database returned is_teacher: " . $row['is_teacher']);
            $_SESSION['is_teacher'] = (int)$row['is_teacher'];
        } else {
            error_log("DEBUG: No user found in database");
            $_SESSION['is_teacher'] = 0;
        }
        $stmt->close();
    }
} else {
    error_log("DEBUG: is_teacher already in session: " . $_SESSION['is_teacher']);
}

// Also fetch from database to double-check
$user_id = $_SESSION['user_id'];
$check_stmt = $conn->prepare("SELECT is_teacher, full_name, email FROM USER WHERE user_id = ?");
$check_stmt->bind_param("i", $user_id);
$check_stmt->execute();
$db_result = $check_stmt->get_result();
$db_user = $db_result->fetch_assoc();

error_log("DEBUG: Direct DB query returned: " . print_r($db_user, true));

echo json_encode([
    'success' => true,
    'user' => [
        'id' => $_SESSION['user_id'],
        'email' => $_SESSION['user_email'] ?? $db_user['email'] ?? 'unknown',
        'name' => $_SESSION['user_name'] ?? $db_user['full_name'] ?? 'unknown',
        'role' => $_SESSION['user_role'] ?? 'Student',
        'is_teacher' => $_SESSION['is_teacher'],
        'debug' => [ // Remove this in production
            'db_is_teacher' => $db_user['is_teacher'] ?? 'not_found',
            'session_is_teacher' => $_SESSION['is_teacher'] ?? 'not_set'
        ]
    ]
]);

$check_stmt->close();
?>