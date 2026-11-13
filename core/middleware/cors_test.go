package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"jadwal-api/core/middleware"
)

func TestCORS_Preflight_And_Origin_Validation(t *testing.T) {
	gin.SetMode(gin.TestMode)

	r := gin.New()
	r.Use(middleware.CORSMiddleware())
	r.GET("/api/v1/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	t.Run("Production Origin Allowed with Exact Header", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodOptions, "/api/v1/ping", nil)
		req.Header.Set("Origin", "https://sistem-sekolah-pintar.vercel.app")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusNoContent {
			t.Fatalf("Expected 204 No Content, got %d", w.Code)
		}
		if w.Header().Get("Access-Control-Allow-Origin") != "https://sistem-sekolah-pintar.vercel.app" {
			t.Fatalf("Wrong Access-Control-Allow-Origin: %s", w.Header().Get("Access-Control-Allow-Origin"))
		}
		if w.Header().Get("Access-Control-Allow-Credentials") != "true" {
			t.Fatalf("Expected Access-Control-Allow-Credentials: true")
		}
	})

	t.Run("Localhost Origins Allowed", func(t *testing.T) {
		for _, origin := range []string{"http://localhost:5173", "http://localhost:8080", "http://localhost:3000"} {
			req, _ := http.NewRequest(http.MethodOptions, "/api/v1/ping", nil)
			req.Header.Set("Origin", origin)
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			if w.Code != http.StatusNoContent {
				t.Fatalf("Expected 204 for %s, got %d", origin, w.Code)
			}
			if w.Header().Get("Access-Control-Allow-Origin") != origin {
				t.Fatalf("Expected %s, got %s", origin, w.Header().Get("Access-Control-Allow-Origin"))
			}
		}
	})

	t.Run("Arbitrary Origin Rejected with 403", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodOptions, "/api/v1/ping", nil)
		req.Header.Set("Origin", "https://evil-attacker.com")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusForbidden {
			t.Fatalf("Expected 403 Forbidden for malicious origin, got %d", w.Code)
		}
		if w.Header().Get("Access-Control-Allow-Origin") != "" {
			t.Fatalf("Expected no Access-Control-Allow-Origin header, got %s", w.Header().Get("Access-Control-Allow-Origin"))
		}
	})

	t.Run("Vercel Preview Origin Blocked When Production Mode", func(t *testing.T) {
		t.Setenv("APP_ENV", "production")
		t.Setenv("VERCEL_ENV", "production")

		req, _ := http.NewRequest(http.MethodOptions, "/api/v1/ping", nil)
		req.Header.Set("Origin", "https://saas-app-ust-indra-preview123-reyhans-projects-2f2615c1.vercel.app")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusForbidden {
			t.Fatalf("Expected 403 Forbidden in production for preview origin, got %d", w.Code)
		}
	})

	t.Run("Vercel Preview Origin Allowed When Not Production", func(t *testing.T) {
		t.Setenv("APP_ENV", "preview")
		t.Setenv("VERCEL_ENV", "preview")

		req, _ := http.NewRequest(http.MethodOptions, "/api/v1/ping", nil)
		req.Header.Set("Origin", "https://saas-app-ust-indra-preview123-reyhans-projects-2f2615c1.vercel.app")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusNoContent {
			t.Fatalf("Expected 204 No Content for preview origin in preview mode, got %d", w.Code)
		}
	})

	t.Run("Loose Wildcard .vercel.app Not Allowed", func(t *testing.T) {
		t.Setenv("APP_ENV", "preview")
		t.Setenv("VERCEL_ENV", "preview")

		req, _ := http.NewRequest(http.MethodOptions, "/api/v1/ping", nil)
		req.Header.Set("Origin", "https://random-phishing-site.vercel.app")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusForbidden {
			t.Fatalf("Expected 403 for random .vercel.app origin, got %d", w.Code)
		}
	})
}
