-- ============================================================================
-- Migration 002: Add teacher code, Create operating_days & time_sessions
-- Aplikasi GuruKu — Master Data & Daily Session Variation
-- ============================================================================

-- 1. Tambah kolom `code` ke tabel teachers untuk kompatibilitas kode guru (e.g. MH, PHY)
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS code VARCHAR(50) NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_teachers_tenant_code 
ON teachers (tenant_id, UPPER(TRIM(code))) 
WHERE code IS NOT NULL AND TRIM(code) != '' AND deleted_at IS NULL;

-- 2. Tabel operating_days (Hari Operasional Sekolah ternormalisasi per tenant)
CREATE TABLE IF NOT EXISTS operating_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL, -- 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'
    day_name VARCHAR(50) NOT NULL,
    order_index INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    total_sessions INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT chk_operating_days_name_not_empty CHECK (TRIM(day_name) != '')
);

-- Composite Unique Constraint untuk multi-tenant FK integrity
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_operating_days_tenant_id') THEN
        ALTER TABLE operating_days ADD CONSTRAINT uq_operating_days_tenant_id UNIQUE (tenant_id, id);
    END IF;
END $$;

-- Unique index per tenant dan hari
CREATE UNIQUE INDEX IF NOT EXISTS uk_operating_days_tenant_day
ON operating_days (tenant_id, UPPER(TRIM(day_of_week)))
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_operating_days_tenant_order
ON operating_days (tenant_id, order_index);

DROP TRIGGER IF EXISTS trg_operating_days_updated_at ON operating_days;
CREATE TRIGGER trg_operating_days_updated_at
BEFORE UPDATE ON operating_days
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Tabel time_sessions (Slot Jam Pembelajaran KBM dan Non-KBM per Hari)
CREATE TABLE IF NOT EXISTS time_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    operating_day_id UUID NOT NULL,
    session_number INT NOT NULL,
    session_type VARCHAR(20) NOT NULL DEFAULT 'KBM', -- 'KBM', 'BREAK', 'CEREMONY', 'RELIGIOUS'
    name VARCHAR(100) NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT chk_time_sessions_number CHECK (session_number >= 1),
    CONSTRAINT chk_time_sessions_time_order CHECK (end_time > start_time)
);

-- Composite FK: Memastikan operating_day_id dan tenant_id cocok (mencegah relasi lintas tenant)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_time_sessions_day_tenant') THEN
        ALTER TABLE time_sessions ADD CONSTRAINT fk_time_sessions_day_tenant
        FOREIGN KEY (tenant_id, operating_day_id)
        REFERENCES operating_days(tenant_id, id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Unique index nomor sesi per hari dalam satu tenant
CREATE UNIQUE INDEX IF NOT EXISTS uk_time_sessions_day_number
ON time_sessions (tenant_id, operating_day_id, session_number)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_time_sessions_tenant_day
ON time_sessions (tenant_id, operating_day_id, session_number);

DROP TRIGGER IF EXISTS trg_time_sessions_updated_at ON time_sessions;
CREATE TRIGGER trg_time_sessions_updated_at
BEFORE UPDATE ON time_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Row-Level Security (RLS)
ALTER TABLE operating_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_operating_days ON operating_days;
DROP POLICY IF EXISTS tenant_isolation_time_sessions ON time_sessions;

CREATE POLICY tenant_isolation_operating_days ON operating_days
    FOR ALL
    USING (
        current_setting('app.is_super_admin', true) = 'true'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_time_sessions ON time_sessions
    FOR ALL
    USING (
        current_setting('app.is_super_admin', true) = 'true'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );
