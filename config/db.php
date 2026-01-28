<?php
$host = "mysql-3050642e-learnland63.k.aivencloud.com";
$user = "avnadmin";
$password = "AVNS_L5dWdIuG88yYHyxP7RE";
$database = "learland_db";
$port = 19985; 

$conn = mysqli_init();
mysqli_ssl_set($conn, NULL, NULL, NULL, NULL, NULL);
mysqli_real_connect(
    $conn,
    $host,
    $user,
    $password,
    $database,
    $port,
    NULL,
    MYSQLI_CLIENT_SSL
);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}



?>
