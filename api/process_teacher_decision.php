<?php
// File: /api/process_teacher_decision.php
session_start();
header('Content-Type: application/json');

require_once '../config/db.php'; // uses $conn MySQLi

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$teacher_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true);

$request_id = isset($data['request_id']) ? (int)$data['request_id'] : 0;
$decision = $data['decision'] ?? ''; // 'accept' or 'decline'
$teacher_message = $data['teacher_message'] ?? '';

if ($request_id <= 0 || !in_array($decision, ['accept', 'decline'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request data']);
    exit;
}

try {
    $conn->begin_transaction();

    // 1️⃣ Verify teacher owns the course for this pending request
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
    $stmt->bind_param("ii", $request_id, $teacher_id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 0) {
        $stmt->close();
        $conn->rollback();
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Request not found or already processed']);
        exit;
    }

    $stmt->bind_result($fetched_request_id, $course_id);
    $stmt->fetch();
    $stmt->close();

    // 2️⃣ Update request status
    $new_status = $decision === 'accept' ? 'accepted' : 'declined';

    $updateQuery = "
        UPDATE ENROLLMENT_REQUEST
        SET status = ?, teacher_decision_date = NOW(), teacher_message = ?
        WHERE request_id = ?
    ";
    $stmt = $conn->prepare($updateQuery);
    $stmt->bind_param("ssi", $new_status, $teacher_message, $request_id);
    $stmt->execute();
    $stmt->close();

    // 3️⃣ Optional: if declined, you could handle notifications here

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Request ' . $decision . 'ed successfully',
        'request_id' => $request_id,
        'status' => $new_status
    ]);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollback();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
