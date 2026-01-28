<?php
// config/database.php
// USE THE PASSWORD FROM corrected_test.php

define('DB_HOST', 'mysql-3050642e-learnland63.k.aivencloud.com');
define('DB_PORT', 19985);
define('DB_USER', 'omayma');
define('DB_PASS', 'AVNS_jqZsYmdfxh8HtSFMb1h'); 
define('DB_NAME', 'learland_db');
define('DB_SSL_CA', __DIR__ . '/../ca.pem');

function getDB() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
            
            $options = [
                PDO::MYSQL_ATTR_SSL_CA => DB_SSL_CA,
                PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false, // Try false if issues
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            
        } catch (PDOException $e) {
            die("Connection failed. Check password in config/database.php");
        }
    }
    
    return $pdo;
}
?>