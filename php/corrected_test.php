<?php
// USE THE NEW PASSWORD FROM AIVEN
$password = "AVNS_jqZsYmdfxh8HtSFMb1h"; 

$host = 'mysql-3050642e-learnland63.k.aivencloud.com';
$port = 19985;
$dbname = 'learland_db';
$username = 'omayma';
$ca_file = __DIR__ . '/ca.pem';

echo "<h2>Testing with NEW Password</h2>";
echo "Password length: " . strlen($password) . " characters<br>";

try {
    // Try SIMPLE connection first
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname";
    
    echo "Attempt 1: Without SSL...<br>";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false
    ]);
    
    echo "<h3 style='color:green;'>🎉 SUCCESS! Connected with new password!</h3>";
    
    // Now try with SSL
    echo "<br>Attempt 2: With SSL...<br>";
    $pdo_ssl = new PDO($dsn, $username, $password, [
        PDO::MYSQL_ATTR_SSL_CA => $ca_file,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => true,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    
    echo "<span style='color:green;'>✅ SSL connection also works!</span><br>";
    
    // Show tables
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "<h4>Your Tables (" . count($tables) . "):</h4>";
    echo "<ul>";
    foreach ($tables as $table) {
        echo "<li>$table</li>";
    }
    echo "</ul>";
    
} catch (PDOException $e) {
    echo "<h3 style='color:red;'>❌ Still failing: " . $e->getMessage() . "</h3>";
    
    // If still fails, THEN whitelist IP
    echo "<hr><h3>Next Step:</h3>";
    echo "1. Go to Aiven Console<br>";
    echo "2. Service Settings → IP Whitelist<br>";
    echo "3. Add this IP: <strong>129.45.29.136/32</strong><br>";
    echo "4. Wait 2 minutes, then refresh this page";
}
?>