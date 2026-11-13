package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	
	"jadwal-api/core/database"
	"jadwal-api/core/middleware"
	"jadwal-api/core/realtime"
	"jadwal-api/core/router"
)

var app *gin.Engine

func init() {
	// 0. Validasi Kunci Rahasia JWT - Panic jika kosong atau memakai default lama
	middleware.InitJWTSecret()

	realtime.InitHub()
	// Initialize DB Connection
	database.Connect()

	// Initialize Gin
	gin.SetMode(gin.ReleaseMode)
	app = gin.New()
	
	// Add CORS middleware with strict allowlist, NO wildcard, and clean headers
	app.Use(middleware.CORSMiddleware())

	// Setup API Routes
	router.SetupRoutes(app)
}

// Handler is the Vercel serverless entrypoint
func Handler(w http.ResponseWriter, r *http.Request) {
	app.ServeHTTP(w, r)
}
