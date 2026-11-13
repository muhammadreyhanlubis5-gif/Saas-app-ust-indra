package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	"jadwal-api/core/database"
	"jadwal-api/core/middleware"
	"jadwal-api/core/realtime"
)

type SchoolProfileResponse struct {
	ID                 string   `json:"id"`
	Name               string   `json:"name"`
	Address            *string  `json:"address"`
	HeadmasterName     *string  `json:"headmaster_name"`
	ViceHeadmasterName *string  `json:"vice_headmaster_name"`
	ScheduleDate       *string  `json:"schedule_date"`
	AcademicYear       *string  `json:"academic_year"`
	Semester           *string  `json:"semester"`
	ActiveDays         []string `json:"active_days"`
}

type sqlDateStruct struct {
	Time *time.Time
}

// resolveSchoolID extracts school_id strictly from authenticated session context
func resolveSchoolID(c *gin.Context) string {
	schoolID := c.GetString("school_id")
	if schoolID == "" {
		schoolID = c.GetString("tenant_id")
	}
	return schoolID
}

// GetMySchoolProfile mengambil data profil sekolah dengan safe empty fallback 200 OK
// GET /api/v1/school/profile
func GetMySchoolProfile(c *gin.Context) {
	schoolID := resolveSchoolID(c)

	// Safe Empty State default
	emptyProfile := SchoolProfileResponse{
		ID:         schoolID,
		Name:       "",
		ActiveDays: []string{"Senin", "Selasa", "Rabu", "Kamis", "Jumat"},
	}

	if schoolID == "" || database.DB == nil {
		c.JSON(http.StatusOK, emptyProfile)
		return
	}

	var p SchoolProfileResponse
	var scheduleDate sqlDateStruct
	var activeDaysBytes []byte

	var query string
	var err error

	if middleware.IsValidUUID(schoolID) {
		query = `
			SELECT id, name, address, headmaster_name, vice_headmaster_name, schedule_date, academic_year, semester, active_days
			FROM schools WHERE id = $1
		`
		err = database.DB.QueryRow(query, schoolID).Scan(
			&p.ID, &p.Name, &p.Address, &p.HeadmasterName, &p.ViceHeadmasterName, &scheduleDate.Time, &p.AcademicYear, &p.Semester, &activeDaysBytes,
		)
	} else {
		query = `
			SELECT id, name, address, headmaster_name, vice_headmaster_name, schedule_date, academic_year, semester, active_days
			FROM schools WHERE id::text = $1
		`
		err = database.DB.QueryRow(query, schoolID).Scan(
			&p.ID, &p.Name, &p.Address, &p.HeadmasterName, &p.ViceHeadmasterName, &scheduleDate.Time, &p.AcademicYear, &p.Semester, &activeDaysBytes,
		)
	}

	if err != nil {
		if err == sql.ErrNoRows {
			// Kembalikan empty state 200 OK jika belum ada row untuk sekolah ini
			c.JSON(http.StatusOK, emptyProfile)
			return
		}
		// Error database tak terduga: kirim respon terstruktur tanpa stack trace publik
		middleware.RespondError(c, http.StatusInternalServerError, "DASHBOARD_LOAD_FAILED", "Data profil lembaga tidak dapat dimuat.", err, "DATABASE_ERROR")
		return
	}

	if scheduleDate.Time != nil {
		dateStr := scheduleDate.Time.Format("2006-01-02")
		p.ScheduleDate = &dateStr
	}

	if len(activeDaysBytes) > 0 {
		_ = json.Unmarshal(activeDaysBytes, &p.ActiveDays)
	} else {
		p.ActiveDays = []string{"Senin", "Selasa", "Rabu", "Kamis", "Jumat"}
	}

	c.JSON(http.StatusOK, p)
}

type UpdateSchoolProfileReq struct {
	HeadmasterName     string   `json:"headmaster_name"`
	ViceHeadmasterName string   `json:"vice_headmaster_name"`
	Address            string   `json:"address"`
	ScheduleDate       string   `json:"schedule_date"` // YYYY-MM-DD
	AcademicYear       string   `json:"academic_year"`
	Semester           string   `json:"semester"`
	ActiveDays         []string `json:"active_days"`
}

