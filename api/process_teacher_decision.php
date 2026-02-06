<?php
// File: /api/process_teacher_decision.php

session_start();
header('Content-Type: application/json');

// Log errors to a file instead of outputting HTML
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Error handler: convert PHP warnings/notices into JSON response
set_error_handler(function($severity, $message, $file, $line) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => "PHP Error: $message"]);
    exit;
});

// Shutdown handler: catches fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => "Shutdown Error: {$error['message']}"]);
        exit;
    }
});

require_once '../config/db.php'; // expects $conn as MySQLi

// Helper function to send JSON and exit
function send_json($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

// 1️⃣ Authentication check
if (!isset($_SESSION['user_id'])) {
    send_json(['success' => false, 'error' => 'Not authenticated'], 401);
}

$teacher_id = $_SESSION['user_id'];

// 2️⃣ Read input JSON
$data = json_decode(file_get_contents('php://input'), true);

$request_id = isset($data['request_id']) ? (int)$data['request_id'] : 0;
$decision = $data['decision'] ?? ''; // 'accept' or 'decline'

if ($request_id <= 0 || !in_array($decision, ['accept', 'decline'])) {
    send_json(['success' => false, 'error' => 'Invalid request data'], 400);
}

try {
    $conn->begin_transaction();

    // 3️⃣ Verify that request exists and belongs to this teacher, still pending
    $verifyQuery = "
        SELECT er.request_id, c.course_id
        FROM ENROLLMENT_REQUEST er
        JOIN COURSE c ON er.course_id = c.course_id
        WHERE er.request_id = ?
          AND c.teacher_id = ?
          AND er.status = 'pending'
        LIMIT 1
    ";
    $stmt = $conn->prepare($verifyQuery);
    if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);

    $stmt->bind_param("ii", $request_id, $teacher_id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 0) {
        $stmt->close();
        $conn->rollback();
        send_json(['success' => false, 'error' => 'Request not found or already processed'], 403);
    }

    $stmt->bind_result($fetched_request_id, $course_id);
    $stmt->fetch();
    $stmt->close();

    // 4️⃣ Update request status
    $new_status = $decision === 'accept' ? 'accepted' : 'declined';
    $updateQuery = "
        UPDATE ENROLLMENT_REQUEST
        SET status = ?, teacher_decision_date = NOW()
        WHERE request_id = ?
    ";
    $stmt = $conn->prepare($updateQuery);
    if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);

    $stmt->bind_param("si", $new_status, $request_id);
    $stmt->execute();
    $stmt->close();

    $conn->commit();

    // 5️⃣ Return success JSON
    send_json([
        'success' => true,
        'message' => "Request $decision" . "ed successfully",
        'request_id' => $request_id,
        'status' => $new_status
    ]);

} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    send_json(['success' => false, 'error' => "Database error: " . $e->getMessage()], 500);
}

$conn->close();
