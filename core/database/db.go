package database

import (
	"database/sql"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func IsConnected() bool {
	return DB != nil && DB.Ping() == nil
}

func Connect() {
	dsn := os.Getenv("DATABASE_URL") // Diset di Neon & Vercel
	if dsn == "" {
		log.Println("[Database] DATABASE_URL is not set, running in stateless offline mode")
		return
	}

	var err error
	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Printf("[Database] Failed to open Neon DB connection pool: %v", err)
		return
	}

	// Konfigurasi connection pool yang aman untuk environment Serverless
	DB.SetMaxOpenConns(10)
	DB.SetMaxIdleConns(5)
	DB.SetConnMaxLifetime(5 * time.Minute)

	// Ping database dengan timeout aman (JANGAN log.Fatalf yang membunuh lambda)
	if err = DB.Ping(); err != nil {
		log.Printf("[Database] Warning: DB ping failed on cold start: %v (queries will auto-retry)", err)
		return
	}

	log.Println("[Database] Successfully connected to Neon Serverless Postgres!")
	
	// Otomatis Buat Tabel Penting jika belum ada
	autoMigrateTables()
}

func autoMigrateTables() {
	if DB == nil {
		return
	}

	// 1. Pastikan tabel schools dan ekstensi UUID tersedia
	_, _ = DB.Exec(`
		CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

		CREATE TABLE IF NOT EXISTS schools (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(255) NOT NULL,
			status VARCHAR(50) DEFAULT 'ACTIVE',
			valid_until TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 year',
			database_limit INT DEFAULT 100,
			readiness_percentage INT DEFAULT 0,
			last_active_menu VARCHAR(100) DEFAULT 'Validasi Lembaga',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		ALTER TABLE schools ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';
		ALTER TABLE schools ADD COLUMN IF NOT EXISTS database_limit INT DEFAULT 100;
		ALTER TABLE schools ADD COLUMN IF NOT EXISTS readiness_percentage INT DEFAULT 0;
		ALTER TABLE schools ADD COLUMN IF NOT EXISTS last_active_menu VARCHAR(100) DEFAULT 'Validasi Lembaga';
	`)

	// 2. Tabel Support Tickets (Pusat Bantuan) dengan relasi Tenant_ID dan status standar B2B SaaS
	_, err := DB.Exec(`
		CREATE TABLE IF NOT EXISTS support_tickets (
			id SERIAL PRIMARY KEY,
			tenant_id UUID,
			name VARCHAR(255) NOT NULL,
			contact VARCHAR(100) NOT NULL,
			school VARCHAR(255) DEFAULT 'Pengguna Umum',
			category VARCHAR(100) NOT NULL,
			message TEXT NOT NULL,
			status VARCHAR(50) DEFAULT 'Open',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS tenant_id UUID;
	`)
	if err != nil {
		log.Println("[Database] Gagal migrasi support_tickets:", err)
	}

	// Standarisasi status support_tickets jika ada data lama
	_, _ = DB.Exec(`
		UPDATE support_tickets SET status = 'Open' WHERE status = 'MENUNGGU' OR status IS NULL;
		UPDATE support_tickets SET status = 'In Progress' WHERE status = 'DIPROSES';
		UPDATE support_tickets SET status = 'Resolved' WHERE status = 'SELESAI';
	`)

	// 3. Tabel Konfirmasi Pembayaran & Faktur (Tagihan & Keuangan)
	// Status ENUM: 'Menunggu Pembayaran', 'Berhasil Dibayar', 'Dibatalkan'
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS payment_confirmations (
			id SERIAL PRIMARY KEY,
			tenant_id UUID,
			invoice VARCHAR(100) NOT NULL UNIQUE,
			plan VARCHAR(50) NOT NULL,
			amount BIGINT NOT NULL,
			method VARCHAR(100) NOT NULL,
			sender_name VARCHAR(255) NOT NULL,
			bank_name VARCHAR(100) NOT NULL,
			notes TEXT,
			proof_image TEXT,
			status VARCHAR(50) DEFAULT 'Menunggu Pembayaran',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		ALTER TABLE payment_confirmations ADD COLUMN IF NOT EXISTS tenant_id UUID;
	`)
	if err != nil {
		log.Println("[Database] Gagal migrasi payment_confirmations:", err)
	}

	// Standarisasi status payment_confirmations dari legacy
	_, _ = DB.Exec(`
		UPDATE payment_confirmations SET status = 'Menunggu Pembayaran' WHERE status = 'MENUNGGU_VERIFIKASI' OR status IS NULL;
		UPDATE payment_confirmations SET status = 'Berhasil Dibayar' WHERE status = 'TERVERIFIKASI';
		UPDATE payment_confirmations SET status = 'Dibatalkan' WHERE status = 'DITOLAK';
	`)

	// 4. Tabel Paket Lisensi (Source of Truth untuk harga masa depan)
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS subscription_plans (
			id VARCHAR(50) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			badge VARCHAR(50),
			tier VARCHAR(50),
			price BIGINT NOT NULL,
			duration_months INT NOT NULL,
			duration_label VARCHAR(100),
			description TEXT,
			features TEXT,
			is_active BOOLEAN DEFAULT TRUE,
			is_popular BOOLEAN DEFAULT FALSE,
			is_premium BOOLEAN DEFAULT FALSE,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Println("[Database] Gagal migrasi subscription_plans:", err)
	}

	// Seeding Paket Lisensi default jika kosong
	var planCount int
	_ = DB.QueryRow("SELECT COUNT(*) FROM subscription_plans").Scan(&planCount)
	if planCount == 0 {
		_, _ = DB.Exec(`
			INSERT INTO subscription_plans (id, name, badge, tier, price, duration_months, duration_label, description, is_active, is_popular, is_premium)
			VALUES 
			('pkg-standar', 'Lisensi Semester Ganjil', 'Standar', 'standar', 254205, 6, '6 Bulan (1 Semester)', 'Manajemen jadwal 1 semester lengkap untuk dewan guru dan rombel kelas.', TRUE, FALSE, FALSE),
			('pkg-populer', 'Lisensi Lengkap 1 Tahun', 'Populer', 'populer', 480000, 12, '12 Bulan (2 Semester Penuh)', 'Dua semester penuh, modul cetak kartu ujian, dan garansi bebas bentrok.', TRUE, TRUE, FALSE),
			('pkg-premium', 'Multi-Kampus & Yayasan', 'Premium', 'premium', 1250000, 12, '12 Bulan (Multi-Unit Terpadu)', 'Solusi terpusat untuk yayasan dengan multi unit sekolah (SD, SMP, SMA/SMK).', TRUE, FALSE, TRUE);
		`)
		log.Println("[Database] Default subscription plans seeded!")
	}

	// 5. Phase B1: Tabel Master Data (Teachers, Classes, Subjects) dengan Isolasi Multi-Tenant
	_, err = DB.Exec(`
		-- Helper Function untuk updated_at trigger otomatis
		CREATE OR REPLACE FUNCTION update_updated_at_column()
		RETURNS TRIGGER AS $$
		BEGIN
			NEW.updated_at = CURRENT_TIMESTAMP;
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;

		-- Tabel Master Guru (Dibuat sebelum Classes)
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

		ALTER TABLE teachers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES schools(id) ON DELETE CASCADE;
		DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teachers' AND column_name = 'school_id') THEN 
			ALTER TABLE teachers ALTER COLUMN school_id DROP NOT NULL;
			UPDATE teachers SET tenant_id = school_id WHERE tenant_id IS NULL; 
			UPDATE teachers SET school_id = tenant_id WHERE school_id IS NULL;
		END IF; END $$;
		DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teachers' AND column_name = 'code') THEN 
			ALTER TABLE teachers ALTER COLUMN code DROP NOT NULL;
		END IF; END $$;
		ALTER TABLE teachers ADD COLUMN IF NOT EXISTS nip_nuptk VARCHAR(50) NULL;
		ALTER TABLE teachers ADD COLUMN IF NOT EXISTS gender VARCHAR(10) NULL;
		ALTER TABLE teachers ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50) NULL;
		ALTER TABLE teachers ADD COLUMN IF NOT EXISTS is_certified BOOLEAN NOT NULL DEFAULT FALSE;
		ALTER TABLE teachers ADD COLUMN IF NOT EXISTS subject_specialty VARCHAR(100) NULL;
		ALTER TABLE teachers ADD COLUMN IF NOT EXISTS code VARCHAR(50) NULL;
		ALTER TABLE teachers ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
		ALTER TABLE teachers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_teachers_tenant_id') THEN
				ALTER TABLE teachers ADD CONSTRAINT uq_teachers_tenant_id UNIQUE (tenant_id, id);
			END IF;
		END $$;

		CREATE UNIQUE INDEX IF NOT EXISTS uk_teachers_tenant_nip 
		ON teachers (tenant_id, LOWER(TRIM(nip_nuptk))) 
		WHERE nip_nuptk IS NOT NULL AND TRIM(nip_nuptk) != '' AND deleted_at IS NULL;

		CREATE INDEX IF NOT EXISTS idx_teachers_tenant_active 
		ON teachers (tenant_id, is_active) 
		WHERE deleted_at IS NULL;

		DROP TRIGGER IF EXISTS trg_teachers_updated_at ON teachers;
		CREATE TRIGGER trg_teachers_updated_at 
		BEFORE UPDATE ON teachers 
		FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

		-- Tabel Master Kelas (Dibuat setelah Teachers dengan Composite FK ke teachers(tenant_id, id))
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

		ALTER TABLE classes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES schools(id) ON DELETE CASCADE;
		DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'school_id') THEN 
			ALTER TABLE classes ALTER COLUMN school_id DROP NOT NULL;
			UPDATE classes SET tenant_id = school_id WHERE tenant_id IS NULL; 
			UPDATE classes SET school_id = tenant_id WHERE school_id IS NULL;
		END IF; END $$;
		DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'code') THEN 
			ALTER TABLE classes ALTER COLUMN code DROP NOT NULL;
		END IF; END $$;
		ALTER TABLE classes ADD COLUMN IF NOT EXISTS grade_level INT NULL;
		ALTER TABLE classes ADD COLUMN IF NOT EXISTS major VARCHAR(100) NULL;
		ALTER TABLE classes ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) DEFAULT '2024/2025';
		ALTER TABLE classes ADD COLUMN IF NOT EXISTS homeroom_teacher_id UUID NULL;
		ALTER TABLE classes ADD COLUMN IF NOT EXISTS student_count INT NOT NULL DEFAULT 0;
		ALTER TABLE classes ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
		ALTER TABLE classes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_classes_tenant_id') THEN
				ALTER TABLE classes ADD CONSTRAINT uq_classes_tenant_id UNIQUE (tenant_id, id);
			END IF;
		END $$;

		-- Tabel Master Mata Pelajaran
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

		ALTER TABLE subjects ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES schools(id) ON DELETE CASCADE;
		DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subjects' AND column_name = 'school_id') THEN UPDATE subjects SET tenant_id = school_id WHERE tenant_id IS NULL; END IF; END $$;
		ALTER TABLE subjects ADD COLUMN IF NOT EXISTS category VARCHAR(50) NULL;
		ALTER TABLE subjects ADD COLUMN IF NOT EXISTS weekly_default_hours INT NOT NULL DEFAULT 0;
		ALTER TABLE subjects ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
		ALTER TABLE subjects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_subjects_tenant_id') THEN
				ALTER TABLE subjects ADD CONSTRAINT uq_subjects_tenant_id UNIQUE (tenant_id, id);
			END IF;
		END $$;

		CREATE UNIQUE INDEX IF NOT EXISTS uk_subjects_tenant_code 
		ON subjects (tenant_id, UPPER(TRIM(code))) 
		WHERE deleted_at IS NULL;

		CREATE INDEX IF NOT EXISTS idx_subjects_tenant_active 
		ON subjects (tenant_id, is_active) 
		WHERE deleted_at IS NULL;

		DROP TRIGGER IF EXISTS trg_subjects_updated_at ON subjects;
		CREATE TRIGGER trg_subjects_updated_at 
		BEFORE UPDATE ON subjects 
		FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

		-- Row-Level Security (RLS)
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
	`)
	if err != nil {
		log.Println("[Database] Gagal migrasi master data tables (teachers, classes, subjects):", err)
	}

	// 6. Phase C: Master Data Extension (Teacher Code, Operating Days, Time Sessions)
	_, err = DB.Exec(`
		-- Tambah kolom code ke teachers jika belum ada
		ALTER TABLE teachers ADD COLUMN IF NOT EXISTS code VARCHAR(50) NULL;

		CREATE UNIQUE INDEX IF NOT EXISTS uk_teachers_tenant_code 
		ON teachers (tenant_id, UPPER(TRIM(code))) 
		WHERE code IS NOT NULL AND TRIM(code) != '' AND deleted_at IS NULL;

		-- Tabel operating_days (Hari Operasional Sekolah)
		CREATE TABLE IF NOT EXISTS operating_days (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
			day_of_week VARCHAR(20) NOT NULL,
			day_name VARCHAR(50) NOT NULL,
			order_index INT NOT NULL DEFAULT 1,
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			total_sessions INT NOT NULL DEFAULT 0,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			deleted_at TIMESTAMP WITH TIME ZONE NULL,
			CONSTRAINT chk_operating_days_name_not_empty CHECK (TRIM(day_name) != '')
		);

		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_operating_days_tenant_id') THEN
				ALTER TABLE operating_days ADD CONSTRAINT uq_operating_days_tenant_id UNIQUE (tenant_id, id);
			END IF;
		END $$;

		CREATE UNIQUE INDEX IF NOT EXISTS uk_operating_days_tenant_day
		ON operating_days (tenant_id, UPPER(TRIM(day_of_week)))
		WHERE deleted_at IS NULL;

		CREATE INDEX IF NOT EXISTS idx_operating_days_tenant_order
		ON operating_days (tenant_id, order_index);

		DROP TRIGGER IF EXISTS trg_operating_days_updated_at ON operating_days;
		CREATE TRIGGER trg_operating_days_updated_at
		BEFORE UPDATE ON operating_days
		FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

		-- Tabel time_sessions (Slot Sesi Waktu per Hari)
		CREATE TABLE IF NOT EXISTS time_sessions (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
			operating_day_id UUID NOT NULL,
			session_number INT NOT NULL,
			session_type VARCHAR(20) NOT NULL DEFAULT 'KBM',
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

		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_time_sessions_day_tenant') THEN
				ALTER TABLE time_sessions ADD CONSTRAINT fk_time_sessions_day_tenant
				FOREIGN KEY (tenant_id, operating_day_id)
				REFERENCES operating_days(tenant_id, id)
				ON DELETE CASCADE;
			END IF;
		END $$;

		CREATE UNIQUE INDEX IF NOT EXISTS uk_time_sessions_day_number
		ON time_sessions (tenant_id, operating_day_id, session_number)
		WHERE deleted_at IS NULL;

		CREATE INDEX IF NOT EXISTS idx_time_sessions_tenant_day
		ON time_sessions (tenant_id, operating_day_id, session_number);

		DROP TRIGGER IF EXISTS trg_time_sessions_updated_at ON time_sessions;
		CREATE TRIGGER trg_time_sessions_updated_at
		BEFORE UPDATE ON time_sessions
		FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

		-- RLS
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
	`)
	if err != nil {
		log.Println("[Database] Gagal migrasi operating_days dan time_sessions:", err)
	}

	// 7. Phase C.4: Migration 003 Normalized Schedules Table with Anti-Clash Constraints & RLS
	_, err = DB.Exec(`
		-- Ensure composite unique constraints on referenced master tables
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

		-- Table schedules (Normalized Lesson Schedule)
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

		-- Composite Foreign Keys: Multi-tenant reference validation
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

		-- Database Anti-Clash Indexes
		CREATE UNIQUE INDEX IF NOT EXISTS uk_schedules_teacher_slot
		ON schedules (tenant_id, academic_year, day_id, session_id, teacher_id)
		WHERE deleted_at IS NULL;

		CREATE UNIQUE INDEX IF NOT EXISTS uk_schedules_class_slot
		ON schedules (tenant_id, academic_year, day_id, session_id, class_id)
		WHERE deleted_at IS NULL;

		CREATE UNIQUE INDEX IF NOT EXISTS uk_schedules_room_slot
		ON schedules (tenant_id, academic_year, day_id, session_id, room_id)
		WHERE room_id IS NOT NULL AND deleted_at IS NULL;

		CREATE INDEX IF NOT EXISTS idx_schedules_tenant_year_grid
		ON schedules (tenant_id, academic_year, day_id, session_id);

		DROP TRIGGER IF EXISTS trg_schedules_updated_at ON schedules;
		CREATE TRIGGER trg_schedules_updated_at
		BEFORE UPDATE ON schedules
		FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

		-- RLS for schedules
		ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

		DROP POLICY IF EXISTS tenant_isolation_schedules ON schedules;
		CREATE POLICY tenant_isolation_schedules ON schedules
			FOR ALL
			USING (
				current_setting('app.is_super_admin', true) = 'true'
				OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
			);
	`)
	if err != nil {
		log.Println("[Database] Gagal migrasi schedules table:", err)
	}
}