// UpdateMySchoolProfile menyimpan konfigurasi profil sekolah
// PUT /api/v1/school/profile
func UpdateMySchoolProfile(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	schoolID := resolveSchoolID(c)
	if schoolID == "" {
		middleware.RespondError(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.", nil, "AUTH_ERROR")
		return
	}

	var req UpdateSchoolProfileReq
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_PAYLOAD", "Format data profil tidak valid", err, "VALIDATION_ERROR")
		return
	}

	// Validasi aturan domain spesifik (Status 422: Unprocessable Entity)
	if req.AcademicYear != "" {
		match, _ := regexp.MatchString(`^\d{4}-\d{4}$`, req.AcademicYear)
		if !match {
			middleware.RespondError(c, http.StatusUnprocessableEntity, "VALIDATION_FAILED", "Format tahun pelajaran harus YYYY-YYYY (contoh: 2026-2027)", nil, "BUSINESS_RULE_VIOLATION")
			return
		}
	}
	if len(req.ActiveDays) == 0 {
		middleware.RespondError(c, http.StatusUnprocessableEntity, "VALIDATION_FAILED", "Minimal 1 hari aktif KBM wajib dipilih", nil, "BUSINESS_RULE_VIOLATION")
		return
	}

	activeDaysBytes, _ := json.Marshal(req.ActiveDays)

	var parsedDate *time.Time
	if req.ScheduleDate != "" {
		t, err := time.Parse("2006-01-02", req.ScheduleDate)
		if err == nil {
			parsedDate = &t
		}
	}

	var err error
	if middleware.IsValidUUID(schoolID) {
		_, err = database.DB.Exec(`
			UPDATE schools 
			SET headmaster_name = $1, vice_headmaster_name = $2, address = $3, 
			    schedule_date = $4, academic_year = $5, semester = $6, active_days = $7
			WHERE id = $8
		`, req.HeadmasterName, req.ViceHeadmasterName, req.Address, parsedDate, req.AcademicYear, req.Semester, string(activeDaysBytes), schoolID)
	} else {
		_, err = database.DB.Exec(`
			UPDATE schools 
			SET headmaster_name = $1, vice_headmaster_name = $2, address = $3, 
			    schedule_date = $4, academic_year = $5, semester = $6, active_days = $7
			WHERE id::text = $8
		`, req.HeadmasterName, req.ViceHeadmasterName, req.Address, parsedDate, req.AcademicYear, req.Semester, string(activeDaysBytes), schoolID)
	}

	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "PROFILE_UPDATE_FAILED", "Gagal menyimpan konfigurasi lembaga", err, "DATABASE_ERROR")
		return
	}

	if realtime.GlobalHub != nil {
		realtime.GlobalHub.BroadcastProgress(schoolID, 10, "Validasi Lembaga")
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profil sekolah berhasil diperbarui"})
}

