<?php
/**
 * Router for PHP Built-in Server
 * Usage: php -S localhost:8000 router.php
 * 
 * This file replicates the .htaccess rewrite rules for the PHP built-in
 * development server (which does NOT support .htaccess).
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// ─── 1. Serve existing files/directories directly ─────────────────────
// If the file exists on disk, let the built-in server handle it natively
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    $ext = pathinfo($uri, PATHINFO_EXTENSION);
    
    // For PHP files, include them directly
    if ($ext === 'php') {
        // Set up the include path so relative requires work
        chdir(dirname(__DIR__ . $uri));
        include __DIR__ . $uri;
        return true;
    }
    
    // For all other static files (CSS, JS, images, HTML, etc.)
    // Return false to let PHP built-in server handle them natively
    return false;
}

// ─── 2. Route API & app requests to backend/public/index.php ──────────
// These match the .htaccess RewriteRules

$path = ltrim($uri, '/');

// API routes: /api/*
if (preg_match('#^api/(.*)$#', $path, $m)) {
    $_GET['url'] = 'api/' . $m[1];
    require __DIR__ . '/backend/public/index.php';
    return true;
}

// Profile routes
if ($path === 'profile') {
    $_GET['url'] = 'profile';
    require __DIR__ . '/backend/public/index.php';
    return true;
}
if ($path === 'profile/update') {
    $_GET['url'] = 'profile/update';
    require __DIR__ . '/backend/public/index.php';
    return true;
}
if ($path === 'profile/change-password') {
    $_GET['url'] = 'profile/change-password';
    require __DIR__ . '/backend/public/index.php';
    return true;
}
if ($path === 'profile/upload-picture') {
    $_GET['url'] = 'profile/upload-picture';
    require __DIR__ . '/backend/public/index.php';
    return true;
}
if (strpos($path, 'profile/') === 0) {
    $_GET['url'] = $path;
    require __DIR__ . '/backend/public/index.php';
    return true;
}

// App page routes
if ($path === 'trips') {
    $_GET['url'] = 'trips';
    require __DIR__ . '/backend/public/index.php';
    return true;
}
if ($path === 'wishlist') {
    $_GET['url'] = 'wishlist';
    require __DIR__ . '/backend/public/index.php';
    return true;
}
if ($path === 'logout') {
    $_GET['url'] = 'logout';
    require __DIR__ . '/backend/public/index.php';
    return true;
}

// ─── 3. Root → serve index.html ───────────────────────────────────────
if ($uri === '/') {
    include __DIR__ . '/index.html';
    return true;
}

// ─── 4. Not found ─────────────────────────────────────────────────────
http_response_code(404);
echo "404 - Not Found: " . htmlspecialchars($uri);
return true;
