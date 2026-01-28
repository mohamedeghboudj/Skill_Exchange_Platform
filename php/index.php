<?php
require_once 'config/database.php';

// Test connection immediately
try {
    $pdo = getDB();
    $connection_status = "✅ Connected to Aiven";
} catch (Exception $e) {
    $connection_status = "❌ Connection failed";
}
// Start session if needed for login
session_start();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LearnLand - Backend Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f7fa;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .status-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .success {
            color: #10b981;
            background: #d1fae5;
            padding: 10px;
            border-radius: 5px;
        }
        .menu {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            margin: 30px 0;
        }
        .menu a {
            background: white;
            padding: 15px 25px;
            border-radius: 8px;
            text-decoration: none;
            color: #374151;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .menu a:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }
        .api-endpoints {
            background: white;
            padding: 25px;
            border-radius: 8px;
            margin-top: 30px;
        }
        code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 LearnLand Backend Dashboard</h1>
        <p>PHP Backend connected to Aiven Cloud Database</p>
    </div>
    
    <div class="status-card">
        <h2>System Status</h2>
        <?php
        try {
           $pdo = getDB();
            echo "<div class='success'>✅ Database Connection: ACTIVE</div>";
            
            // Get database info
            $info = $pdo->query("SELECT 
                DATABASE() as db,
                VERSION() as version,
                NOW() as server_time
            ")->fetch();
            
            echo "<p><strong>Database:</strong> " . htmlspecialchars($info['db']) . "</p>";
            echo "<p><strong>MySQL Version:</strong> " . htmlspecialchars($info['version']) . "</p>";
            echo "<p><strong>Server Time:</strong> " . htmlspecialchars($info['server_time']) . "</p>";
            
        } catch (Exception $e) {
            echo "<div style='color:#dc2626; background:#fee2e2; padding:10px; border-radius:5px;'>";
            echo "❌ Database Connection Error: " . htmlspecialchars($e->getMessage());
            echo "</div>";
        }
        ?>
    </div>
    
    <div class="menu">
        <a href="final_check.php">📊 Database Check</a>
        <a href="api/users.php" target="_blank">👥 Users API</a>
        <a href="test_query.php" target="_blank">🧪 Test Queries</a>
        <a href="create_tables.php" target="_blank">🗃️ Create Tables</a>
        <a href="phpinfo.php" target="_blank">ℹ️ PHP Info</a>
    </div>
    
    <div class="api-endpoints">
        <h2>API Endpoints (To Build)</h2>
        <ul>
            <li><code>GET /api/users</code> - List all users</li>
            <li><code>POST /api/login</code> - User login</li>
            <li><code>POST /api/register</code> - User registration</li>
            <li><code>GET /api/data</code> - Your main data</li>
        </ul>
        <p style="color: #6b7280; margin-top: 15px;">
            ⏳ <strong>15-Day Progress:</strong> Day 1 - Database Connected ✓
        </p>
    </div>
    
    <div style="margin-top: 40px; padding: 20px; background: #fef3c7; border-radius: 8px;">
        <h3>📝 Next Steps:</h3>
        <ol>
            <li>Check tables with <a href="final_check.php">final_check.php</a></li>
            <li>Create database tables if needed</li>
            <li>Build your first API endpoint</li>
            <li>Connect frontend to backend</li>
        </ol>
    </div>
    
    <footer style="margin-top: 50px; text-align: center; color: #6b7280;">
        <p>LearnLand Backend | Aiven Cloud | PHP <?php echo phpversion(); ?></p>
    </footer>
</body>
</html>