type SessionPayload struct {
	Type      string `json:"type"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
}

type UpdateSessionsRequest struct {
	Sessions map[string][]SessionPayload `json:"sessions"` // Key: day_of_week
}

// GetSchoolSessions mengambil sesi KBM dengan safe empty map {} fallback 200 OK
// GET /api/v1/school/sessions
func GetSchoolSessions(c *gin.Context) {
	schoolID := resolveSchoolID(c)
	emptySessions := make(map[string][]SessionPayload)

	if schoolID == "" || database.DB == nil {
		c.JSON(http.StatusOK, emptySessions)
		return
	}

	var rows *sql.Rows
	var err error

	if middleware.IsValidUUID(schoolID) {
		rows, err = database.DB.Query(`
			SELECT day_of_week, session_index, type, 
			       start_time, 
			       end_time 
			FROM school_sessions 
			WHERE school_id = $1 
			ORDER BY day_of_week, session_index ASC
		`, schoolID)
	} else {
		rows, err = database.DB.Query(`
			SELECT day_of_week, session_index, type, 
			       start_time, 
			       end_time 
			FROM school_sessions 
			WHERE school_id::text = $1 
			ORDER BY day_of_week, session_index ASC
		`, schoolID)
	}

	if err != nil {
		// Non-fatal: kembalikan empty session
		c.JSON(http.StatusOK, emptySessions)
		return
	}
	defer rows.Close()

	sessionsByDay := make(map[string][]SessionPayload)
	for rows.Next() {
		var day, t, start, end string
		var idx int
		if err := rows.Scan(&day, &idx, &t, &start, &end); err == nil {
			sessionsByDay[day] = append(sessionsByDay[day], SessionPayload{
				Type:      t,
				StartTime: start,
				EndTime:   end,
			})
		}
	}

	c.JSON(http.StatusOK, sessionsByDay)
}

// UpdateSchoolSessions menyimpan jadwal sesi KBM
// PUT /api/v1/school/sessions
func UpdateSchoolSessions(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	schoolID := resolveSchoolID(c)
	if schoolID == "" {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_SCHOOL_ID", "School ID tidak valid", nil, "VALIDATION_ERROR")
		return
	}

	var req UpdateSessionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_PAYLOAD", "Format data sesi KBM tidak valid", err, "VALIDATION_ERROR")
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "TRANSACTION_START_FAILED", "Gagal memulai transaksi basis data", err, "DATABASE_ERROR")
		return
	}

	// Hapus semua sesi lama untuk sekolah ini
	if middleware.IsValidUUID(schoolID) {
		_, _ = tx.Exec("DELETE FROM school_sessions WHERE school_id = $1", schoolID)
	} else {
		_, _ = tx.Exec("DELETE FROM school_sessions WHERE school_id::text = $1", schoolID)
	}

	// Insert sesi baru
	for day, sessions := range req.Sessions {
		for i, sess := range sessions {
			if middleware.IsValidUUID(schoolID) {
				_, err = tx.Exec(`
					INSERT INTO school_sessions (school_id, day_of_week, session_index, type, start_time, end_time)
					VALUES ($1, $2, $3, $4, $5, $6)
				`, schoolID, day, i+1, sess.Type, sess.StartTime, sess.EndTime)
			} else {
				_, err = tx.Exec(`
					INSERT INTO school_sessions (school_id, day_of_week, session_index, type, start_time, end_time)
					VALUES ($1::uuid, $2, $3, $4, $5, $6)
				`, nil, day, i+1, sess.Type, sess.StartTime, sess.EndTime)
			}
			if err != nil {
				tx.Rollback()
				middleware.RespondError(c, http.StatusInternalServerError, "SESSION_SAVE_FAILED", "Gagal menyimpan rincian sesi KBM", err, "DATABASE_ERROR")
				return
			}
		}
	}

	if err := tx.Commit(); err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "TRANSACTION_COMMIT_FAILED", "Gagal menyimpan perubahan sesi", err, "DATABASE_ERROR")
		return
	}

	if realtime.GlobalHub != nil {
		realtime.GlobalHub.BroadcastProgress(schoolID, 30, "Sesi & Waktu KBM")
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sesi KBM berhasil diperbarui"})
}

// GetPengampuMapel mengambil data pengampu dengan safe fallback 200 OK
// GET /api/v1/school/pengampu
func GetPengampuMapel(c *gin.Context) {
	schoolID := resolveSchoolID(c)
	emptyPengampu := gin.H{"classes": []string{}, "rows": []interface{}{}}

	if schoolID == "" || database.DB == nil {
		c.JSON(http.StatusOK, emptyPengampu)
		return
	}

	var pengampuData []byte
	var err error

	if middleware.IsValidUUID(schoolID) {
		err = database.DB.QueryRow("SELECT pengampu_data FROM schools WHERE id = $1", schoolID).Scan(&pengampuData)
	} else {
		err = database.DB.QueryRow("SELECT pengampu_data FROM schools WHERE id::text = $1", schoolID).Scan(&pengampuData)
	}

	if err != nil || len(pengampuData) == 0 {
		// Non-fatal: kembalikan empty structure
		c.JSON(http.StatusOK, emptyPengampu)
		return
	}

	c.Data(http.StatusOK, "application/json", pengampuData)
}

// UpdatePengampuMapel menyimpan data pengampu jsonb
// PUT /api/v1/school/pengampu
func UpdatePengampuMapel(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	schoolID := resolveSchoolID(c)
	if schoolID == "" {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_SCHOOL_ID", "School ID tidak valid", nil, "VALIDATION_ERROR")
		return
	}

	rawData, err := c.GetRawData()
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_JSON", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	if middleware.IsValidUUID(schoolID) {
		_, err = database.DB.Exec("UPDATE schools SET pengampu_data = $1 WHERE id = $2", string(rawData), schoolID)
	} else {
		_, err = database.DB.Exec("UPDATE schools SET pengampu_data = $1 WHERE id::text = $2", string(rawData), schoolID)
	}

	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "PENGAMPU_SAVE_FAILED", "Gagal menyimpan data pengampu", err, "DATABASE_ERROR")
		return
	}

	if realtime.GlobalHub != nil {
		realtime.GlobalHub.BroadcastProgress(schoolID, 70, "Pengampu Mapel")
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data pengampu berhasil disimpan"})
}

// GetTugasTambahan mengambil data tugas tambahan jsonb
// GET /api/v1/school/tugas-tambahan
func GetTugasTambahan(c *gin.Context) {
	schoolID := resolveSchoolID(c)
	emptyData := gin.H{"assignments": []interface{}{}}

	if schoolID == "" || database.DB == nil {
		c.JSON(http.StatusOK, emptyData)
		return
	}

	var data []byte
	var err error

	if middleware.IsValidUUID(schoolID) {
		err = database.DB.QueryRow("SELECT tugas_tambahan FROM schools WHERE id = $1", schoolID).Scan(&data)
	} else {
		err = database.DB.QueryRow("SELECT tugas_tambahan FROM schools WHERE id::text = $1", schoolID).Scan(&data)
	}

	if err != nil || len(data) == 0 {
		c.JSON(http.StatusOK, emptyData)
		return
	}

	c.Data(http.StatusOK, "application/json", data)
}

// UpdateTugasTambahan menyimpan data tugas tambahan
// PUT /api/v1/school/tugas-tambahan
func UpdateTugasTambahan(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	schoolID := resolveSchoolID(c)
	if schoolID == "" {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_SCHOOL_ID", "School ID tidak valid", nil, "VALIDATION_ERROR")
		return
	}

	rawData, err := c.GetRawData()
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_JSON", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	if middleware.IsValidUUID(schoolID) {
		_, err = database.DB.Exec("UPDATE schools SET tugas_tambahan = $1 WHERE id = $2", string(rawData), schoolID)
	} else {
		_, err = database.DB.Exec("UPDATE schools SET tugas_tambahan = $1 WHERE id::text = $2", string(rawData), schoolID)
	}

	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "TUGAS_TAMBAHAN_SAVE_FAILED", "Gagal menyimpan data tugas tambahan", err, "DATABASE_ERROR")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data tugas tambahan berhasil disimpan"})
}

// GetJamKosong mengambil data jam kosong jsonb
// GET /api/v1/school/jam-kosong
func GetJamKosong(c *gin.Context) {
	schoolID := resolveSchoolID(c)
	emptyData := gin.H{"constraints": gin.H{}}

	if schoolID == "" || database.DB == nil {
		c.JSON(http.StatusOK, emptyData)
		return
	}

	var data []byte
	var err error

	if middleware.IsValidUUID(schoolID) {
		err = database.DB.QueryRow("SELECT jam_kosong_data FROM schools WHERE id = $1", schoolID).Scan(&data)
	} else {
		err = database.DB.QueryRow("SELECT jam_kosong_data FROM schools WHERE id::text = $1", schoolID).Scan(&data)
	}

	if err != nil || len(data) == 0 {
		c.JSON(http.StatusOK, emptyData)
		return
	}

	c.Data(http.StatusOK, "application/json", data)
}

// UpdateJamKosong menyimpan data jam kosong
// PUT /api/v1/school/jam-kosong
func UpdateJamKosong(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	schoolID := resolveSchoolID(c)
	if schoolID == "" {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_SCHOOL_ID", "School ID tidak valid", nil, "VALIDATION_ERROR")
		return
	}

	rawData, err := c.GetRawData()
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_JSON", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	if middleware.IsValidUUID(schoolID) {
		_, err = database.DB.Exec("UPDATE schools SET jam_kosong_data = $1 WHERE id = $2", string(rawData), schoolID)
	} else {
		_, err = database.DB.Exec("UPDATE schools SET jam_kosong_data = $1 WHERE id::text = $2", string(rawData), schoolID)
	}

	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "JAM_KOSONG_SAVE_FAILED", "Gagal menyimpan data jam kosong", err, "DATABASE_ERROR")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data jam kosong berhasil disimpan"})
}

// GetJadwal mengambil data jadwal
// GET /api/v1/school/jadwal
func GetJadwal(c *gin.Context) {
	schoolID := resolveSchoolID(c)
	emptyData := gin.H{"schedule": []interface{}{}, "status": "NOT_READY"}

	if schoolID == "" || database.DB == nil {
		c.JSON(http.StatusOK, emptyData)
		return
	}

	var data []byte
	var err error

	if middleware.IsValidUUID(schoolID) {
		err = database.DB.QueryRow("SELECT jadwal_data FROM schools WHERE id = $1", schoolID).Scan(&data)
	} else {
		err = database.DB.QueryRow("SELECT jadwal_data FROM schools WHERE id::text = $1", schoolID).Scan(&data)
	}

	if err != nil || len(data) == 0 {
		c.JSON(http.StatusOK, emptyData)
		return
	}

	c.Data(http.StatusOK, "application/json", data)
}

// UpdateJadwal menyimpan data jadwal
// PUT /api/v1/school/jadwal
func UpdateJadwal(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	schoolID := resolveSchoolID(c)
	if schoolID == "" {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_SCHOOL_ID", "School ID tidak valid", nil, "VALIDATION_ERROR")
		return
	}

	rawData, err := c.GetRawData()
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_JSON", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	if middleware.IsValidUUID(schoolID) {
		_, err = database.DB.Exec("UPDATE schools SET jadwal_data = $1 WHERE id = $2", string(rawData), schoolID)
	} else {
		_, err = database.DB.Exec("UPDATE schools SET jadwal_data = $1 WHERE id::text = $2", string(rawData), schoolID)
	}

	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, "JADWAL_SAVE_FAILED", "Gagal menyimpan data jadwal", err, "DATABASE_ERROR")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data jadwal berhasil disimpan"})
}

// SchoolDashboardSummary represents unified summary stats for School Admin
type SchoolDashboardSummary struct {
	TotalTeachers      int      `json:"totalTeachers"`
	TotalClasses       int      `json:"totalClasses"`
	TotalSubjects      int      `json:"totalSubjects"`
	TotalTeachingHours int      `json:"totalTeachingHours"`
	RecentActivities   []string `json:"recentActivities"`
	ScheduleStatus     string   `json:"scheduleStatus"`
	SchoolName         string   `json:"schoolName"`
}

// GetSchoolDashboardSummary endpoint terpadu ringkasan dashboard sekolah
// GET /api/v1/school/dashboard
func GetSchoolDashboardSummary(c *gin.Context) {
	schoolID := resolveSchoolID(c)

	summary := SchoolDashboardSummary{
		TotalTeachers:      0,
		TotalClasses:       0,
		TotalSubjects:      0,
		TotalTeachingHours: 0,
		RecentActivities:   []string{},
		ScheduleStatus:     "NOT_READY",
		SchoolName:         "",
	}

	if schoolID == "" || database.DB == nil {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    summary,
		})
		return
	}

	// 1. Ambil Nama Sekolah
	if middleware.IsValidUUID(schoolID) {
		_ = database.DB.QueryRow("SELECT name FROM schools WHERE id = $1", schoolID).Scan(&summary.SchoolName)
	} else {
		_ = database.DB.QueryRow("SELECT name FROM schools WHERE id::text = $1", schoolID).Scan(&summary.SchoolName)
	}

	// 2. Hitung Total Guru Terdaftar
	if middleware.IsValidUUID(schoolID) {
		_ = database.DB.QueryRow("SELECT COUNT(*) FROM users WHERE school_id = $1 AND role = 'TEACHER'", schoolID).Scan(&summary.TotalTeachers)
	} else {
		_ = database.DB.QueryRow("SELECT COUNT(*) FROM users WHERE school_id::text = $1 AND role = 'TEACHER'", schoolID).Scan(&summary.TotalTeachers)
	}

	// 3. Hitung Total Mata Pelajaran
	if middleware.IsValidUUID(schoolID) {
		_ = database.DB.QueryRow("SELECT COUNT(*) FROM subjects WHERE school_id = $1", schoolID).Scan(&summary.TotalSubjects)
	} else {
		_ = database.DB.QueryRow("SELECT COUNT(*) FROM subjects WHERE school_id::text = $1", schoolID).Scan(&summary.TotalSubjects)
	}

	// 4. Hitung Alokasi Pengampu & Jam
	var rawPengampu []byte
	if middleware.IsValidUUID(schoolID) {
		_ = database.DB.QueryRow("SELECT pengampu_data FROM schools WHERE id = $1", schoolID).Scan(&rawPengampu)
	} else {
		_ = database.DB.QueryRow("SELECT pengampu_data FROM schools WHERE id::text = $1", schoolID).Scan(&rawPengampu)
	}

	if len(rawPengampu) > 0 {
		var pData struct {
			Classes []string `json:"classes"`
			Rows    []struct {
				Hours []interface{} `json:"hours"`
			} `json:"rows"`
		}
		if err := json.Unmarshal(rawPengampu, &pData); err == nil {
			summary.TotalClasses = len(pData.Classes)
			for _, r := range pData.Rows {
				for _, h := range r.Hours {
					switch v := h.(type) {
					case float64:
						summary.TotalTeachingHours += int(v)
					case int:
						summary.TotalTeachingHours += v
					}
				}
			}
		}
	}

	if summary.TotalTeachingHours > 0 {
		summary.ScheduleStatus = "READY"
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    summary,
	})
}
