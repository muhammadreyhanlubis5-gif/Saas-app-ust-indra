package api

import (
	"net/http"
	"github.com/gin-gonic/gin"
	
	"jadwal-api/core/database"
	"jadwal-api/core/router"
)

var app *gin.Engine

func init() {
	// Initialize DB Connection
	database.Connect()

	// Initialize Gin
	gin.SetMode(gin.ReleaseMode)
	app = gin.New()
	
	// Add CORS middleware
	app.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Setup API Routes
	router.SetupRoutes(app)
}

// Handler is the Vercel serverless entrypoint
func Handler(w http.ResponseWriter, r *http.Request) {
	app.ServeHTTP(w, r)
}
