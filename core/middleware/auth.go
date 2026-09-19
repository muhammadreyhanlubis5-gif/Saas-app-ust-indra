package middleware

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	// "github.com/golang-jwt/jwt/v5" // Membutuhkan library jwt-go
	"jadwal-api/core/database"
)

// Struktur rahasia JWT (Sebagai contoh, di production harus pakai env variable)
var jwtSecretKey = []byte("super-secret-saas-key")

// Claims struct untuk JWT
// type Claims struct {
// 	UserID   string `json:"user_id"`
// 	SchoolID string `json:"school_id"`
// 	Role     string `json:"role"`
// 	jwt.RegisteredClaims
// }

// AuthMiddleware adalah middleware untuk JWT dan pengecekan Multi-Tenant
func AuthMiddleware(requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: No token provided"})
			c.Abort()
			return
		}

		// tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		
		// 1. Validasi JWT Token (Simulasi)
		// token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// 	return jwtSecretKey, nil
		// })
		
		// MOCKING HASIL PARSING JWT UNTUK CONTOH:
		mockRole := "school_admin" 
		mockSchoolID := "123e4567-e89b-12d3-a456-426614174000" // ID Tenant

		// 2. Cek Role Access (RBAC)
		roleAllowed := false
		if len(requiredRoles) == 0 {
			roleAllowed = true // Jika tidak dispesifikasikan, bebas akses asal login
		} else {
			for _, role := range requiredRoles {
				if role == mockRole {
					roleAllowed = true
					break
				}
			}
		}

		if !roleAllowed {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: You don't have permission to access this resource"})
			c.Abort()
			return
		}

		// 3. Validasi Kontrak Tenant (SaaS Subscription)
		if mockRole != "super_admin" {
			var validUntil time.Time
			var isActive bool

			// Query ke database untuk mengecek masa aktif sekolah/tenant ini
			err := database.DB.QueryRow(`
				SELECT valid_until, is_active 
				FROM schools 
				WHERE id = $1
			`, mockSchoolID).Scan(&validUntil, &isActive)

			if err != nil {
				if err == sql.ErrNoRows {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "Tenant / School not found"})
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error checking tenant status"})
				}
				c.Abort()
				return
			}

			// Cek apakah akun sekolah di-nonaktifkan manual oleh Super Admin
			if !isActive {
				c.JSON(http.StatusForbidden, gin.H{"error": "School account has been deactivated by Super Admin"})
				c.Abort()
				return
			}

			// Cek apakah kontrak (valid_until) sudah kedaluwarsa
			if time.Now().After(validUntil) {
				c.JSON(http.StatusPaymentRequired, gin.H{
					"error": "Subscription Expired",
					"message": "Masa kontrak sekolah Anda telah habis. Silakan hubungi Super Admin untuk perpanjangan layanan.",
				})
				c.Abort()
				return
			}
		}

		// 4. Set Context Variables (Agar handler selanjutnya tahu siapa user yang request)
		c.Set("user_role", mockRole)
		c.Set("school_id", mockSchoolID)
		
		c.Next()
	}
}
