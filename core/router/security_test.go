package router_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"jadwal-api/core/middleware"
	"jadwal-api/core/router"
)

const testSecret = "test-secret-at-least-32-chars-long-secure-key-1234567890"

func init() {
	gin.SetMode(gin.TestMode)
	os.Setenv("JWT_SECRET", testSecret)
	middleware.InitJWTSecret()
}

func generateTestToken(userID, schoolID, role string, expired bool) string {
	exp := time.Now().Add(1 * time.Hour)
	if expired {
		exp = time.Now().Add(-1 * time.Hour)
	}

	claims := middleware.CustomClaims{
		UserID:     userID,
		SchoolID:   schoolID,
		Role:       role,
		ValidUntil: time.Now().Add(24 * time.Hour).Format(time.RFC3339),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(exp),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(middleware.GetJWTSecret())
	return tokenString
}

func setupTestRouter() *gin.Engine {
	r := gin.New()
	router.SetupRoutes(r)
	return r
}

// TEST 1: Request ke /school/* tanpa token WAJIB mengembalikan HTTP 401
func TestSecurity_UnauthenticatedRequest_Returns401(t *testing.T) {
	r := setupTestRouter()

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/school/classes", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("Expected HTTP 401 Unauthorized for unauthenticated request, got %d", w.Code)
	}
}

