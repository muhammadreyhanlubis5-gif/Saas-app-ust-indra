package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"jadwal-api/core/middleware"
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

	// Di sini harusnya ada query database untuk cek username & password
	// dan mengambil data user beserta valid_until milik school_id nya.
	// Contoh MOCK DATA:
	
	mockUserID := "user-123"
	mockSchoolID := "school-456"
	mockRole := "SCHOOL_ADMIN"
	mockValidUntil := time.Now().AddDate(0, 1, 0).Format(time.RFC3339) // Aktif 1 bulan dari sekarang
	
	// Khusus untuk test expired: 
	if req.Username == "expired" {
		mockValidUntil = time.Now().AddDate(0, -1, 0).Format(time.RFC3339) // Expired 1 bulan lalu
	}

	// Buat Claims Token
	claims := middleware.CustomClaims{
		UserID:     mockUserID,
		SchoolID:   mockSchoolID,
		Role:       mockRole,
		ValidUntil: mockValidUntil,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // Token login expired 1 hari
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
