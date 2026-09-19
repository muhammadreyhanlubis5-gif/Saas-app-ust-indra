-- ==========================================
-- 06. TABLE SESI WAKTU KBM
-- ==========================================

CREATE TYPE session_type AS ENUM ('KBM', 'ISTIRAHAT');

CREATE TABLE school_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    session_index INTEGER NOT NULL, -- Urutan sesi dalam satu hari
    type session_type NOT NULL DEFAULT 'KBM',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
