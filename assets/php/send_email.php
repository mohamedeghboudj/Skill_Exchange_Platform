<?php
// Disable error reporting for valid JSON output
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Check if message exists
    if (!isset($_POST["message"]) || empty(trim($_POST["message"]))) {
        echo json_encode(["success" => false, "message" => "Message cannot be empty."]);
        exit;
    }

    $message = htmlspecialchars($_POST["message"]);
    $to = "meelo9307@gmail.com"; 
    $subject = "New message from LearnLand website";
    // Use a clean from header
    $headers = "From: noreply@learnland.com" . "\r\n" .
               "Reply-To: noreply@learnland.com" . "\r\n" .
               "X-Mailer: PHP/" . phpversion();

    try {
        // Suppress warnings with @ because localhost mail() usually fails and prints HTML warnings
        if (@mail($to, $subject, $message, $headers)) {
            echo json_encode(["success" => true, "message" => "Message sent!"]);
        } else {
            // Get the last error if possible
            $error = error_get_last();
            $errorMsg = $error ? $error['message'] : "Unknown error";
            
            echo json_encode([
                "success" => false, 
                "message" => "Failed to send message.",
                "debug_error" => "Localhost/Server Error: $errorMsg"
            ]);
        }
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>
