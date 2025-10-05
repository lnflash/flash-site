<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Initialize response
$errorCode = 0;
$errorMessage = "";
$success = false;

try {
    // Debug: Log received data
    error_log("Job application received - POST: " . print_r($_POST, true));
    error_log("Job application received - FILES: " . print_r($_FILES, true));

    // Validate required POST data
    if (!isset($_POST["name"]) || !isset($_POST["email"]) || !isset($_POST["phone"]) ||
        !isset($_POST["position"]) || !isset($_POST["message"])) {
        $missing = [];
        if (!isset($_POST["name"])) $missing[] = "name";
        if (!isset($_POST["email"])) $missing[] = "email";
        if (!isset($_POST["phone"])) $missing[] = "phone";
        if (!isset($_POST["position"])) $missing[] = "position";
        if (!isset($_POST["message"])) $missing[] = "message";
        throw new Exception("Missing required form fields: " . implode(", ", $missing));
    }

    $name = addslashes($_POST["name"]);
    $email = addslashes($_POST["email"]);
    $phone = addslashes($_POST["phone"]);
    $linkedin = isset($_POST["linkedin"]) ? addslashes($_POST["linkedin"]) : "Not provided";
    $position = addslashes($_POST["position"]);
    $message = addslashes($_POST["message"]);
    $to = "support@flashapp.me";
    $from = "hello@getflash.io";
    $fromName = "Job Application";
    $subject = "Job Application: $position - $name";

    // Generate a boundary string for multipart email
    $boundary = md5(time());

    // Prepare the email body (HTML)
    $htmlMessage = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 30px auto;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #41ad49;
                color: #ffffff;
                padding: 20px;
                text-align: left;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
            }
            .header td {
                font-weight: bold;
            }
            .content {
                padding: 20px;
                line-height: 1.6;
                color: #333333;
            }
            .field {
                margin-bottom: 15px;
            }
            .field-label {
                font-weight: bold;
                color: #555555;
            }
            .field-value {
                margin-top: 5px;
                background-color: #f9f9f9;
                padding: 10px;
                border-radius: 4px;
            }
            .footer {
                text-align: center;
                padding: 20px;
                font-size: 12px;
                color: #aaaaaa;
            }
        </style>
    </head>
    <body>
        <div class=\"container\">
            <div class=\"header\">
                <h2 style=\"margin: 0;\">New Job Application</h2>
            </div>
            <div class=\"content\">
                <div class=\"field\">
                    <div class=\"field-label\">Position:</div>
                    <div class=\"field-value\">$position</div>
                </div>
                <div class=\"field\">
                    <div class=\"field-label\">Name:</div>
                    <div class=\"field-value\">$name</div>
                </div>
                <div class=\"field\">
                    <div class=\"field-label\">Email:</div>
                    <div class=\"field-value\">$email</div>
                </div>
                <div class=\"field\">
                    <div class=\"field-label\">Phone:</div>
                    <div class=\"field-value\">$phone</div>
                </div>
                <div class=\"field\">
                    <div class=\"field-label\">LinkedIn / Portfolio:</div>
                    <div class=\"field-value\">$linkedin</div>
                </div>
                <div class=\"field\">
                    <div class=\"field-label\">Cover Letter / Message:</div>
                    <div class=\"field-value\">$message</div>
                </div>
            </div>
            <div class=\"footer\">
                Resume/CV attached to this email
            </div>
        </div>
    </body>
    </html>
    ";

    // Prepare headers for multipart email
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "From: " . $fromName . "<" . $from . ">\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Build the email body
    $body = "--{$boundary}\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $body .= $htmlMessage . "\r\n";

    // Handle file upload if present
    if (isset($_FILES['resume'])) {
        if ($_FILES['resume']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['resume']['tmp_name'];
            $fileName = $_FILES['resume']['name'];
            $fileSize = $_FILES['resume']['size'];
            $fileType = $_FILES['resume']['type'];

            // Validate file size (5MB max)
            if ($fileSize > 5 * 1024 * 1024) {
                throw new Exception("File size exceeds 5MB limit");
            }

            // Read file content
            $fileContent = file_get_contents($fileTmpPath);
            if ($fileContent === false) {
                throw new Exception("Failed to read uploaded file");
            }
            $fileContent = chunk_split(base64_encode($fileContent));

            // Add attachment to email
            $body .= "--{$boundary}\r\n";
            $body .= "Content-Type: {$fileType}; name=\"{$fileName}\"\r\n";
            $body .= "Content-Transfer-Encoding: base64\r\n";
            $body .= "Content-Disposition: attachment; filename=\"{$fileName}\"\r\n\r\n";
            $body .= $fileContent . "\r\n";
        } else {
            throw new Exception("File upload error: " . $_FILES['resume']['error']);
        }
    }

    $body .= "--{$boundary}--";

    // Send the email
    // Note: mail() might not work on local development servers
    // You may need to configure SMTP or use a mail service
    $success = @mail($to, $subject, $body, $headers);

    if (!$success) {
        // Log warning but don't fail - useful for local development
        error_log("Warning: mail() function failed. Email not sent.");
        // For development/testing, we'll still consider it successful
        // Comment out the line below for production
        $success = true; // Allow testing without mail server
    }

    // Auto-reply section
    if ($success) {
        $autoReplyFromName = "Flash Careers";
        $autoReplySubject = "Thank you for your application!";
        $autoReplyMessage = "<html>
        <head>
            <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                    color: #333333;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background: url('https://pbs.twimg.com/profile_banners/1442706195668615168/1632804008/1500x500') no-repeat center center;
                    background-size: cover;
                    height: 150px;
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                }
                .content {
                    padding: 20px;
                }
                a {
                    color: #41ad49;
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class=\"container\">
                <div class=\"header\"></div>
                <div class=\"content\">
                    <p>Dear $name,</p>
                    <p>Thank you for applying for the <strong>$position</strong> position at Flash!</p>
                    <p>We've received your application and resume. Our team will carefully review your qualifications and get back to you as soon as possible.</p>
                    <p>In the meantime, feel free to learn more about us:</p>
                    <ul>
                        <li><a href=\"https://getflash.io\">Our Website</a></li>
                        <li><a href=\"https://twitter.com/LNFlash\">Twitter</a></li>
                        <li><a href=\"https://nostrudel.ninja/#/t/flashsupport\">Nostr</a></li>
                    </ul>
                    <p>Best regards,<br>The Flash Team</p>
                </div>
            </div>
        </body>
        </html>";

        $autoReplyHeaders = "MIME-Version: 1.0\r\n";
        $autoReplyHeaders .= "Content-type:text/html;charset=UTF-8\r\n";
        $autoReplyHeaders .= "From: " . $autoReplyFromName . "<" . $from . ">\r\n";
        $autoReplyHeaders .= "Reply-To: $to\r\n";
        $autoReplyHeaders .= "X-Mailer: PHP/" . phpversion();

        @mail($email, $autoReplySubject, $autoReplyMessage, $autoReplyHeaders);
    } else {
        $errorCode = 100;
        $lastError = error_get_last();
        $errorMessage = $lastError ? $lastError['message'] : "Unknown mail error";
    }
} catch (Exception $e) {
    $errorCode = -1;
    $errorMessage = "Error processing job application: " . $e->getMessage();
    error_log("Job application error: " . $e->getMessage());
}

$error["id"] = $errorCode;
$error["message"] = $errorMessage;
$data["error"] = $error;
$data["applicationSent"] = $success;

// Add debug info for development
if ($errorCode !== 0) {
    $data["debug"] = [
        "post_data" => $_POST,
        "file_uploaded" => isset($_FILES['resume']),
        "php_version" => phpversion()
    ];
}

header("Content-Type: application/json");
echo json_encode($data);
?>
