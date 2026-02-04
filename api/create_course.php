<?php
// api/create_course.php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// 1. Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

// 2. Get teacher ID from session
$teacher_id = $_SESSION['user_id'];

// 3. Include database connection
require_once '../assets/php/db.php';

// 4. Verify user is a teacher
if (isset($_SESSION['is_teacher'])) {
    if ($_SESSION['is_teacher'] == 0) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Only teachers can create courses']);
        exit;
    }
} else {
    $checkTeacherStmt = $conn->prepare("SELECT is_teacher FROM USER WHERE user_id = ?");
    $checkTeacherStmt->bind_param("i", $teacher_id);
    $checkTeacherStmt->execute();
    $checkTeacherStmt->bind_result($is_teacher);
    $checkTeacherStmt->fetch();
    $checkTeacherStmt->close();

    if (!$is_teacher || $is_teacher == 0) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Only teachers can create courses']);
        exit;
    }
}

// 5. Validate required fields
$required_fields = ['course_title', 'duration', 'price', 'course_description', 'category'];
foreach ($required_fields as $field) {
    if (empty($_POST[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
        exit;
    }
}

try {
    // 6. Start transaction
    $conn->begin_transaction();

    // 7. Insert course
    $stmt = $conn->prepare("
        INSERT INTO COURSE (
            course_title,
            duration,
            price,
            teacher_id,
            course_description,
            category,
            rating,
            enrolled_count
        ) VALUES (?, ?, ?, ?, ?, ?, 0.00, 0)
    ");

    // FIX: was "sddis" (5 chars, wrong types). Correct: s s d i s s
    //   course_title       → string
    //   duration           → string  (e.g. "4 weeks")
    //   price              → double
    //   teacher_id         → integer
    //   course_description → string
    //   category           → string
    $stmt->bind_param(
        "ssdiss",
        $_POST['course_title'],
        $_POST['duration'],
        $_POST['price'],
        $teacher_id,
        $_POST['course_description'],
        $_POST['category']
    );

    if (!$stmt->execute()) {
        throw new Exception("Failed to create course: " . $stmt->error);
    }

    $course_id = $conn->insert_id;
    $stmt->close();

    // 8. Handle video uploads
    $video_ids = [];
    if (!empty($_FILES['videos']['name'][0])) {
        $upload_dir = '../uploads/videos/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $videoStmt = $conn->prepare("
            INSERT INTO VIDEO (course_id, video_title, video_url)
            VALUES (?, ?, ?)
        ");

        foreach ($_FILES['videos']['tmp_name'] as $key => $tmp_name) {
            if ($_FILES['videos']['error'][$key] === UPLOAD_ERR_OK) {
                $allowed_types = ['video/mp4', 'video/webm', 'video/mov'];
                $file_type = mime_content_type($tmp_name);

                if (!in_array($file_type, $allowed_types)) {
                    throw new Exception("Invalid video format: " . $_FILES['videos']['name'][$key]);
                }

                $original_name = basename($_FILES['videos']['name'][$key]);
                $safe_name     = preg_replace('/[^a-zA-Z0-9._-]/', '_', $original_name);
                $video_name    = uniqid() . '_' . $safe_name;
                $video_path    = $upload_dir . $video_name;

                if (move_uploaded_file($tmp_name, $video_path)) {
                    $video_title = pathinfo($original_name, PATHINFO_FILENAME);
                    $video_url   = 'uploads/videos/' . $video_name;

                    $videoStmt->bind_param("iss", $course_id, $video_title, $video_url);
                    if ($videoStmt->execute()) {
                        $video_ids[] = $conn->insert_id;
                    }
                }
            }
        }
        $videoStmt->close();
    }

    // 9. Handle assignment uploads
    $assignment_ids = [];
    if (!empty($_FILES['assignments']['name'][0])) {
        $upload_dir = '../uploads/assignments/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $assignmentStmt = $conn->prepare("
            INSERT INTO ASSIGNMENT (
                course_id,
                assignment_title,
                assignment_url,
                assignment_status
            ) VALUES (?, ?, ?, 'pending')
        ");

        foreach ($_FILES['assignments']['tmp_name'] as $key => $tmp_name) {
            if ($_FILES['assignments']['error'][$key] === UPLOAD_ERR_OK) {
                $original_name    = basename($_FILES['assignments']['name'][$key]);
                $safe_name        = preg_replace('/[^a-zA-Z0-9._-]/', '_', $original_name);
                $assignment_name  = uniqid() . '_' . $safe_name;
                $assignment_path  = $upload_dir . $assignment_name;

                if (move_uploaded_file($tmp_name, $assignment_path)) {
                    $assignment_title = pathinfo($original_name, PATHINFO_FILENAME);
                    $assignment_url   = 'uploads/assignments/' . $assignment_name;

                    $assignmentStmt->bind_param("iss", $course_id, $assignment_title, $assignment_url);
                    if ($assignmentStmt->execute()) {
                        $assignment_ids[] = $conn->insert_id;
                    }
                }
            }
        }
        $assignmentStmt->close();
    }

    // 10. Commit
    $conn->commit();

    echo json_encode([
        'success'       => true,
        'course_id'     => $course_id,
        'video_ids'     => $video_ids,
        'assignment_ids'=> $assignment_ids,
        'message'       => 'Course created successfully'
    ]);

} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>