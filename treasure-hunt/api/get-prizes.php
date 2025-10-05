<?php
/**
 * Keys of the Caribbean - Get Prizes API
 * Returns hunter's claimed prizes
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

try {
    // Fetch hunter's prizes
    $stmt = $pdo->prepare("
        SELECT
            id,
            stage,
            amount_sats,
            state,
            created_at,
            claimed_at,
            invoice_settled
        FROM prizes
        WHERE hunter_id = ?
        ORDER BY stage ASC
    ");

    $stmt->execute([$hunter_id]);
    $prizes = $stmt->fetchAll();

    // Format response
    $formatted_prizes = array_map(function($prize) {
        return [
            'id' => (int)$prize['id'],
            'stage' => (int)$prize['stage'],
            'amount_sats' => (int)$prize['amount_sats'],
            'state' => $prize['state'],
            'created_at' => $prize['created_at'],
            'claimed_at' => $prize['claimed_at'],
            'invoice_settled' => (bool)$prize['invoice_settled']
        ];
    }, $prizes);

    echo json_encode([
        'success' => true,
        'prizes' => $formatted_prizes
    ]);

} catch (PDOException $e) {
    error_log("Get prizes error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
