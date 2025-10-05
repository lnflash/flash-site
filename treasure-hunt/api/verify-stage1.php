<?php
/**
 * Keys of the Caribbean - Stage 1 Token Verification API
 * Verifies HMAC token from rabbithole URL
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

if (!isset($data['token']) || empty($data['token'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No token provided']);
    exit;
}

$token = $data['token'];

// Decode base64url token
$token_decoded = base64_decode(strtr($token, '-_', '+/'));

if (!$token_decoded) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid token format']);
    exit;
}

// Parse token parts: hunter_id|expiry|nonce|hmac
$parts = explode('|', $token_decoded);

if (count($parts) !== 4) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Malformed token']);
    exit;
}

list($hunter_id, $expiry, $nonce, $hmac_provided) = $parts;

// Check expiry
if (time() > $expiry) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Token has expired. Please generate a new one.']);
    exit;
}

// Verify HMAC
$hmac_data = $hunter_id . '|' . $expiry . '|' . $nonce . '|stage1';
$hmac_expected = hash_hmac('sha256', $hmac_data, HMAC_SECRET);

if (!hash_equals($hmac_expected, $hmac_provided)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid token signature']);
    exit;
}

// Get database connection
$pdo = getDbConnection();

// Check if nonce has been used (replay protection)
try {
    $stmt = $pdo->prepare("SELECT used_at FROM nonces WHERE nonce = ? AND purpose = 'stage1_token'");
    $stmt->execute([$nonce]);
    $nonce_record = $stmt->fetch();

    if (!$nonce_record) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Token not found or already used']);
        exit;
    }

    // Get hunter data
    $stmt = $pdo->prepare("
        SELECT id, username, email, current_stage, total_sats_won
        FROM hunters
        WHERE id = ?
    ");
    $stmt->execute([$hunter_id]);
    $hunter = $stmt->fetch();

    if (!$hunter) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Hunter not found']);
        exit;
    }

    // Log successful verification
    logAudit($pdo, $hunter_id, 'stage1_verified', ['nonce' => $nonce]);

    // Return success with hunter data
    echo json_encode([
        'success' => true,
        'message' => 'Token verified successfully',
        'hunter' => [
            'id' => (int)$hunter['id'],
            'username' => $hunter['username'],
            'current_stage' => (int)$hunter['current_stage'],
            'total_sats_won' => (int)$hunter['total_sats_won']
        ]
    ]);

} catch (PDOException $e) {
    error_log("Stage 1 verification error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
