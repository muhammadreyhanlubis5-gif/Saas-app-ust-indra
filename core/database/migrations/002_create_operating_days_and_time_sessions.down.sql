-- ============================================================================
-- Rollback Migration: 002_create_operating_days_and_time_sessions.down.sql
-- ============================================================================

DROP TABLE IF EXISTS time_sessions CASCADE;
DROP TABLE IF EXISTS operating_days CASCADE;
DROP INDEX IF EXISTS uk_teachers_tenant_code;
ALTER TABLE teachers DROP COLUMN IF EXISTS code;
