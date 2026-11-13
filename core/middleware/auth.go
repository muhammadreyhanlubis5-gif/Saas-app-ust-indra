package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const LegacyDefaultSecret = "super-secret-saas-key"

var JwtSecretKey []byte

// InitJWTSecret initializes and validates the JWT signing key strictly from environment.
// Panics immediately if missing, empty, or set to the legacy hardcoded default.
func InitJWTSecret() {
	secret := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	if secret == "" {
		panic("[CRITICAL SECURITY] JWT_SECRET environment variable is missing. Application cannot start without a valid JWT_SECRET.")
	}
	if secret == LegacyDefaultSecret {
		panic("[CRITICAL SECURITY] Insecure legacy default JWT_SECRET detected. You must provide a secure, unique JWT_SECRET in environment variables.")
	}
	if len(secret) < 32 {
		panic("[CRITICAL SECURITY] JWT_SECRET is too short (must be at least 32 characters for HMAC-SHA256).")
	}
	JwtSecretKey = []byte(secret)
}

// GetJWTSecret returns the validated secret key, initializing it lazily if not yet initialized.
func GetJWTSecret() []byte {
	if len(JwtSecretKey) == 0 {
		InitJWTSecret()
	}
	return JwtSecretKey
}

const AuthCookieName = "guruku_jwt"

// Claims JWT Sesuai Kebutuhan Enterprise
type CustomClaims struct {
	UserID     string `json:"user_id"`
	SchoolID   string `json:"school_id"`
	Role       string `json:"role"`
	ValidUntil string `json:"valid_until"` // Disimpan dalam format ISO8601
	jwt.RegisteredClaims
}

/**
 * SetAuthCookie
 * Sets HttpOnly, Secure, SameSite=Strict cookie for session management.
 * Protects tokens from JavaScript access and prevents XSS token-stealing attacks.
 */
func SetAuthCookie(c *gin.Context, token string, duration time.Duration) {
	isSecure := c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https"
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		AuthCookieName,
		token,
		int(duration.Seconds()),
		"/",
		"",
		isSecure,
		true, // HttpOnly: Strictly no JS access (Anti-XSS)
	)
}

/**
 * ClearAuthCookie
 * Safely expires and clears the auth session cookie.
 */
func ClearAuthCookie(c *gin.Context) {
	isSecure := c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https"
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		AuthCookieName,
		"",
		-1,
		"/",
		"",
		isSecure,
		true,
	)
}

// ExtractAndValidateClaims mengekstrak dan memvalidasi JWT dari cookie atau header
func ExtractAndValidateClaims(c *gin.Context) (*CustomClaims, error) {
	tokenString := ""
	if cookieToken, err := c.Cookie(AuthCookieName); err == nil && cookieToken != "" {
		tokenString = cookieToken
	}

	if tokenString == "" {
		authHeader := c.GetHeader("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}

	if tokenString == "" {
		return nil, fmt.Errorf("token tidak ditemukan")
	}

	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("metode signing tidak valid")
		}
		return GetJWTSecret(), nil
	})

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("token tidak valid atau telah kedaluwarsa")
	}

	claims, ok := token.Claims.(*CustomClaims)
	if !ok {
		return nil, fmt.Errorf("klaim token tidak sesuai format")
	}

	return claims, nil
}

/**
 * AuthMiddleware
 * High-security authentication checking HttpOnly cookie first, then Bearer header fallback.
 */
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := ""

		// 1. Primary Defense: Read from HttpOnly cookie
		if cookieToken, err := c.Cookie(AuthCookieName); err == nil && cookieToken != "" {
			tokenString = cookieToken
		}

		// 2. Secondary Fallback: Authorization Bearer header (for mobile / CLI / third-party)
		if tokenString == "" {
			authHeader := c.GetHeader("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Sesi tidak ditemukan atau kedaluwarsa. Silakan login kembali.",
				"code":    "AUTH_TOKEN_MISSING",
			})
			return
		}

		// Parsing Token
		token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return GetJWTSecret(), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Token otentikasi tidak valid atau telah dimodifikasi.",
				"code":    "AUTH_TOKEN_INVALID",
			})
			return
		}

		claims, ok := token.Claims.(*CustomClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Format klaim identitas tidak sesuai.",
			})
			return
		}

		// VALIDASI KONTRAK SAAS JIKA BUKAN SUPER ADMIN
		if claims.Role != "SUPER_ADMIN" {
			if claims.ValidUntil != "" {
				validUntil, parseErr := time.Parse(time.RFC3339, claims.ValidUntil)
				if parseErr == nil && time.Now().After(validUntil) {
					c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
						"error":   "Forbidden",
						"message": "Masa aktif kontrak sekolah habis. Akses diblokir.",
						"code":    "SUBSCRIPTION_EXPIRED",
					})
					return
				}
			}
		}

		// Set context values
		c.Set("user_id", claims.UserID)
		c.Set("school_id", claims.SchoolID)
		c.Set("tenant_id", claims.SchoolID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

/**
 * RequireRoles
 * RBAC authorization middleware ensuring the user belongs to at least one of the permitted roles.
 */
func RequireRoles(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Identitas peran tidak ditemukan dalam sesi.",
				"code":    "ROLE_MISSING",
			})
			return
		}

		userRole, ok := roleVal.(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"error": "Tipe data peran tidak valid.",
			})
			return
		}

		normalizedUserRole := strings.ToUpper(strings.TrimSpace(userRole))
		for _, allowed := range allowedRoles {
			if strings.ToUpper(strings.TrimSpace(allowed)) == normalizedUserRole {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error":   "Forbidden",
			"message": "Anda tidak memiliki wewenang untuk mengakses endpoint ini.",
			"code":    "INSUFFICIENT_PERMISSIONS",
		})
	}
}
