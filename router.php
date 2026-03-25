<?php
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
$path = $uri === '/' ? '/' : '/' . ltrim($uri, '/');
$projectRoot = realpath(__DIR__);

function serveFile(string $filePath): bool
{
    $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

    if ($extension === 'php') {
        chdir(dirname($filePath));
        require $filePath;
        return true;
    }

    return false;
}

if ($path !== '/') {
    $requested = realpath(__DIR__ . $path);

    if ($requested && str_starts_with($requested, $projectRoot) && is_file($requested)) {
        return serveFile($requested);
    }

    foreach (['.html', '.htm', '.php'] as $extension) {
        $candidate = realpath(__DIR__ . $path . $extension);
        if ($candidate && str_starts_with($candidate, $projectRoot) && is_file($candidate)) {
            return serveFile($candidate);
        }
    }
}

if ($path === '/') {
    include __DIR__ . '/index.html';
    return true;
}

http_response_code(404);
echo '404 - Not Found';
return true;
