<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: /auth.html");
    exit();
}

require_once 'db.php';

echo "<h2>Database Tables in: " . DB_NAME . "</h2>";

// Get list of tables
$sql = "SHOW TABLES";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "<ul>";
    while($row = $result->fetch_array()) {
        $tableName = $row[0];
        echo "<li><strong>$tableName</strong>";
        
        // Get columns for each table
        $columnsSql = "DESCRIBE $tableName";
        $columnsResult = $conn->query($columnsSql);
        
        if ($columnsResult->num_rows > 0) {
            echo "<ul>";
            while($column = $columnsResult->fetch_assoc()) {
                echo "<li>" . $column['Field'] . " (" . $column['Type'] . ")</li>";
            }
            echo "</ul>";
        }
        echo "</li>";
    }
    echo "</ul>";
} else {
    echo "No tables found in the database.";
}

$conn->close();
?>
