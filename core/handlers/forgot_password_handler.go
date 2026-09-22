package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"jadwal-api/core/database"
)

type ForgotPasswordRequest struct {
	Username    string `json:"username" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

func SubmitForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	// Cek apakah username valid di tabel users
	var userID string
	err := database.DB.QueryRow("SELECT id FROM users WHERE username = $1", req.Username).Scan(&userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Username Anda tidak terdaftar di sistem"})
		return
	}

	// Insert ke forgot_password_requests
	_, err = database.DB.Exec(`
		INSERT INTO forgot_password_requests (user_id, new_password)
		VALUES ($1, $2)
	`, userID, req.NewPassword)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengajukan permintaan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pengajuan berhasil dikirim!"})
}

// Mengecek status laporan untuk user tertentu (agar polling login jalan)
func CheckForgotPasswordStatus(c *gin.Context) {
	username := c.Query("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username wajib diisi"})
		return
	}

	var id int
	var status string
	err := database.DB.QueryRow(`
		SELECT f.id, f.status FROM forgot_password_requests f
		JOIN users u ON f.user_id = u.id
		WHERE u.username = $1
		ORDER BY f.created_at DESC LIMIT 1
	`, username).Scan(&id, &status)

	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "NOT_FOUND"})
		return
	}

	// Jika statusnya APPROVED, tandai sebagai NOTIFIED agar tidak muncul terus-terusan di client
	if status == "APPROVED" {
		database.DB.Exec("UPDATE forgot_password_requests SET status = 'NOTIFIED' WHERE id = $1", id)
	}

	c.JSON(http.StatusOK, gin.H{"status": status})
}
