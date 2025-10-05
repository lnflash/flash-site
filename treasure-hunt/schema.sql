-- Keys of the Caribbean - Database Schema
-- Flash Treasure Hunt

-- Drop existing tables (for development)
-- DROP TABLE IF EXISTS merchant_interactions;
-- DROP TABLE IF EXISTS stage_completions;
-- DROP TABLE IF EXISTS prizes;
-- DROP TABLE IF EXISTS nonces;
-- DROP TABLE IF EXISTS idempotency_keys;
-- DROP TABLE IF EXISTS hunters;

-- Hunters table
CREATE TABLE hunters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    satoshi_date DATE NOT NULL,
    satoshi_topic VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_stage INT DEFAULT 0,
    total_sats_won INT DEFAULT 0,
    completed_at TIMESTAMP NULL,
    chosen_path VARCHAR(50) NULL, -- 'safe', 'claim_all', 'satoshi_way'
    INDEX idx_username (username),
    INDEX idx_current_stage (current_stage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stage completions
CREATE TABLE stage_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hunter_id INT NOT NULL,
    stage_number INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_data JSON, -- Store stage-specific data (coordinates, answers, etc.)
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    UNIQUE KEY unique_hunter_stage (hunter_id, stage_number),
    FOREIGN KEY (hunter_id) REFERENCES hunters(id) ON DELETE CASCADE,
    INDEX idx_stage (stage_number),
    INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Prizes
CREATE TABLE prizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hunter_id INT NOT NULL,
    stage INT NOT NULL,
    amount_sats INT NOT NULL,
    state ENUM('created', 'reserved', 'claimed', 'settled') DEFAULT 'created',
    claim_token VARCHAR(255) UNIQUE,
    token_expires_at TIMESTAMP NULL,
    claimed_at TIMESTAMP NULL,
    lnurl_w TEXT,
    invoice_settled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_hunter_stage_prize (hunter_id, stage),
    FOREIGN KEY (hunter_id) REFERENCES hunters(id) ON DELETE CASCADE,
    INDEX idx_claim_token (claim_token),
    INDEX idx_state (state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Nonces (for replay protection)
CREATE TABLE nonces (
    nonce VARCHAR(64) PRIMARY KEY,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hunter_id INT,
    purpose VARCHAR(50), -- 'stage1_token', 'stage2_submit', etc.
    INDEX idx_used_at (used_at),
    INDEX idx_hunter (hunter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Idempotency keys
CREATE TABLE idempotency_keys (
    key_value VARCHAR(64) PRIMARY KEY,
    hunter_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_data JSON,
    INDEX idx_hunter (hunter_id),
    FOREIGN KEY (hunter_id) REFERENCES hunters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Merchant interactions (Stage 5)
CREATE TABLE merchant_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hunter_id INT NOT NULL,
    merchant_username VARCHAR(100) NOT NULL,
    parish VARCHAR(100),
    interaction_type ENUM('message', 'payment', 'visit') NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hunter_id) REFERENCES hunters(id) ON DELETE CASCADE,
    INDEX idx_hunter (hunter_id),
    INDEX idx_merchant (merchant_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GPS verifications (Stage 4)
CREATE TABLE gps_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hunter_id INT NOT NULL,
    reading_1_lat DECIMAL(10, 7),
    reading_1_lon DECIMAL(10, 7),
    reading_1_accuracy DECIMAL(6, 2),
    reading_1_timestamp TIMESTAMP,
    reading_2_lat DECIMAL(10, 7),
    reading_2_lon DECIMAL(10, 7),
    reading_2_accuracy DECIMAL(6, 2),
    reading_2_timestamp TIMESTAMP,
    jitter_distance DECIMAL(6, 2), -- meters
    time_diff INT, -- seconds
    device_fingerprint JSON,
    photo_hash VARCHAR(64),
    photo_exif_timestamp TIMESTAMP,
    daily_word VARCHAR(100),
    staff_pin VARCHAR(20),
    gesture VARCHAR(100),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hunter_id) REFERENCES hunters(id) ON DELETE CASCADE,
    INDEX idx_hunter (hunter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit log
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hunter_id INT,
    action VARCHAR(100) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_hunter (hunter_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin actions log
CREATE TABLE admin_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_username VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_hunter_id INT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin (admin_username),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hall of Heroes
CREATE TABLE hall_of_heroes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hunter_id INT NOT NULL UNIQUE,
    completion_time_hours DECIMAL(8, 2),
    total_sats_earned INT,
    shared_amount INT, -- Amount shared if chose Satoshi Way
    inducted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_text TEXT,
    FOREIGN KEY (hunter_id) REFERENCES hunters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
