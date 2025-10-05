<?php
/**
 * Keys of the Caribbean - Stage 1 Token Generation API
 * Generates per-hunter HMAC tokens for Stage 1 (The Awakening)
 */

define('HUNT_API', true);
require_once 'config.php';

// Set headers
setCorsHeaders();
header('Content-Type: application/json');

// Get Authorization header
$headers = getallheaders();
$auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (!$auth_header || !preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

$jwt_token = $matches[1];

// Verify JWT token
$payload = verifyToken($jwt_token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid or expired session']);
    exit;
}

$hunter_id = $payload['hunter_id'];

// Get database connection
$pdo = getDbConnection();

// Check if hunter exists and get current stage
try {
    $stmt = $pdo->prepare("SELECT current_stage FROM hunters WHERE id = ?");
    $stmt->execute([$hunter_id]);
    $hunter = $stmt->fetch();

    if (!$hunter) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Hunter not found']);
        exit;
    }

    // Only generate token if hunter is at stage 0 (not yet started)
    if ($hunter['current_stage'] > 0) {
        http_response_code(200);
        echo json_encode([
            'success' => false,
            'message' => 'You have already completed Stage 1',
            'current_stage' => (int)$hunter['current_stage']
        ]);
        exit;
    }

    // Generate Stage 1 HMAC token
    // Format: base64url(hunter_id|timestamp|nonce|HMAC)
    $timestamp = time();
    $nonce = bin2hex(random_bytes(16));
    $expiry = $timestamp + 3600; // Token valid for 1 hour

    // HMAC payload
    $hmac_data = $hunter_id . '|' . $expiry . '|' . $nonce . '|stage1';
    $hmac = hash_hmac('sha256', $hmac_data, HMAC_SECRET);

    // Build token
    $token_parts = $hunter_id . '|' . $expiry . '|' . $nonce . '|' . $hmac;
    $stage1_token = rtrim(strtr(base64_encode($token_parts), '+/', '-_'), '=');

    // Store nonce in database for replay protection
    $stmt = $pdo->prepare("
        INSERT INTO nonces (nonce, hunter_id, purpose)
        VALUES (?, ?, 'stage1_token')
    ");
    $stmt->execute([$nonce, $hunter_id]);

    // Log token generation
    logAudit($pdo, $hunter_id, 'stage1_token_generated', ['nonce' => $nonce]);

    // Return token
    echo json_encode([
        'success' => true,
        'stage1_token' => $stage1_token,
        'expires_in' => 3600,
        'message' => 'Stage 1 token generated successfully'
    ]);

} catch (PDOException $e) {
    error_log("Stage 1 token generation error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
