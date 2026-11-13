package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"jadwal-api/core/database"
	"jadwal-api/core/middleware"
	"jadwal-api/core/realtime"
	"jadwal-api/core/router"
)

func main() {
	// 0. Validasi Kunci Rahasia JWT - Panic jika kosong atau memakai default lama
	middleware.InitJWTSecret()

	realtime.InitHub()
	database.Connect()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	app := gin.Default()

	// CORS middleware dengan allowlist ketat (tanpa wildcard jika credentials true)
	app.Use(middleware.CORSMiddleware())

	router.SetupRoutes(app)

	log.Printf("[GuruKu Backend] Starting API server on http://localhost:%s\n", port)
	if err := app.Run(":" + port); err != nil {
		log.Fatalf("[GuruKu Backend] Failed to run server: %v", err)
	}
}
