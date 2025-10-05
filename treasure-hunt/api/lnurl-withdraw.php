<?php
/**
 * Keys of the Caribbean - LNURL Withdrawal Callback
 * Handles Lightning Network withdrawals for prize claims
 *
 * LNURL-w Specification: https://github.com/lnurl/luds/blob/luds/03.md
 */

define('HUNT_API', true);
require_once 'config.php';

// Set headers
setCorsHeaders();
header('Content-Type: application/json');

// Get request parameters
$prize_id = $_GET['prize_id'] ?? null;
$claim_token = $_GET['token'] ?? null;
$k1 = $_GET['k1'] ?? null;
$pr = $_GET['pr'] ?? null; // Lightning invoice (for second callback)

if (!$prize_id || !$claim_token) {
    http_response_code(400);
    echo json_encode([
        'status' => 'ERROR',
        'reason' => 'Missing prize_id or token'
    ]);
    exit;
}

// Get database connection
$pdo = getDbConnection();

try {
    // Fetch prize details
    $stmt = $pdo->prepare("
        SELECT p.*, h.username
        FROM prizes p
        JOIN hunters h ON h.id = p.hunter_id
        WHERE p.id = ? AND p.claim_token = ?
    ");
    $stmt->execute([$prize_id, $claim_token]);
    $prize = $stmt->fetch();

    if (!$prize) {
        http_response_code(404);
        echo json_encode([
            'status' => 'ERROR',
            'reason' => 'Prize not found or invalid token'
        ]);
        exit;
    }

    // Check if token expired
    if (strtotime($prize['token_expires_at']) < time()) {
        http_response_code(400);
        echo json_encode([
            'status' => 'ERROR',
            'reason' => 'Claim token has expired. Please contact support.'
        ]);
        exit;
    }

    // Check prize state
    if ($prize['state'] === 'claimed' || $prize['state'] === 'settled') {
        http_response_code(400);
        echo json_encode([
            'status' => 'ERROR',
            'reason' => 'Prize has already been claimed'
        ]);
        exit;
    }

    // If this is the second callback (with invoice)
    if ($pr) {
        return handleInvoiceCallback($pdo, $prize, $pr);
    }

    // First callback - return withdrawal info
    $callback_url = 'https://' . $_SERVER['HTTP_HOST'] . '/treasure-hunt/api/lnurl-withdraw.php';
    $callback_url .= '?' . http_build_query([
        'prize_id' => $prize_id,
        'token' => $claim_token,
        'k1' => generateK1($prize_id, $claim_token)
    ]);

    // LNURL-w response
    echo json_encode([
        'status' => 'OK',
        'tag' => 'withdrawRequest',
        'callback' => $callback_url,
        'k1' => generateK1($prize_id, $claim_token),
        'defaultDescription' => "Keys of the Caribbean - Stage {$prize['stage']} Prize",
        'minWithdrawable' => $prize['amount_sats'] * 1000, // Convert to millisats
        'maxWithdrawable' => $prize['amount_sats'] * 1000, // Convert to millisats
        'balanceCheck' => $callback_url . '&check=1'
    ]);

} catch (PDOException $e) {
    error_log("LNURL withdrawal error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'ERROR',
        'reason' => 'Database error'
    ]);
}

/**
 * Handle invoice callback (second request)
 */
function handleInvoiceCallback($pdo, $prize, $invoice) {
    try {
        // Verify invoice (bolt11 format)
        // In production, you would:
        // 1. Decode the bolt11 invoice
        // 2. Verify the amount matches
        // 3. Pay the invoice via your Lightning node
        // 4. Update prize status

        // For now, we'll simulate this
        $invoice_valid = validateInvoice($invoice, $prize['amount_sats']);

        if (!$invoice_valid) {
            echo json_encode([
                'status' => 'ERROR',
                'reason' => 'Invalid invoice or amount mismatch'
            ]);
            return;
        }

        // Update prize state to claimed
        $stmt = $pdo->prepare("
            UPDATE prizes
            SET state = 'claimed', claimed_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$prize['id']]);

        // In production, you would pay the invoice here
        // $payment_result = payLightningInvoice($invoice);

        // Simulate successful payment
        $stmt = $pdo->prepare("
            UPDATE prizes
            SET state = 'settled', invoice_settled = TRUE
            WHERE id = ?
        ");
        $stmt->execute([$prize['id']]);

        // Log the withdrawal
        logAudit($pdo, $prize['hunter_id'], 'prize_claimed', [
            'prize_id' => $prize['id'],
            'stage' => $prize['stage'],
            'amount_sats' => $prize['amount_sats'],
            'invoice' => substr($invoice, 0, 50) . '...'
        ]);

        // Return success
        echo json_encode([
            'status' => 'OK'
        ]);

    } catch (PDOException $e) {
        error_log("Invoice callback error: " . $e->getMessage());
        echo json_encode([
            'status' => 'ERROR',
            'reason' => 'Payment processing failed'
        ]);
    }
}

/**
 * Generate k1 challenge for LNURL
 */
function generateK1($prize_id, $claim_token) {
    return hash('sha256', $prize_id . $claim_token . HMAC_SECRET);
}

/**
 * Validate Lightning invoice
 * This is a placeholder - integrate with proper bolt11 decoder
 */
function validateInvoice($invoice, $expected_sats) {
    // In production:
    // 1. Decode bolt11 invoice
    // 2. Extract amount
    // 3. Verify it matches expected_sats
    // 4. Verify expiry
    // 5. Verify payment hash

    // For now, basic validation
    if (!preg_match('/^ln[a-z0-9]+$/i', $invoice)) {
        return false;
    }

    return true; // Placeholder
}

/**
 * Pay Lightning invoice
 * This is a placeholder - integrate with your Lightning node
 */
function payLightningInvoice($invoice) {
    // In production:
    // 1. Connect to your Lightning node (LND, CLN, Eclair, etc.)
    // 2. Pay the invoice
    // 3. Return payment result with preimage

    // For development, you might use:
    // - LND REST/gRPC API
    // - Core Lightning (CLN) via lightning-cli
    // - LNbits API
    // - BTCPay Server API
    // - Strike API
    // - OpenNode API

    return [
        'success' => true,
        'payment_hash' => hash('sha256', $invoice),
        'preimage' => bin2hex(random_bytes(32))
    ];
}
