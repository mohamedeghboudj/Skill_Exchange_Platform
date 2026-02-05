<?php
require_once 'db.php';

echo "<h2>Setting up Test Data...</h2>";

/**
 * Helper: upsert ASSIGNMENT_SUBMISSION (insert or update by student_id + assignment_id)
 */
function upsertSubmission($conn, $student_id, $assignment_id, $submission_url, $score, $submission_status) {
    $check = $conn->prepare("SELECT submission_id FROM ASSIGNMENT_SUBMISSION WHERE student_id = ? AND assignment_id = ?");
    $check->bind_param("ii", $student_id, $assignment_id);
    $check->execute();
    $res = $check->get_result()->fetch_assoc();
    $check->close();

    if ($res) {
        $stmt = $conn->prepare("UPDATE ASSIGNMENT_SUBMISSION SET submission_url = ?, score = ?, submission_status = ? WHERE submission_id = ?");
        $stmt->bind_param("sdsi", $submission_url, $score, $submission_status, $res['submission_id']);
    } else {
        $stmt = $conn->prepare("INSERT INTO ASSIGNMENT_SUBMISSION (student_id, assignment_id, submission_url, score, submission_status) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("iisds", $student_id, $assignment_id, $submission_url, $score, $submission_status);
    }
    $stmt->execute();
    $stmt->close();
}

try {
    // 1. Create Teacher
    $teacher_email = 'teacher_v2@test.com';
    $password = password_hash('TestPass123!', PASSWORD_DEFAULT);
    
    $checkTeacher = $conn->prepare("SELECT user_id FROM USER WHERE email = ?");
    $checkTeacher->bind_param("s", $teacher_email);
    $checkTeacher->execute();
    $teacher_res = $checkTeacher->get_result();
    
    if ($teacher_res->num_rows === 0) {
        $stmt = $conn->prepare("INSERT INTO USER (full_name, email, password_hash, is_teacher) VALUES ('Test Teacher', ?, ?, 1)");
        $stmt->bind_param("ss", $teacher_email, $password);
        $stmt->execute();
        $teacher_id = $conn->insert_id;
        echo "Created Teacher (ID: $teacher_id)<br>";
    } else {
        $teacher_id = $teacher_res->fetch_assoc()['user_id'];
        $updateStmt = $conn->prepare("UPDATE USER SET password_hash = ? WHERE user_id = ?");
        $updateStmt->bind_param("si", $password, $teacher_id);
        $updateStmt->execute();
        echo "Teacher already exists (ID: $teacher_id) - Password Updated<br>";
    }
    
    // 2. Create Students
    $students = [
        ['Test Student 2', 'student_v2@test.com'],
        ['Test Student 3', 'student_v3@test.com']
    ];
    $student_ids = [];
    
    foreach ($students as $s) {
        $checkStudent = $conn->prepare("SELECT user_id FROM USER WHERE email = ?");
        $checkStudent->bind_param("s", $s[1]);
        $checkStudent->execute();
        $student_res = $checkStudent->get_result();
        
        if ($student_res->num_rows === 0) {
            $stmt = $conn->prepare("INSERT INTO USER (full_name, email, password_hash, is_teacher) VALUES (?, ?, ?, 0)");
            $stmt->bind_param("sss", $s[0], $s[1], $password);
            $stmt->execute();
            $sid = $conn->insert_id;
            echo "Created Student $s[0] (ID: $sid)<br>";
        } else {
            $sid = $student_res->fetch_assoc()['user_id'];
            $updateStmt = $conn->prepare("UPDATE USER SET password_hash = ? WHERE user_id = ?");
            $updateStmt->bind_param("si", $password, $sid);
            $updateStmt->execute();
            echo "Student $s[0] already exists (ID: $sid) - Password Updated<br>";
        }
        $student_ids[$s[1]] = $sid;
    }
    
    $student_id = $student_ids['student_v2@test.com'];
    $student3_id = $student_ids['student_v3@test.com'];
    
    // 3. Create Course
    $course_title = 'Full-Stack Web Development';
    $checkCourse = $conn->prepare("SELECT course_id FROM COURSE WHERE course_title = ?");
    $checkCourse->bind_param("s", $course_title);
    $checkCourse->execute();
    $course_res = $checkCourse->get_result();
    
    if ($course_res->num_rows === 0) {
        $stmt = $conn->prepare("INSERT INTO COURSE (course_title, course_description, category, price, teacher_id, duration) VALUES (?, 'Learn modern web dev', 'Web', 99.99, ?, 40)");
        $stmt->bind_param("si", $course_title, $teacher_id);
        $stmt->execute();
        $course_id = $conn->insert_id;
        echo "Created Course (ID: $course_id)<br>";
    } else {
        $course_id = $course_res->fetch_assoc()['course_id'];
        echo "Course already exists (ID: $course_id)<br>";
    }
    
    // 4. Enroll Students
    foreach ($student_ids as $sid) {
        $checkEnroll = $conn->prepare("SELECT enrollment_id FROM ENROLLMENT WHERE student_id = ? AND course_id = ?");
        $checkEnroll->bind_param("ii", $sid, $course_id);
        $checkEnroll->execute();
        if ($checkEnroll->get_result()->num_rows === 0) {
            $stmt = $conn->prepare("INSERT INTO ENROLLMENT (student_id, course_id, progress_percentage, videos_watched, is_active) VALUES (?, ?, 0, 0, 1)");
            $stmt->bind_param("ii", $sid, $course_id);
            $stmt->execute();
            echo "Enrolled Student ID: $sid in Course<br>";
        }
    }
    
    // 5. Add Videos (course instances)
    $videos = [
        ['Course welcome', 'uploads/videos/welcome.mp4'],
        ['Setup', 'uploads/videos/setup.mp4'],
        ['HTML basics', 'uploads/videos/html.mp4'],
        ['CSS selectors', 'uploads/videos/css.mp4'],
        ['JavaScript', 'uploads/videos/js.mp4']
    ];
    
    $video_ids = [];
    foreach ($videos as $v) {
        $checkVideo = $conn->prepare("SELECT video_id FROM VIDEO WHERE course_id = ? AND video_title = ?");
        $checkVideo->bind_param("is", $course_id, $v[0]);
        $checkVideo->execute();
        $v_res = $checkVideo->get_result();
        if ($v_res->num_rows === 0) {
            $stmt = $conn->prepare("INSERT INTO VIDEO (course_id, video_title, video_url) VALUES (?, ?, ?)");
            $stmt->bind_param("iss", $course_id, $v[0], $v[1]);
            $stmt->execute();
            $vid = $conn->insert_id;
            echo "Added Video: {$v[0]}<br>";
        } else {
            $vid = $v_res->fetch_assoc()['video_id'];
        }
        $video_ids[] = $vid;
    }
    
    // 6. Add Assignments (course instances)
    $assignments = [
        ['A1 · HTML structure', 100, 'uploads/assignments/a1.pdf'],
        ['A2 · Responsive layout', 100, 'uploads/assignments/a2.pdf'],
        ['A3 · JavaScript basics', 100, 'uploads/assignments/a3.pdf']
    ];
    
    $assignment_ids = [];
    foreach ($assignments as $a) {
        $checkAssign = $conn->prepare("SELECT assignment_id FROM ASSIGNMENT WHERE course_id = ? AND assignment_title = ?");
        $checkAssign->bind_param("is", $course_id, $a[0]);
        $checkAssign->execute();
        $a_res = $checkAssign->get_result();
        if ($a_res->num_rows === 0) {
            $stmt = $conn->prepare("INSERT INTO ASSIGNMENT (course_id, assignment_title, max_score, assignment_url) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("isis", $course_id, $a[0], $a[1], $a[2]);
            $stmt->execute();
            $aid = $conn->insert_id;
            echo "Added Assignment: {$a[0]}<br>";
        } else {
            $aid = $a_res->fetch_assoc()['assignment_id'];
        }
        $assignment_ids[] = $aid;
    }
    
    // 7. VIDEO_WATCH + ENROLLMENT stats for Student 2: 3/5 videos (stepper: 3 completed, 2 not_yet)
    for ($i = 0; $i < 3; $i++) {
        $vid = (int)$video_ids[$i];
        $checkVw = $conn->prepare("SELECT 1 FROM VIDEO_WATCH WHERE student_id = ? AND video_id = ?");
        $checkVw->bind_param("ii", $student_id, $vid);
        $checkVw->execute();
        if ($checkVw->get_result()->num_rows > 0) {
            $conn->query("UPDATE VIDEO_WATCH SET is_watched = 1, is_current = 0 WHERE student_id = $student_id AND video_id = $vid");
        } else {
            $ins = $conn->prepare("INSERT INTO VIDEO_WATCH (student_id, video_id, is_watched, is_current) VALUES (?, ?, 1, 0)");
            $ins->bind_param("ii", $student_id, $vid);
            $ins->execute();
            $ins->close();
        }
        $checkVw->close();
    }
    $enrollUpdate = "UPDATE ENROLLMENT SET progress_percentage = 60.0, videos_watched = 3 WHERE student_id = ? AND course_id = ?";
    $st = $conn->prepare($enrollUpdate);
    if ($st) {
        $st->bind_param("ii", $student_id, $course_id);
        $st->execute();
        $st->close();
    }
    // Update assignments_completed if column exists (used by get_teacher_progress)
    @$conn->query("UPDATE ENROLLMENT SET assignments_completed = 1 WHERE student_id = $student_id AND course_id = $course_id");
    
    // 8. VIDEO_WATCH + ENROLLMENT stats for Student 3: 1/5 videos
    $vid0 = (int)$video_ids[0];
    $checkVw3 = $conn->prepare("SELECT 1 FROM VIDEO_WATCH WHERE student_id = ? AND video_id = ?");
    $checkVw3->bind_param("ii", $student3_id, $vid0);
    $checkVw3->execute();
    if ($checkVw3->get_result()->num_rows > 0) {
        $conn->query("UPDATE VIDEO_WATCH SET is_watched = 1, is_current = 0 WHERE student_id = $student3_id AND video_id = $vid0");
    } else {
        $ins3 = $conn->prepare("INSERT INTO VIDEO_WATCH (student_id, video_id, is_watched, is_current) VALUES (?, ?, 1, 0)");
        $ins3->bind_param("ii", $student3_id, $vid0);
        $ins3->execute();
        $ins3->close();
    }
    $checkVw3->close();
    $st3 = $conn->prepare("UPDATE ENROLLMENT SET progress_percentage = 20.0, videos_watched = 1 WHERE student_id = ? AND course_id = ?");
    if ($st3) {
        $st3->bind_param("ii", $student3_id, $course_id);
        $st3->execute();
        $st3->close();
    }
    
    // 9. ASSIGNMENT_SUBMISSION for Student 2: A1 graded (85), A2 submitted (pending), A3 not submitted
    upsertSubmission($conn, $student_id, $assignment_ids[0], '/uploads/assignments/s2_a1.pdf', 85.0, 'marked');
    upsertSubmission($conn, $student_id, $assignment_ids[1], '/uploads/assignments/s2_a2.pdf', 0.0, 'submitted');
    echo "Student 2: A1 graded 85/100, A2 submitted (pending grading), A3 not submitted<br>";
    
    // Create uploads/submissions dir for submission file paths (optional - paths may still 404)
    $subDir = dirname(__DIR__, 2) . '/uploads/submissions';
    if (!is_dir($subDir)) {
        @mkdir($subDir, 0777, true);
        echo "Created uploads/submissions directory<br>";
    }

    echo "<h3>Setup Complete!</h3>";
    echo "<strong>Course:</strong> $course_title (ID: $course_id)<br>";
    echo "<strong>Videos:</strong> 5 | <strong>Assignments:</strong> 3<br>";
    echo "<strong>Student 2</strong> (student_v2@test.com): 60% progress, 3/5 videos watched, A1 graded 85, A2 submitted, A3 not done<br>";
    echo "<strong>Student 3</strong> (student_v3@test.com): 20% progress, 1/5 videos watched, no submissions<br>";
    echo "<strong>Teacher:</strong> teacher_v2@test.com / TestPass123!<br>";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

$conn->close();
?>
