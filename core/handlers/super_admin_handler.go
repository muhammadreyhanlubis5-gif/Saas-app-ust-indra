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

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memulai transaksi"})
		return
	}

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
	_, err := database.DB.Exec("UPDATE schools SET valid_until = NOW() - INTERVAL '1 day' WHERE id = $1", schoolID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memblokir klien"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Klien berhasil diblokir (status expired)"})
}

func DeleteSchool(c *gin.Context) {
	schoolID := c.Param("id")
	_, err := database.DB.Exec("DELETE FROM schools WHERE id = $1", schoolID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus klien"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Klien beserta seluruh data terkait berhasil dihapus permanen"})
}

type ForgotPasswordReport struct {
	ID         int    `json:"id"`
	SchoolName string `json:"school_name"`
	Username   string `json:"username"`
	Contact    string `json:"contact"`
	Date       string `json:"date"`
	Message    string `json:"message"`
}

func GetForgotPasswordRequests(c *gin.Context) {
	rows, err := database.DB.Query(`
		SELECT f.id, COALESCE(s.name, 'Tanpa Lembaga'), u.username, COALESCE(s.contact_number, '-'), f.created_at, f.new_password
		FROM forgot_password_requests f
		JOIN users u ON f.user_id = u.id
		LEFT JOIN schools s ON u.school_id = s.id
		WHERE f.status = 'PENDING'
		ORDER BY f.created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data laporan"})
		return
	}
	defer rows.Close()

	var reports []ForgotPasswordReport
	for rows.Next() {
		var r ForgotPasswordReport
		var t time.Time
		var newPass string
		if err := rows.Scan(&r.ID, &r.SchoolName, &r.Username, &r.Contact, &t, &newPass); err != nil {
			continue
		}
		r.Date = t.Format("02 Jan 15:04")
		r.Message = "Mohon izinkan pergantian password ke: " + newPass
		reports = append(reports, r)
	}

	if reports == nil {
		reports = []ForgotPasswordReport{}
	}
	c.JSON(http.StatusOK, reports)
}

func ApproveForgotPassword(c *gin.Context) {
	id := c.Param("id")
	
	var userID string
	var newPassword string
	err := database.DB.QueryRow("SELECT user_id, new_password FROM forgot_password_requests WHERE id = $1 AND status = 'PENDING'", id).Scan(&userID, &newPassword)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Laporan tidak ditemukan"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal enkripsi password"})
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memulai transaksi"})
		return
	}

	_, err = tx.Exec("UPDATE users SET password = $1 WHERE id = $2", string(hashedPassword), userID)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update password user"})
		return
	}

	_, err = tx.Exec("UPDATE forgot_password_requests SET status = 'APPROVED' WHERE id = $1", id)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update status laporan"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Izin diberikan, password diupdate"})
}

func RejectForgotPassword(c *gin.Context) {
	id := c.Param("id")
	
	_, err := database.DB.Exec("UPDATE forgot_password_requests SET status = 'REJECTED' WHERE id = $1 AND status = 'PENDING'", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus laporan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Laporan berhasil dihapus / ditolak"})
}
