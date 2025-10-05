<?php
/**
 * Keys of the Caribbean - Registration API
 * Handles hunter registration with Satoshi question validation
 */

define('HUNT_API', true);
require_once 'config.php';

// Set headers
setCorsHeaders();
header('Content-Type: application/json');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

// Validate required fields
$required_fields = ['username', 'email', 'satoshi_date', 'satoshi_topic', 'agree_rules', 'age_confirm'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit;
    }
}

// Get database connection
$pdo = getDbConnection();

// Rate limiting check
$ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (!checkRateLimit($pdo, 'register_attempt', $ip_address, RATE_LIMIT_REGISTER)) {
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'message' => 'Too many registration attempts. Please try again in an hour.'
    ]);
    exit;
}

// Validate username format
$username = trim($data['username']);
if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Username must be 3-20 characters and contain only letters, numbers, and underscores.'
    ]);
    exit;
}

// Validate email format
$email = trim($data['email']);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

// Validate Satoshi date
$satoshi_date = $data['satoshi_date'];
if ($satoshi_date !== SATOSHI_DATE_CORRECT) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Incorrect answer to the Satoshi date question. Bitcoin\'s whitepaper was published on a specific date in October 2008.'
    ]);
    logAudit($pdo, null, 'register_failed_satoshi_date', ['username' => $username, 'answer' => $satoshi_date], $ip_address);
    exit;
}

// Validate Satoshi topic (case-insensitive)
$satoshi_topic = strtolower(trim($data['satoshi_topic']));
$topic_valid = false;

foreach (SATOSHI_TOPIC_ANSWERS as $valid_answer) {
    if ($satoshi_topic === $valid_answer) {
        $topic_valid = true;
        break;
    }
}

if (!$topic_valid) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Incorrect answer to the whitepaper title question. Hint: It\'s about a peer-to-peer electronic cash system.'
    ]);
    logAudit($pdo, null, 'register_failed_satoshi_topic', ['username' => $username, 'answer' => $satoshi_topic], $ip_address);
    exit;
}

// Check if username already exists
try {
    $stmt = $pdo->prepare("SELECT id FROM hunters WHERE username = ?");
    $stmt->execute([$username]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Username already taken. Please choose a different one.'
        ]);
        exit;
    }
} catch (PDOException $e) {
    error_log("Database error checking username: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error. Please try again.']);
    exit;
}

// Check if email already exists
try {
    $stmt = $pdo->prepare("SELECT id FROM hunters WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Email already registered. Please use a different email or login.'
        ]);
        exit;
    }
} catch (PDOException $e) {
    error_log("Database error checking email: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error. Please try again.']);
    exit;
}

// Insert new hunter
try {
    $stmt = $pdo->prepare("
        INSERT INTO hunters (username, email, satoshi_date, satoshi_topic, current_stage, total_sats_won)
        VALUES (?, ?, ?, ?, 0, 0)
    ");

    $stmt->execute([
        $username,
        $email,
        $satoshi_date,
        $data['satoshi_topic'] // Store original case
    ]);

    $hunter_id = $pdo->lastInsertId();

    // Generate session token
    $token = generateToken($hunter_id, $username);

    // Log successful registration
    logAudit($pdo, $hunter_id, 'register_success', [
        'username' => $username,
        'email' => $email
    ], $ip_address);

    // Return success response
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful! Welcome to the hunt, ' . $username . '.',
        'token' => $token,
        'hunter' => [
            'id' => $hunter_id,
            'username' => $username,
            'current_stage' => 0
        ]
    ]);

} catch (PDOException $e) {
    error_log("Database error during registration: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Registration failed. Please try again.'
    ]);
}
