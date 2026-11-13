-- ============================================================================
-- Migration: 004_expand_master_data_constraints.up.sql
-- Description: Expand constraints, add teacher code column, safety check NULL tenant_id, partial unique indexes
-- ============================================================================

-- 1. Safety check: Verify no records have NULL tenant_id before asserting NOT NULL
DO $$
DECLARE
    null_teachers INT := 0;
    null_classes INT := 0;
    null_subjects INT := 0;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teachers') THEN
        SELECT COUNT(*) INTO null_teachers FROM teachers WHERE tenant_id IS NULL;
        IF null_teachers > 0 THEN
            RAISE EXCEPTION '[ABORT] Cannot enforce NOT NULL: % teacher(s) have NULL tenant_id', null_teachers;
        END IF;
        ALTER TABLE teachers ALTER COLUMN tenant_id SET NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'classes') THEN
        SELECT COUNT(*) INTO null_classes FROM classes WHERE tenant_id IS NULL;
        IF null_classes > 0 THEN
            RAISE EXCEPTION '[ABORT] Cannot enforce NOT NULL: % class(es) have NULL tenant_id', null_classes;
        END IF;
        ALTER TABLE classes ALTER COLUMN tenant_id SET NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subjects') THEN
        SELECT COUNT(*) INTO null_subjects FROM subjects WHERE tenant_id IS NULL;
        IF null_subjects > 0 THEN
            RAISE EXCEPTION '[ABORT] Cannot enforce NOT NULL: % subject(s) have NULL tenant_id', null_subjects;
        END IF;
        ALTER TABLE subjects ALTER COLUMN tenant_id SET NOT NULL;
    END IF;
END $$;

-- 2. Add 'code' column to teachers table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teachers' AND column_name = 'code'
    ) THEN
        ALTER TABLE teachers ADD COLUMN code VARCHAR(50) NULL;
    END IF;
END $$;

-- 3. Partial Unique Indexes
-- 3a. Teachers: Kode guru unik per tenant (hanya jika diisi, tidak kosong, dan tidak terhapus)
CREATE UNIQUE INDEX IF NOT EXISTS uk_teachers_tenant_code 
ON teachers (tenant_id, UPPER(TRIM(code))) 
WHERE code IS NOT NULL AND TRIM(code) != '' AND deleted_at IS NULL;

-- 3b. Classes: Nama rombel unik per tenant dan tahun ajaran (hanya yang aktif / belum soft-deleted)
CREATE UNIQUE INDEX IF NOT EXISTS uk_classes_tenant_year_name 
ON classes (tenant_id, academic_year, LOWER(TRIM(name))) 
WHERE deleted_at IS NULL;

-- 3c. Subjects: Kode mapel unik per tenant (UPPER, belum soft-deleted)
CREATE UNIQUE INDEX IF NOT EXISTS uk_subjects_tenant_code 
ON subjects (tenant_id, UPPER(TRIM(code))) 
WHERE deleted_at IS NULL;
