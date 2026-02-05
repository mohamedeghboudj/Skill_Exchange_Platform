<?php
// File: /api/process_teacher_decision.php
require_once '../config/db.php';

session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$teacher_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true);

$request_id = $data['request_id'] ?? 0;
$decision = $data['decision'] ?? ''; // 'accept' or 'decline'
$teacher_message = $data['teacher_message'] ?? '';

if ($request_id <= 0 || !in_array($decision, ['accept', 'decline'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid request data']);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Start transaction
    $conn->beginTransaction();
    
    // 1. Verify teacher owns this course
    $verifyQuery = "
        SELECT er.request_id, c.course_id
        FROM ENROLLMENT_REQUEST er
        JOIN COURSE c ON er.course_id = c.course_id
        WHERE er.request_id = :request_id 
        AND c.teacher_id = :teacher_id
        AND er.status = 'pending'
    ";
    
    $stmt = $conn->prepare($verifyQuery);
    $stmt->execute([
        ':request_id' => $request_id,
        ':teacher_id' => $teacher_id
    ]);
    
    $request = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$request) {
        throw new Exception('Request not found or already processed');
    }
    
    $course_id = $request['course_id'];
    
    // 2. Update request status
    $new_status = $decision === 'accept' ? 'accepted' : 'declined';
    
    $updateQuery = "
        UPDATE ENROLLMENT_REQUEST 
        SET status = :status,
            teacher_decision_date = NOW(),
            teacher_message = :teacher_message
        WHERE request_id = :request_id
    ";
    
    $stmt = $conn->prepare($updateQuery);
    $stmt->execute([
        ':status' => $new_status,
        ':teacher_message' => $teacher_message,
        ':request_id' => $request_id
    ]);
    
    // 3. If declined, remove any related data (optional)
    if ($decision === 'decline') {
        // Could add to notification table or just leave as declined
        // No enrollment record should be created
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Request ' . $decision . 'ed successfully',
        'request_id' => $request_id,
        'status' => $new_status
    ]);
    
} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>