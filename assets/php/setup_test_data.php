<?php
require_once 'db.php';

echo "<h2>Setting up Test Data...</h2>";

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
        // Force update password to ensure it matches
        $updateStmt = $conn->prepare("UPDATE USER SET password_hash = ? WHERE user_id = ?");
        $updateStmt->bind_param("si", $password, $teacher_id);
        $updateStmt->execute();
        echo "Teacher already exists (ID: $teacher_id) - Password Updated<br>";
    }
    
    // 2. Create Student
    $student_email = 'student_v2@test.com';
    $checkStudent = $conn->prepare("SELECT user_id FROM USER WHERE email = ?");
    $checkStudent->bind_param("s", $student_email);
    $checkStudent->execute();
    $student_res = $checkStudent->get_result();
    
    if ($student_res->num_rows === 0) {
        $stmt = $conn->prepare("INSERT INTO USER (full_name, email, password_hash, is_teacher) VALUES ('Test Student', ?, ?, 0)");
        $stmt->bind_param("ss", $student_email, $password);
        $stmt->execute();
        $student_id = $conn->insert_id;
        echo "Created Student (ID: $student_id)<br>";
    } else {
        $student_id = $student_res->fetch_assoc()['user_id'];
        // Force update password to ensure it matches
        $updateStmt = $conn->prepare("UPDATE USER SET password_hash = ? WHERE user_id = ?");
        $updateStmt->bind_param("si", $password, $student_id);
        $updateStmt->execute();
        echo "Student already exists (ID: $student_id) - Password Updated<br>";
    }
    
    // 3. Create Course
    $course_title = 'Full-Stack Web Development';
    $checkCourse = $conn->prepare("SELECT course_id FROM COURSE WHERE course_title = ?");
    $checkCourse->bind_param("s", $course_title);
    $checkCourse->execute();
    $course_res = $checkCourse->get_result();
    
    if ($course_res->num_rows === 0) {
        $stmt = $conn->prepare("INSERT INTO COURSE (course_title, course_description, category, price, teacher_id) VALUES (?, 'Learn modern web dev', 'Web', 99.99, ?)");
        $stmt->bind_param("si", $course_title, $teacher_id);
        $stmt->execute();
        $course_id = $conn->insert_id;
        echo "Created Course (ID: $course_id)<br>";
    } else {
        $course_id = $course_res->fetch_assoc()['course_id'];
        echo "Course already exists (ID: $course_id)<br>";
    }
    
    // 4. Enroll Student
    $checkEnroll = $conn->prepare("SELECT enrollment_id FROM ENROLLMENT WHERE student_id = ? AND course_id = ?");
    $checkEnroll->bind_param("ii", $student_id, $course_id);
    $checkEnroll->execute();
    if ($checkEnroll->get_result()->num_rows === 0) {
        $stmt = $conn->prepare("INSERT INTO ENROLLMENT (student_id, course_id, progress_percentage, videos_watched, is_active) VALUES (?, ?, 0, 0, 1)");
        $stmt->bind_param("ii", $student_id, $course_id);
        $stmt->execute();
        echo "Enrolled Student in Course<br>";
    } else {
        echo "Student already enrolled<br>";
    }
    
    // 5. Add Videos
    $videos = [
        ['Course welcome', 1],
        ['Setup', 2],
        ['HTML basics', 3],
        ['CSS selectors', 4],
        ['JavaScript', 5]
    ];
    
    foreach ($videos as $v) {
        $checkVideo = $conn->prepare("SELECT video_id FROM VIDEO WHERE course_id = ? AND title = ?");
        $checkVideo->bind_param("is", $course_id, $v[0]);
        $checkVideo->execute();
        $video_res = $checkVideo->get_result();
        if ($video_res->num_rows === 0) {
            $stmt = $conn->prepare("INSERT INTO VIDEO (course_id, title, sequence_number, duration) VALUES (?, ?, ?, '10:00')");
            $stmt->bind_param("isi", $course_id, $v[0], $v[1]);
            $stmt->execute();
            $curr_video_id = $conn->insert_id;
            echo "Added Video: {$v[0]}<br>";
        } else {
            $curr_video_id = $video_res->fetch_assoc()['video_id'];
        }
        
        // Mark first video as current/watched to test progress
        if ($v[1] === 1) {
             $checkWatch = $conn->prepare("SELECT video_id FROM VIDEO_WATCH WHERE student_id = ? AND video_id = ?");
             $checkWatch->bind_param("ii", $student_id, $curr_video_id);
             $checkWatch->execute();
             if ($checkWatch->get_result()->num_rows === 0) {
                 $stmt = $conn->prepare("INSERT INTO VIDEO_WATCH (student_id, video_id, is_watched, is_current) VALUES (?, ?, 1, 0)");
                 $stmt->bind_param("ii", $student_id, $curr_video_id);
                 $stmt->execute();
                 echo "Marked first video as watched<br>";
             }
        }
    }
    
    // 6. Add Assignments
    $assignments = [
        ['A1 · HTML structure', 100, 1],
        ['A2 · Responsive layout', 100, 2],
        ['A3 · JavaScript basics', 100, 3]
    ];
    
    foreach ($assignments as $a) {
        $checkAssign = $conn->prepare("SELECT assignment_id FROM ASSIGNMENT WHERE course_id = ? AND assignment_title = ?");
        $checkAssign->bind_param("is", $course_id, $a[0]);
        $checkAssign->execute();
        if ($checkAssign->get_result()->num_rows === 0) {
            $stmt = $conn->prepare("INSERT INTO ASSIGNMENT (course_id, assignment_title, max_score, sequence_number) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("isii", $course_id, $a[0], $a[1], $a[2]);
            $stmt->execute();
            echo "Added Assignment: {$a[0]}<br>";
        }
    }
    
    echo "<h3>Setup Complete!</h3>";
    echo "You can now login with:<br>";
    echo "Student: student_v2@test.com / TestPass123!<br>";
    echo "Teacher: teacher_v2@test.com / TestPass123!<br>";
    echo "Course ID: $course_id";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

$conn->close();
?>
