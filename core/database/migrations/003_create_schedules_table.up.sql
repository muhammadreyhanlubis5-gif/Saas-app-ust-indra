-- ============================================================================
-- Migration: 003_create_schedules_table.sql
-- Description: Production-grade normalized schedules table with strict multi-tenant
--              isolation, composite foreign keys, and database-level anti-clash constraints.
-- ============================================================================

-- 1. Ensure composite unique constraints on referenced master tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_classes_tenant_id') THEN
        ALTER TABLE classes ADD CONSTRAINT uq_classes_tenant_id UNIQUE (tenant_id, id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_subjects_tenant_id') THEN
        ALTER TABLE subjects ADD CONSTRAINT uq_subjects_tenant_id UNIQUE (tenant_id, id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_time_sessions_tenant_id') THEN
        ALTER TABLE time_sessions ADD CONSTRAINT uq_time_sessions_tenant_id UNIQUE (tenant_id, id);
    END IF;
END $$;

-- 2. Table schedules (Normalized Lesson Schedule)
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    day_id UUID NOT NULL,
    session_id UUID NOT NULL,
    class_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    room_id UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT chk_schedules_academic_year_not_empty CHECK (TRIM(academic_year) != '')
);

-- 3. Composite Foreign Keys: Enforces that referenced entities MUST belong to the SAME tenant!
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_schedules_day_tenant') THEN
        ALTER TABLE schedules ADD CONSTRAINT fk_schedules_day_tenant
        FOREIGN KEY (tenant_id, day_id)
        REFERENCES operating_days(tenant_id, id)
        ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_schedules_session_tenant') THEN
        ALTER TABLE schedules ADD CONSTRAINT fk_schedules_session_tenant
        FOREIGN KEY (tenant_id, session_id)
        REFERENCES time_sessions(tenant_id, id)
        ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_schedules_class_tenant') THEN
        ALTER TABLE schedules ADD CONSTRAINT fk_schedules_class_tenant
        FOREIGN KEY (tenant_id, class_id)
        REFERENCES classes(tenant_id, id)
        ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_schedules_teacher_tenant') THEN
        ALTER TABLE schedules ADD CONSTRAINT fk_schedules_teacher_tenant
        FOREIGN KEY (tenant_id, teacher_id)
        REFERENCES teachers(tenant_id, id)
        ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_schedules_subject_tenant') THEN
        ALTER TABLE schedules ADD CONSTRAINT fk_schedules_subject_tenant
        FOREIGN KEY (tenant_id, subject_id)
        REFERENCES subjects(tenant_id, id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 4. CRITICAL ANTI-CLASH CONSTRAINTS (Rule 1 & Rule 2 Enforcement at Database Level)
-- Rule 1: A teacher CANNOT be scheduled in two classes at the same day & time session
CREATE UNIQUE INDEX IF NOT EXISTS uk_schedules_teacher_slot
ON schedules (tenant_id, academic_year, day_id, session_id, teacher_id)
WHERE deleted_at IS NULL;

-- Rule 2: A class CANNOT have two subjects/teachers at the same day & time session
CREATE UNIQUE INDEX IF NOT EXISTS uk_schedules_class_slot
ON schedules (tenant_id, academic_year, day_id, session_id, class_id)
WHERE deleted_at IS NULL;

-- Rule 3: A room CANNOT be double-booked by two classes at the same day & time session
CREATE UNIQUE INDEX IF NOT EXISTS uk_schedules_room_slot
ON schedules (tenant_id, academic_year, day_id, session_id, room_id)
WHERE room_id IS NOT NULL AND deleted_at IS NULL;

-- General query index for rapid schedule grid rendering
CREATE INDEX IF NOT EXISTS idx_schedules_tenant_year_grid
ON schedules (tenant_id, academic_year, day_id, session_id);

CREATE INDEX IF NOT EXISTS idx_schedules_tenant_class
ON schedules (tenant_id, class_id);

CREATE INDEX IF NOT EXISTS idx_schedules_tenant_teacher
ON schedules (tenant_id, teacher_id);

-- Automatic updated_at trigger
DROP TRIGGER IF EXISTS trg_schedules_updated_at ON schedules;
CREATE TRIGGER trg_schedules_updated_at
BEFORE UPDATE ON schedules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Row-Level Security (RLS)
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_schedules ON schedules;

CREATE POLICY tenant_isolation_schedules ON schedules
    FOR ALL
    USING (
        current_setting('app.is_super_admin', true) = 'true'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );
