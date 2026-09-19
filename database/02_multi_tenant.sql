-- ==========================================================
-- SAAS MULTI-TENANT & RBAC ARCHITECTURE
-- ==========================================================

-- 1. Table Schools / Tenants (Langganan SaaS)
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    valid_until TIMESTAMP NOT NULL, -- Masa aktif kontrak SaaS
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table Users (RBAC: Authentication)
CREATE TYPE user_role AS ENUM ('super_admin', 'school_admin', 'teacher');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE, -- NULL jika role adalah super_admin
    teacher_id UUID, -- Referensi ke tabel guru (hanya jika role = teacher)
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Update Master Data Tables (Menambahkan Isolasi Data / school_id)
-- Menghubungkan setiap entitas data ke Tenant (Sekolah) masing-masing
ALTER TABLE teachers ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE subjects ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE classes ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE sessions ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE schedules ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
