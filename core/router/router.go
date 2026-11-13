package router

import (
	"os"

	"github.com/gin-gonic/gin"
	"jadwal-api/core/handlers"
	"jadwal-api/core/middleware"
	"jadwal-api/core/realtime"
)

func SetupRoutes(r *gin.Engine) {
	// 0. Observability & Security: Structured Logging & Request ID
	r.Use(middleware.StructuredLoggerMiddleware())

	// 1. Extreme Performance Middleware: Gzip Payload Compression (Pillar 3)
	r.Use(middleware.GzipCompressionMiddleware())

	// 2. DevSecOps Defense: Token Bucket Rate Limiter (60 req/s, burst 20) (Pillar 4)
	r.Use(middleware.TokenBucketRateLimiter(60, 20))

	api := r.Group("/api/v1")

	// =========================================================================
	// 1. DAFTAR PUTIH ROUTE PUBLIK SECARA EKSPLISIT
	// =========================================================================
	// - POST /api/v1/login (Autentikasi akun)
	// - POST /api/v1/logout (Logout sesi)
	// - GET  /api/v1/auth/session (Verifikasi sesi cookie/token)
	// - POST /api/v1/forgot-password (Pengajuan lupa password)
	// - GET  /api/v1/forgot-password/status (Cek status pengajuan)
	// - GET  /api/v1/ping (Ping healthcheck)
	// - GET  /api/v1/health (Health check publik minimal {"status":"ok"})
	api.POST("/login", middleware.NewCustomRateLimiter(0.5, 5), handlers.GenerateJWTLogin)
	api.POST("/logout", handlers.LogoutHandler)
	api.GET("/auth/session", handlers.GetSessionHandler)
	api.POST("/forgot-password", middleware.NewCustomRateLimiter(0.2, 3), handlers.SubmitForgotPassword)
	api.GET("/forgot-password/status", handlers.CheckForgotPasswordStatus)
	api.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong dari GuruKu SaaS Core API (Enterprise Grade)!"})
	})
	api.GET("/health", handlers.HealthCheckHandler)

	// =========================================================================
	// 2. ROUTE REALTIME (WebSocket & SSE - Handshake Auth Wajib)
	// =========================================================================
	api.GET("/ws", realtime.HandleWebSocket)
	api.GET("/realtime/stream", realtime.HandleSSE)
	api.POST("/school/progress", middleware.AuthMiddleware(), middleware.RequireRoles("SCHOOL_ADMIN", "SUPER_ADMIN"), realtime.HandleProgressUpdate)

	// Heavy-Lifting Scheduling Engine (Wajib Auth & Role)
	api.POST("/school/auto-schedule/solve", middleware.AuthMiddleware(), middleware.RequireRoles("SCHOOL_ADMIN", "CURRICULUM_ADMIN", "SUPER_ADMIN"), handlers.HandleSolveSchedule)

	// Super Admin Routes (Wajib Auth + Role SUPER_ADMIN + Tenant Context)
	super := api.Group("/super")
	super.Use(middleware.AuthMiddleware(), middleware.RequireRoles("SUPER_ADMIN"), middleware.TenantContextMiddleware())
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

	// School Admin Routes (Wajib Auth + Role Sekolah + Tenant Context RLS)
	school := api.Group("/school")
	school.Use(middleware.AuthMiddleware(), middleware.RequireRoles("SCHOOL_ADMIN", "CURRICULUM_ADMIN", "PRINCIPAL", "SUPER_ADMIN"), middleware.TenantContextMiddleware())
	{
		school.GET("/dashboard", handlers.GetSchoolDashboardSummary)
		school.GET("/profile", handlers.GetMySchoolProfile)
		school.PUT("/profile", handlers.UpdateMySchoolProfile)
		school.GET("/sessions", handlers.GetSchoolSessions)
		school.PUT("/sessions", handlers.UpdateSchoolSessions)

		// Master Data: Classes (Daftar Kelas)
		school.GET("/classes", handlers.GetClasses)
		school.POST("/classes", handlers.CreateClass)
		school.POST("/classes/batch", handlers.BatchImportClasses)
		school.GET("/classes/:id", handlers.GetClassByID)
		school.PUT("/classes/:id", handlers.UpdateClass)
		school.DELETE("/classes/:id", handlers.DeleteClass)

		// Master Data: Teachers (Daftar Guru)
		school.GET("/teachers", handlers.GetTeachers)
		school.POST("/teachers", handlers.CreateTeacher)
		school.POST("/teachers/batch", handlers.BatchImportTeachers)
		school.GET("/teachers/:id", handlers.GetTeacherByID)
		school.PUT("/teachers/:id", handlers.UpdateTeacher)
		school.DELETE("/teachers/:id", handlers.DeleteTeacher)

		// Master Data: Subjects (Mata Pelajaran)
		school.GET("/subjects", handlers.GetSubjects)
		school.POST("/subjects", handlers.CreateSubject)
		school.POST("/subjects/batch", handlers.BatchImportSubjects)
		school.GET("/subjects/:id", handlers.GetSubjectByID)
		school.PUT("/subjects/:id", handlers.UpdateSubject)
		school.DELETE("/subjects/:id", handlers.DeleteSubject)

		// Standardized XLSB Import Validate & Commit Endpoints
		school.POST("/import/xlsb/validate", handlers.ValidateXlsbImport)
		school.POST("/import/xlsb/commit", handlers.CommitXlsbImport)

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
	dashboard.Use(middleware.AuthMiddleware(), middleware.RequireRoles("SCHOOL_ADMIN", "CURRICULUM_ADMIN", "PRINCIPAL", "SUPER_ADMIN"), middleware.TenantContextMiddleware())
	{
		dashboard.GET("/validation", handlers.GetDashboardValidation)
	}

	// Support Tickets (Pusat Bantuan SaaS - Wajib Auth)
	tickets := api.Group("/support-tickets")
	tickets.Use(middleware.AuthMiddleware())
	{
		tickets.POST("", handlers.CreateSupportTicket)
		tickets.GET("", middleware.RequireRoles("SUPER_ADMIN"), handlers.GetSupportTickets)
		tickets.PUT("/:id/status", middleware.RequireRoles("SUPER_ADMIN"), handlers.UpdateSupportTicketStatus)
		tickets.DELETE("/:id", middleware.RequireRoles("SUPER_ADMIN"), handlers.DeleteSupportTicket)
	}

	// Billing & Invoices (Tagihan & Keuangan - Wajib Auth)
	billing := api.Group("/billing")
	billing.Use(middleware.AuthMiddleware(), middleware.RequireRoles("SCHOOL_ADMIN", "SUPER_ADMIN"), middleware.TenantContextMiddleware())
	{
		billing.POST("/renew", handlers.CreateRenewalInvoice)
	}

	payments := api.Group("/payment-confirmations")
	payments.Use(middleware.AuthMiddleware())
	{
		payments.POST("", middleware.RequireRoles("SCHOOL_ADMIN", "SUPER_ADMIN"), handlers.CreatePaymentConfirmation)
		payments.GET("", middleware.RequireRoles("SUPER_ADMIN"), handlers.GetPaymentConfirmations)
		payments.PUT("/:id/approve", middleware.RequireRoles("SUPER_ADMIN"), handlers.ApprovePaymentConfirmation)
		payments.PUT("/:id/reject", middleware.RequireRoles("SUPER_ADMIN"), handlers.RejectPaymentConfirmation)
		payments.DELETE("/:id", middleware.RequireRoles("SUPER_ADMIN"), handlers.DeletePaymentConfirmation)
	}

	// Endpoint diagnostik dan mutatif/destruktif hanya diizinkan pada test environment internal
	// Dilarang keras aktif pada environment production dan preview
	if os.Getenv("APP_ENV") == "test" {
		api.GET("/health/db-stats", handlers.GetDatabaseStats)
		api.POST("/health/db-reset-test", handlers.ResetTestingDatabaseHandler)
		api.POST("/health/run-migrations", handlers.RunMigrationsHandler)
	}
}
