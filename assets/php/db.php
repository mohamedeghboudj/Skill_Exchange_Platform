<?php
require_once 'config.php'; // include credentials

// create connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

// check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully!";
// $sql = "SELECT * FROM user"; //test test
// $result = $conn->query($sql);

// if ($result->num_rows > 0) {
//     while($row = $result->fetch_assoc()) {
//         echo $row['username'] . "<br>";
//     }
// } else {
//     echo "0 results";
// }

?>
