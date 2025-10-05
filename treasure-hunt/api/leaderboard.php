<?php
/**
 * Keys of the Caribbean - Leaderboard API
 * Returns leaderboard data with hunters, heroes, and stats
 */

define('HUNT_API', true);
require_once 'config.php';

// Set headers
setCorsHeaders();
header('Content-Type: application/json');

// Get database connection
$pdo = getDbConnection();

try {
    // Get all hunters sorted by stage and sats
    $stmt = $pdo->prepare("
        SELECT
            id,
            username,
            current_stage,
            total_sats_won,
            created_at,
            completed_at,
            chosen_path
        FROM hunters
        ORDER BY current_stage DESC, total_sats_won DESC, created_at ASC
    ");

    $stmt->execute();
    $hunters = $stmt->fetchAll();

    // Get Hall of Heroes (hunters who chose Satoshi Way)
    $stmt = $pdo->prepare("
        SELECT
            h.id,
            h.username,
            hoh.completion_time_hours,
            hoh.total_sats_earned,
            hoh.shared_amount,
            hoh.inducted_at,
            hoh.profile_text
        FROM hall_of_heroes hoh
        JOIN hunters h ON h.id = hoh.hunter_id
        ORDER BY hoh.inducted_at ASC
    ");

    $stmt->execute();
    $heroes = $stmt->fetchAll();

    // Calculate stats
    $total_hunters = count($hunters);
    $total_completed = 0;
    $total_sats_distributed = 0;
    $total_stages = 0;

    foreach ($hunters as $hunter) {
        if ($hunter['current_stage'] == 7 || $hunter['completed_at']) {
            $total_completed++;
        }
        $total_sats_distributed += $hunter['total_sats_won'];
        $total_stages += $hunter['current_stage'];
    }

    $avg_stage = $total_hunters > 0 ? $total_stages / $total_hunters : 0;

    // Format response
    $response = [
        'success' => true,
        'hunters' => array_map(function($hunter) {
            return [
                'id' => (int)$hunter['id'],
                'username' => $hunter['username'],
                'current_stage' => (int)$hunter['current_stage'],
                'total_sats_won' => (int)$hunter['total_sats_won'],
                'created_at' => $hunter['created_at'],
                'completed_at' => $hunter['completed_at'],
                'chosen_path' => $hunter['chosen_path']
            ];
        }, $hunters),
        'heroes' => array_map(function($hero) {
            return [
                'id' => (int)$hero['id'],
                'username' => $hero['username'],
                'completion_time_hours' => (float)$hero['completion_time_hours'],
                'total_sats_earned' => (int)$hero['total_sats_earned'],
                'shared_amount' => (int)$hero['shared_amount'],
                'inducted_at' => $hero['inducted_at'],
                'profile_text' => $hero['profile_text']
            ];
        }, $heroes),
        'stats' => [
            'total_hunters' => $total_hunters,
            'total_completed' => $total_completed,
            'total_sats_distributed' => $total_sats_distributed,
            'avg_stage' => round($avg_stage, 1)
        ]
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    error_log("Leaderboard API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch leaderboard data'
    ]);
}