// TEST 2: Request membawa token SAH milik Tenant A + header X-School-ID milik Tenant B
// Verifikasi bahwa header X-School-ID diabaikan total dan handler HANYA memproses Tenant A
func TestSecurity_TenantIsolation_XSchoolIDHeaderIgnored(t *testing.T) {
	r := gin.New()
	r.Use(middleware.AuthMiddleware())
	r.GET("/api/v1/school/identity", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"school_id": c.GetString("school_id"),
			"tenant_id": c.GetString("tenant_id"),
		})
	})

	const tenantA = "tenant-a-uuid-1111-1111-111111111111"
	const tenantB = "tenant-b-uuid-2222-2222-222222222222"

	tokenA := generateTestToken("user-a", tenantA, "SCHOOL_ADMIN", false)

	// Uji 1: Custom endpoint yang mengecek context school_id / tenant_id
	req, _ := http.NewRequest(http.MethodGet, "/api/v1/school/identity", nil)
	req.Header.Set("Authorization", "Bearer "+tokenA)
	req.Header.Set("X-School-ID", tenantB)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected HTTP 200 OK, got %d", w.Code)
	}

	var resp struct {
		SchoolID string `json:"school_id"`
		TenantID string `json:"tenant_id"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if resp.SchoolID != tenantA {
		t.Fatalf("Tenant isolation breached! Expected school_id %s, got %s", tenantA, resp.SchoolID)
	}
	if resp.TenantID != tenantA {
		t.Fatalf("Tenant isolation breached! Expected tenant_id %s, got %s", tenantA, resp.TenantID)
	}

	// Uji 2: Endpoint sesi resmi SetupRoutes (/api/v1/auth/session)
	rOfficial := setupTestRouter()
	reqSession, _ := http.NewRequest(http.MethodGet, "/api/v1/auth/session", nil)
	reqSession.Header.Set("Authorization", "Bearer "+tokenA)
	reqSession.Header.Set("X-School-ID", tenantB)
	wSession := httptest.NewRecorder()
	rOfficial.ServeHTTP(wSession, reqSession)

	if wSession.Code != http.StatusOK {
		t.Fatalf("Expected HTTP 200 OK on /auth/session, got %d", wSession.Code)
	}
	var sessionResp struct {
		User struct {
			SchoolID string `json:"school_id"`
		} `json:"user"`
	}
	if err := json.Unmarshal(wSession.Body.Bytes(), &sessionResp); err != nil {
		t.Fatalf("Failed to parse session response: %v", err)
	}
	if sessionResp.User.SchoolID != tenantA {
		t.Fatalf("Header X-School-ID was not ignored! Got %s instead of Tenant A (%s)", sessionResp.User.SchoolID, tenantA)
	}
}

// TEST 2B: Request ke /school/* dengan header X-School-ID tanpa JWT tetap ditolak HTTP 401
func TestSecurity_FakeXSchoolIDHeaderWithoutToken_Returns401(t *testing.T) {
	r := setupTestRouter()

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/school/classes", nil)
	req.Header.Set("X-School-ID", "36c278ce-9063-4ac0-8f82-ae42b52b8eae")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("Expected HTTP 401 Unauthorized when passing fake X-School-ID without JWT, got %d", w.Code)
	}
}

// TEST 3: Request ke /super/* dengan role bukan SUPER_ADMIN WAJIB mengembalikan HTTP 403
func TestSecurity_WrongRole_Returns403(t *testing.T) {
	r := setupTestRouter()

	schoolAdminToken := generateTestToken("user-1", "school-1", "SCHOOL_ADMIN", false)

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/super/schools", nil)
	req.Header.Set("Authorization", "Bearer "+schoolAdminToken)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Fatalf("Expected HTTP 403 Forbidden for SCHOOL_ADMIN accessing /super/*, got %d", w.Code)
	}
}

// TEST 4: Request dengan token kadaluwarsa WAJIB mengembalikan HTTP 401
func TestSecurity_ExpiredToken_Returns401(t *testing.T) {
	r := setupTestRouter()

	expiredToken := generateTestToken("user-1", "school-1", "SCHOOL_ADMIN", true)

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/school/classes", nil)
	req.Header.Set("Authorization", "Bearer "+expiredToken)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("Expected HTTP 401 Unauthorized for expired token, got %d", w.Code)
	}
}

// TEST 5: Startup panic jika JWT_SECRET kosong atau default lama
func TestSecurity_JWTSecretValidation_PanicsOnInsecure(t *testing.T) {
	defer func() {
		os.Setenv("JWT_SECRET", testSecret)
		middleware.InitJWTSecret()
	}()

	// 1. Kosong
	os.Setenv("JWT_SECRET", "")
	panicked := false
	func() {
		defer func() {
			if r := recover(); r != nil {
				panicked = true
			}
		}()
		middleware.InitJWTSecret()
	}()
	if !panicked {
		t.Fatal("Expected panic when JWT_SECRET is empty, but did not panic")
	}

	// 2. Default lama
	os.Setenv("JWT_SECRET", "super-secret-saas-key")
	panicked = false
	func() {
		defer func() {
			if r := recover(); r != nil {
				panicked = true
			}
		}()
		middleware.InitJWTSecret()
	}()
	if !panicked {
		t.Fatal("Expected panic when JWT_SECRET is super-secret-saas-key, but did not panic")
	}
}

// TEST 6: WebSocket Handshake tanpa token WAJIB ditolak HTTP 401
func TestSecurity_WebSocketHandshakeWithoutToken_Returns401(t *testing.T) {
	r := setupTestRouter()

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/ws", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("Expected HTTP 401 Unauthorized for WebSocket handshake without token, got %d", w.Code)
	}
}

// TEST 7: SSE Stream tanpa token WAJIB ditolak HTTP 401
func TestSecurity_SSEStreamWithoutToken_Returns401(t *testing.T) {
	r := setupTestRouter()

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/realtime/stream", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("Expected HTTP 401 Unauthorized for SSE stream without token, got %d", w.Code)
	}
}

// TEST 8: Auto Schedule Solve tanpa token WAJIB ditolak HTTP 401
func TestSecurity_AutoScheduleSolveWithoutToken_Returns401(t *testing.T) {
	r := setupTestRouter()

	req, _ := http.NewRequest(http.MethodPost, "/api/v1/school/auto-schedule/solve", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("Expected HTTP 401 Unauthorized for solve endpoint without token, got %d", w.Code)
	}
}

// TEST 9: Payment Approval oleh SCHOOL_ADMIN WAJIB ditolak HTTP 403 Forbidden
func TestSecurity_PaymentApprovalBySchoolAdmin_Returns403(t *testing.T) {
	r := setupTestRouter()

	schoolAdminToken := generateTestToken("user-1", "school-1", "SCHOOL_ADMIN", false)

	req, _ := http.NewRequest(http.MethodPut, "/api/v1/payment-confirmations/123/approve", nil)
	req.Header.Set("Authorization", "Bearer "+schoolAdminToken)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Fatalf("Expected HTTP 403 Forbidden for SCHOOL_ADMIN trying to approve payment, got %d", w.Code)
	}
}

// TEST 10: Token yang ditandatangani dengan secret lama ("super-secret-saas-key")
// WAJIB ditolak HTTP 401 Unauthorized secara elegan (bukan panic atau crash 500)
func TestSecurity_TokenSignedWithOldSecret_Returns401(t *testing.T) {
	r := setupTestRouter()

	claims := middleware.CustomClaims{
		UserID:     "user-1",
		SchoolID:   "school-1",
		Role:       "SCHOOL_ADMIN",
		ValidUntil: time.Now().Add(24 * time.Hour).Format(time.RFC3339),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	oldToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	oldTokenStr, err := oldToken.SignedString([]byte("super-secret-saas-key"))
	if err != nil {
		t.Fatalf("Failed to sign token with old secret: %v", err)
	}

	// 1. Uji ke endpoint terlindungi /school/classes
	req, _ := http.NewRequest(http.MethodGet, "/api/v1/school/classes", nil)
	req.Header.Set("Authorization", "Bearer "+oldTokenStr)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("Expected HTTP 401 Unauthorized on protected route for token signed with old secret, got %d", w.Code)
	}

	// 2. Uji ke endpoint sesi /auth/session
	reqSession, _ := http.NewRequest(http.MethodGet, "/api/v1/auth/session", nil)
	reqSession.Header.Set("Authorization", "Bearer "+oldTokenStr)
	wSession := httptest.NewRecorder()
	r.ServeHTTP(wSession, reqSession)

	if wSession.Code != http.StatusUnauthorized {
		t.Fatalf("Expected HTTP 401 Unauthorized on /auth/session for old token, got %d", wSession.Code)
	}
}
