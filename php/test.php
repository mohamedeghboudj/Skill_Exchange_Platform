<?php
require_once 'config/database.php';

echo "<h2>Testing New Config Structure</h2>";

try {
    $pdo = getDB();
    echo "<div style='color:green; padding:15px; background:#d4edda; border-radius:5px;'>";
    echo "✅ SUCCESS! Config/database.php works!";
    echo "</div><br>";
    
    // Show what's in the database
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<h3>Database: " . DB_NAME . "</h3>";
    
    if (count($tables) > 0) {
        echo "Found " . count($tables) . " table(s):<br>";
        echo "<ul>";
        foreach ($tables as $table) {
            echo "<li>$table</li>";
        }
        echo "</ul>";
    } else {
        echo "<div style='color:orange; padding:15px; background:#fff3cd;'>";
        echo "⚠️ No tables found.<br>";
        echo "This is OK if you haven't created tables yet.";
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<div style='color:red; padding:15px; background:#f8d7da;'>";
    echo "❌ New config failed!<br>";
    echo "Error: " . $e->getMessage() . "<br><br>";
    echo "Copy the EXACT password from corrected_test.php";
    echo "</div>";
}
?>