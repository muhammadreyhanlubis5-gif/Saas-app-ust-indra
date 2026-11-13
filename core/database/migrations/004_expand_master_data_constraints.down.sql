-- ============================================================================
-- Migration: 004_expand_master_data_constraints.down.sql
-- Description: Rollback constraints expansion
-- ============================================================================

DROP INDEX IF EXISTS uk_subjects_tenant_code;
DROP INDEX IF EXISTS uk_classes_tenant_year_name;
DROP INDEX IF EXISTS uk_teachers_tenant_code;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teachers' AND column_name = 'code'
    ) THEN
        ALTER TABLE teachers DROP COLUMN code;
    END IF;
END $$;
