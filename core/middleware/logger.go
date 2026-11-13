package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"runtime/debug"
	"time"

	"github.com/gin-gonic/gin"
)

const RequestIDKey = "request_id"

// StructuredLogEntry format standar observabilitas JSON untuk server log
type StructuredLogEntry struct {
	Timestamp     string  `json:"timestamp"`
	Level         string  `json:"level"`
	RequestID     string  `json:"request_id"`
	UserID        string  `json:"user_id,omitempty"`
	TenantID      string  `json:"tenant_id,omitempty"`
	SchoolID      string  `json:"school_id,omitempty"`
	Method        string  `json:"method"`
	Endpoint      string  `json:"endpoint"`
	StatusCode    int     `json:"status_code"`
	DurationMs    float64 `json:"duration_ms"`
	ErrorCategory string  `json:"error_category,omitempty"`
	ErrorDetail   string  `json:"error_detail,omitempty"`
	StackTrace    string  `json:"stack_trace,omitempty"`
}

// ErrorResponse format standar sanitasi untuk dikirim ke browser / client
type ErrorResponse struct {
	Success bool           `json:"success"`
	Error   ErrorDetailDTO `json:"error"`
}

type ErrorDetailDTO struct {
	Code      string            `json:"code"`
	Message   string            `json:"message"`
	RequestID string            `json:"requestId,omitempty"`
	Fields    map[string]string `json:"fields,omitempty"`
}

// GenerateRequestID membuat ID unik request 16-byte hex
func GenerateRequestID() string {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		return fmt.Sprintf("req-%d", time.Now().UnixNano())
	}
	return "req-" + hex.EncodeToString(bytes)
}

// GetRequestID mengambil Request ID dari context Gin
func GetRequestID(c *gin.Context) string {
	if val, ok := c.Get(RequestIDKey); ok {
		if idStr, ok := val.(string); ok && idStr != "" {
			return idStr
		}
	}
	return c.GetHeader("X-Request-ID")
}

// StructuredLoggerMiddleware mencatat durasi, metadata tenant, dan menghasilkan X-Request-ID
func StructuredLoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		reqID := c.GetHeader("X-Request-ID")
		if reqID == "" {
			reqID = GenerateRequestID()
		}

		c.Set(RequestIDKey, reqID)
		c.Writer.Header().Set("X-Request-ID", reqID)

		c.Next()

		duration := float64(time.Since(start).Microseconds()) / 1000.0 // Milidetik

		userID := c.GetString("user_id")
		tenantID := c.GetString("tenant_id")
		if tenantID == "" {
			tenantID = c.GetString("school_id")
		}

		status := c.Writer.Status()
		level := "INFO"
		if status >= 500 {
			level = "ERROR"
		} else if status >= 400 {
			level = "WARN"
		}

		entry := StructuredLogEntry{
			Timestamp:  time.Now().Format(time.RFC3339Nano),
			Level:      level,
			RequestID:  reqID,
			UserID:     userID,
			TenantID:   tenantID,
			SchoolID:   tenantID,
			Method:     c.Request.Method,
			Endpoint:   c.Request.URL.Path,
			StatusCode: status,
			DurationMs: duration,
		}

		// Catat hanya jika bukan polling ping rutin untuk efisiensi log serverless
		if c.Request.URL.Path != "/api/v1/ping" {
			if jsonBytes, err := json.Marshal(entry); err == nil {
				log.Println(string(jsonBytes))
			}
		}
	}
}

// RespondError mengirim response error konsisten dan tersanitasi ke klien
// serta mencatat detail error + stack trace hanya di internal log server
func RespondError(c *gin.Context, httpStatus int, code string, clientMsg string, err error, category string) {
	reqID := GetRequestID(c)
	if reqID == "" {
		reqID = GenerateRequestID()
		c.Set(RequestIDKey, reqID)
		c.Writer.Header().Set("X-Request-ID", reqID)
	}

	userID := c.GetString("user_id")
	tenantID := c.GetString("tenant_id")
	if tenantID == "" {
		tenantID = c.GetString("school_id")
	}

	errDetail := ""
	if err != nil {
		errDetail = err.Error()
	}

	var stackTrace string
	if httpStatus >= 500 {
		stackTrace = string(debug.Stack())
	}

	entry := StructuredLogEntry{
		Timestamp:     time.Now().Format(time.RFC3339Nano),
		Level:         "ERROR",
		RequestID:     reqID,
		UserID:        userID,
		TenantID:      tenantID,
		SchoolID:      tenantID,
		Method:        c.Request.Method,
		Endpoint:      c.Request.URL.Path,
		StatusCode:    httpStatus,
		ErrorCategory: category,
		ErrorDetail:   errDetail,
		StackTrace:    stackTrace,
	}

	if jsonBytes, mErr := json.Marshal(entry); mErr == nil {
		log.Println("[STRUCTURED_ERROR]", string(jsonBytes))
	}

	// Response publik: Tidak membocorkan database error / query detail / stack trace kecuali jika ada header debug
	if c.GetHeader("X-Debug-Error") == "true" {
		c.JSON(httpStatus, gin.H{
			"success": false,
			"error": gin.H{
				"code":      code,
				"message":   clientMsg,
				"requestId": reqID,
				"debug":     errDetail,
			},
		})
		return
	}

	c.JSON(httpStatus, ErrorResponse{
		Success: false,
		Error: ErrorDetailDTO{
			Code:      code,
			Message:   clientMsg,
			RequestID: reqID,
		},
	})
}

// RespondValidationError mengirimkan respon 422 Unprocessable Entity berstandar untuk kegagalan validasi
func RespondValidationError(c *gin.Context, clientMsg string, fields map[string]string) {
	reqID := GetRequestID(c)
	if reqID == "" {
		reqID = GenerateRequestID()
		c.Set(RequestIDKey, reqID)
		c.Writer.Header().Set("X-Request-ID", reqID)
	}

	c.JSON(422, ErrorResponse{
		Success: false,
		Error: ErrorDetailDTO{
			Code:      "VALIDATION_ERROR",
			Message:   clientMsg,
			RequestID: reqID,
			Fields:    fields,
		},
	})
}
