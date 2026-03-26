<?php
/**
 * API Helper Functions
 * Standardized functions for CORS, responses, and error handling
 */

/**
 * Set standard CORS headers for API endpoints
 * Allows requests from any origin for production compatibility
 */
function setCorsHeaders() {
    if (!headers_sent()) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Max-Age: 86400'); // 24 hours
    }
    
    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        if (!headers_sent()) {
            http_response_code(200);
        }
        exit();
    }
}

/**
 * Set JSON content type header
 */
function setJsonHeader() {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=UTF-8');
    }
}

/**
 * Send standardized success response
 * @param mixed $data Data to return
 * @param string $message Optional success message
 * @param int $httpCode HTTP status code (default 200)
 */
function sendSuccess($data = null, $message = 'Success', $httpCode = 200) {
    if (!headers_sent()) {
        http_response_code($httpCode);
        setJsonHeader();
    }
    
    $response = ['success' => true];
    
    if ($message) {
        $response['message'] = $message;
    }
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    
    // In test mode, throw exception instead of exit
    if (defined('TEST_MODE') && TEST_MODE === true) {
        throw new Exception('Success');
    }
    exit();
}

/**
 * Send standardized error response
 * @param string $error Error message
 * @param int $httpCode HTTP status code (default 400)
 * @param array $details Optional additional error details
 */
function sendError($error, $httpCode = 400, $details = null) {
    if (!headers_sent()) {
        http_response_code($httpCode);
        setJsonHeader();
    }
    
    $response = [
        'success' => false,
        'error' => $error
    ];
    
    if ($details !== null) {
        $response['details'] = $details;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    
    // In test mode, throw exception instead of exit
    if (defined('TEST_MODE') && TEST_MODE === true) {
        throw new Exception($error);
    }
    exit();
}

/**
 * Check if user is authenticated
 * @return int User ID if authenticated
 */
function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        sendError('Authentication required. Please log in.', 401);
    }
    return $_SESSION['user_id'];
}

/**
 * Check if user is a teacher
 * @param mysqli $conn Database connection
 * @param int $user_id User ID to check
 * @return bool True if teacher
 */
function requireTeacher($conn, $user_id) {
    $stmt = $conn->prepare("SELECT is_teacher FROM USER WHERE user_id = ?");
    if (!$stmt) {
        sendError('Database error', 500);
    }
    
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($is_teacher);
    $stmt->fetch();
    $stmt->close();
    
    if (!$is_teacher) {
        sendError('Teacher access required', 403);
    }
    
    return true;
}

/**
 * Validate required POST fields
 * @param array $fields Array of required field names
 * @return bool True if all fields present
 */
function validateRequiredFields($fields, $source = 'POST') {
    $data = $source === 'POST' ? $_POST : $_GET;
    $missing = [];
    
    foreach ($fields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }
    
    return true;
}

/**
 * Sanitize input string
 * @param string $input Input to sanitize
 * @return string Sanitized input
 */
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Log error to file
 * @param string $message Error message
 * @param string $file File where error occurred
 */
function logError($message, $file = '') {
    $logFile = __DIR__ . '/../logs/error.log';
    $logDir = dirname($logFile);
    
    if (!file_exists($logDir)) {
        mkdir($logDir, 0777, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] " . ($file ? "[$file] " : '') . $message . "\n";
    error_log($logMessage, 3, $logFile);
}

/**
 * Handle database connection errors
 * @param mysqli $conn Connection object
 */
function handleDbError($conn) {
    $error = mysqli_connect_error() ?: $conn->error;
    logError("Database error: $error", $_SERVER['PHP_SELF']);
    sendError('Database connection failed', 500);
}

?>
