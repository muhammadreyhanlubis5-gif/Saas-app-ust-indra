package middleware

import (
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

var previewOriginRegex = regexp.MustCompile(`^https://saas-app-ust-indra-[a-z0-9]+-reyhans-projects-2f2615c1\.vercel\.app$`)

// IsOriginAllowed validates whether an incoming origin is permitted
func IsOriginAllowed(origin string) bool {
	if origin == "" {
		return false
	}

	// 1. Check explicit allowlist from environment variable if defined
	allowedRaw := strings.TrimSpace(os.Getenv("CORS_ALLOWED_ORIGINS"))
	if allowedRaw != "" {
		allowedList := strings.Split(allowedRaw, ",")
		for _, a := range allowedList {
			if strings.TrimSpace(a) == origin {
				return true
			}
		}
		return false
	}

	// 2. Exact match production domain GuruKu
	if origin == "https://sistem-sekolah-pintar.vercel.app" {
		return true
	}

	// 3. Localhost development
	if origin == "http://localhost:5173" || origin == "http://localhost:8080" || origin == "http://localhost:3000" {
		return true
	}

	// 4. Specific Vercel preview project pattern (ONLY if NOT production)
	appEnv := os.Getenv("APP_ENV")
	vercelEnv := os.Getenv("VERCEL_ENV")
	if appEnv != "production" && vercelEnv != "production" {
		if previewOriginRegex.MatchString(origin) {
			return true
		}
	}

	return false
}

// CORSMiddleware enforces strict CORS policies
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		if IsOriginAllowed(origin) {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")

			allowedHeaders := "Content-Type, Authorization, X-Requested-With, Accept, Origin"
			if os.Getenv("APP_ENV") == "test" || os.Getenv("VERCEL_ENV") == "preview" {
				allowedHeaders += ", x-vercel-protection-bypass"
			}
			c.Writer.Header().Set("Access-Control-Allow-Headers", allowedHeaders)
		}

		if c.Request.Method == "OPTIONS" {
			if IsOriginAllowed(origin) {
				c.AbortWithStatus(http.StatusNoContent)
			} else {
				c.AbortWithStatus(http.StatusForbidden)
			}
			return
		}
		c.Next()
	}
}
