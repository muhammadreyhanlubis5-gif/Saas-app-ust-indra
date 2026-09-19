package handlers

import (
	"encoding/json"
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

	c.JSON(http.StatusOK, gin.H{"message": "Validasi lembaga berhasil disimpan!"})
}
