package router

import (
	"github.com/gin-gonic/gin"
	"jadwal-api/core/handlers"
	"jadwal-api/core/realtime"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	// Real-Time WebSocket & SSE Architecture
	api.GET("/ws", realtime.HandleWebSocket)
	api.GET("/realtime/stream", realtime.HandleSSE)
	api.POST("/school/progress", realtime.HandleProgressUpdate)
	
	// Authentication
	api.POST("/login", handlers.GenerateJWTLogin)
	api.POST("/forgot-password", handlers.SubmitForgotPassword)
	api.GET("/forgot-password/status", handlers.CheckForgotPasswordStatus)
	
	// Super Admin Routes
	super := api.Group("/super")
	{
		super.GET("/metrics", handlers.GetDashboardMetrics)
		super.GET("/schools", handlers.GetSchools)
		super.POST("/schools", handlers.CreateSchool)
		super.PUT("/schools/:id/limit", handlers.UpdateSchoolLimit)
		super.PUT("/schools/:id/renew", handlers.ManualRenewSchool)
		super.PUT("/schools/:id/suspend", handlers.SuspendSchool)
		super.PUT("/schools/:id/block", handlers.BlockSchool)
		super.DELETE("/schools/:id", handlers.DeleteSchool)
		
		// Pricing Source of Truth
		super.GET("/plans", handlers.GetSubscriptionPlans)
		super.PUT("/plans/:id", handlers.UpdateSubscriptionPlan)

		// Password Reset Requests
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

	// Support Tickets (Pusat Bantuan SaaS)
	api.POST("/support-tickets", handlers.CreateSupportTicket)
	api.GET("/support-tickets", handlers.GetSupportTickets)
	api.PUT("/support-tickets/:id/status", handlers.UpdateSupportTicketStatus)
	api.DELETE("/support-tickets/:id", handlers.DeleteSupportTicket)

	// Billing & Invoices (Tagihan & Keuangan)
	api.POST("/billing/renew", handlers.CreateRenewalInvoice)
	api.POST("/payment-confirmations", handlers.CreatePaymentConfirmation)
	api.GET("/payment-confirmations", handlers.GetPaymentConfirmations)
	api.PUT("/payment-confirmations/:id/approve", handlers.ApprovePaymentConfirmation)
	api.PUT("/payment-confirmations/:id/reject", handlers.RejectPaymentConfirmation)
	api.DELETE("/payment-confirmations/:id", handlers.DeletePaymentConfirmation)

	api.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong dari GuruKu SaaS Core API!"})
	})
}
