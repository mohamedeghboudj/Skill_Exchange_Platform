<?php
$host = "mysql-3050642e-learnland63.k.aivencloud.com";
$user = "avnadmin";
$password = "AVNS_JVC48gUfTTbXvZlZzFJ";
$database = "defaultdb";

$conn = mysqli_connect($host, $user, $password, $database);

if (mysqli_connect_errno()) {
    die("Connection failed: " . mysqli_connect_error());
}
 else {
    echo "Database connection is successful!";
}
?>