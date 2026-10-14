CREATE TABLE IF NOT EXISTS payment_confirmations (
    id SERIAL PRIMARY KEY,
    invoice VARCHAR(100) NOT NULL UNIQUE,
    plan VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    method VARCHAR(100) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    notes TEXT,
    proof_image TEXT,
    status VARCHAR(50) DEFAULT 'MENUNGGU_VERIFIKASI',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
