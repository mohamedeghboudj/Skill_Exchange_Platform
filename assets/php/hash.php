<?php
require_once 'db.php';

// ⚠️ CHANGE THIS TO THE REAL PASSWORD YOU WANT
$plainPassword = "imadmin123!"; 

// Hash the password securely
$hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);

// User ID you want to update
$userId = 28;

// Prepare update query
$sql = "UPDATE USER SET password_hash = ? WHERE user_id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    die("Prepare failed: " . $conn->error);
}

$stmt->bind_param("si", $hashedPassword, $userId);

if ($stmt->execute()) {
    echo "✅ Password successfully hashed and stored for user ID 28";
} else {
    echo "❌ Error updating password";
}

$stmt->close();
$conn->close();
