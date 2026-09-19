-- ==========================================
-- 1. STRUKTUR TABEL DATABASE (PostgreSQL)
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    valid_until TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE, -- NULL untuk SUPER_ADMIN
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- QUERY RELASI UNTUK SUPER ADMIN
-- "Menarik data daftar guru berdasarkan sekolah"
-- ==========================================
/*
SELECT 
    s.name AS school_name,
    u.name AS teacher_name,
    u.username
FROM schools s
JOIN users u ON s.id = u.school_id
WHERE u.role = 'TEACHER' 
ORDER BY s.name ASC, u.name ASC;
*/
