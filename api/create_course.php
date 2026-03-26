<?php
session_start();
require_once '../config/api_helpers.php';
require_once '../config/db.php';

// Set CORS headers
setCorsHeaders();
setJsonHeader();

// Check authentication
$teacher_id = requireAuth();

// Verify teacher status
requireTeacher($conn, $teacher_id);

// Validate required fields
validateRequiredFields(['course_title','duration','price','course_description','category']);

// Type validation
$duration = (int)$_POST['duration'];
$price = (float)$_POST['price'];
if($duration<=0 || $price<0){
    sendError("Invalid duration or price", 400);
}

try {
    $conn->begin_transaction();

    // Insert course
    $stmt = $conn->prepare("INSERT INTO COURSE (course_title,duration,price,teacher_id,course_description,category,rating,enrolled_count) VALUES (?,?,?,?,?,?,0,0)");
    $stmt->bind_param("sidiss", $_POST['course_title'],$duration,$price,$teacher_id,$_POST['course_description'],$_POST['category']);
    if(!$stmt->execute()) throw new Exception($stmt->error);
    $course_id = $conn->insert_id;
    $stmt->close();

    //  Handle videos
    $video_ids = [];
    if(isset($_FILES['videos'])){
        $upload_dir = '../uploads/videos/';
        if(!file_exists($upload_dir)) mkdir($upload_dir,0777,true);

        $videoStmt = $conn->prepare("INSERT INTO VIDEO (course_id,video_title,video_url) VALUES (?,?,?)");

        $count = count($_FILES['videos']['name']);
        for($i=0;$i<$count;$i++){
            if($_FILES['videos']['error'][$i]===UPLOAD_ERR_OK){
                $file = $_FILES['videos']['tmp_name'][$i];
                $original = basename($_FILES['videos']['name'][$i]);
                $safe = preg_replace('/[^a-zA-Z0-9._-]/','_',$original);
                $filename = uniqid().'_'.$safe;
                $path = $upload_dir.$filename;
                if(move_uploaded_file($file,$path)){
                    $title = pathinfo($original, PATHINFO_FILENAME);
                    $url = '/uploads/videos/'.$filename;
                    $videoStmt->bind_param("iss",$course_id,$title,$url);
                    if($videoStmt->execute()) $video_ids[]=$conn->insert_id;
                }
            }
        }
        $videoStmt->close();
    }

    // Handle assignments
    $assignment_ids = [];
    if(isset($_FILES['assignments'])){
        $upload_dir = '../uploads/assignments/';
        if(!file_exists($upload_dir)) mkdir($upload_dir,0777,true);

        $assignStmt = $conn->prepare("INSERT INTO ASSIGNMENT (course_id,assignment_title,assignment_url,assignment_status) VALUES (?,?,?,'pending')");

        $count = count($_FILES['assignments']['name']);
        for($i=0;$i<$count;$i++){
            if($_FILES['assignments']['error'][$i]===UPLOAD_ERR_OK){
                $file = $_FILES['assignments']['tmp_name'][$i];
                $original = basename($_FILES['assignments']['name'][$i]);
                $safe = preg_replace('/[^a-zA-Z0-9._-]/','_',$original);
                $filename = uniqid().'_'.$safe;
                $path = $upload_dir.$filename;
                if(move_uploaded_file($file,$path)){
                    $title = pathinfo($original, PATHINFO_FILENAME);
                    $url = '/uploads/assignments/'.$filename;
                    $assignStmt->bind_param("iss",$course_id,$title,$url);
                    if($assignStmt->execute()) $assignment_ids[] = $conn->insert_id;
                }
            }
        }
        $assignStmt->close();
    }

    $conn->commit();
    $conn->close();
    sendSuccess([
        'course_id' => $course_id,
        'video_ids' => $video_ids,
        'assignment_ids' => $assignment_ids
    ], 'Course created successfully', 201);

} catch(Exception $e){
    if(isset($conn)) {
        $conn->rollback();
        $conn->close();
    }
    logError($e->getMessage(), 'create_course.php');
    sendError('Failed to create course', 500);
}
