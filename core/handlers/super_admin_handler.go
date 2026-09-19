package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"jadwal-api/core/database"
	"golang.org/x/crypto/bcrypt"
)

type SchoolResponse struct {
	ID             string     `json:"id"`
	Name           string     `json:"name"`
	ValidUntil     *time.Time `json:"valid_until"`
	PaymentMethod  *string    `json:"payment_method"`
	PaymentAmount  *float64   `json:"payment_amount"`
	Address        *string    `json:"address"`
	ContactNumber  *string    `json:"contact_number"`
	TeacherCount   int        `json:"teacher_count"`
	SubjectCount   int        `json:"subject_count"`
	AdminUsername  string     `json:"admin_username"`
}

func GetSchools(c *gin.Context) {
	rows, err := database.DB.Query(`
		SELECT 
			s.id, s.name, s.valid_until, s.payment_method, s.payment_amount, s.address, s.contact_number,
			(SELECT COUNT(*) FROM users u WHERE u.school_id = s.id AND u.role = 'TEACHER') as teacher_count,
			(SELECT COUNT(*) FROM subjects sub WHERE sub.school_id = s.id) as subject_count,
			COALESCE((SELECT u.username FROM users u WHERE u.school_id = s.id AND u.role = 'SCHOOL_ADMIN' LIMIT 1), '') as admin_username
		FROM schools s
		ORDER BY s.created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data klien"})
		return
	}
	defer rows.Close()

	var schools []SchoolResponse
	for rows.Next() {
		var s SchoolResponse
		err := rows.Scan(
			&s.ID, &s.Name, &s.ValidUntil, &s.PaymentMethod, &s.PaymentAmount, &s.Address, &s.ContactNumber,
			&s.TeacherCount, &s.SubjectCount, &s.AdminUsername,
		)
		if err != nil {
			log.Println("Error scan school:", err)
			continue
		}
		schools = append(schools, s)
	}

	c.JSON(http.StatusOK, schools)
}

type CreateSchoolRequest struct {
	Name          string  `json:"name"`
	ValidUntil    string  `json:"valid_until"`
	PaymentMethod string  `json:"payment_method"`
	PaymentAmount float64 `json:"payment_amount"`
	Address       string  `json:"address"`
	ContactNumber string  `json:"contact_number"`
	Username      string  `json:"username"`
	Password      string  `json:"password"`
}

func CreateSchool(c *gin.Context) {
	var req CreateSchoolRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	// Mulai Transaction agar jika gagal satu, semua di-rollback
	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memulai transaksi"})
		return
	}

	// 1. Insert School
	var schoolID string
	err = tx.QueryRow(`
		INSERT INTO schools (name, valid_until, payment_method, payment_amount, address, contact_number)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`, req.Name, req.ValidUntil, req.PaymentMethod, req.PaymentAmount, req.Address, req.ContactNumber).Scan(&schoolID)
	
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat klien sekolah"})
		return
	}

	// 2. Hash Password & Insert User (School Admin)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi password"})
		return
	}

	_, err = tx.Exec(`
		INSERT INTO users (school_id, name, username, password, role)
		VALUES ($1, $2, $3, $4, 'SCHOOL_ADMIN')
	`, schoolID, "Admin " + req.Name, req.Username, string(hashedPassword))

	if err != nil {
		tx.Rollback()
		// Kemungkinan username duplikat (UNIQUE constraint)
		c.JSON(http.StatusConflict, gin.H{"error": "Username sudah dipakai oleh lembaga lain. Gunakan username unik."})
		return
	}

	err = tx.Commit()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Klien sekolah berhasil dibuat!"})
}

func BlockSchool(c *gin.Context) {
	schoolID := c.Param("id")
	
	// Blokir = set valid_until ke waktu masa lalu (kemarin)
	_, err := database.DB.Exec(`
		UPDATE schools SET valid_until = NOW() - INTERVAL '1 day' WHERE id = $1
	`, schoolID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memblokir klien"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Klien berhasil diblokir (status expired)"})
}
