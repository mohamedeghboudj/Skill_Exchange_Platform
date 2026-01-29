<?php
session_start();
header('Content-Type: application/json');// telling that the output is json
require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit();
}
$user_id = $_SESSION['user_id'];
$sql = "SELECT certificate_name, certificate_url FROM CERTIFICATE WHERE teacher_id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$certificates = [];
while ($row = mysqli_fetch_assoc($result)) {
    $certificates[] = [
        'file_name' => $row['certificate_name'],
        'file_url' => $row['certificate_url'],
        'file_type' => pathinfo($row['certificate_url'], PATHINFO_EXTENSION) === 'pdf' ? 'application/pdf' : 'image/jpeg'
    ];
}
echo json_encode($certificates);
mysqli_stmt_close($stmt);
mysqli_close($conn);
?>

