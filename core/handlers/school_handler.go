package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"jadwal-api/core/database"
)

type SchoolProfileResponse struct {
	ID                 string     `json:"id"`
	Name               string     `json:"name"`
	Address            *string    `json:"address"`
	HeadmasterName     *string    `json:"headmaster_name"`
	ViceHeadmasterName *string    `json:"vice_headmaster_name"`
	ScheduleDate       *string    `json:"schedule_date"`
	AcademicYear       *string    `json:"academic_year"`
	Semester           *string    `json:"semester"`
	ActiveDays         []string   `json:"active_days"`
}

func GetMySchoolProfile(c *gin.Context) {
	// Ambil school_id dari context middleware otorisasi (nanti akan kita set di JWT Middleware, sementara pakai header / simulasi)
	// Untuk saat ini karena belum ada middleware yang inject schoolID ke context secara penuh, kita ambil dari header (atau nanti token)
	schoolID := c.GetHeader("X-School-ID")
	if schoolID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "School ID missing"})
		return
	}

	var p SchoolProfileResponse
	var scheduleDate sqlDateStruct
	var activeDaysBytes []byte

	err := database.DB.QueryRow(`
		SELECT id, name, address, headmaster_name, vice_headmaster_name, schedule_date, academic_year, semester, active_days
		FROM schools WHERE id = $1
	`, schoolID).Scan(
		&p.ID, &p.Name, &p.Address, &p.HeadmasterName, &p.ViceHeadmasterName, &scheduleDate.Time, &p.AcademicYear, &p.Semester, &activeDaysBytes,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data lembaga"})
		return
	}

	if scheduleDate.Time != nil {
		dateStr := scheduleDate.Time.Format("2006-01-02")
		p.ScheduleDate = &dateStr
	}

	if len(activeDaysBytes) > 0 {
		json.Unmarshal(activeDaysBytes, &p.ActiveDays)
	} else {
		p.ActiveDays = []string{}
	}

	c.JSON(http.StatusOK, p)
}

// Struct bantuan untuk handle null date
type sqlDateStruct struct {
	Time *time.Time
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

func UpdateMySchoolProfile(c *gin.Context) {
	schoolID := c.GetHeader("X-School-ID")
	if schoolID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "School ID missing"})
		return
	}

	var req UpdateSchoolProfileReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid"})
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

	_, err := database.DB.Exec(`
		UPDATE schools 
		SET headmaster_name = $1, vice_headmaster_name = $2, address = $3, 
		    schedule_date = $4, academic_year = $5, semester = $6, active_days = $7
		WHERE id = $8
	`, req.HeadmasterName, req.ViceHeadmasterName, req.Address, parsedDate, req.AcademicYear, req.Semester, string(activeDaysBytes), schoolID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan konfigurasi lembaga"})
		return
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

func GetSchoolSessions(c *gin.Context) {
	schoolID := c.GetHeader("X-School-ID")
	if schoolID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Akses Ditolak: X-School-ID kosong"})
		return
	}

	rows, err := database.DB.Query(`
		SELECT day_of_week, session_index, type, 
		       start_time, 
		       end_time 
		FROM school_sessions 
		WHERE school_id = $1 
		ORDER BY day_of_week, session_index ASC
	`, schoolID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil sesi KBM"})
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

func UpdateSchoolSessions(c *gin.Context) {
	schoolID := c.GetHeader("X-School-ID")
	if schoolID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Akses Ditolak: X-School-ID kosong"})
		return
	}

	var req UpdateSessionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data sesi tidak valid"})
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memulai transaksi"})
		return
	}

	// Hapus semua sesi lama untuk klien ini
	_, err = tx.Exec("DELETE FROM school_sessions WHERE school_id = $1", schoolID)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus sesi lama"})
		return
	}

	// Insert sesi baru
	for day, sessions := range req.Sessions {
		for i, sess := range sessions {
			_, err = tx.Exec(`
				INSERT INTO school_sessions (school_id, day_of_week, session_index, type, start_time, end_time)
				VALUES ($1, $2, $3, $4, $5, $6)
			`, schoolID, day, i+1, sess.Type, sess.StartTime, sess.EndTime)
			if err != nil {
				tx.Rollback()
				log.Println("Insert session error:", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan sesi baru"})
				return
			}
		}
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal commit transaksi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sesi KBM berhasil diperbarui"})
}

// GetPengampuMapel mengambil data pengampu jsonb
func GetPengampuMapel(c *gin.Context) {
	schoolID := c.GetHeader("X-School-ID")
	if schoolID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing X-School-ID"})
		return
	}

	var pengampuData []byte
	err := database.DB.QueryRow("SELECT pengampu_data FROM schools WHERE id = $1", schoolID).Scan(&pengampuData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pengampu"})
		return
	}

	c.Data(http.StatusOK, "application/json", pengampuData)
}

// UpdatePengampuMapel menyimpan data pengampu jsonb
func UpdatePengampuMapel(c *gin.Context) {
	schoolID := c.GetHeader("X-School-ID")
	if schoolID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing X-School-ID"})
		return
	}

	rawData, err := c.GetRawData()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	_, err = database.DB.Exec("UPDATE schools SET pengampu_data = $1 WHERE id = $2", string(rawData), schoolID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data pengampu"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data pengampu berhasil disimpan"})
}

// GetTugasTambahan mengambil data tugas tambahan jsonb
func GetTugasTambahan(c *gin.Context) {
	schoolID := c.GetHeader("X-School-ID")
	if schoolID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing X-School-ID"})
		return
	}

	var data []byte
	err := database.DB.QueryRow("SELECT tugas_tambahan FROM schools WHERE id = $1", schoolID).Scan(&data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data tugas tambahan"})
		return
	}

	c.Data(http.StatusOK, "application/json", data)
}

// UpdateTugasTambahan menyimpan data tugas tambahan jsonb
func UpdateTugasTambahan(c *gin.Context) {
	schoolID := c.GetHeader("X-School-ID")
	if schoolID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing X-School-ID"})
		return
	}

	rawData, err := c.GetRawData()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	_, err = database.DB.Exec("UPDATE schools SET tugas_tambahan = $1 WHERE id = $2", string(rawData), schoolID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data tugas tambahan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data tugas tambahan berhasil disimpan"})
}

// GetJamKosong mengambil data jam kosong jsonb
func GetJamKosong(c *gin.Context) {
	schoolID := c.GetHeader("X-School-ID")
	if schoolID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing X-School-ID"})
		return
	}

	var data []byte
	err := database.DB.QueryRow("SELECT jam_kosong_data FROM schools WHERE id = $1", schoolID).Scan(&data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data jam kosong"})
		return
	}

	c.Data(http.StatusOK, "application/json", data)
}

// UpdateJamKosong menyimpan data jam kosong jsonb
func UpdateJamKosong(c *gin.Context) {
	schoolID := c.GetHeader("X-School-ID")
	if schoolID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing X-School-ID"})
		return
	}

	rawData, err := c.GetRawData()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	_, err = database.DB.Exec("UPDATE schools SET jam_kosong_data = $1 WHERE id = $2", string(rawData), schoolID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data jam kosong"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data jam kosong berhasil disimpan"})
}
