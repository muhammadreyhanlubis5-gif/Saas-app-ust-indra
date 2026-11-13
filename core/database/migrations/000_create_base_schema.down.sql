-- ============================================================================
-- Migration: 000_create_base_schema.down.sql
-- Rollback baseline schema
-- ============================================================================

DROP TABLE IF EXISTS forgot_password_requests CASCADE;
DROP TABLE IF EXISTS payment_confirmations CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
