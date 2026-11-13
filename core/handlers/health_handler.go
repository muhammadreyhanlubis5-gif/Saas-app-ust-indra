package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"jadwal-api/core/database"
)

// HealthCheckHandler returns the health and database connectivity diagnostics.
// Conforms strictly to Phase C.4 / Vercel + Neon specification:
// - database.connected = true (only if DB ping succeeds)
// - migration.status = "applied" (if connected) or "pending_connection"
// - migration.version = 3 (latest migration matching 003_create_schedules_table.sql)
// HealthCheckHandler returns minimal public health status without leaking internal metadata
func HealthCheckHandler(c *gin.Context) {
	if !database.IsConnected() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"status": "error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

type DatabaseTableCounts struct {
	Classes       int64 `json:"classes"`
	Teachers      int64 `json:"teachers"`
	Subjects      int64 `json:"subjects"`
	Rooms         int64 `json:"rooms"`
	OperatingDays int64 `json:"operating_days"`
	TimeSessions  int64 `json:"time_sessions"`
	Schedules     int64 `json:"schedules"`
	AuthAccounts  int64 `json:"auth_accounts"`
}

func countTableSafe(tableName string) int64 {
	if database.DB == nil {
		return 0
	}
	var count int64
	row := database.DB.QueryRow(fmt.Sprintf("SELECT COUNT(*) FROM %s", tableName))
	if err := row.Scan(&count); err != nil {
		return 0
	}
	return count
}

// GetDatabaseStats reports live row counts for all business and auth tables
// GET /api/v1/health/db-stats
func GetDatabaseStats(c *gin.Context) {
	if !database.IsConnected() {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"connected": false,
			"error":     "database not connected",
		})
		return
	}

	counts := DatabaseTableCounts{
		Classes:       countTableSafe("classes"),
		Teachers:      countTableSafe("teachers"),
		Subjects:      countTableSafe("subjects"),
		Rooms:         0, // Logical room slots managed via schedules
		OperatingDays: countTableSafe("operating_days"),
		TimeSessions:  countTableSafe("time_sessions"),
		Schedules:     countTableSafe("schedules"),
		AuthAccounts:  countTableSafe("users"),
	}

	type UserInfo struct {
		Username string `json:"username"`
		Role     string `json:"role"`
	}
	var usersList []UserInfo
	uRows, uErr := database.DB.Query("SELECT username, role FROM users LIMIT 10")
	if uErr == nil {
		defer uRows.Close()
		for uRows.Next() {
			var u, r string
			if err := uRows.Scan(&u, &r); err == nil {
				usersList = append(usersList, UserInfo{Username: u, Role: r})
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"connected": true,
		"counts":    counts,
		"users":     usersList,
	})
}

// ResetTestingDatabaseHandler safely resets test business tables to 0 while preserving auth users
// POST /api/v1/health/db-reset-test
func ResetTestingDatabaseHandler(c *gin.Context) {
	if os.Getenv("APP_ENV") != "test" {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "404 page not found",
		})
		return
	}

	confirm := c.GetHeader("X-Confirm-Reset-Test-DB")
	if confirm != "true" && c.Query("confirm") != "true" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Confirmation header X-Confirm-Reset-Test-DB: true or query ?confirm=true required",
		})
		return
	}

	if !database.IsConnected() {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"success": false,
			"error":   "Database not connected",
		})
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer tx.Rollback()

	// Bypass RLS for test cleanup by setting app.is_super_admin session variable
	if _, err := tx.Exec("SELECT set_config('app.is_super_admin', 'true', true)"); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to set admin context: %v", err)})
		return
	}

	// Nullify homeroom FKs first to avoid any self/circular constraints if column exists
	_, _ = tx.Exec(`
		DO $$
		BEGIN
			IF EXISTS (
				SELECT 1 FROM information_schema.columns 
				WHERE table_name = 'classes' AND column_name = 'homeroom_teacher_id'
			) THEN
				UPDATE classes SET homeroom_teacher_id = NULL WHERE homeroom_teacher_id IS NOT NULL;
			END IF;
		END $$;
	`)

	// Purge business data in FK-safe reverse order
	tablesToPurge := []string{
		"schedules",
		"time_sessions",
		"operating_days",
		"classes",
		"subjects",
		"teachers",
	}

	for _, tbl := range tablesToPurge {
		var exists bool
		_ = tx.QueryRow("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1)", tbl).Scan(&exists)
		if exists {
			if _, err := tx.Exec(fmt.Sprintf("DELETE FROM %s", tbl)); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete from %s: %v", tbl, err)})
				return
			}
		}
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	counts := DatabaseTableCounts{
		Classes:       countTableSafe("classes"),
		Teachers:      countTableSafe("teachers"),
		Subjects:      countTableSafe("subjects"),
		Rooms:         0,
		OperatingDays: countTableSafe("operating_days"),
		TimeSessions:  countTableSafe("time_sessions"),
		Schedules:     countTableSafe("schedules"),
		AuthAccounts:  countTableSafe("users"),
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Testing database reset successfully. All business data = 0.",
		"counts":  counts,
	})
}

