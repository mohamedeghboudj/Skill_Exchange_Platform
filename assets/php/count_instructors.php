<?php
require_once 'db.php';
// Use the same query logic as top_instructors.php to ensure consistency
$sql = "SELECT COUNT(DISTINCT u.user_id) as count
FROM USER u
LEFT JOIN COURSE c ON u.user_id = c.teacher_id
WHERE u.is_teacher = 1 AND c.course_id IS NOT NULL AND c.rating > 0";

$result = $conn->query($sql);
$row = $result->fetch_assoc();
echo "Total Qualified Instructors: " . $row['count'] . "\n";
?>
