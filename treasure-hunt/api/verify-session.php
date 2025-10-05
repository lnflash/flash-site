<?php
/**
 * Keys of the Caribbean - Session Verification API
 * Verifies JWT token and returns hunter session data
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
    echo json_encode(['valid' => false, 'message' => 'No token provided']);
    exit;
}

$token = $matches[1];

// Verify token
$payload = verifyToken($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(['valid' => false, 'message' => 'Invalid or expired token']);
    exit;
}

// Get database connection
$pdo = getDbConnection();

// Fetch hunter data
try {
    $stmt = $pdo->prepare("
        SELECT id, username, email, current_stage, total_sats_won, completed_at, chosen_path
        FROM hunters
        WHERE id = ?
    ");

    $stmt->execute([$payload['hunter_id']]);
    $hunter = $stmt->fetch();

    if (!$hunter) {
        http_response_code(404);
        echo json_encode(['valid' => false, 'message' => 'Hunter not found']);
        exit;
    }

    // Return session data
    echo json_encode([
        'valid' => true,
        'hunter' => [
            'id' => (int)$hunter['id'],
            'username' => $hunter['username'],
            'email' => $hunter['email'],
            'current_stage' => (int)$hunter['current_stage'],
            'total_sats_won' => (int)$hunter['total_sats_won'],
            'completed' => !is_null($hunter['completed_at']),
            'chosen_path' => $hunter['chosen_path']
        ]
    ]);

} catch (PDOException $e) {
    error_log("Database error in verify-session: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['valid' => false, 'message' => 'Database error']);
}
