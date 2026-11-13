package handlers

import (
	"crypto/rand"
	"database/sql"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"jadwal-api/core/database"
	"jadwal-api/core/middleware"
)

// requireDatabase ensures PostgreSQL is connected before performing any write/mutation.
// Returns HTTP 503 SERVICE_UNAVAILABLE if DB is not connected.
// In accordance with Phase C.4 specification: No write mutations may occur into memory when DB fails.
func requireDatabase(c *gin.Context) bool {
	if os.Getenv("ALLOW_IN_MEMORY_FOR_UNIT_TEST") == "true" {
		return true
	}
	if !database.IsConnected() {
		middleware.RespondError(c, http.StatusServiceUnavailable, "DATABASE_UNAVAILABLE", "Operasi penulisan ditolak: basis data PostgreSQL tidak terhubung atau sedang mengalami gangguan.", nil, "DATABASE_ERROR")
		return false
	}
	return true
}

func warnFallback(entity string) {
	log.Printf("[RUNTIME WARNING] PostgreSQL is not connected (database.DB == nil). Using in-memory fallback for %s. (NOT FOR PRODUCTION)\n", entity)
}

// Helper UUID v4 RFC4122 berbasis crypto/rand
func generateUUID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}

// PaginationMeta format standar pagination API
type PaginationMeta struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// ============================================================================
// MODELS DOMAIN (DTO)
// ============================================================================

type ClassDTO struct {
	ID                  string     `json:"id"`
	TenantID            string     `json:"tenant_id"`
	Name                string     `json:"name"`
	GradeLevel          *int       `json:"grade_level"`
	Major               string     `json:"major"`
	AcademicYear        string     `json:"academic_year"`
	HomeroomTeacherID   *string    `json:"homeroom_teacher_id"`
	HomeroomTeacherName string     `json:"homeroom_teacher_name,omitempty"`
	StudentCount        int        `json:"student_count"`
	IsActive            bool       `json:"is_active"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
	DeletedAt           *time.Time `json:"deleted_at,omitempty"`
}

type TeacherDTO struct {
	ID               string     `json:"id"`
	TenantID         string     `json:"tenant_id"`
	NipNuptk         *string    `json:"nip_nuptk"`
	Name             string     `json:"name"`
	Gender           string     `json:"gender"`
	EmploymentStatus string     `json:"employment_status"`
	IsCertified      bool       `json:"is_certified"`
	SubjectSpecialty string     `json:"subject_specialty"`
	IsActive         bool       `json:"is_active"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	DeletedAt        *time.Time `json:"deleted_at,omitempty"`
}

