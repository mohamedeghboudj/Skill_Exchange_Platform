<?php
require_once 'config/database.php';

$pdo = getDB();
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

echo "Tables in 'learland_db': " . count($tables) . "<br>";
print_r($tables);
?>
