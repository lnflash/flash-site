<?php
$username = $_POST["username"];
$username = addslashes($username);
$email = $_POST["email"];
$email = addslashes($email);
$q1 = $_POST["q1"];
$q1 = addslashes($q1);
$q2 = $_POST["q2"];
$q2 = addslashes($q2);
$q3 = $_POST["q3"];
$q3 = addslashes($q3);

$errorCode = 0;
$errorMessage = "";

try {
    $to = "fake-kotc@islandbitcoin.com";
    $from = "hello@getflash.io";
    $fromName = "Fake KOTC Registration";
    $subject = "[FAKE KOTC] Registration Attempt: $username";
    $message = "
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
                background-color: #D12229;
                color: #ffffff;
                padding: 20px;
                text-align: center;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
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
                <h2 style=\"margin: 0;\">🏴‍☠️ Fake KOTC Registration Attempt 🏴‍☠️</h2>
            </div>
            <div class=\"content\">
                <div class=\"field\">
                    <div class=\"field-label\">Hunter Name:</div>
                    <div class=\"field-value\">$username</div>
                </div>
                <div class=\"field\">
                    <div class=\"field-label\">Email:</div>
                    <div class=\"field-value\">$email</div>
                </div>
                <div class=\"field\">
                    <div class=\"field-label\">Q1: When was Bitcoin whitepaper published?</div>
                    <div class=\"field-value\">$q1</div>
                </div>
                <div class=\"field\">
                    <div class=\"field-label\">Q2: Maximum supply of Bitcoin?</div>
                    <div class=\"field-value\">$q2</div>
                </div>
                <div class=\"field\">
                    <div class=\"field-label\">Q3: First real-world Bitcoin transaction?</div>
                    <div class=\"field-value\">$q3</div>
                </div>
            </div>
            <div class=\"footer\">
                This hunter tried to register on the fake page! 😂
            </div>
        </div>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

    $headers .= "From: " . $fromName . "<" . $from . ">" . "\r\n" .
        "Reply-To: " . $email . "\r\n" .
        "X-Mailer: PHP/" . phpversion();
    $success = mail($to, $subject, $message, $headers);

    if (!$success) {
        $errorCode = 100;
        $errorMessage = error_get_last()['message'];
    }
} catch (PDOException $e) {
    $errorCode = -1;
    $errorMessage = "Error sending fake KOTC registration.";
}

$error["id"] = $errorCode;
$error["message"] = $errorMessage;
$data["error"] = $error;
$data["registrationSent"] = $success;
$data = json_encode($data);

header("Content-Type: application/json");

echo $data;
?>
