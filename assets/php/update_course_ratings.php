<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: /auth.html");
    exit();
}

require_once 'db.php';


if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'DB connection failed: ' . $conn->connect_error]);
    exit;
}

// Compute average ratings per course
$sql = "SELECT course_id, AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM RATING GROUP BY course_id";
$res = $conn->query($sql);
if ($res === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Query failed: ' . $conn->error]);
    $conn->close();
    exit;
}

$updated = [];
while ($row = $res->fetch_assoc()) {
    $course_id = (int)$row['course_id'];
    $avg = (float)$row['avg_rating'];
    // Round to 2 decimals and ensure within 0-5 (if desired)
    $avg_rounded = round($avg, 2);

    $updateSql = "UPDATE COURSE SET rating = ? WHERE course_id = ?";
    $stmt = $conn->prepare($updateSql);
    if (!$stmt) continue;
    $stmt->bind_param('di', $avg_rounded, $course_id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    $updated[] = [
        'course_id' => $course_id,
        'avg_rating' => $avg_rounded,
        'ratings_count' => (int)$row['cnt'],
        'rows_updated' => $affected
    ];
}

// Optionally set courses with no ratings to 0.0 (uncomment if desired)
// $conn->query("UPDATE COURSE SET rating = 0.00 WHERE course_id NOT IN (SELECT DISTINCT course_id FROM RATING)");

$conn->close();

header('Content-Type: application/json');
echo json_encode(['success' => true, 'updated_count' => count($updated), 'updated' => $updated]);
?>