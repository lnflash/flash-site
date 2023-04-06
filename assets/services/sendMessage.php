<?php
  $name = $_POST["user"];
  $name = addslashes($name);
  $email = $_POST["email"];
  $email = addslashes($email);
  $msg = $_POST["msg"];
  $msg = addslashes($msg);

  $errorCode = 0;
  $errorMessage = "";

  try {
    $to = "contact@joellejohnson.com";
    $from = "$email";
    $fromName = "$name";
    $subject = "Message from $name";
    $message = "
      <html>
      <head>
      <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />
      </head>
      <body>
        <table role=\"presentation\">
          <tr style=\"font-weight: 700; padding:20px 0;\">
            <td>From:</td>
            <td>$name</td>
          </tr>
          <tr style=\"font-weight: 700; padding:20px 0;\">
            <td>Email:</td>
            <td>$email</td>
          </tr>
          <tr>
            <td>$msg</td>
          </tr>
        </table>
      </body>
      </html>";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n"; 
  
    $headers .= "From: " .$name."<".$email.">" . "\r\n" .
    "Reply-To: $email" . "\r\n" .
    "X-Mailer: PHP/" . phpversion();
    $success = mail($to, $subject, $message, $headers, "-fnoreply@joellejohnson.com");
    if (!$sucess) {
      $errorCode = 100;
      $errorMessage = error_get_last()['message'];
    }

  } catch(PDOException $e) {
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
?>