-- ============================================================================
-- Rollback Migration: 001_create_master_data_tables.down.sql
-- ============================================================================

DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
