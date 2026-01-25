<?php
$host = "localhost";
$user = "root";
$password = "";
$database = "learland_db";

$conn = mysqli_connect($host, $user, $password, $database);

if (mysqli_connect_errno()) {
    die("Connection failed: " . mysqli_connect_error());
}
 else {
    echo "Database connection is successful!";
}
?>