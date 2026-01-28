<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: /auth.html");
    exit();
}

require_once 'db.php';

// Get rating count 
$sql = "SELECT COUNT(*) AS cnt FROM RATING";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    die("Error: " . $conn->error);
}

$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
echo "Total rating rows: " . $row['cnt'] . "\n";

// Get sample ratings 
$sql2 = "SELECT * FROM RATING LIMIT 10";
$stmt2 = $conn->prepare($sql2);

if (!$stmt2) {
    die("Error: " . $conn->error);
}

$stmt2->execute();
$result2 = $stmt2->get_result();

while($r = $result2->fetch_assoc()){
    echo json_encode($r) . "\n";
}

$stmt->close();
$stmt2->close();
$conn->close();
?>