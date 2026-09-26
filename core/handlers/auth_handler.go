package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"jadwal-api/core/database"
	"jadwal-api/core/middleware"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// GenerateJWTLogin mensimulasikan login dan pembuatan token
func GenerateJWTLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Cari user di database berdasarkan username
	var user struct {
		ID         string
		SchoolID   *string
		Password   string
		Role       string
		ValidUntil *time.Time
	}

	cleanUsername := strings.TrimSpace(req.Username)

	err := database.DB.QueryRow(`
		SELECT u.id, u.school_id, u.password, u.role, s.valid_until
		FROM users u
		LEFT JOIN schools s ON u.school_id = s.id
		WHERE u.username = $1
	`, cleanUsername).Scan(&user.ID, &user.SchoolID, &user.Password, &user.Role, &user.ValidUntil)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Username tidak ditemukan"})
		return
	}

	// Verifikasi Password menggunakan bcrypt
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Password salah"})
		return
	}

	schoolIDStr := ""
	if user.SchoolID != nil {
		schoolIDStr = *user.SchoolID
	}
	
	validUntilStr := ""
	if user.ValidUntil != nil {
		validUntilStr = user.ValidUntil.Format(time.RFC3339)
	}

	// Buat Claims Token
	claims := middleware.CustomClaims{
		UserID:     user.ID,
		SchoolID:   schoolIDStr,
		Role:       user.Role,
		ValidUntil: validUntilStr,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(middleware.JwtSecretKey)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"message": "Login sukses",
	})
}
