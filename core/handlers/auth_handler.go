package handlers

import (
	"fmt"
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
		ID           string
		SchoolID     *string
		Password     string
		Role         string
		ValidUntil   *time.Time
		SchoolStatus *string
	}

	cleanUsername := strings.TrimSpace(req.Username)
	var altUsername string
	domain := "@guruku.id"
	if strings.HasSuffix(cleanUsername, domain) {
		altUsername = strings.TrimSuffix(cleanUsername, domain)
	} else {
		altUsername = cleanUsername + domain
	}

	err := database.DB.QueryRow(`
		SELECT u.id, u.school_id, u.password, u.role, s.valid_until, s.status
		FROM users u
		LEFT JOIN schools s ON u.school_id = s.id
		WHERE u.username = $1 OR u.username = $2
	`, cleanUsername, altUsername).Scan(&user.ID, &user.SchoolID, &user.Password, &user.Role, &user.ValidUntil, &user.SchoolStatus)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Username tidak ditemukan"})
		return
	}

	// Verifikasi Password menggunakan bcrypt
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Password salah"})
		return
	}

	// Cek status lisensi dan suspensi untuk tenant (SCHOOL_ADMIN / TEACHER)
	if user.Role != "SUPER_ADMIN" {
		if user.SchoolStatus != nil && *user.SchoolStatus == "SUSPENDED" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Akses login institusi Anda ditangguhkan oleh Super Admin (Suspended). Silakan hubungi manajemen GuruKu.",
				"code":  "TENANT_SUSPENDED",
			})
			return
		}

		if user.ValidUntil != nil && user.ValidUntil.Before(time.Now()) {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Masa langganan lisensi sekolah Anda telah kedaluwarsa (Expired). Akses masuk ditangguhkan sampai perpanjangan lisensi diproses.",
				"code":  "SUBSCRIPTION_EXPIRED",
			})
			return
		}
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

	// Set HttpOnly, Secure, SameSite=Strict cookie for session (Enterprise Anti-XSS)
	middleware.SetAuthCookie(c, tokenString, 24*time.Hour)

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"message": "Login sukses",
	})
}

// LogoutHandler clears the HttpOnly session cookie
func LogoutHandler(c *gin.Context) {
	middleware.ClearAuthCookie(c)
	c.JSON(http.StatusOK, gin.H{
		"message": "Logout berhasil. Sesi telah diakhiri secara aman.",
	})
}

// GetSessionHandler validates the HttpOnly cookie session and returns the active user info
func GetSessionHandler(c *gin.Context) {
	tokenString := ""
	if cookieToken, err := c.Cookie(middleware.AuthCookieName); err == nil && cookieToken != "" {
		tokenString = cookieToken
	} else {
		authHeader := c.GetHeader("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}

	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"authenticated": false,
			"error":         "Sesi tidak ditemukan atau telah berakhir",
		})
		return
	}

	token, err := jwt.ParseWithClaims(tokenString, &middleware.CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return middleware.JwtSecretKey, nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{
			"authenticated": false,
			"error":         "Token tidak valid atau kedaluwarsa",
		})
		return
	}

	claims, ok := token.Claims.(*middleware.CustomClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"authenticated": false,
			"error":         "Claims token tidak valid",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"authenticated": true,
		"user": gin.H{
			"id":          claims.UserID,
			"role":        claims.Role,
			"school_id":   claims.SchoolID,
			"valid_until": claims.ValidUntil,
		},
	})
}
