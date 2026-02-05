<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
require_once '../config/db.php';

if (ob_get_level()) ob_end_clean();
//Clears any buffered output. This ensures no extra whitespace or output breaks JSON response.


if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json', true, 401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json', true, 405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$user_id = $_SESSION['user_id'];


$json_data = file_get_contents('php://input'); // reads the body of the http request
$data = json_decode($json_data, true);// converts json intp php associative array 


if (!$data) {
    header('Content-Type: application/json', true, 400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

try {
    
    $full_name = isset($data['full_name']) ? trim($data['full_name']) : '';
    $age = isset($data['age']) ? intval($data['age']) : 0;
    $skill = isset($data['skill']) ? trim($data['skill']) : '';
    $bio = isset($data['bio']) ? trim($data['bio']) : '';
    // HADIL REMOVED: User cannot set is_teacher through profile update
    // $is_teacher = isset($data['is_teacher']) ? intval($data['is_teacher']) : 0;
    $whatsapp_link = isset($data['whatsapp_link']) ? trim($data['whatsapp_link']) : '';
    $linkedIn_link = isset($data['linkedIn_link']) ? trim($data['linkedIn_link']) : '';
    $insta_link = isset($data['insta_link']) ? trim($data['insta_link']) : '';
    $profile_picture = isset($data['profile_picture']) ? trim($data['profile_picture']) : '';

    
    if (empty($full_name)) {
        throw new Exception('Full name is required');
    }
    
    if ($age <= 0) {
        throw new Exception('Valid age is required');
    }

    if (empty($skill)) {
        throw new Exception('Skill is required');
    }

    if (empty($bio)) {
        throw new Exception('Bio is required');
    }

    // ============================================================
    // HADIL ADDED: Get current teacher status from database
    // Teacher mode can ONLY be changed through admin approval system
    // ============================================================
    $check_sql = "SELECT is_teacher FROM USER WHERE user_id = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    mysqli_stmt_bind_param($check_stmt, "i", $user_id);
    mysqli_stmt_execute($check_stmt);
    mysqli_stmt_bind_result($check_stmt, $is_teacher);
    mysqli_stmt_fetch($check_stmt);
    mysqli_stmt_close($check_stmt);

    // Use the current value from database, ignoring any user input
    // This prevents users from manually activating teacher mode
    // ============================================================
    // END OF HADIL'S ADDITION
    // ============================================================

    // REMOVED: Check and delete certificates when disabling teacher mode
    // Users cannot disable teacher mode through profile update
    /*
    // If changing from teacher (1) to student (0), delete all certificates
    if ($current_is_teacher == 1 && $is_teacher == 0) {
        // Get all certificate URLs to delete files
        $cert_sql = "SELECT certificate_url FROM CERTIFICATE WHERE teacher_id = ?";
        $cert_stmt = mysqli_prepare($conn, $cert_sql);
        mysqli_stmt_bind_param($cert_stmt, "i", $user_id);
        mysqli_stmt_execute($cert_stmt);
        $cert_result = mysqli_stmt_get_result($cert_stmt);
        
        $certificate_urls = [];
        while ($row = mysqli_fetch_assoc($cert_result)) {
            $certificate_urls[] = $row['certificate_url'];
        }
        mysqli_stmt_close($cert_stmt);

        // Delete all certificates from database
        $delete_cert_sql = "DELETE FROM CERTIFICATE WHERE teacher_id = ?";
        $delete_cert_stmt = mysqli_prepare($conn, $delete_cert_sql);
        mysqli_stmt_bind_param($delete_cert_stmt, "i", $user_id);
        mysqli_stmt_execute($delete_cert_stmt);
        mysqli_stmt_close($delete_cert_stmt);

        // Delete certificate files from server
        foreach ($certificate_urls as $cert_url) {
            $file_path = '../' . $cert_url;
            if (file_exists($file_path)) {
                @unlink($file_path);
            }
        }
    }
    */

    
    // teacher mode - validate social links only if user is already a teacher
    if ($is_teacher == 1) {
        if (empty($whatsapp_link) || !filter_var($whatsapp_link, FILTER_VALIDATE_URL)) {
            throw new Exception('Valid WhatsApp link is required for teachers');
        }
        if (empty($linkedIn_link) || !filter_var($linkedIn_link, FILTER_VALIDATE_URL)) {
            throw new Exception('Valid LinkedIn link is required for teachers');
        }
        if (empty($insta_link) || !filter_var($insta_link, FILTER_VALIDATE_URL)) {
            throw new Exception('Valid Instagram link is required for teachers');
        }
    } else {
        // not teacher mode - clear social links
        $whatsapp_link = '';
        $linkedIn_link = '';
        $insta_link = '';
    }

    // ============================================================
    // HADIL MODIFIED: Update database WITHOUT changing is_teacher
    // is_teacher field is NOT included in UPDATE - it preserves current value
    // ============================================================
    $sql = "UPDATE USER SET 
                full_name = ?,
                age = ?,
                skill = ?,
                bio = ?,
                whatsapp_link = ?,
                linkedIn_link = ?,
                insta_link = ?";
    
    $params = [$full_name, $age, $skill, $bio, $whatsapp_link, $linkedIn_link, $insta_link];
    $types = "sisssss";
    // Note: is_teacher is NOT in the UPDATE statement
    // ============================================================

    // Add profile picture update if provided
    if (!empty($profile_picture)) {
        $sql .= ", profile_picture = ?";
        $params[] = $profile_picture;
        $types .= "s";
    }

    $sql .= " WHERE user_id = ?";
    $params[] = $user_id;
    $types .= "i";

    $stmt = mysqli_prepare($conn, $sql);

    if (!$stmt) {
        throw new Exception('Query preparation failed: ' . mysqli_error($conn));
    }

    mysqli_stmt_bind_param($stmt, $types, ...$params);
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception('Update failed: ' . mysqli_stmt_error($stmt));
    }

    $affected_rows = mysqli_stmt_affected_rows($stmt);
    mysqli_stmt_close($stmt);

    // Return success response
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'affected_rows' => $affected_rows,
        'is_teacher' => $is_teacher // Return current teacher status
    ]);

} catch (Exception $e) {
    header('Content-Type: application/json', true, 400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

mysqli_close($conn);
exit;
?>