type SubjectDTO struct {
	ID                 string     `json:"id"`
	TenantID           string     `json:"tenant_id"`
	Code               string     `json:"code"`
	Name               string     `json:"name"`
	Category           string     `json:"category"`
	WeeklyDefaultHours int        `json:"weekly_default_hours"`
	IsActive           bool       `json:"is_active"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
	DeletedAt          *time.Time `json:"deleted_at,omitempty"`
}

// In-Memory store thread-safe saat offline / database.DB == nil
var (
	memMasterMu sync.RWMutex
	memClasses  = make(map[string]map[string]*ClassDTO)   // tenant_id -> id -> ClassDTO
	memTeachers = make(map[string]map[string]*TeacherDTO) // tenant_id -> id -> TeacherDTO
	memSubjects = make(map[string]map[string]*SubjectDTO) // tenant_id -> id -> SubjectDTO
)

// ============================================================================
// 1. CLASSES HANDLERS (DAFTAR KELAS)
// ============================================================================

type CreateClassPayload struct {
	Name              string  `json:"name"`
	GradeLevel        *int    `json:"grade_level"`
	Major             string  `json:"major"`
	AcademicYear      string  `json:"academic_year"`
	HomeroomTeacherID *string `json:"homeroom_teacher_id"`
	StudentCount      int     `json:"student_count"`
	IsActive          *bool   `json:"is_active"`
}

// GET /api/v1/school/classes
func GetClasses(c *gin.Context) {
	tenantID := resolveSchoolID(c)
	if tenantID == "" {
		middleware.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sesi autentikasi tidak valid", nil, "AUTH_ERROR")
		return
	}

	search := strings.ToLower(strings.TrimSpace(c.Query("q")))
	if search == "" {
		search = strings.ToLower(strings.TrimSpace(c.Query("search")))
	}
	academicYear := strings.TrimSpace(c.Query("academic_year"))
	isActiveStr := strings.TrimSpace(c.Query("is_active"))

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit < 1 {
		limit = 20
	} else if limit > 100 {
		limit = 100
	}

	// 1. Database PostgreSQL Mode
	if database.DB != nil {
		whereClauses := []string{"tenant_id = $1", "deleted_at IS NULL"}
		args := []interface{}{tenantID}
		argIdx := 2

		if search != "" {
			whereClauses = append(whereClauses, fmt.Sprintf("(LOWER(name) LIKE $%d OR LOWER(COALESCE(major, '')) LIKE $%d)", argIdx, argIdx))
			args = append(args, "%"+search+"%")
			argIdx++
		}

		if academicYear != "" {
			whereClauses = append(whereClauses, fmt.Sprintf("academic_year = $%d", argIdx))
			args = append(args, academicYear)
			argIdx++
		}

		if isActiveStr == "true" {
			whereClauses = append(whereClauses, fmt.Sprintf("is_active = $%d", argIdx))
			args = append(args, true)
			argIdx++
		} else if isActiveStr == "false" {
			whereClauses = append(whereClauses, fmt.Sprintf("is_active = $%d", argIdx))
			args = append(args, false)
			argIdx++
		}

		whereSql := strings.Join(whereClauses, " AND ")

		// Hitung Total Data
		var total int64
		countQuery := fmt.Sprintf("SELECT COUNT(*) FROM classes WHERE %s", whereSql)
		if err := database.DB.QueryRow(countQuery, args...).Scan(&total); err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_COUNT_FAILED", "Gagal menghitung data kelas", err, "DATABASE_ERROR")
			return
		}

		offset := (page - 1) * limit
		selectQuery := fmt.Sprintf(`
			SELECT c.id, c.tenant_id, c.name, c.grade_level, COALESCE(c.major, ''), c.academic_year,
			       c.homeroom_teacher_id, COALESCE(t.name, ''), c.student_count, c.is_active,
			       c.created_at, c.updated_at
			FROM classes c
			LEFT JOIN teachers t ON c.homeroom_teacher_id = t.id AND t.tenant_id = c.tenant_id
			WHERE %s
			ORDER BY c.academic_year DESC, c.name ASC
			LIMIT $%d OFFSET $%d
		`, whereSql, argIdx, argIdx+1)

		args = append(args, limit, offset)

		rows, err := database.DB.Query(selectQuery, args...)
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_QUERY_FAILED", "Gagal mengambil data kelas", err, "DATABASE_ERROR")
			return
		}
		defer rows.Close()

		results := make([]ClassDTO, 0)
		for rows.Next() {
			var cls ClassDTO
			var hrID sql.NullString
			var grade sql.NullInt64
			err := rows.Scan(
				&cls.ID, &cls.TenantID, &cls.Name, &grade, &cls.Major, &cls.AcademicYear,
				&hrID, &cls.HomeroomTeacherName, &cls.StudentCount, &cls.IsActive,
				&cls.CreatedAt, &cls.UpdatedAt,
			)
			if err != nil {
				continue
			}
			if grade.Valid {
				g := int(grade.Int64)
				cls.GradeLevel = &g
			}
			if hrID.Valid {
				cls.HomeroomTeacherID = &hrID.String
			}
			results = append(results, cls)
		}

		totalPages := int(math.Ceil(float64(total) / float64(limit)))
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    results,
			"pagination": PaginationMeta{
				Page:       page,
				Limit:      limit,
				Total:      total,
				TotalPages: totalPages,
			},
		})
		return
	}

	// 2. In-Memory Mode (Zero DB fallback)
	memMasterMu.RLock()
	defer memMasterMu.RUnlock()

	tenantClasses := memClasses[tenantID]
	all := make([]ClassDTO, 0)
	for _, cls := range tenantClasses {
		if cls.DeletedAt != nil {
			continue
		}
		if search != "" && !strings.Contains(strings.ToLower(cls.Name), search) && !strings.Contains(strings.ToLower(cls.Major), search) {
			continue
		}
		if academicYear != "" && cls.AcademicYear != academicYear {
			continue
		}
		if isActiveStr == "true" && !cls.IsActive {
			continue
		}
		if isActiveStr == "false" && cls.IsActive {
			continue
		}
		all = append(all, *cls)
	}

	total := int64(len(all))
	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	start := (page - 1) * limit
	end := start + limit
	if start > len(all) {
		start = len(all)
	}
	if end > len(all) {
		end = len(all)
	}
	sliced := all[start:end]

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    sliced,
		"pagination": PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	})
}

// POST /api/v1/school/classes
func CreateClass(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	tenantID := resolveSchoolID(c)
	if tenantID == "" {
		middleware.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sesi autentikasi tidak valid", nil, "AUTH_ERROR")
		return
	}

	var req CreateClassPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	var tx *sql.Tx
	if database.DB != nil {
		var err error
		tx, err = database.DB.BeginTx(c.Request.Context(), nil)
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_TX_FAILED", "Gagal memulai transaksi", err, "DATABASE_ERROR")
			return
		}
		defer tx.Rollback()
	}

	fields := make(map[string]string)
	name := strings.TrimSpace(req.Name)
	if name == "" {
		fields["name"] = "Nama kelas wajib diisi"
	}
	academicYear := strings.TrimSpace(req.AcademicYear)
	if academicYear == "" {
		fields["academic_year"] = "Tahun pelajaran wajib diisi"
	}
	if req.StudentCount < 0 {
		fields["student_count"] = "Jumlah siswa tidak boleh negatif"
	}

	// Validasi Homeroom Teacher: Harus guru aktif pada tenant yang sama
	var homeroomName string
	if req.HomeroomTeacherID != nil && strings.TrimSpace(*req.HomeroomTeacherID) != "" {
		tID := strings.TrimSpace(*req.HomeroomTeacherID)
		if tx != nil {
			var teacherName string
			var isActive bool
			err := tx.QueryRow(`
				SELECT name, is_active FROM teachers 
				WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
			`, tID, tenantID).Scan(&teacherName, &isActive)
			if err != nil || !isActive {
				fields["homeroom_teacher_id"] = "Wali kelas harus berasal dari guru aktif pada sekolah yang sama"
			} else {
				homeroomName = teacherName
			}
		} else {
			memMasterMu.RLock()
			teachers := memTeachers[tenantID]
			t, exists := teachers[tID]
			memMasterMu.RUnlock()
			if !exists || t.DeletedAt != nil || !t.IsActive {
				fields["homeroom_teacher_id"] = "Wali kelas harus berasal dari guru aktif pada sekolah yang sama"
			} else {
				homeroomName = t.Name
			}
		}
	}

	// Validasi Duplikasi Nama Kelas dalam tenant dan tahun pelajaran aktif
	if name != "" && academicYear != "" {
		if tx != nil {
			var count int
			_ = tx.QueryRow(`
				SELECT COUNT(*) FROM classes 
				WHERE tenant_id = $1 AND LOWER(TRIM(name)) = LOWER($2) AND academic_year = $3 AND deleted_at IS NULL
			`, tenantID, name, academicYear).Scan(&count)
			if count > 0 {
				fields["name"] = "Nama kelas sudah terdaftar untuk tahun pelajaran ini"
			}
		} else {
			memMasterMu.RLock()
			for _, cls := range memClasses[tenantID] {
				if cls.DeletedAt == nil && strings.EqualFold(strings.TrimSpace(cls.Name), name) && cls.AcademicYear == academicYear {
					fields["name"] = "Nama kelas sudah terdaftar untuk tahun pelajaran ini"
					break
				}
			}
			memMasterMu.RUnlock()
		}
	}

	if len(fields) > 0 {
		middleware.RespondValidationError(c, "Data kelas tidak valid", fields)
		return
	}

	newID := generateUUID()
	now := time.Now()
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	newClass := ClassDTO{
		ID:                  newID,
		TenantID:            tenantID,
		Name:                name,
		GradeLevel:          req.GradeLevel,
		Major:               strings.TrimSpace(req.Major),
		AcademicYear:        academicYear,
		HomeroomTeacherID:   req.HomeroomTeacherID,
		HomeroomTeacherName: homeroomName,
		StudentCount:        req.StudentCount,
		IsActive:            isActive,
		CreatedAt:           now,
		UpdatedAt:           now,
	}

	if tx != nil {
		_, err := tx.Exec(`
			INSERT INTO classes (id, tenant_id, name, grade_level, major, academic_year, homeroom_teacher_id, student_count, is_active, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		`, newClass.ID, newClass.TenantID, newClass.Name, newClass.GradeLevel, newClass.Major,
			newClass.AcademicYear, newClass.HomeroomTeacherID, newClass.StudentCount, newClass.IsActive, newClass.CreatedAt, newClass.UpdatedAt)
		if err != nil {
			if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "uk_classes") {
				c.JSON(http.StatusConflict, gin.H{
					"success": false,
					"error": gin.H{
						"code":    "DUPLICATE_CLASS",
						"message": "Nama kelas sudah digunakan pada sekolah ini untuk tahun pelajaran yang sama",
					},
				})
				return
			}
			middleware.RespondError(c, http.StatusInternalServerError, "DB_INSERT_FAILED", "Gagal menyimpan data kelas", err, "DATABASE_ERROR")
			return
		}
		if err := tx.Commit(); err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_COMMIT_FAILED", "Gagal menyelesaikan transaksi", err, "DATABASE_ERROR")
			return
		}
	} else {
		memMasterMu.Lock()
		if memClasses[tenantID] == nil {
			memClasses[tenantID] = make(map[string]*ClassDTO)
		}
		memClasses[tenantID][newID] = &newClass
		memMasterMu.Unlock()
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    newClass,
	})
}

// GET /api/v1/school/classes/:id
func GetClassByID(c *gin.Context) {
	tenantID := resolveSchoolID(c)
	classID := c.Param("id")

	if database.DB != nil {
		var cls ClassDTO
		var hrID sql.NullString
		var grade sql.NullInt64
		err := database.DB.QueryRow(`
			SELECT c.id, c.tenant_id, c.name, c.grade_level, COALESCE(c.major, ''), c.academic_year,
			       c.homeroom_teacher_id, COALESCE(t.name, ''), c.student_count, c.is_active,
			       c.created_at, c.updated_at
			FROM classes c
			LEFT JOIN teachers t ON c.homeroom_teacher_id = t.id AND t.tenant_id = c.tenant_id
			WHERE c.id = $1 AND c.tenant_id = $2 AND c.deleted_at IS NULL
		`, classID, tenantID).Scan(
			&cls.ID, &cls.TenantID, &cls.Name, &grade, &cls.Major, &cls.AcademicYear,
			&hrID, &cls.HomeroomTeacherName, &cls.StudentCount, &cls.IsActive,
			&cls.CreatedAt, &cls.UpdatedAt,
		)
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": "Data kelas tidak ditemukan",
				},
			})
			return
		} else if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_QUERY_FAILED", "Gagal mengambil detail kelas", err, "DATABASE_ERROR")
			return
		}

		if grade.Valid {
			g := int(grade.Int64)
			cls.GradeLevel = &g
		}
		if hrID.Valid {
			cls.HomeroomTeacherID = &hrID.String
		}

		c.JSON(http.StatusOK, gin.H{"success": true, "data": cls})
		return
	}

	// In-Memory
	memMasterMu.RLock()
	cls, exists := memClasses[tenantID][classID]
	memMasterMu.RUnlock()

	if !exists || cls.DeletedAt != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "NOT_FOUND",
				"message": "Data kelas tidak ditemukan",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": cls})
}

// PUT /api/v1/school/classes/:id
func UpdateClass(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	tenantID := resolveSchoolID(c)
	classID := c.Param("id")

	// 1. Verifikasi Kepemilikan dan Keberadaan Record Terlebih Dahulu (RLS Isolation)
	var existingAcademicYear string
	if database.DB != nil {
		err := database.DB.QueryRow(`
			SELECT academic_year FROM classes 
			WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
		`, classID, tenantID).Scan(&existingAcademicYear)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data kelas tidak ditemukan"}})
			return
		}
	} else {
		memMasterMu.RLock()
		existing, exists := memClasses[tenantID][classID]
		memMasterMu.RUnlock()
		if !exists || existing == nil || existing.DeletedAt != nil {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data kelas tidak ditemukan"}})
			return
		}
		existingAcademicYear = existing.AcademicYear
	}

	var req CreateClassPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	fields := make(map[string]string)
	name := strings.TrimSpace(req.Name)
	if name == "" {
		fields["name"] = "Nama kelas wajib diisi"
	}
	academicYear := strings.TrimSpace(req.AcademicYear)
	if academicYear == "" {
		academicYear = existingAcademicYear
	}
	if req.StudentCount < 0 {
		fields["student_count"] = "Jumlah siswa tidak boleh negatif"
	}

	// Validasi Homeroom Teacher
	var homeroomName string
	if req.HomeroomTeacherID != nil && strings.TrimSpace(*req.HomeroomTeacherID) != "" {
		tID := strings.TrimSpace(*req.HomeroomTeacherID)
		if database.DB != nil {
			var teacherName string
			var isActive bool
			err := database.DB.QueryRow(`
				SELECT name, is_active FROM teachers 
				WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
			`, tID, tenantID).Scan(&teacherName, &isActive)
			if err != nil || !isActive {
				fields["homeroom_teacher_id"] = "Wali kelas harus berasal dari guru aktif pada sekolah yang sama"
			} else {
				homeroomName = teacherName
			}
		} else {
			memMasterMu.RLock()
			t, exists := memTeachers[tenantID][tID]
			memMasterMu.RUnlock()
			if !exists || t.DeletedAt != nil || !t.IsActive {
				fields["homeroom_teacher_id"] = "Wali kelas harus berasal dari guru aktif pada sekolah yang sama"
			} else {
				homeroomName = t.Name
			}
		}
	}

	// Validasi Duplikasi Nama Kelas (Kecuali ID itu sendiri)
	if name != "" && academicYear != "" {
		if database.DB != nil {
			var count int
			_ = database.DB.QueryRow(`
				SELECT COUNT(*) FROM classes 
				WHERE tenant_id = $1 AND LOWER(TRIM(name)) = LOWER($2) AND academic_year = $3 AND id != $4 AND deleted_at IS NULL
			`, tenantID, name, academicYear, classID).Scan(&count)
			if count > 0 {
				fields["name"] = "Nama kelas sudah terdaftar untuk tahun pelajaran ini"
			}
		} else {
			memMasterMu.RLock()
			for id, cls := range memClasses[tenantID] {
				if id != classID && cls.DeletedAt == nil && strings.EqualFold(strings.TrimSpace(cls.Name), name) && cls.AcademicYear == academicYear {
					fields["name"] = "Nama kelas sudah terdaftar untuk tahun pelajaran ini"
					break
				}
			}
			memMasterMu.RUnlock()
		}
	}

	if len(fields) > 0 {
		middleware.RespondValidationError(c, "Data kelas tidak valid", fields)
		return
	}

	now := time.Now()
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	if database.DB != nil {
		res, err := database.DB.Exec(`
			UPDATE classes 
			SET name = $1, grade_level = $2, major = $3, academic_year = $4,
			    homeroom_teacher_id = $5, student_count = $6, is_active = $7, updated_at = $8
			WHERE id = $9 AND tenant_id = $10 AND deleted_at IS NULL
		`, name, req.GradeLevel, strings.TrimSpace(req.Major), academicYear,
			req.HomeroomTeacherID, req.StudentCount, isActive, now, classID, tenantID)
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_UPDATE_FAILED", "Gagal memperbarui data kelas", err, "DATABASE_ERROR")
			return
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data kelas tidak ditemukan"}})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": ClassDTO{
				ID:                  classID,
				TenantID:            tenantID,
				Name:                name,
				GradeLevel:          req.GradeLevel,
				Major:               strings.TrimSpace(req.Major),
				AcademicYear:        academicYear,
				HomeroomTeacherID:   req.HomeroomTeacherID,
				HomeroomTeacherName: homeroomName,
				StudentCount:        req.StudentCount,
				IsActive:            isActive,
				UpdatedAt:           now,
			},
		})
		return
	}

	// In-Memory
	memMasterMu.Lock()
	cls, exists := memClasses[tenantID][classID]
	if !exists || cls.DeletedAt != nil {
		memMasterMu.Unlock()
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data kelas tidak ditemukan"}})
		return
	}

	cls.Name = name
	cls.GradeLevel = req.GradeLevel
	cls.Major = strings.TrimSpace(req.Major)
	cls.AcademicYear = academicYear
	cls.HomeroomTeacherID = req.HomeroomTeacherID
	cls.HomeroomTeacherName = homeroomName
	cls.StudentCount = req.StudentCount
	cls.IsActive = isActive
	cls.UpdatedAt = now
	resCopy := *cls
	memMasterMu.Unlock()

	c.JSON(http.StatusOK, gin.H{"success": true, "data": resCopy})
}

// DELETE /api/v1/school/classes/:id (Soft Delete)
func DeleteClass(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	tenantID := resolveSchoolID(c)
	classID := c.Param("id")

	now := time.Now()

	if database.DB != nil {
		res, err := database.DB.Exec(`
			UPDATE classes 
			SET deleted_at = $1, is_active = FALSE, updated_at = $1
			WHERE id = $2 AND tenant_id = $3 AND deleted_at IS NULL
		`, now, classID, tenantID)
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_DELETE_FAILED", "Gagal menghapus data kelas", err, "DATABASE_ERROR")
			return
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data kelas tidak ditemukan"}})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Data kelas berhasil dihapus (soft delete)"})
		return
	}

	memMasterMu.Lock()
	cls, exists := memClasses[tenantID][classID]
	if !exists || cls.DeletedAt != nil {
		memMasterMu.Unlock()
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data kelas tidak ditemukan"}})
		return
	}

	cls.DeletedAt = &now
	cls.IsActive = false
	cls.UpdatedAt = now
	memMasterMu.Unlock()

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Data kelas berhasil dihapus (soft delete)"})
}

// ============================================================================
// 2. TEACHERS HANDLERS (DAFTAR GURU)
// ============================================================================

type CreateTeacherPayload struct {
	NipNuptk         *string `json:"nip_nuptk"`
	Name             string  `json:"name"`
	Gender           string  `json:"gender"`
	EmploymentStatus string  `json:"employment_status"`
	IsCertified      bool    `json:"is_certified"`
	SubjectSpecialty string  `json:"subject_specialty"`
	IsActive         *bool   `json:"is_active"`
}

// GET /api/v1/school/teachers
func GetTeachers(c *gin.Context) {
	tenantID := resolveSchoolID(c)
	if tenantID == "" {
		middleware.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sesi autentikasi tidak valid", nil, "AUTH_ERROR")
		return
	}

	search := strings.ToLower(strings.TrimSpace(c.Query("q")))
	if search == "" {
		search = strings.ToLower(strings.TrimSpace(c.Query("search")))
	}
	isActiveStr := strings.TrimSpace(c.Query("is_active"))

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit < 1 {
		limit = 20
	} else if limit > 100 {
		limit = 100
	}

	if database.DB != nil {
		whereClauses := []string{"tenant_id = $1", "deleted_at IS NULL"}
		args := []interface{}{tenantID}
		argIdx := 2

		if search != "" {
			whereClauses = append(whereClauses, fmt.Sprintf("(LOWER(name) LIKE $%d OR LOWER(COALESCE(nip_nuptk, '')) LIKE $%d OR LOWER(COALESCE(subject_specialty, '')) LIKE $%d)", argIdx, argIdx, argIdx))
			args = append(args, "%"+search+"%")
			argIdx++
		}

		if isActiveStr == "true" {
			whereClauses = append(whereClauses, fmt.Sprintf("is_active = $%d", argIdx))
			args = append(args, true)
			argIdx++
		} else if isActiveStr == "false" {
			whereClauses = append(whereClauses, fmt.Sprintf("is_active = $%d", argIdx))
			args = append(args, false)
			argIdx++
		}

		whereSql := strings.Join(whereClauses, " AND ")

		var total int64
		countQuery := fmt.Sprintf("SELECT COUNT(*) FROM teachers WHERE %s", whereSql)
		if err := database.DB.QueryRow(countQuery, args...).Scan(&total); err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_COUNT_FAILED", "Gagal menghitung data guru", err, "DATABASE_ERROR")
			return
		}

		offset := (page - 1) * limit
		selectQuery := fmt.Sprintf(`
			SELECT id, tenant_id, nip_nuptk, name, COALESCE(gender, ''),
			       COALESCE(employment_status, ''), is_certified, COALESCE(subject_specialty, ''),
			       is_active, created_at, updated_at
			FROM teachers
			WHERE %s
			ORDER BY name ASC
			LIMIT $%d OFFSET $%d
		`, whereSql, argIdx, argIdx+1)

		args = append(args, limit, offset)

		rows, err := database.DB.Query(selectQuery, args...)
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_QUERY_FAILED", "Gagal mengambil data guru", err, "DATABASE_ERROR")
			return
		}
		defer rows.Close()

		results := make([]TeacherDTO, 0)
		for rows.Next() {
			var t TeacherDTO
			var nip sql.NullString
			err := rows.Scan(
				&t.ID, &t.TenantID, &nip, &t.Name, &t.Gender,
				&t.EmploymentStatus, &t.IsCertified, &t.SubjectSpecialty,
				&t.IsActive, &t.CreatedAt, &t.UpdatedAt,
			)
			if err != nil {
				continue
			}
			if nip.Valid {
				t.NipNuptk = &nip.String
			}
			results = append(results, t)
		}

		totalPages := int(math.Ceil(float64(total) / float64(limit)))
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    results,
			"pagination": PaginationMeta{
				Page:       page,
				Limit:      limit,
				Total:      total,
				TotalPages: totalPages,
			},
		})
		return
	}

	// In-Memory Mode
	memMasterMu.RLock()
	defer memMasterMu.RUnlock()

	tenantTeachers := memTeachers[tenantID]
	all := make([]TeacherDTO, 0)
	for _, t := range tenantTeachers {
		if t.DeletedAt != nil {
			continue
		}
		if search != "" {
			nameMatch := strings.Contains(strings.ToLower(t.Name), search)
			nipMatch := t.NipNuptk != nil && strings.Contains(strings.ToLower(*t.NipNuptk), search)
			specMatch := strings.Contains(strings.ToLower(t.SubjectSpecialty), search)
			if !nameMatch && !nipMatch && !specMatch {
				continue
			}
		}
		if isActiveStr == "true" && !t.IsActive {
			continue
		}
		if isActiveStr == "false" && t.IsActive {
			continue
		}
		all = append(all, *t)
	}

	total := int64(len(all))
	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	start := (page - 1) * limit
	end := start + limit
	if start > len(all) {
		start = len(all)
	}
	if end > len(all) {
		end = len(all)
	}
	sliced := all[start:end]

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    sliced,
		"pagination": PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	})
}

// POST /api/v1/school/teachers
func CreateTeacher(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	tenantID := resolveSchoolID(c)
	if tenantID == "" {
		middleware.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sesi autentikasi tidak valid", nil, "AUTH_ERROR")
		return
	}

	var req CreateTeacherPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	var tx *sql.Tx
	if database.DB != nil {
		var err error
		tx, err = database.DB.BeginTx(c.Request.Context(), nil)
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_TX_FAILED", "Gagal memulai transaksi", err, "DATABASE_ERROR")
			return
		}
		defer tx.Rollback()
	}

	fields := make(map[string]string)
	name := strings.TrimSpace(req.Name)
	if name == "" {
		fields["name"] = "Nama guru wajib diisi"
	}

	var cleanNip *string
	if req.NipNuptk != nil && strings.TrimSpace(*req.NipNuptk) != "" {
		val := strings.TrimSpace(*req.NipNuptk)
		cleanNip = &val

		// Cek keunikan NIP dalam tenant
		if tx != nil {
			var count int
			_ = tx.QueryRow(`
				SELECT COUNT(*) FROM teachers 
				WHERE tenant_id = $1 AND LOWER(TRIM(nip_nuptk)) = LOWER($2) AND deleted_at IS NULL
			`, tenantID, val).Scan(&count)
			if count > 0 {
				fields["nip_nuptk"] = "NIP/NUPTK sudah terdaftar pada sekolah ini"
			}
		} else {
			memMasterMu.RLock()
			for _, t := range memTeachers[tenantID] {
				if t.DeletedAt == nil && t.NipNuptk != nil && strings.EqualFold(strings.TrimSpace(*t.NipNuptk), val) {
					fields["nip_nuptk"] = "NIP/NUPTK sudah terdaftar pada sekolah ini"
					break
				}
			}
			memMasterMu.RUnlock()
		}
	}

	if len(fields) > 0 {
		middleware.RespondValidationError(c, "Data guru tidak valid", fields)
		return
	}

	newID := generateUUID()
	now := time.Now()
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	newTeacher := TeacherDTO{
		ID:               newID,
		TenantID:         tenantID,
		NipNuptk:         cleanNip,
		Name:             name,
		Gender:           strings.TrimSpace(req.Gender),
		EmploymentStatus: strings.TrimSpace(req.EmploymentStatus),
		IsCertified:      req.IsCertified,
		SubjectSpecialty: strings.TrimSpace(req.SubjectSpecialty),
		IsActive:         isActive,
		CreatedAt:        now,
		UpdatedAt:        now,
	}

	if tx != nil {
		_, err := tx.Exec(`
			INSERT INTO teachers (id, tenant_id, nip_nuptk, name, gender, employment_status, is_certified, subject_specialty, is_active, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		`, newTeacher.ID, newTeacher.TenantID, newTeacher.NipNuptk, newTeacher.Name, newTeacher.Gender,
			newTeacher.EmploymentStatus, newTeacher.IsCertified, newTeacher.SubjectSpecialty, newTeacher.IsActive, newTeacher.CreatedAt, newTeacher.UpdatedAt)
		if err != nil {
			if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "uk_teachers") {
				c.JSON(http.StatusConflict, gin.H{
					"success": false,
					"error": gin.H{
						"code":    "DUPLICATE_NIP",
						"message": "NIP/NUPTK atau kode guru sudah digunakan pada sekolah ini",
					},
				})
				return
			}
			middleware.RespondError(c, http.StatusInternalServerError, "DB_INSERT_FAILED", "Gagal menyimpan data guru", err, "DATABASE_ERROR")
			return
		}
		if err := tx.Commit(); err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_COMMIT_FAILED", "Gagal menyelesaikan transaksi", err, "DATABASE_ERROR")
			return
		}
	} else {
		memMasterMu.Lock()
		if memTeachers[tenantID] == nil {
			memTeachers[tenantID] = make(map[string]*TeacherDTO)
		}
		memTeachers[tenantID][newID] = &newTeacher
		memMasterMu.Unlock()
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    newTeacher,
	})
}

// GET /api/v1/school/teachers/:id
func GetTeacherByID(c *gin.Context) {
	tenantID := resolveSchoolID(c)
	teacherID := c.Param("id")

	if database.DB != nil {
		var t TeacherDTO
		var nip sql.NullString
		err := database.DB.QueryRow(`
			SELECT id, tenant_id, nip_nuptk, name, COALESCE(gender, ''),
			       COALESCE(employment_status, ''), is_certified, COALESCE(subject_specialty, ''),
			       is_active, created_at, updated_at
			FROM teachers
			WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
		`, teacherID, tenantID).Scan(
			&t.ID, &t.TenantID, &nip, &t.Name, &t.Gender,
			&t.EmploymentStatus, &t.IsCertified, &t.SubjectSpecialty,
			&t.IsActive, &t.CreatedAt, &t.UpdatedAt,
		)
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data guru tidak ditemukan"}})
			return
		} else if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_QUERY_FAILED", "Gagal mengambil data guru", err, "DATABASE_ERROR")
			return
		}
		if nip.Valid {
			t.NipNuptk = &nip.String
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "data": t})
		return
	}

	memMasterMu.RLock()
	t, exists := memTeachers[tenantID][teacherID]
	memMasterMu.RUnlock()

	if !exists || t.DeletedAt != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data guru tidak ditemukan"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": t})
}

// PUT /api/v1/school/teachers/:id
func UpdateTeacher(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	tenantID := resolveSchoolID(c)
	teacherID := c.Param("id")

	// 1. Verifikasi Keberadaan dan Kepemilikan Record Terlebih Dahulu (RLS Isolation)
	if database.DB != nil {
		var dummy string
		err := database.DB.QueryRow(`
			SELECT id FROM teachers 
			WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
		`, teacherID, tenantID).Scan(&dummy)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data guru tidak ditemukan"}})
			return
		}
	} else {
		memMasterMu.RLock()
		existing, exists := memTeachers[tenantID][teacherID]
		memMasterMu.RUnlock()
		if !exists || existing == nil || existing.DeletedAt != nil {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data guru tidak ditemukan"}})
			return
		}
	}

	var req CreateTeacherPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	fields := make(map[string]string)
	name := strings.TrimSpace(req.Name)
	if name == "" {
		fields["name"] = "Nama guru wajib diisi"
	}

	var cleanNip *string
	if req.NipNuptk != nil && strings.TrimSpace(*req.NipNuptk) != "" {
		val := strings.TrimSpace(*req.NipNuptk)
		cleanNip = &val

		if database.DB != nil {
			var count int
			_ = database.DB.QueryRow(`
				SELECT COUNT(*) FROM teachers 
				WHERE tenant_id = $1 AND LOWER(TRIM(nip_nuptk)) = LOWER($2) AND id != $3 AND deleted_at IS NULL
			`, tenantID, val, teacherID).Scan(&count)
			if count > 0 {
				fields["nip_nuptk"] = "NIP/NUPTK sudah terdaftar pada sekolah ini"
			}
		} else {
			memMasterMu.RLock()
			for id, t := range memTeachers[tenantID] {
				if id != teacherID && t.DeletedAt == nil && t.NipNuptk != nil && strings.EqualFold(strings.TrimSpace(*t.NipNuptk), val) {
					fields["nip_nuptk"] = "NIP/NUPTK sudah terdaftar pada sekolah ini"
					break
				}
			}
			memMasterMu.RUnlock()
		}
	}

	if len(fields) > 0 {
		middleware.RespondValidationError(c, "Data guru tidak valid", fields)
		return
	}

	now := time.Now()
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	if database.DB != nil {
		res, err := database.DB.Exec(`
			UPDATE teachers 
			SET nip_nuptk = $1, name = $2, gender = $3, employment_status = $4,
			    is_certified = $5, subject_specialty = $6, is_active = $7, updated_at = $8
			WHERE id = $9 AND tenant_id = $10 AND deleted_at IS NULL
		`, cleanNip, name, strings.TrimSpace(req.Gender), strings.TrimSpace(req.EmploymentStatus),
			req.IsCertified, strings.TrimSpace(req.SubjectSpecialty), isActive, now, teacherID, tenantID)
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_UPDATE_FAILED", "Gagal memperbarui data guru", err, "DATABASE_ERROR")
			return
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data guru tidak ditemukan"}})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": TeacherDTO{
				ID:               teacherID,
				TenantID:         tenantID,
				NipNuptk:         cleanNip,
				Name:             name,
				Gender:           strings.TrimSpace(req.Gender),
				EmploymentStatus: strings.TrimSpace(req.EmploymentStatus),
				IsCertified:      req.IsCertified,
				SubjectSpecialty: strings.TrimSpace(req.SubjectSpecialty),
				IsActive:         isActive,
				UpdatedAt:        now,
			},
		})
		return
	}

	memMasterMu.Lock()
	t, exists := memTeachers[tenantID][teacherID]
	if !exists || t.DeletedAt != nil {
		memMasterMu.Unlock()
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data guru tidak ditemukan"}})
		return
	}

	t.NipNuptk = cleanNip
	t.Name = name
	t.Gender = strings.TrimSpace(req.Gender)
	t.EmploymentStatus = strings.TrimSpace(req.EmploymentStatus)
	t.IsCertified = req.IsCertified
	t.SubjectSpecialty = strings.TrimSpace(req.SubjectSpecialty)
	t.IsActive = isActive
	t.UpdatedAt = now
	resCopy := *t
	memMasterMu.Unlock()

	c.JSON(http.StatusOK, gin.H{"success": true, "data": resCopy})
}

// DELETE /api/v1/school/teachers/:id (Soft Delete)
func DeleteTeacher(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	tenantID := resolveSchoolID(c)
	teacherID := c.Param("id")
	now := time.Now()

	if database.DB != nil {
		res, err := database.DB.Exec(`
			UPDATE teachers 
			SET deleted_at = $1, is_active = FALSE, updated_at = $1
			WHERE id = $2 AND tenant_id = $3 AND deleted_at IS NULL
		`, now, teacherID, tenantID)
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_DELETE_FAILED", "Gagal menghapus data guru", err, "DATABASE_ERROR")
			return
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data guru tidak ditemukan"}})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Data guru berhasil dihapus (soft delete)"})
		return
	}

	memMasterMu.Lock()
	t, exists := memTeachers[tenantID][teacherID]
	if !exists || t.DeletedAt != nil {
		memMasterMu.Unlock()
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data guru tidak ditemukan"}})
		return
	}

	t.DeletedAt = &now
	t.IsActive = false
	t.UpdatedAt = now
	memMasterMu.Unlock()

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Data guru berhasil dihapus (soft delete)"})
}

// ============================================================================
// 3. SUBJECTS HANDLERS (MATA PELAJARAN)
// ============================================================================

type CreateSubjectPayload struct {
	Code               string `json:"code"`
	Name               string `json:"name"`
	Category           string `json:"category"`
	WeeklyDefaultHours int    `json:"weekly_default_hours"`
	IsActive           *bool  `json:"is_active"`
}

// GET /api/v1/school/subjects
func GetSubjects(c *gin.Context) {
	tenantID := resolveSchoolID(c)
	if tenantID == "" {
		middleware.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sesi autentikasi tidak valid", nil, "AUTH_ERROR")
		return
	}

	search := strings.ToLower(strings.TrimSpace(c.Query("q")))
	if search == "" {
		search = strings.ToLower(strings.TrimSpace(c.Query("search")))
	}
	isActiveStr := strings.TrimSpace(c.Query("is_active"))

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit < 1 {
		limit = 20
	} else if limit > 100 {
		limit = 100
	}

	if database.DB != nil {
		whereClauses := []string{"tenant_id = $1", "deleted_at IS NULL"}
		args := []interface{}{tenantID}
		argIdx := 2

		if search != "" {
			whereClauses = append(whereClauses, fmt.Sprintf("(LOWER(code) LIKE $%d OR LOWER(name) LIKE $%d OR LOWER(COALESCE(category, '')) LIKE $%d)", argIdx, argIdx, argIdx))
			args = append(args, "%"+search+"%")
			argIdx++
		}

		if isActiveStr == "true" {
			whereClauses = append(whereClauses, fmt.Sprintf("is_active = $%d", argIdx))
			args = append(args, true)
			argIdx++
		} else if isActiveStr == "false" {
			whereClauses = append(whereClauses, fmt.Sprintf("is_active = $%d", argIdx))
			args = append(args, false)
			argIdx++
		}

		whereSql := strings.Join(whereClauses, " AND ")

		var total int64
		countQuery := fmt.Sprintf("SELECT COUNT(*) FROM subjects WHERE %s", whereSql)
		if err := database.DB.QueryRow(countQuery, args...).Scan(&total); err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_COUNT_FAILED", "Gagal menghitung data mata pelajaran", err, "DATABASE_ERROR")
			return
		}

		offset := (page - 1) * limit
		selectQuery := fmt.Sprintf(`
			SELECT id, tenant_id, code, name, COALESCE(category, ''),
			       weekly_default_hours, is_active, created_at, updated_at
			FROM subjects
			WHERE %s
			ORDER BY code ASC
			LIMIT $%d OFFSET $%d
		`, whereSql, argIdx, argIdx+1)

		args = append(args, limit, offset)

		rows, err := database.DB.Query(selectQuery, args...)
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_QUERY_FAILED", "Gagal mengambil data mata pelajaran", err, "DATABASE_ERROR")
			return
		}
		defer rows.Close()

		results := make([]SubjectDTO, 0)
		for rows.Next() {
			var s SubjectDTO
			err := rows.Scan(
				&s.ID, &s.TenantID, &s.Code, &s.Name, &s.Category,
				&s.WeeklyDefaultHours, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
			)
			if err != nil {
				continue
			}
			results = append(results, s)
		}

		totalPages := int(math.Ceil(float64(total) / float64(limit)))
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    results,
			"pagination": PaginationMeta{
				Page:       page,
				Limit:      limit,
				Total:      total,
				TotalPages: totalPages,
			},
		})
		return
	}

	// In-Memory Mode
	memMasterMu.RLock()
	defer memMasterMu.RUnlock()

	tenantSubjects := memSubjects[tenantID]
	all := make([]SubjectDTO, 0)
	for _, s := range tenantSubjects {
		if s.DeletedAt != nil {
			continue
		}
		if search != "" {
			codeMatch := strings.Contains(strings.ToLower(s.Code), search)
			nameMatch := strings.Contains(strings.ToLower(s.Name), search)
			catMatch := strings.Contains(strings.ToLower(s.Category), search)
			if !codeMatch && !nameMatch && !catMatch {
				continue
			}
		}
		if isActiveStr == "true" && !s.IsActive {
			continue
		}
		if isActiveStr == "false" && s.IsActive {
			continue
		}
		all = append(all, *s)
	}

	total := int64(len(all))
	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	start := (page - 1) * limit
	end := start + limit
	if start > len(all) {
		start = len(all)
	}
	if end > len(all) {
		end = len(all)
	}
	sliced := all[start:end]

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    sliced,
		"pagination": PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	})
}

// POST /api/v1/school/subjects
func CreateSubject(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	tenantID := resolveSchoolID(c)
	if tenantID == "" {
		middleware.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sesi autentikasi tidak valid", nil, "AUTH_ERROR")
		return
	}

	var req CreateSubjectPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	var tx *sql.Tx
	if database.DB != nil {
		var err error
		tx, err = database.DB.BeginTx(c.Request.Context(), nil)
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_TX_FAILED", "Gagal memulai transaksi", err, "DATABASE_ERROR")
			return
		}
		defer tx.Rollback()
	}

	fields := make(map[string]string)
	code := strings.ToUpper(strings.TrimSpace(req.Code))
	if code == "" {
		fields["code"] = "Kode mata pelajaran wajib diisi"
	}
	name := strings.TrimSpace(req.Name)
	if name == "" {
		fields["name"] = "Nama mata pelajaran wajib diisi"
	}
	if req.WeeklyDefaultHours < 0 {
		fields["weekly_default_hours"] = "Beban jam default tidak boleh negatif"
	}

	// Cek keunikan kode mapel dalam tenant
	if code != "" {
		if tx != nil {
			var count int
			_ = tx.QueryRow(`
				SELECT COUNT(*) FROM subjects 
				WHERE tenant_id = $1 AND UPPER(TRIM(code)) = $2 AND deleted_at IS NULL
			`, tenantID, code).Scan(&count)
			if count > 0 {
				fields["code"] = "Kode mata pelajaran sudah digunakan pada sekolah ini"
			}
		} else {
			memMasterMu.RLock()
			for _, s := range memSubjects[tenantID] {
				if s.DeletedAt == nil && strings.EqualFold(strings.TrimSpace(s.Code), code) {
					fields["code"] = "Kode mata pelajaran sudah digunakan pada sekolah ini"
					break
				}
			}
			memMasterMu.RUnlock()
		}
	}

	if len(fields) > 0 {
		middleware.RespondValidationError(c, "Data mata pelajaran tidak valid", fields)
		return
	}

	newID := generateUUID()
	now := time.Now()
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	newSubject := SubjectDTO{
		ID:                 newID,
		TenantID:           tenantID,
		Code:               code,
		Name:               name,
		Category:           strings.TrimSpace(req.Category),
		WeeklyDefaultHours: req.WeeklyDefaultHours,
		IsActive:           isActive,
		CreatedAt:          now,
		UpdatedAt:          now,
	}

	if tx != nil {
		_, err := tx.Exec(`
			INSERT INTO subjects (id, tenant_id, code, name, category, weekly_default_hours, is_active, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`, newSubject.ID, newSubject.TenantID, newSubject.Code, newSubject.Name, newSubject.Category,
			newSubject.WeeklyDefaultHours, newSubject.IsActive, newSubject.CreatedAt, newSubject.UpdatedAt)
		if err != nil {
			if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "uk_subjects_tenant_code") {
				c.JSON(http.StatusConflict, gin.H{
					"success": false,
					"error": gin.H{
						"code":    "DUPLICATE_CODE",
						"message": "Kode mata pelajaran sudah digunakan pada sekolah ini",
					},
				})
				return
			}
			middleware.RespondError(c, http.StatusInternalServerError, "DB_INSERT_FAILED", "Gagal menyimpan data mata pelajaran", err, "DATABASE_ERROR")
			return
		}
		if err := tx.Commit(); err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_COMMIT_FAILED", "Gagal menyelesaikan transaksi", err, "DATABASE_ERROR")
			return
		}
	} else {
		memMasterMu.Lock()
		if memSubjects[tenantID] == nil {
			memSubjects[tenantID] = make(map[string]*SubjectDTO)
		}
		memSubjects[tenantID][newID] = &newSubject
		memMasterMu.Unlock()
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    newSubject,
	})
}

// GET /api/v1/school/subjects/:id
func GetSubjectByID(c *gin.Context) {
	tenantID := resolveSchoolID(c)
	subjectID := c.Param("id")

	if database.DB != nil {
		var s SubjectDTO
		err := database.DB.QueryRow(`
			SELECT id, tenant_id, code, name, COALESCE(category, ''),
			       weekly_default_hours, is_active, created_at, updated_at
			FROM subjects
			WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
		`, subjectID, tenantID).Scan(
			&s.ID, &s.TenantID, &s.Code, &s.Name, &s.Category,
			&s.WeeklyDefaultHours, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
		)
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data mata pelajaran tidak ditemukan"}})
			return
		} else if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_QUERY_FAILED", "Gagal mengambil data mata pelajaran", err, "DATABASE_ERROR")
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "data": s})
		return
	}

	memMasterMu.RLock()
	s, exists := memSubjects[tenantID][subjectID]
	memMasterMu.RUnlock()

	if !exists || s.DeletedAt != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data mata pelajaran tidak ditemukan"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": s})
}

// PUT /api/v1/school/subjects/:id
func UpdateSubject(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	tenantID := resolveSchoolID(c)
	subjectID := c.Param("id")

	// 1. Verifikasi Keberadaan dan Kepemilikan Record Terlebih Dahulu (RLS Isolation)
	if database.DB != nil {
		var dummy string
		err := database.DB.QueryRow(`
			SELECT id FROM subjects 
			WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
		`, subjectID, tenantID).Scan(&dummy)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data mata pelajaran tidak ditemukan"}})
			return
		}
	} else {
		memMasterMu.RLock()
		existing, exists := memSubjects[tenantID][subjectID]
		memMasterMu.RUnlock()
		if !exists || existing == nil || existing.DeletedAt != nil {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data mata pelajaran tidak ditemukan"}})
			return
		}
	}

	var req CreateSubjectPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	fields := make(map[string]string)
	code := strings.ToUpper(strings.TrimSpace(req.Code))
	if code == "" {
		fields["code"] = "Kode mata pelajaran wajib diisi"
	}
	name := strings.TrimSpace(req.Name)
	if name == "" {
		fields["name"] = "Nama mata pelajaran wajib diisi"
	}
	if req.WeeklyDefaultHours < 0 {
		fields["weekly_default_hours"] = "Beban jam default tidak boleh negatif"
	}

	if code != "" {
		if database.DB != nil {
			var count int
			_ = database.DB.QueryRow(`
				SELECT COUNT(*) FROM subjects 
				WHERE tenant_id = $1 AND UPPER(TRIM(code)) = $2 AND id != $3 AND deleted_at IS NULL
			`, tenantID, code, subjectID).Scan(&count)
			if count > 0 {
				fields["code"] = "Kode mata pelajaran sudah digunakan pada sekolah ini"
			}
		} else {
			memMasterMu.RLock()
			for id, s := range memSubjects[tenantID] {
				if id != subjectID && s.DeletedAt == nil && strings.EqualFold(strings.TrimSpace(s.Code), code) {
					fields["code"] = "Kode mata pelajaran sudah digunakan pada sekolah ini"
					break
				}
			}
			memMasterMu.RUnlock()
		}
	}

	if len(fields) > 0 {
		middleware.RespondValidationError(c, "Data mata pelajaran tidak valid", fields)
		return
	}

	now := time.Now()
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	if database.DB != nil {
		res, err := database.DB.Exec(`
			UPDATE subjects 
			SET code = $1, name = $2, category = $3, weekly_default_hours = $4,
			    is_active = $5, updated_at = $6
			WHERE id = $7 AND tenant_id = $8 AND deleted_at IS NULL
		`, code, name, strings.TrimSpace(req.Category), req.WeeklyDefaultHours,
			isActive, now, subjectID, tenantID)
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_UPDATE_FAILED", "Gagal memperbarui data mata pelajaran", err, "DATABASE_ERROR")
			return
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data mata pelajaran tidak ditemukan"}})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": SubjectDTO{
				ID:                 subjectID,
				TenantID:           tenantID,
				Code:               code,
				Name:               name,
				Category:           strings.TrimSpace(req.Category),
				WeeklyDefaultHours: req.WeeklyDefaultHours,
				IsActive:           isActive,
				UpdatedAt:          now,
			},
		})
		return
	}

	memMasterMu.Lock()
	s, exists := memSubjects[tenantID][subjectID]
	if !exists || s.DeletedAt != nil {
		memMasterMu.Unlock()
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data mata pelajaran tidak ditemukan"}})
		return
	}

	s.Code = code
	s.Name = name
	s.Category = strings.TrimSpace(req.Category)
	s.WeeklyDefaultHours = req.WeeklyDefaultHours
	s.IsActive = isActive
	s.UpdatedAt = now
	resCopy := *s
	memMasterMu.Unlock()

	c.JSON(http.StatusOK, gin.H{"success": true, "data": resCopy})
}

// DELETE /api/v1/school/subjects/:id (Soft Delete)
func DeleteSubject(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	tenantID := resolveSchoolID(c)
	subjectID := c.Param("id")
	now := time.Now()

	if database.DB != nil {
		res, err := database.DB.Exec(`
			UPDATE subjects 
			SET deleted_at = $1, is_active = FALSE, updated_at = $1
			WHERE id = $2 AND tenant_id = $3 AND deleted_at IS NULL
		`, now, subjectID, tenantID)
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "DB_DELETE_FAILED", "Gagal menghapus data mata pelajaran", err, "DATABASE_ERROR")
			return
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data mata pelajaran tidak ditemukan"}})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Data mata pelajaran berhasil dihapus (soft delete)"})
		return
	}

	memMasterMu.Lock()
	s, exists := memSubjects[tenantID][subjectID]
	if !exists || s.DeletedAt != nil {
		memMasterMu.Unlock()
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": gin.H{"code": "NOT_FOUND", "message": "Data mata pelajaran tidak ditemukan"}})
		return
	}

	s.DeletedAt = &now
	s.IsActive = false
	s.UpdatedAt = now
	memMasterMu.Unlock()

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Data mata pelajaran berhasil dihapus (soft delete)"})
}

// ============================================================================
// BATCH IMPORT & TRANSACTIONAL UPSERT
// ============================================================================

type BatchClassItem struct {
	Name                string  `json:"name"`
	GradeLevel          *int    `json:"grade_level"`
	Major               string  `json:"major"`
	AcademicYear        string  `json:"academic_year"`
	HomeroomTeacherID   *string `json:"homeroom_teacher_id"`
	HomeroomTeacherName string  `json:"homeroom_teacher_name"`
	StudentCount        int     `json:"student_count"`
	IsActive            *bool   `json:"is_active"`
}

type BatchImportClassesPayload struct {
	Classes []BatchClassItem `json:"classes"`
	Mode    string           `json:"mode"` // "upsert" | "insert"
}

type BatchErrorItem struct {
	Row     int    `json:"row"`
	Name    string `json:"name"`
	Message string `json:"message"`
}

type BatchImportResult struct {
	Total    int              `json:"total"`
	Inserted int              `json:"inserted"`
	Updated  int              `json:"updated"`
	Skipped  int              `json:"skipped"`
	Failed   int              `json:"failed"`
	Errors   []BatchErrorItem `json:"errors"`
}

// POST /api/v1/school/classes/batch
func BatchImportClasses(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	tenantID := resolveSchoolID(c)
	if tenantID == "" {
		middleware.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sesi autentikasi tidak valid", nil, "AUTH_ERROR")
		return
	}

	var payload BatchImportClassesPayload
	if val, ok := c.Get("batch_classes_override"); ok {
		if p, castOk := val.(BatchImportClassesPayload); castOk {
			payload = p
		}
	} else if err := c.ShouldBindJSON(&payload); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	mode := strings.ToLower(strings.TrimSpace(payload.Mode))
	if mode == "" {
		mode = "upsert"
	}

	result := BatchImportResult{
		Total:    len(payload.Classes),
		Errors:   make([]BatchErrorItem, 0),
	}

	now := time.Now()

	// 1. Database PostgreSQL Mode dengan Transaction
	if database.DB != nil {
		tx, err := database.DB.Begin()
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "TX_BEGIN_FAILED", "Gagal memulai transaksi database", err, "DATABASE_ERROR")
			return
		}
		defer func() {
			if r := recover(); r != nil {
				_ = tx.Rollback()
				panic(r)
			}
		}()

		// Lookup map guru aktif pada tenant ini untuk resolusi nama wali kelas
		teacherRows, qErr := tx.Query(`SELECT id, LOWER(TRIM(name)) FROM teachers WHERE tenant_id = $1 AND is_active = TRUE AND deleted_at IS NULL`, tenantID)
		teacherLookup := make(map[string]string) // lowerName -> id
		if qErr == nil {
			for teacherRows.Next() {
				var tID, tName string
				if err := teacherRows.Scan(&tID, &tName); err == nil {
					teacherLookup[tName] = tID
				}
			}
			teacherRows.Close()
		}

		for idx, item := range payload.Classes {
			rowNum := idx + 1
			name := strings.TrimSpace(item.Name)
			if name == "" {
				result.Failed++
				result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: name, Message: "Nama kelas wajib diisi"})
				continue
			}

			academicYear := strings.TrimSpace(item.AcademicYear)
			if academicYear == "" {
				academicYear = fmt.Sprintf("%d/%d", now.Year(), now.Year()+1)
			}

			if item.StudentCount < 0 {
				result.Failed++
				result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: name, Message: "Jumlah siswa tidak boleh negatif"})
				continue
			}

			// Resolusi wali kelas
			var resolvedTeacherID *string
			if item.HomeroomTeacherID != nil && strings.TrimSpace(*item.HomeroomTeacherID) != "" {
				resolvedTeacherID = item.HomeroomTeacherID
			} else if strings.TrimSpace(item.HomeroomTeacherName) != "" {
				wName := strings.ToLower(strings.TrimSpace(item.HomeroomTeacherName))
				if tid, found := teacherLookup[wName]; found {
					resolvedTeacherID = &tid
				}
			}

			// Cek duplikasi di DB
			var existingID string
			err := tx.QueryRow(`
				SELECT id FROM classes 
				WHERE tenant_id = $1 AND LOWER(TRIM(name)) = LOWER($2) AND academic_year = $3 AND deleted_at IS NULL
			`, tenantID, name, academicYear).Scan(&existingID)

			isActive := true
			if item.IsActive != nil {
				isActive = *item.IsActive
			}

			if err == nil && existingID != "" {
				// Record sudah ada
				if mode == "upsert" {
					_, upErr := tx.Exec(`
						UPDATE classes 
						SET grade_level = $1, major = $2, homeroom_teacher_id = $3, student_count = $4, is_active = $5, updated_at = $6
						WHERE id = $7 AND tenant_id = $8
					`, item.GradeLevel, strings.TrimSpace(item.Major), resolvedTeacherID, item.StudentCount, isActive, now, existingID, tenantID)
					if upErr != nil {
						result.Failed++
						result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: name, Message: "Gagal memperbarui: " + upErr.Error()})
					} else {
						result.Updated++
					}
				} else {
					result.Skipped++
				}
			} else {
				// Insert kelas baru
				newID := generateUUID()
				_, insErr := tx.Exec(`
					INSERT INTO classes (id, tenant_id, name, grade_level, major, academic_year, homeroom_teacher_id, student_count, is_active, created_at, updated_at)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
				`, newID, tenantID, name, item.GradeLevel, strings.TrimSpace(item.Major), academicYear, resolvedTeacherID, item.StudentCount, isActive, now, now)
				if insErr != nil {
					result.Failed++
					result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: name, Message: "Gagal menyimpan: " + insErr.Error()})
				} else {
					result.Inserted++
				}
			}
		}

		if err := tx.Commit(); err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "TX_COMMIT_FAILED", "Gagal menyimpan transaksi batch", err, "DATABASE_ERROR")
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
		return
	}

	// 2. In-Memory Mode Fallback
	memMasterMu.Lock()
	defer memMasterMu.Unlock()

	if memClasses[tenantID] == nil {
		memClasses[tenantID] = make(map[string]*ClassDTO)
	}

	// Lookup guru in-memory
	teacherLookup := make(map[string]string)
	for tID, t := range memTeachers[tenantID] {
		if t.IsActive && t.DeletedAt == nil {
			teacherLookup[strings.ToLower(strings.TrimSpace(t.Name))] = tID
		}
	}

	for idx, item := range payload.Classes {
		rowNum := idx + 1
		name := strings.TrimSpace(item.Name)
		if name == "" {
			result.Failed++
			result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: name, Message: "Nama kelas wajib diisi"})
			continue
		}

		academicYear := strings.TrimSpace(item.AcademicYear)
		if academicYear == "" {
			academicYear = fmt.Sprintf("%d/%d", now.Year(), now.Year()+1)
		}

		if item.StudentCount < 0 {
			result.Failed++
			result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: name, Message: "Jumlah siswa tidak boleh negatif"})
			continue
		}

		var resolvedTeacherID *string
		var resolvedTeacherName string
		if item.HomeroomTeacherID != nil && strings.TrimSpace(*item.HomeroomTeacherID) != "" {
			resolvedTeacherID = item.HomeroomTeacherID
			if t, ok := memTeachers[tenantID][*resolvedTeacherID]; ok {
				resolvedTeacherName = t.Name
			}
		} else if strings.TrimSpace(item.HomeroomTeacherName) != "" {
			wName := strings.ToLower(strings.TrimSpace(item.HomeroomTeacherName))
			if tid, found := teacherLookup[wName]; found {
				resolvedTeacherID = &tid
				if t, ok := memTeachers[tenantID][tid]; ok {
					resolvedTeacherName = t.Name
				}
			}
		}

		// Cari existing
		var existing *ClassDTO
		for _, cls := range memClasses[tenantID] {
			if cls.DeletedAt == nil && strings.EqualFold(strings.TrimSpace(cls.Name), name) && cls.AcademicYear == academicYear {
				existing = cls
				break
			}
		}

		isActive := true
		if item.IsActive != nil {
			isActive = *item.IsActive
		}

		if existing != nil {
			if mode == "upsert" {
				existing.GradeLevel = item.GradeLevel
				existing.Major = strings.TrimSpace(item.Major)
				existing.HomeroomTeacherID = resolvedTeacherID
				existing.HomeroomTeacherName = resolvedTeacherName
				existing.StudentCount = item.StudentCount
				existing.IsActive = isActive
				existing.UpdatedAt = now
				result.Updated++
			} else {
				result.Skipped++
			}
		} else {
			newID := generateUUID()
			memClasses[tenantID][newID] = &ClassDTO{
				ID:                  newID,
				TenantID:            tenantID,
				Name:                name,
				GradeLevel:          item.GradeLevel,
				Major:               strings.TrimSpace(item.Major),
				AcademicYear:        academicYear,
				HomeroomTeacherID:   resolvedTeacherID,
				HomeroomTeacherName: resolvedTeacherName,
				StudentCount:        item.StudentCount,
				IsActive:            isActive,
				CreatedAt:           now,
				UpdatedAt:           now,
			}
			result.Inserted++
		}
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// ============================================================================
// BATCH IMPORT TEACHERS
// ============================================================================

type BatchTeacherItem struct {
	NipNuptk         *string `json:"nip_nuptk"`
	Name             string  `json:"name"`
	Gender           string  `json:"gender"`
	EmploymentStatus string  `json:"employment_status"`
	IsCertified      *bool   `json:"is_certified"`
	SubjectSpecialty string  `json:"subject_specialty"`
	IsActive         *bool   `json:"is_active"`
}

type BatchImportTeachersPayload struct {
	Teachers []BatchTeacherItem `json:"teachers"`
	Mode     string             `json:"mode"`
}

// POST /api/v1/school/teachers/batch
func BatchImportTeachers(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	tenantID := resolveSchoolID(c)
	if tenantID == "" {
		middleware.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sesi autentikasi tidak valid", nil, "AUTH_ERROR")
		return
	}

	var payload BatchImportTeachersPayload
	if val, ok := c.Get("batch_teachers_override"); ok {
		if p, castOk := val.(BatchImportTeachersPayload); castOk {
			payload = p
		}
	} else if err := c.ShouldBindJSON(&payload); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	mode := strings.ToLower(strings.TrimSpace(payload.Mode))
	if mode == "" {
		mode = "upsert"
	}

	result := BatchImportResult{
		Total:  len(payload.Teachers),
		Errors: make([]BatchErrorItem, 0),
	}
	now := time.Now()

	if database.DB != nil {
		tx, err := database.DB.Begin()
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "TX_BEGIN_FAILED", "Gagal memulai transaksi database", err, "DATABASE_ERROR")
			return
		}
		defer func() {
			if r := recover(); r != nil {
				_ = tx.Rollback()
				panic(r)
			}
		}()

		for idx, item := range payload.Teachers {
			rowNum := idx + 1
			name := strings.TrimSpace(item.Name)
			if name == "" {
				result.Failed++
				result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: name, Message: "Nama guru wajib diisi"})
				continue
			}

			var nip *string
			if item.NipNuptk != nil && strings.TrimSpace(*item.NipNuptk) != "" {
				trimmed := strings.TrimSpace(*item.NipNuptk)
				nip = &trimmed
			}

			// Cek duplikasi berdasarkan NIP (jika ada) atau Nama
			var existingID string
			if nip != nil {
				_ = tx.QueryRow(`
					SELECT id FROM teachers 
					WHERE tenant_id = $1 AND nip_nuptk = $2 AND deleted_at IS NULL
				`, tenantID, *nip).Scan(&existingID)
			}
			if existingID == "" {
				_ = tx.QueryRow(`
					SELECT id FROM teachers 
					WHERE tenant_id = $1 AND LOWER(TRIM(name)) = LOWER($2) AND deleted_at IS NULL
				`, tenantID, name).Scan(&existingID)
			}

			isActive := true
			if item.IsActive != nil {
				isActive = *item.IsActive
			}
			isCert := false
			if item.IsCertified != nil {
				isCert = *item.IsCertified
			}

			if existingID != "" {
				if mode == "upsert" {
					_, upErr := tx.Exec(`
						UPDATE teachers 
						SET nip_nuptk = $1, gender = $2, employment_status = $3, is_certified = $4, subject_specialty = $5, is_active = $6, updated_at = $7
						WHERE id = $8 AND tenant_id = $9
					`, nip, strings.TrimSpace(item.Gender), strings.TrimSpace(item.EmploymentStatus), isCert, strings.TrimSpace(item.SubjectSpecialty), isActive, now, existingID, tenantID)
					if upErr != nil {
						result.Failed++
						result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: name, Message: "Gagal memperbarui: " + upErr.Error()})
					} else {
						result.Updated++
					}
				} else {
					result.Skipped++
				}
			} else {
				newID := generateUUID()
				_, insErr := tx.Exec(`
					INSERT INTO teachers (id, tenant_id, nip_nuptk, name, gender, employment_status, is_certified, subject_specialty, is_active, created_at, updated_at)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
				`, newID, tenantID, nip, name, strings.TrimSpace(item.Gender), strings.TrimSpace(item.EmploymentStatus), isCert, strings.TrimSpace(item.SubjectSpecialty), isActive, now, now)
				if insErr != nil {
					result.Failed++
					result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: name, Message: "Gagal menyimpan: " + insErr.Error()})
				} else {
					result.Inserted++
				}
			}
		}

		if err := tx.Commit(); err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "TX_COMMIT_FAILED", "Gagal menyimpan transaksi batch", err, "DATABASE_ERROR")
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
		return
	}

	// In-Memory Mode
	memMasterMu.Lock()
	defer memMasterMu.Unlock()

	if memTeachers[tenantID] == nil {
		memTeachers[tenantID] = make(map[string]*TeacherDTO)
	}

	for idx, item := range payload.Teachers {
		rowNum := idx + 1
		name := strings.TrimSpace(item.Name)
		if name == "" {
			result.Failed++
			result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: name, Message: "Nama guru wajib diisi"})
			continue
		}

		var nip *string
		if item.NipNuptk != nil && strings.TrimSpace(*item.NipNuptk) != "" {
			trimmed := strings.TrimSpace(*item.NipNuptk)
			nip = &trimmed
		}

		var existing *TeacherDTO
		for _, t := range memTeachers[tenantID] {
			if t.DeletedAt != nil {
				continue
			}
			if nip != nil && t.NipNuptk != nil && *t.NipNuptk == *nip {
				existing = t
				break
			}
			if strings.EqualFold(strings.TrimSpace(t.Name), name) {
				existing = t
				break
			}
		}

		isActive := true
		if item.IsActive != nil {
			isActive = *item.IsActive
		}
		isCert := false
		if item.IsCertified != nil {
			isCert = *item.IsCertified
		}

		if existing != nil {
			if mode == "upsert" {
				existing.NipNuptk = nip
				existing.Gender = strings.TrimSpace(item.Gender)
				existing.EmploymentStatus = strings.TrimSpace(item.EmploymentStatus)
				existing.IsCertified = isCert
				existing.SubjectSpecialty = strings.TrimSpace(item.SubjectSpecialty)
				existing.IsActive = isActive
				existing.UpdatedAt = now
				result.Updated++
			} else {
				result.Skipped++
			}
		} else {
			newID := generateUUID()
			memTeachers[tenantID][newID] = &TeacherDTO{
				ID:               newID,
				TenantID:         tenantID,
				NipNuptk:         nip,
				Name:             name,
				Gender:           strings.TrimSpace(item.Gender),
				EmploymentStatus: strings.TrimSpace(item.EmploymentStatus),
				IsCertified:      isCert,
				SubjectSpecialty: strings.TrimSpace(item.SubjectSpecialty),
				IsActive:         isActive,
				CreatedAt:        now,
				UpdatedAt:        now,
			}
			result.Inserted++
		}
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// ============================================================================
// BATCH IMPORT SUBJECTS
// ============================================================================

type BatchSubjectItem struct {
	Code               string `json:"code"`
	Name               string `json:"name"`
	Category           string `json:"category"`
	WeeklyDefaultHours int    `json:"weekly_default_hours"`
	IsActive           *bool  `json:"is_active"`
}

type BatchImportSubjectsPayload struct {
	Subjects []BatchSubjectItem `json:"subjects"`
	Mode     string             `json:"mode"`
}

// POST /api/v1/school/subjects/batch
func BatchImportSubjects(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	tenantID := resolveSchoolID(c)
	if tenantID == "" {
		middleware.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sesi autentikasi tidak valid", nil, "AUTH_ERROR")
		return
	}

	var payload BatchImportSubjectsPayload
	if val, ok := c.Get("batch_subjects_override"); ok {
		if p, castOk := val.(BatchImportSubjectsPayload); castOk {
			payload = p
		}
	} else if err := c.ShouldBindJSON(&payload); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	mode := strings.ToLower(strings.TrimSpace(payload.Mode))
	if mode == "" {
		mode = "upsert"
	}

	result := BatchImportResult{
		Total:  len(payload.Subjects),
		Errors: make([]BatchErrorItem, 0),
	}
	now := time.Now()

	if database.DB != nil {
		tx, err := database.DB.Begin()
		if err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "TX_BEGIN_FAILED", "Gagal memulai transaksi database", err, "DATABASE_ERROR")
			return
		}
		defer func() {
			if r := recover(); r != nil {
				_ = tx.Rollback()
				panic(r)
			}
		}()

		for idx, item := range payload.Subjects {
			rowNum := idx + 1
			code := strings.ToUpper(strings.TrimSpace(item.Code))
			name := strings.TrimSpace(item.Name)

			if code == "" {
				result.Failed++
				result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: name, Message: "Kode mapel wajib diisi"})
				continue
			}
			if name == "" {
				result.Failed++
				result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: code, Message: "Nama mapel wajib diisi"})
				continue
			}
			if item.WeeklyDefaultHours < 0 {
				result.Failed++
				result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: code, Message: "Beban jam mingguan tidak boleh negatif"})
				continue
			}

			var existingID string
			_ = tx.QueryRow(`
				SELECT id FROM subjects 
				WHERE tenant_id = $1 AND UPPER(TRIM(code)) = $2 AND deleted_at IS NULL
			`, tenantID, code).Scan(&existingID)

			isActive := true
			if item.IsActive != nil {
				isActive = *item.IsActive
			}

			if existingID != "" {
				if mode == "upsert" {
					_, upErr := tx.Exec(`
						UPDATE subjects 
						SET name = $1, category = $2, weekly_default_hours = $3, is_active = $4, updated_at = $5
						WHERE id = $6 AND tenant_id = $7
					`, name, strings.TrimSpace(item.Category), item.WeeklyDefaultHours, isActive, now, existingID, tenantID)
					if upErr != nil {
						result.Failed++
						result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: code, Message: "Gagal memperbarui: " + upErr.Error()})
					} else {
						result.Updated++
					}
				} else {
					result.Skipped++
				}
			} else {
				newID := generateUUID()
				_, insErr := tx.Exec(`
					INSERT INTO subjects (id, tenant_id, code, name, category, weekly_default_hours, is_active, created_at, updated_at)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
				`, newID, tenantID, code, name, strings.TrimSpace(item.Category), item.WeeklyDefaultHours, isActive, now, now)
				if insErr != nil {
					result.Failed++
					result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: code, Message: "Gagal menyimpan: " + insErr.Error()})
				} else {
					result.Inserted++
				}
			}
		}

		if err := tx.Commit(); err != nil {
			middleware.RespondError(c, http.StatusInternalServerError, "TX_COMMIT_FAILED", "Gagal menyimpan transaksi batch", err, "DATABASE_ERROR")
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
		return
	}

	// In-Memory Mode
	memMasterMu.Lock()
	defer memMasterMu.Unlock()

	if memSubjects[tenantID] == nil {
		memSubjects[tenantID] = make(map[string]*SubjectDTO)
	}

	for idx, item := range payload.Subjects {
		rowNum := idx + 1
		code := strings.ToUpper(strings.TrimSpace(item.Code))
		name := strings.TrimSpace(item.Name)

		if code == "" {
			result.Failed++
			result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: name, Message: "Kode mapel wajib diisi"})
			continue
		}
		if name == "" {
			result.Failed++
			result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: code, Message: "Nama mapel wajib diisi"})
			continue
		}
		if item.WeeklyDefaultHours < 0 {
			result.Failed++
			result.Errors = append(result.Errors, BatchErrorItem{Row: rowNum, Name: code, Message: "Beban jam mingguan tidak boleh negatif"})
			continue
		}

		var existing *SubjectDTO
		for _, s := range memSubjects[tenantID] {
			if s.DeletedAt == nil && strings.EqualFold(strings.TrimSpace(s.Code), code) {
				existing = s
				break
			}
		}

		isActive := true
		if item.IsActive != nil {
			isActive = *item.IsActive
		}

		if existing != nil {
			if mode == "upsert" {
				existing.Name = name
				existing.Category = strings.TrimSpace(item.Category)
				existing.WeeklyDefaultHours = item.WeeklyDefaultHours
				existing.IsActive = isActive
				existing.UpdatedAt = now
				result.Updated++
			} else {
				result.Skipped++
			}
		} else {
			newID := generateUUID()
			memSubjects[tenantID][newID] = &SubjectDTO{
				ID:                 newID,
				TenantID:           tenantID,
				Code:               code,
				Name:               name,
				Category:           strings.TrimSpace(item.Category),
				WeeklyDefaultHours: item.WeeklyDefaultHours,
				IsActive:           isActive,
				CreatedAt:          now,
				UpdatedAt:          now,
			}
			result.Inserted++
		}
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// ============================================================================
// STANDARDIZED XLSB IMPORT VALIDATE & COMMIT ENDPOINTS
// ============================================================================

type XlsbValidatePayload struct {
	EntityType string             `json:"entity_type"` // "classes" | "teachers" | "subjects"
	Classes    []BatchClassItem   `json:"classes,omitempty"`
	Teachers   []BatchTeacherItem `json:"teachers,omitempty"`
	Subjects   []BatchSubjectItem `json:"subjects,omitempty"`
}

type XlsbCommitPayload struct {
	EntityType string             `json:"entity_type"` // "classes" | "teachers" | "subjects"
	Mode       string             `json:"mode"`        // "insert" | "upsert"
	Classes    []BatchClassItem   `json:"classes,omitempty"`
	Teachers   []BatchTeacherItem `json:"teachers,omitempty"`
	Subjects   []BatchSubjectItem `json:"subjects,omitempty"`
}

// POST /api/v1/school/import/xlsb/validate
func ValidateXlsbImport(c *gin.Context) {
	tenantID := resolveSchoolID(c)
	if tenantID == "" {
		middleware.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sesi autentikasi tidak valid", nil, "AUTH_ERROR")
		return
	}

	var payload XlsbValidatePayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	entityType := strings.ToLower(strings.TrimSpace(payload.EntityType))
	errors := make([]BatchErrorItem, 0)
	total := 0

	switch entityType {
	case "classes":
		total = len(payload.Classes)
		seen := make(map[string]int)
		for idx, item := range payload.Classes {
			row := idx + 1
			name := strings.TrimSpace(item.Name)
			if name == "" {
				errors = append(errors, BatchErrorItem{Row: row, Name: name, Message: "Nama kelas wajib diisi"})
				continue
			}
			lower := strings.ToLower(name)
			if prev, ok := seen[lower]; ok {
				errors = append(errors, BatchErrorItem{Row: row, Name: name, Message: fmt.Sprintf("Nama kelas duplikat dengan baris %d", prev)})
			} else {
				seen[lower] = row
			}
		}
	case "teachers":
		total = len(payload.Teachers)
		seenCodes := make(map[string]int)
		seenNames := make(map[string]int)
		for idx, item := range payload.Teachers {
			row := idx + 1
			name := strings.TrimSpace(item.Name)
			if name == "" {
				errors = append(errors, BatchErrorItem{Row: row, Name: name, Message: "Nama guru wajib diisi"})
				continue
			}
			lowerName := strings.ToLower(name)
			if prev, ok := seenNames[lowerName]; ok {
				errors = append(errors, BatchErrorItem{Row: row, Name: name, Message: fmt.Sprintf("Nama guru duplikat dengan baris %d", prev)})
			} else {
				seenNames[lowerName] = row
			}
			if item.NipNuptk != nil && strings.TrimSpace(*item.NipNuptk) != "" {
				codeVal := strings.ToUpper(strings.TrimSpace(*item.NipNuptk))
				if prev, ok := seenCodes[codeVal]; ok {
					errors = append(errors, BatchErrorItem{Row: row, Name: name, Message: fmt.Sprintf("Kode/NIP guru duplikat dengan baris %d", prev)})
				} else {
					seenCodes[codeVal] = row
				}
			}
		}
	case "subjects":
		total = len(payload.Subjects)
		seenCodes := make(map[string]int)
		for idx, item := range payload.Subjects {
			row := idx + 1
			code := strings.ToUpper(strings.TrimSpace(item.Code))
			name := strings.TrimSpace(item.Name)
			if code == "" {
				errors = append(errors, BatchErrorItem{Row: row, Name: name, Message: "Kode mapel wajib diisi"})
				continue
			}
			if name == "" {
				errors = append(errors, BatchErrorItem{Row: row, Name: code, Message: "Nama mapel wajib diisi"})
				continue
			}
			if prev, ok := seenCodes[code]; ok {
				errors = append(errors, BatchErrorItem{Row: row, Name: code, Message: fmt.Sprintf("Kode mapel duplikat dengan baris %d", prev)})
			} else {
				seenCodes[code] = row
			}
		}
	default:
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_ENTITY_TYPE", "entity_type harus salah satu dari: classes, teachers, subjects", nil, "VALIDATION_ERROR")
		return
	}

	invalidCount := len(errors)
	validCount := total - invalidCount
	if validCount < 0 {
		validCount = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"total":         total,
			"valid_count":   validCount,
			"invalid_count": invalidCount,
			"errors":        errors,
		},
	})
}

// POST /api/v1/school/import/xlsb/commit
func CommitXlsbImport(c *gin.Context) {
	if !requireDatabase(c) {
		return
	}
	tenantID := resolveSchoolID(c)
	if tenantID == "" {
		middleware.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Sesi autentikasi tidak valid", nil, "AUTH_ERROR")
		return
	}

	var payload XlsbCommitPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_PAYLOAD", "Payload JSON tidak valid", err, "VALIDATION_ERROR")
		return
	}

	mode := strings.ToLower(strings.TrimSpace(payload.Mode))
	if mode != "insert" && mode != "upsert" {
		mode = "upsert"
	}

	entityType := strings.ToLower(strings.TrimSpace(payload.EntityType))
	switch entityType {
	case "classes":
		batchPayload := BatchImportClassesPayload{
			Classes: payload.Classes,
			Mode:    mode,
		}
		// Wrap to invoke internal logic
		c.Set("batch_classes_override", batchPayload)
		BatchImportClasses(c)
	case "teachers":
		batchPayload := BatchImportTeachersPayload{
			Teachers: payload.Teachers,
			Mode:     mode,
		}
		c.Set("batch_teachers_override", batchPayload)
		BatchImportTeachers(c)
	case "subjects":
		batchPayload := BatchImportSubjectsPayload{
			Subjects: payload.Subjects,
			Mode:     mode,
		}
		c.Set("batch_subjects_override", batchPayload)
		BatchImportSubjects(c)
	default:
		middleware.RespondError(c, http.StatusBadRequest, "INVALID_ENTITY_TYPE", "entity_type harus salah satu dari: classes, teachers, subjects", nil, "VALIDATION_ERROR")
	}
}
