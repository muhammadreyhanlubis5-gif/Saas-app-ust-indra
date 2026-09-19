package router

import (
	"github.com/gin-gonic/gin"
	"jadwal-api/core/handlers"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	
	// Authentication
	api.POST("/login", handlers.GenerateJWTLogin)
	
	// Super Admin Routes (Should be protected by role in middleware in real app, but for now just basic auth structure)
	super := api.Group("/super")
	{
		super.GET("/schools", handlers.GetSchools)
		super.POST("/schools", handlers.CreateSchool)
		super.PUT("/schools/:id/block", handlers.BlockSchool)
		super.DELETE("/schools/:id", handlers.DeleteSchool)
	}

	school := api.Group("/school")
	{
		school.GET("/profile", handlers.GetMySchoolProfile)
		school.PUT("/profile", handlers.UpdateMySchoolProfile)
	}
	
	dashboard := api.Group("/dashboard")
	{
		dashboard.GET("/validation", handlers.GetDashboardValidation)
	}

	// You can expand others here
	api.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong dari Vercel + Neon!"})
	})
}
