<?php
// Railway entry point
$port = $_ENV['PORT'] ?? 8080;
echo "TTTN Website is running on port $port\n";

// Redirect to frontend
if (php_sapi_name() !== 'cli-server') {
    header('Location: frontend/index.html');
    exit();
}

// For CLI server, serve files
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve frontend files
if (file_exists(__DIR__ . '/frontend' . $path)) {
    return false; // Let PHP serve the file
}

// Serve backend API
if (strpos($path, '/api/') === 0) {
    $apiPath = str_replace('/api/', '/backend/api/', $path);
    if (file_exists(__DIR__ . $apiPath)) {
        include __DIR__ . $apiPath;
        return true;
    }
}

// Default to frontend index
if ($path === '/' || $path === '') {
    include __DIR__ . '/frontend/index.html';
    return true;
}

// 404
http_response_code(404);
echo "404 Not Found";
?>