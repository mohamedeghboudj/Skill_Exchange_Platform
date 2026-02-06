<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// 1. Check login
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

$teacher_id = $_SESSION['user_id'];

require_once '../config/db.php';

// 2. Verify teacher
$stmt = $conn->prepare("SELECT is_teacher FROM USER WHERE user_id=?");
$stmt->bind_param("i",$teacher_id);
$stmt->execute();
$stmt->bind_result($is_teacher);
$stmt->fetch();
$stmt->close();
if (!$is_teacher) {
    http_response_code(403);
    echo json_encode(['success'=>false,'error'=>'Only teachers can create courses']);
    exit;
}

// 3. Validate required fields
$fields = ['course_title','duration','price','course_description','category'];
foreach($fields as $f){
    if(empty($_POST[$f])){
        http_response_code(400);
        echo json_encode(['success'=>false,'error'=>"Missing field: $f"]);
        exit;
    }
}

// 4. Type validation
$duration = (int)$_POST['duration'];
$price = (float)$_POST['price'];
if($duration<=0 || $price<0){
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>"Invalid duration or price"]);
    exit;
}

try {
    $conn->begin_transaction();

    // 5. Insert course
    $stmt = $conn->prepare("INSERT INTO COURSE (course_title,duration,price,teacher_id,course_description,category,rating,enrolled_count) VALUES (?,?,?,?,?,?,0,0)");
    $stmt->bind_param("sidiss", $_POST['course_title'],$duration,$price,$teacher_id,$_POST['course_description'],$_POST['category']);
    if(!$stmt->execute()) throw new Exception($stmt->error);
    $course_id = $conn->insert_id;
    $stmt->close();

    // 6. Handle videos
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

    // 7. Handle assignments
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
    echo json_encode(['success'=>true,'course_id'=>$course_id,'video_ids'=>$video_ids,'assignment_ids'=>$assignment_ids]);

} catch(Exception $e){
    if(isset($conn)) $conn->rollback();
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
}
$conn->close();
