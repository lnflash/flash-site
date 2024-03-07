<?php
$email = $_POST["email"];
$email = addslashes($email);

$errorCode = 0;
$errorMessage = "";

try {
    $to = "joindiline@lnflash.me";
    $from = "hello@getflash.io";
    $fromName = "Waitlist Request";
    $subject = "Waitlist Addition";
    $message = "
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
                background-color: #4caf50;
                color: #ffffff;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
                padding: 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 20px;
                line-height: 1.6;
                color: #333333;
            }
            .content td {
                padding: 10px 0;
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
                <h1>Waitlist Addition Request</h1>
            </div>
            <div class=\"content\">
                <table role=\"presentation\" style=\"width: 100%; border-collapse: collapse;\">
                    <tr>
                        <td style=\"font-weight: bold;\">Email:</td>
                        <td>$email</td>
                    </tr>
                </table>
            </div>
            <div class=\"footer\">
                TODO: Add to Mailing List
            </div>
        </div>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

    $headers .= "From: " . $fromName . "<hello@getflash.io>" . "\r\n" .
        "Reply-To: hello@getflash.io" . "\r\n" .
        "X-Mailer: PHP/" . phpversion();
    $success = mail($to, $subject, $message, $headers);

    // Auto-reply section
    if ($success) {
        $autoReplyFromName = "Flash";
        $autoReplySubject = "Thank you joining our waitlist and newsletter!";
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
                color: #1a73e8;
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
                <p>Greetings!</p>
                <p>Thank you for joining our waitlist. We are so excited to show you what we have in store for you! Look out for NEWSFLASH, our quarterly newsletter, and you can also reach us on the <a href=\"https://twitter.com/LNFlash\">Twitter</a> or the <a href=\"https://nostrudel.ninja/#/t/flashsupport\">Nostr</a> if you have any questions or comments.</p>
                <p>- One Love.</p>
                <p><a href=\"https://getflash.io\">getflash.io</a></p>
            </div>
        </div>
    </body>
    </html>";

        $autoReplyHeaders = "MIME-Version: 1.0" . "\r\n";
        $autoReplyHeaders .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $autoReplyHeaders .= "From: " . $autoReplyFromName . "<hello@getflash.io>" . "\r\n" .
            "Reply-To: $to" . "\r\n" .
            "X-Mailer: PHP/" . phpversion();

        mail($email, $autoReplySubject, $autoReplyMessage, $autoReplyHeaders);
    } else {
        $errorCode = 100;
        $errorMessage = error_get_last()['message'];
    }
} catch (PDOException $e) {
    $this->errorCode = 1;
    $errorCode = -1;
    $errorMessage = "PDOException for sendMsg.";
}

$error["id"] = $errorCode;
$error["message"] = $errorMessage;
$data["error"] = $error;
$data["msgSent"] = $success;
$data = json_encode($data);

header("Content-Type: application/json");

echo $data;