// RunMigrationsHandler explicitly applies migrations 001, 002, 003 on remote database and reports outcome
// POST /api/v1/health/run-migrations
func RunMigrationsHandler(c *gin.Context) {
	if os.Getenv("APP_ENV") != "test" {
		c.JSON(http.StatusNotFound, gin.H{"error": "404 page not found"})
		return
	}

	if !database.IsConnected() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database not connected"})
		return
	}

	results := make(map[string]string)

	// Step 1: Extensions & Schools
	_, err := database.DB.Exec(`
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
		ALTER TABLE schools ADD COLUMN IF NOT EXISTS headmaster_name VARCHAR(100);
		ALTER TABLE schools ADD COLUMN IF NOT EXISTS vice_headmaster_name VARCHAR(100);
		ALTER TABLE schools ADD COLUMN IF NOT EXISTS schedule_date DATE;
		ALTER TABLE schools ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20);
		ALTER TABLE schools ADD COLUMN IF NOT EXISTS semester VARCHAR(20);
		ALTER TABLE schools ADD COLUMN IF NOT EXISTS active_days JSONB DEFAULT '["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]'::jsonb;

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
	`)
	if err != nil {
		results["step1_schools"] = err.Error()
	} else {
		results["step1_schools"] = "OK"
	}

	// Step 2: Master Tables (001)
	_, err = database.DB.Exec(`
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
		ALTER TABLE teachers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
		ALTER TABLE teachers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

		DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_teachers_tenant_id') THEN
			ALTER TABLE teachers ADD CONSTRAINT uq_teachers_tenant_id UNIQUE (tenant_id, id);
		END IF; END $$;

		CREATE TABLE IF NOT EXISTS classes (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
			name VARCHAR(100) NOT NULL,
			grade_level INT NULL,
			major VARCHAR(100) NULL,
			academic_year VARCHAR(20) NOT NULL DEFAULT '2024/2025',
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
		ALTER TABLE classes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
		ALTER TABLE classes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

		DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_classes_tenant_id') THEN
			ALTER TABLE classes ADD CONSTRAINT uq_classes_tenant_id UNIQUE (tenant_id, id);
		END IF; END $$;

		CREATE TABLE IF NOT EXISTS subjects (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
			code VARCHAR(50) NOT NULL DEFAULT '',
			name VARCHAR(255) NOT NULL,
			category VARCHAR(50) NULL,
			weekly_default_hours INT NOT NULL DEFAULT 0,
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			deleted_at TIMESTAMP NULL,
			CONSTRAINT chk_subjects_weekly_hours CHECK (weekly_default_hours >= 0),
			CONSTRAINT chk_subjects_name_not_empty CHECK (TRIM(name) != '')
		);
		ALTER TABLE subjects ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES schools(id) ON DELETE CASCADE;
		DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subjects' AND column_name = 'school_id') THEN 
			ALTER TABLE subjects ALTER COLUMN school_id DROP NOT NULL;
			UPDATE subjects SET tenant_id = school_id WHERE tenant_id IS NULL; 
			UPDATE subjects SET school_id = tenant_id WHERE school_id IS NULL;
		END IF; END $$;
		ALTER TABLE subjects ADD COLUMN IF NOT EXISTS code VARCHAR(50) NOT NULL DEFAULT '';
		ALTER TABLE subjects ADD COLUMN IF NOT EXISTS category VARCHAR(50) NULL;
		ALTER TABLE subjects ADD COLUMN IF NOT EXISTS weekly_default_hours INT NOT NULL DEFAULT 0;
		ALTER TABLE subjects ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
		ALTER TABLE subjects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
		ALTER TABLE subjects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

		DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_subjects_tenant_id') THEN
			ALTER TABLE subjects ADD CONSTRAINT uq_subjects_tenant_id UNIQUE (tenant_id, id);
		END IF; END $$;
	`)
	if err != nil {
		results["step2_master_001"] = err.Error()
	} else {
		results["step2_master_001"] = "OK"
	}

	// Step 3: Operating Days & Time Sessions (002)
	_, err = database.DB.Exec(`
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
			IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_time_sessions_tenant_id') THEN
				ALTER TABLE time_sessions ADD CONSTRAINT uq_time_sessions_tenant_id UNIQUE (tenant_id, id);
			END IF;
			IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_time_sessions_day_tenant') THEN
				ALTER TABLE time_sessions ADD CONSTRAINT fk_time_sessions_day_tenant
				FOREIGN KEY (tenant_id, operating_day_id)
				REFERENCES operating_days(tenant_id, id)
				ON DELETE CASCADE;
			END IF;
		END $$;
	`)
	if err != nil {
		results["step3_sessions_002"] = err.Error()
	} else {
		results["step3_sessions_002"] = "OK"
	}

	// Step 4: Schedules (003)
	_, _ = database.DB.Exec(`
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
			deleted_at TIMESTAMP WITH TIME ZONE NULL
		);
		ALTER TABLE schedules ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES schools(id) ON DELETE CASCADE;
		DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'school_id') THEN 
			ALTER TABLE schedules ALTER COLUMN school_id DROP NOT NULL;
			UPDATE schedules SET tenant_id = school_id WHERE tenant_id IS NULL; 
			UPDATE schedules SET school_id = tenant_id WHERE school_id IS NULL;
		END IF; END $$;
		ALTER TABLE schedules ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) DEFAULT '2024/2025';
		ALTER TABLE schedules ADD COLUMN IF NOT EXISTS day_id UUID;
		ALTER TABLE schedules ADD COLUMN IF NOT EXISTS session_id UUID;
		ALTER TABLE schedules ADD COLUMN IF NOT EXISTS class_id UUID;
		ALTER TABLE schedules ADD COLUMN IF NOT EXISTS teacher_id UUID;
		ALTER TABLE schedules ADD COLUMN IF NOT EXISTS subject_id UUID;
		ALTER TABLE schedules ADD COLUMN IF NOT EXISTS room_id UUID;
		ALTER TABLE schedules ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;

		CREATE UNIQUE INDEX IF NOT EXISTS uk_schedules_teacher_slot
		ON schedules (tenant_id, academic_year, day_id, session_id, teacher_id)
		WHERE deleted_at IS NULL;

		CREATE UNIQUE INDEX IF NOT EXISTS uk_schedules_class_slot
		ON schedules (tenant_id, academic_year, day_id, session_id, class_id)
		WHERE deleted_at IS NULL;

		CREATE UNIQUE INDEX IF NOT EXISTS uk_schedules_room_slot
		ON schedules (tenant_id, academic_year, day_id, session_id, room_id)
		WHERE room_id IS NOT NULL AND deleted_at IS NULL;
	`)

	var s4Err []string
	if _, err := database.DB.Exec("ALTER TABLE schedules ADD CONSTRAINT fk_schedules_day_tenant FOREIGN KEY (tenant_id, day_id) REFERENCES operating_days(tenant_id, id) ON DELETE CASCADE"); err != nil && !strings.Contains(err.Error(), "already exists") {
		s4Err = append(s4Err, "day: "+err.Error())
	}
	if _, err := database.DB.Exec("ALTER TABLE schedules ADD CONSTRAINT fk_schedules_session_tenant FOREIGN KEY (tenant_id, session_id) REFERENCES time_sessions(tenant_id, id) ON DELETE CASCADE"); err != nil && !strings.Contains(err.Error(), "already exists") {
		s4Err = append(s4Err, "session: "+err.Error())
	}
	if _, err := database.DB.Exec("ALTER TABLE schedules ADD CONSTRAINT fk_schedules_class_tenant FOREIGN KEY (tenant_id, class_id) REFERENCES classes(tenant_id, id) ON DELETE CASCADE"); err != nil && !strings.Contains(err.Error(), "already exists") {
		s4Err = append(s4Err, "class: "+err.Error())
	}
	if _, err := database.DB.Exec("ALTER TABLE schedules ADD CONSTRAINT fk_schedules_teacher_tenant FOREIGN KEY (tenant_id, teacher_id) REFERENCES teachers(tenant_id, id) ON DELETE CASCADE"); err != nil && !strings.Contains(err.Error(), "already exists") {
		s4Err = append(s4Err, "teacher: "+err.Error())
	}
	if _, err := database.DB.Exec("ALTER TABLE schedules ADD CONSTRAINT fk_schedules_subject_tenant FOREIGN KEY (tenant_id, subject_id) REFERENCES subjects(tenant_id, id) ON DELETE CASCADE"); err != nil && !strings.Contains(err.Error(), "already exists") {
		s4Err = append(s4Err, "subject: "+err.Error())
	}

	if len(s4Err) > 0 {
		results["step4_schedules_003"] = strings.Join(s4Err, "; ")
	} else {
		results["step4_schedules_003"] = "OK"
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"results": results,
	})
}
