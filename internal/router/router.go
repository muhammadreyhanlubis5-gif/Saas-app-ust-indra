package router

import (
	"github.com/gin-gonic/gin"
	"jadwal-api/internal/handlers"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	
	dashboard := api.Group("/dashboard")
	{
		dashboard.GET("/validation", handlers.GetDashboardValidation)
	}

	// You can expand others here
	api.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong dari Vercel + Neon!"})
	})
}
