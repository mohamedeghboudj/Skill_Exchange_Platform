<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(E_ALL);

session_start();
require_once "../config/db.php";
if (!isset($_SESSION['user_id'])){
    $_SESSION['user_id'] =1;
}
$user_id = $_SESSION['user_id'];

$sql = "SELECT user_id, email,password_hash,full_name,profile_picture,age,skill,bio,date_registered,is_teacher,insta_link,whatsapp_link,linkedIn_link ";
$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(["error" => mysqli_error($conn)]);
    exit;
}
$user = mysqli_fetch_assoc($result);
header("Content-Type: application/json");
echo json_encode($user);