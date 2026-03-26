<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "db.php";

try {
    // Get total users
    $totalUsersQuery = "SELECT COUNT(*) as total FROM USER";
    $totalUsersResult = $conn->query($totalUsersQuery);
    $totalUsers = $totalUsersResult->fetch_assoc()['total'];

    // Get total teachers (users with is_teacher = 1)
    $totalTeachersQuery = "SELECT COUNT(*) as total FROM USER WHERE is_teacher = 1";
    $totalTeachersResult = $conn->query($totalTeachersQuery);
    $totalTeachers = $totalTeachersResult->fetch_assoc()['total'];

    // Get total courses
    $totalCoursesQuery = "SELECT COUNT(*) as total FROM COURSE";
    $totalCoursesResult = $conn->query($totalCoursesQuery);
    $totalCourses = $totalCoursesResult->fetch_assoc()['total'];

    // Get revenue statistics
    // Monthly recurring revenue (sum of all active course prices)
    $monthlyRecurringQuery = "SELECT COALESCE(SUM(price), 0) as total FROM COURSE";
    $monthlyRecurringResult = $conn->query($monthlyRecurringQuery);
    $monthlyRecurring = $monthlyRecurringResult->fetch_assoc()['total'];

    // Revenue this month - if you don't have enrollment_date, calculate from all enrollments
    $revenueThisMonthQuery = "
        SELECT COALESCE(SUM(c.price), 0) as total 
        FROM ENROLLMENT e
        JOIN COURSE c ON e.course_id = c.course_id
        WHERE e.is_active = 1
    ";
    $revenueThisMonthResult = $conn->query($revenueThisMonthQuery);
    $revenueThisMonth = $revenueThisMonthResult->fetch_assoc()['total'];

    // Payouts pending (30% of active enrollments)
    $payoutsPending = $revenueThisMonth * 0.30;

    $stats = [
        "totalUsers" => intval($totalUsers),
        "totalTeachers" => intval($totalTeachers),
        "totalCourses" => intval($totalCourses),
        "monthlyRecurring" => floatval($monthlyRecurring),
        "revenueThisMonth" => floatval($revenueThisMonth),
        "payoutsPending" => floatval($payoutsPending)
    ];

    echo json_encode($stats);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn->close();
?>
