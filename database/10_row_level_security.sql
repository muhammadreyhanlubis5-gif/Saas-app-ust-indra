-- ============================================================================
-- GURUKU ENTERPRISE SAAS - DATABASE-LEVEL MULTI-TENANCY & ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Architecture:
-- 1. All tenant tables enforce strict Row-Level Security (RLS) policies.
-- 2. Scoped by session context: current_setting('app.current_tenant_id', true).
-- 3. Super Admins bypass tenant filters via current_setting('app.is_super_admin', true) = 'true'.
-- 4. Guaranteed zero cross-tenant data leakage (School A CANNOT view School B data).
-- ============================================================================

-- Ensure uuid-ossp extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enable RLS on core multi-tenant tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- If additional tables exist, enable RLS
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'support_tickets') THEN
        EXECUTE 'ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;';
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_confirmations') THEN
        EXECUTE 'ALTER TABLE payment_confirmations ENABLE ROW LEVEL SECURITY;';
    END IF;
END $$;

-- 2. Drop existing tenant policies if any
DROP POLICY IF EXISTS tenant_isolation_schools ON schools;
DROP POLICY IF EXISTS tenant_isolation_sessions ON school_sessions;
DROP POLICY IF EXISTS tenant_isolation_users ON users;
DROP POLICY IF EXISTS tenant_isolation_subjects ON subjects;

-- 3. Strict Row Level Security Policies

-- A. Schools Table Policy
CREATE POLICY tenant_isolation_schools ON schools
    FOR ALL
    USING (
        current_setting('app.is_super_admin', true) = 'true'
        OR id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

-- B. School Sessions Policy
CREATE POLICY tenant_isolation_sessions ON school_sessions
    FOR ALL
    USING (
        current_setting('app.is_super_admin', true) = 'true'
        OR school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

-- C. Users Policy (Teacher, School Admin, Super Admin)
CREATE POLICY tenant_isolation_users ON users
    FOR ALL
    USING (
        current_setting('app.is_super_admin', true) = 'true'
        OR school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        OR id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    );

-- D. Subjects Policy
CREATE POLICY tenant_isolation_subjects ON subjects
    FOR ALL
    USING (
        current_setting('app.is_super_admin', true) = 'true'
        OR school_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

-- 4. Helper Function to Set Tenant Context in Transaction
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id UUID, p_is_super_admin BOOLEAN, p_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', COALESCE(p_tenant_id::TEXT, ''), true);
    PERFORM set_config('app.is_super_admin', CASE WHEN p_is_super_admin THEN 'true' ELSE 'false' END, true);
    IF p_user_id IS NOT NULL THEN
        PERFORM set_config('app.current_user_id', p_user_id::TEXT, true);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
