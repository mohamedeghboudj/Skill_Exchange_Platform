<?php
require_once 'config.php'; // include credentials

// create connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

// check connection
if ($conn->connect_error) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}
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
