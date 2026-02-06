<?php
// File: assets/php/set_current_course.php
session_start();

if (!isset($_GET['course_id'])) {
    die("Error: Course ID missing!");
}

// Set the current course in session
$_SESSION['current_course_id'] = intval($_GET['course_id']);

// Redirect to rating page
header("Location: ../ratecourse.htm");
exit;
?>