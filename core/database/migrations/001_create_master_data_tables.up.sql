-- ============================================================================
-- Migration: 001_create_master_data_tables.sql
-- Description: Production-grade multi-tenant isolated tables for Master Data
-- Entities: teachers, classes, subjects
-- Dependency: schools (id UUID PRIMARY KEY)
-- Architecture:
--   1. Strict tenant isolation via FK to schools(id) ON DELETE CASCADE
--   2. Cross-tenant FK prevention via composite key (tenant_id, homeroom_teacher_id)
--   3. Partial unique indexes with normalization (LOWER/UPPER/TRIM)
--   4. Automatic updated_at triggers
--   5. PostgreSQL Row-Level Security (RLS) policies
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Helper Trigger Function for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Table Teachers (Daftar Guru)
-- Dibuat SEBELUM classes agar classes dapat membuat foreign key ke teachers(id)
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    nip_nuptk VARCHAR(50) NULL,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NULL,
    employment_status VARCHAR(50) NULL,
    is_certified BOOLEAN NOT NULL DEFAULT FALSE,
    subject_specialty VARCHAR(100) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT chk_teachers_name_not_empty CHECK (TRIM(name) != '')
);

-- Unique constraint pada (tenant_id, id) untuk composite foreign key lintas tabel
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_teachers_tenant_id'
    ) THEN
        ALTER TABLE teachers ADD CONSTRAINT uq_teachers_tenant_id UNIQUE (tenant_id, id);
    END IF;
END $$;

-- Unique index for NIP/NUPTK per tenant (excluding null, empty, and soft-deleted)
CREATE UNIQUE INDEX IF NOT EXISTS uk_teachers_tenant_nip 
ON teachers (tenant_id, LOWER(TRIM(nip_nuptk))) 
WHERE nip_nuptk IS NOT NULL AND TRIM(nip_nuptk) != '' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_teachers_tenant_active 
ON teachers (tenant_id, is_active) 
WHERE deleted_at IS NULL;

-- Trigger updated_at untuk teachers
DROP TRIGGER IF EXISTS trg_teachers_updated_at ON teachers;
CREATE TRIGGER trg_teachers_updated_at 
BEFORE UPDATE ON teachers 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 2. Table Classes (Daftar Rombel / Kelas)
-- Dibuat SETELAH teachers dan memiliki composite FK (tenant_id, homeroom_teacher_id)
-- untuk MENCEGAH referensi wali kelas lintas tenant secara matematis di level database.
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    grade_level INT NULL,
    major VARCHAR(100) NULL,
    academic_year VARCHAR(20) NOT NULL,
    homeroom_teacher_id UUID NULL,
    student_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT chk_classes_student_count CHECK (student_count >= 0),
    CONSTRAINT chk_classes_name_not_empty CHECK (TRIM(name) != '')
);

-- Foreign Key komposit: Menjamin homeroom_teacher_id HARUS berasal dari tenant_id yang sama!
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_classes_homeroom_teacher_tenant'
    ) THEN
        ALTER TABLE classes ADD CONSTRAINT fk_classes_homeroom_teacher_tenant 
        FOREIGN KEY (tenant_id, homeroom_teacher_id) 
        REFERENCES teachers(tenant_id, id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Unique class name per tenant and academic year for active/non-deleted records
CREATE UNIQUE INDEX IF NOT EXISTS uk_classes_tenant_name_year 
ON classes (tenant_id, LOWER(TRIM(name)), academic_year) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_classes_tenant_active 
ON classes (tenant_id, is_active) 
WHERE deleted_at IS NULL;

-- Trigger updated_at untuk classes
DROP TRIGGER IF EXISTS trg_classes_updated_at ON classes;
CREATE TRIGGER trg_classes_updated_at 
BEFORE UPDATE ON classes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 3. Table Subjects (Mata Pelajaran)
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NULL,
    weekly_default_hours INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT chk_subjects_weekly_hours CHECK (weekly_default_hours >= 0),
    CONSTRAINT chk_subjects_code_not_empty CHECK (TRIM(code) != ''),
    CONSTRAINT chk_subjects_name_not_empty CHECK (TRIM(name) != '')
);

-- Normalized subject code unique per tenant for active records
CREATE UNIQUE INDEX IF NOT EXISTS uk_subjects_tenant_code 
ON subjects (tenant_id, UPPER(TRIM(code))) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_subjects_tenant_active 
ON subjects (tenant_id, is_active) 
WHERE deleted_at IS NULL;

-- Trigger updated_at untuk subjects
DROP TRIGGER IF EXISTS trg_subjects_updated_at ON subjects;
CREATE TRIGGER trg_subjects_updated_at 
BEFORE UPDATE ON subjects 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_teachers ON teachers;
DROP POLICY IF EXISTS tenant_isolation_classes ON classes;
DROP POLICY IF EXISTS tenant_isolation_subjects ON subjects;

CREATE POLICY tenant_isolation_teachers ON teachers
    FOR ALL
    USING (
        current_setting('app.is_super_admin', true) = 'true'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_classes ON classes
    FOR ALL
    USING (
        current_setting('app.is_super_admin', true) = 'true'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_subjects ON subjects
    FOR ALL
    USING (
        current_setting('app.is_super_admin', true) = 'true'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );
