package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5" // Pastikan sudah di-go get
)

var JwtSecretKey = []byte("super-secret-saas-key")

// Claims JWT Sesuai Kebutuhan
type CustomClaims struct {
	UserID     string `json:"user_id"`
	SchoolID   string `json:"school_id"`
	Role       string `json:"role"`
	ValidUntil string `json:"valid_until"` // Disimpan dalam format ISO8601
	jwt.RegisteredClaims
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: No token provided"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		
		// Parsing Token
		token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return JwtSecretKey, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Invalid token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(*CustomClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Invalid claims format"})
			c.Abort()
			return
		}

		// VALIDASI KONTRAK SAAS JIKA BUKAN SUPER ADMIN
		if claims.Role != "SUPER_ADMIN" {
			// Parsing string ValidUntil ke tipe Time
			validUntil, parseErr := time.Parse(time.RFC3339, claims.ValidUntil)
			if parseErr != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid valid_until date format in token"})
				c.Abort()
				return
			}

			// Cek apakah sudah kedaluwarsa
			if time.Now().After(validUntil) {
				c.JSON(http.StatusForbidden, gin.H{
					"error": "Forbidden",
					"message": "Masa aktif kontrak sekolah habis. Akses diblokir.",
				})
				c.Abort()
				return
			}
		}

		// Lolos validasi, teruskan data ke handler berikutnya
		c.Set("user_id", claims.UserID)
		c.Set("school_id", claims.SchoolID)
		c.Set("role", claims.Role)
		c.Next()
	}
}
