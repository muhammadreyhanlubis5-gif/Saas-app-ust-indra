-- ============================================================================
-- Migration: 000_create_base_schema.up.sql
-- Description: Baseline schema for GuruKu B2B SaaS (Schools, Users, Auth, Support, Payments)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Helper Trigger Function for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Schools (Tenants)
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    valid_until TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '365 days'),
    address TEXT,
    contact_number VARCHAR(50),
    headmaster_name VARCHAR(100),
    vice_headmaster_name VARCHAR(100),
    schedule_date DATE,
    academic_year VARCHAR(20),
    semester VARCHAR(20),
    active_days JSONB DEFAULT '["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]'::jsonb,
    payment_method VARCHAR(100),
    payment_amount DECIMAL(12, 2) DEFAULT 0,
    pengampu_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trg_schools_updated_at ON schools;
CREATE TRIGGER trg_schools_updated_at
BEFORE UPDATE ON schools
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Users (Super Admin, School Admin, Teacher)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'SCHOOL_ADMIN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_school_id ON users (school_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (LOWER(username));

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(100) NOT NULL,
    school VARCHAR(255) DEFAULT 'Pengguna Umum',
    category VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'MENUNGGU',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Payment Confirmations
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

-- 6. Forgot Password Requests
CREATE TABLE IF NOT EXISTS forgot_password_requests (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    new_password TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
