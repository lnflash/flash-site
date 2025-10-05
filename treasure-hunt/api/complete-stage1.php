<?php
/**
 * Keys of the Caribbean - Complete Stage 1 API
 * Completes Stage 1, creates prize, and advances hunter
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

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Verify stage1_token provided (for additional validation)
if (!isset($data['stage1_token'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Stage 1 token required']);
    exit;
}

// Get database connection
$pdo = getDbConnection();

try {
    // Start transaction
    $pdo->beginTransaction();

    // Get hunter current stage
    $stmt = $pdo->prepare("SELECT current_stage, username FROM hunters WHERE id = ? FOR UPDATE");
    $stmt->execute([$hunter_id]);
    $hunter = $stmt->fetch();

    if (!$hunter) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Hunter not found']);
        exit;
    }

    // Check if already completed Stage 1
    if ($hunter['current_stage'] > 0) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'You have already completed Stage 1',
            'current_stage' => (int)$hunter['current_stage']
        ]);
        exit;
    }

    // Create stage completion record
    $stmt = $pdo->prepare("
        INSERT INTO stage_completions (hunter_id, stage_number, completion_data, verification_status)
        VALUES (?, 1, ?, 'verified')
    ");
    $completion_data = json_encode([
        'completed_at' => date('Y-m-d H:i:s'),
        'method' => 'console_discovery'
    ]);
    $stmt->execute([$hunter_id, $completion_data]);

    // Stage 1 prize amount (from spec: $13)
    $prize_amount_usd = 13;
    $prize_amount_sats = 13000; // Simplified conversion (adjust based on BTC price)

    // Create prize record
    $claim_token = bin2hex(random_bytes(32));
    $token_expires_at = date('Y-m-d H:i:s', time() + 600); // 10 minutes

    $stmt = $pdo->prepare("
        INSERT INTO prizes (hunter_id, stage, amount_sats, state, claim_token, token_expires_at)
        VALUES (?, 1, ?, 'reserved', ?, ?)
    ");
    $stmt->execute([$hunter_id, $prize_amount_sats, $claim_token, $token_expires_at]);
    $prize_id = $pdo->lastInsertId();

    // Generate LNURL-w (Lightning withdrawal)
    // In production, this would call your LNURL service
    // For now, we'll create a placeholder
    $lnurl_w = generateLNURLWithdrawal($prize_id, $claim_token, $prize_amount_sats);

    // Update prize with LNURL
    $stmt = $pdo->prepare("UPDATE prizes SET lnurl_w = ? WHERE id = ?");
    $stmt->execute([$lnurl_w, $prize_id]);

    // Update hunter's stage and total sats
    $stmt = $pdo->prepare("
        UPDATE hunters
        SET current_stage = 1, total_sats_won = total_sats_won + ?
        WHERE id = ?
    ");
    $stmt->execute([$prize_amount_sats, $hunter_id]);

    // Log completion
    logAudit($pdo, $hunter_id, 'stage1_completed', [
        'prize_amount_sats' => $prize_amount_sats,
        'prize_id' => $prize_id
    ]);

    // Commit transaction
    $pdo->commit();

    // Return success with LNURL
    echo json_encode([
        'success' => true,
        'message' => 'Stage 1 completed successfully!',
        'prize_amount' => $prize_amount_sats,
        'lnurl_w' => $lnurl_w,
        'claim_token' => $claim_token,
        'expires_at' => $token_expires_at,
        'next_stage' => 2
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    error_log("Complete Stage 1 error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}

/**
 * Generate LNURL withdrawal string
 * This is a placeholder - integrate with your actual LNURL service
 */
function generateLNURLWithdrawal($prize_id, $claim_token, $amount_sats) {
    // In production, this would:
    // 1. Call your LNURL service API
    // 2. Create withdrawal endpoint
    // 3. Return proper LNURL-encoded string

    // Placeholder format
    $callback_url = 'https://getflash.io/treasure-hunt/api/lnurl-withdraw.php';
    $params = http_build_query([
        'prize_id' => $prize_id,
        'token' => $claim_token,
        'amount' => $amount_sats
    ]);

    $lnurl_base = $callback_url . '?' . $params;

    // Encode to bech32 lnurl format (simplified)
    // In production, use proper bech32 encoding
    return 'lnurl' . strtoupper(bin2hex($lnurl_base));
}
