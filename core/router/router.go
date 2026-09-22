package router

import (
	"github.com/gin-gonic/gin"
	"jadwal-api/core/handlers"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	
	// Authentication
	api.POST("/login", handlers.GenerateJWTLogin)
	api.POST("/forgot-password", handlers.SubmitForgotPassword)
	api.GET("/forgot-password/status", handlers.CheckForgotPasswordStatus)
	
	// Super Admin Routes (Should be protected by role in middleware in real app, but for now just basic auth structure)
	super := api.Group("/super")
	{
		super.GET("/schools", handlers.GetSchools)
		super.POST("/schools", handlers.CreateSchool)
		super.PUT("/schools/:id/block", handlers.BlockSchool)
		super.DELETE("/schools/:id", handlers.DeleteSchool)
		super.GET("/forgot-password-requests", handlers.GetForgotPasswordRequests)
		super.PUT("/forgot-password-requests/:id/approve", handlers.ApproveForgotPassword)
		super.DELETE("/forgot-password-requests/:id", handlers.RejectForgotPassword)
	}

	school := api.Group("/school")
	{
		school.GET("/profile", handlers.GetMySchoolProfile)
		school.PUT("/profile", handlers.UpdateMySchoolProfile)
		school.GET("/sessions", handlers.GetSchoolSessions)
		school.PUT("/sessions", handlers.UpdateSchoolSessions)
		school.GET("/pengampu", handlers.GetPengampuMapel)
		school.PUT("/pengampu", handlers.UpdatePengampuMapel)
		school.GET("/tugas-tambahan", handlers.GetTugasTambahan)
		school.PUT("/tugas-tambahan", handlers.UpdateTugasTambahan)
		school.GET("/jam-kosong", handlers.GetJamKosong)
		school.PUT("/jam-kosong", handlers.UpdateJamKosong)
		school.GET("/jadwal", handlers.GetJadwal)
		school.PUT("/jadwal", handlers.UpdateJadwal)
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
