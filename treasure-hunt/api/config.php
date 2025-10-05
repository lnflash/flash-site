<?php
/**
 * Keys of the Caribbean - Database Configuration
 *
 * IMPORTANT: Update these values with your actual database credentials
 */

// Prevent direct access
if (!defined('HUNT_API')) {
    http_response_code(403);
    exit('Direct access not permitted');
}

// Database Configuration
// TODO: Update these with your actual cPanel MySQL credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');  // Update this
define('DB_USER', 'your_database_user');  // Update this
define('DB_PASS', 'your_database_password');  // Update this
define('DB_CHARSET', 'utf8mb4');

// JWT Secret Key for session tokens
// TODO: Generate a secure random string for production
define('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production');

// HMAC Secret for Stage 1 tokens
// TODO: Generate a secure random string for production
define('HMAC_SECRET', 'your-super-secret-hmac-key-change-this-in-production');

// Security Settings
define('TOKEN_EXPIRY', 86400); // 24 hours in seconds
define('BCRYPT_COST', 12);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_TIME', 900); // 15 minutes in seconds

// CORS Settings (adjust for production)
define('ALLOWED_ORIGINS', [
    'https://getflash.io',
    'https://www.getflash.io',
    'http://localhost:3000' // Remove in production
]);

// Rate Limiting
define('RATE_LIMIT_REGISTER', 5); // Max 5 registrations per IP per hour
define('RATE_LIMIT_SUBMIT', 10);  // Max 10 stage submissions per user per hour

// Satoshi Question Answers (case-insensitive validation)
define('SATOSHI_DATE_CORRECT', '2008-10-31'); // October 31, 2008
define('SATOSHI_TOPIC_ANSWERS', [
    'bitcoin: a peer-to-peer electronic cash system',
    'bitcoin a peer-to-peer electronic cash system',
    'bitcoin: a peer to peer electronic cash system',
    'bitcoin a peer to peer electronic cash system',
    'a peer-to-peer electronic cash system',
    'a peer to peer electronic cash system'
]);

// LNURL Configuration (for prizes)
define('LNURL_ENDPOINT', 'https://your-lnurl-server.com/api'); // Update with actual LNURL service
define('LNURL_API_KEY', 'your-lnurl-api-key'); // Update with actual API key

// Create database connection
function getDbConnection() {
    static $pdo = null;

    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed']);
            exit;
        }
    }

    return $pdo;
}

// Generate JWT token
function generateToken($hunter_id, $username) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'hunter_id' => $hunter_id,
        'username' => $username,
        'iat' => time(),
        'exp' => time() + TOKEN_EXPIRY
    ]);

    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

// Verify JWT token
function verifyToken($token) {
    if (!$token) {
        return false;
    }

    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }

    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;

    $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlSignature));
    $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);

    if (!hash_equals($signature, $expectedSignature)) {
        return false;
    }

    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload)), true);

    if (!$payload || $payload['exp'] < time()) {
        return false;
    }

    return $payload;
}

// Set CORS headers
function setCorsHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, ALLOWED_ORIGINS)) {
        header("Access-Control-Allow-Origin: $origin");
    }

    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Log to audit trail
function logAudit($pdo, $hunter_id, $action, $details = null, $ip = null, $user_agent = null) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO audit_log (hunter_id, action, details, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $hunter_id,
            $action,
            $details ? json_encode($details) : null,
            $ip ?? $_SERVER['REMOTE_ADDR'] ?? null,
            $user_agent ?? $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
    } catch (PDOException $e) {
        error_log("Audit log error: " . $e->getMessage());
    }
}

// Rate limiting check
function checkRateLimit($pdo, $action, $identifier, $limit, $window = 3600) {
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count
        FROM audit_log
        WHERE action = ?
        AND ip_address = ?
        AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
    ");

    $stmt->execute([$action, $identifier, $window]);
    $result = $stmt->fetch();

    return $result['count'] < $limit;
}
