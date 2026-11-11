package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"jadwal-api/core/database"
)

type PaymentConfirmationRequest struct {
	TenantID   *string `json:"tenant_id"`
	Invoice    string  `json:"invoice"`
	Plan       string  `json:"plan" binding:"required"`
	Amount     int64   `json:"amount"`
	Method     string  `json:"method"`
	SenderName string  `json:"senderName" binding:"required"`
	BankName   string  `json:"bankName"`
	Notes      string  `json:"notes"`
	ProofImage string  `json:"proofImage"`
	Status     string  `json:"status"`
}

type PaymentConfirmationResponse struct {
	ID            int     `json:"id"`
	TenantID      *string `json:"tenant_id"`
	SchoolName    string  `json:"school_name"`
	Invoice       string  `json:"invoice"`
	Plan          string  `json:"plan"`
	Amount        int64   `json:"amount"`
	Method        string  `json:"method"`
	SenderName    string  `json:"senderName"`
	BankName      string  `json:"bankName"`
	Notes         string  `json:"notes"`
	ProofImage    string  `json:"proofImage"`
	Status        string  `json:"status"` // "Menunggu Pembayaran", "Berhasil Dibayar", "Dibatalkan"
	Timestamp     string  `json:"timestamp"`
	FormattedDate string  `json:"formattedDate"`
}

// POST /api/v1/payment-confirmations
func CreatePaymentConfirmation(c *gin.Context) {
	var req PaymentConfirmationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tagihan / pembayaran wajib diisi: " + err.Error()})
		return
	}

	if req.Invoice == "" {
		req.Invoice = fmt.Sprintf("INV-%s-%04d", time.Now().Format("20060102"), time.Now().Unix()%10000)
	}
	if req.Method == "" {
		req.Method = "Transfer Bank"
	}
	if req.BankName == "" {
		req.BankName = "BCA"
	}

	// Status standar B2B SaaS
	initialStatus := "Menunggu Pembayaran"
	if req.Status == "Berhasil Dibayar" {
		initialStatus = "Berhasil Dibayar"
	} else if req.Status == "Dibatalkan" {
		initialStatus = "Dibatalkan"
	}

	// Jika harga 0, cari dari source of truth subscription_plans
	if req.Amount <= 0 {
		var planPrice int64
		err := database.DB.QueryRow("SELECT price FROM subscription_plans WHERE name = $1 OR id = $1 LIMIT 1", req.Plan).Scan(&planPrice)
		if err == nil && planPrice > 0 {
			req.Amount = planPrice
		} else {
			req.Amount = 254205 // Default Standar
		}
	}

	var newID int
	var createdAt time.Time
	err := database.DB.QueryRow(`
		INSERT INTO payment_confirmations (tenant_id, invoice, plan, amount, method, sender_name, bank_name, notes, proof_image, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT (invoice) DO UPDATE SET
			tenant_id = COALESCE(EXCLUDED.tenant_id, payment_confirmations.tenant_id),
			plan = EXCLUDED.plan,
			amount = EXCLUDED.amount,
			method = EXCLUDED.method,
			sender_name = EXCLUDED.sender_name,
			bank_name = EXCLUDED.bank_name,
			notes = EXCLUDED.notes,
			proof_image = EXCLUDED.proof_image,
			status = EXCLUDED.status,
			created_at = CURRENT_TIMESTAMP
		RETURNING id, created_at
	`, req.TenantID, req.Invoice, req.Plan, req.Amount, req.Method, req.SenderName, req.BankName, req.Notes, req.ProofImage, initialStatus).Scan(&newID, &createdAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan invoice pembayaran: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Tagihan pembayaran berhasil dicatat dengan status 'Menunggu Pembayaran'.",
		"payment": PaymentConfirmationResponse{
			ID:            newID,
			TenantID:      req.TenantID,
			SchoolName:    req.SenderName,
			Invoice:       req.Invoice,
			Plan:          req.Plan,
			Amount:        req.Amount,
			Method:        req.Method,
			SenderName:    req.SenderName,
			BankName:      req.BankName,
			Notes:         req.Notes,
			ProofImage:    req.ProofImage,
			Status:        initialStatus,
			Timestamp:     createdAt.Format(time.RFC3339),
			FormattedDate: createdAt.Format("02 Jan 2006, 15:04"),
		},
	})
}

// POST /api/v1/billing/renew
// Dipanggil saat klien menekan tombol "Renew / Perpanjang" dari dashboard sekolah
func CreateRenewalInvoice(c *gin.Context) {
	var body struct {
		TenantID   string `json:"tenant_id" binding:"required"`
		PlanID     string `json:"plan_id"`
		Notes      string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tenant_id wajib disertakan: " + err.Error()})
		return
	}

	// 1. Cari data sekolah berdasarkan tenant_id
	var schoolName, contactNumber string
	err := database.DB.QueryRow("SELECT name, COALESCE(contact_number, '') FROM schools WHERE id::text = $1", body.TenantID).Scan(&schoolName, &contactNumber)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tenant sekolah tidak ditemukan di database"})
		return
	}

	// 2. Ambil harga dari SOURCE OF TRUTH (subscription_plans) agar harga masa depan selalu sinkron
	planID := body.PlanID
	if planID == "" {
		planID = "pkg-populer"
	}

	var planName string
	var planPrice int64
	err = database.DB.QueryRow("SELECT name, price FROM subscription_plans WHERE id = $1 LIMIT 1", planID).Scan(&planName, &planPrice)
	if err != nil {
		// Fallback harga default
		planName = "Lisensi Lengkap 1 Tahun"
		planPrice = 480000
	}

	invoiceNum := fmt.Sprintf("INV-%s-%04d", time.Now().Format("20060102"), time.Now().Unix()%10000)

	var newID int
	var createdAt time.Time
	err = database.DB.QueryRow(`
		INSERT INTO payment_confirmations (tenant_id, invoice, plan, amount, method, sender_name, bank_name, notes, status)
		VALUES ($1, $2, $3, $4, 'Virtual Account Otomatis', $5, 'BCA Virtual Account', $6, 'Menunggu Pembayaran')
		RETURNING id, created_at
	`, body.TenantID, invoiceNum, planName, planPrice, schoolName, body.Notes).Scan(&newID, &createdAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat invoice perpanjangan: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Faktur perpanjangan berhasil diterbitkan dan masuk ke antrean tagihan Super Admin.",
		"invoice": PaymentConfirmationResponse{
			ID:            newID,
			TenantID:      &body.TenantID,
			SchoolName:    schoolName,
			Invoice:       invoiceNum,
			Plan:          planName,
			Amount:        planPrice,
			Method:        "Virtual Account Otomatis",
			SenderName:    schoolName,
			BankName:      "BCA Virtual Account",
			Notes:         body.Notes,
			Status:        "Menunggu Pembayaran",
			Timestamp:     createdAt.Format(time.RFC3339),
			FormattedDate: createdAt.Format("02 Jan 2006, 15:04"),
		},
	})
}

// GET /api/v1/payment-confirmations
func GetPaymentConfirmations(c *gin.Context) {
	statusFilter := strings.TrimSpace(c.Query("status"))
	tenantFilter := strings.TrimSpace(c.Query("tenant_id"))

	query := `
		SELECT p.id, p.tenant_id::text, COALESCE(s.name, p.sender_name) as school_name,
		       p.invoice, p.plan, p.amount, p.method, p.sender_name, p.bank_name, 
		       COALESCE(p.notes, ''), COALESCE(p.proof_image, ''), p.status, p.created_at
		FROM payment_confirmations p
		LEFT JOIN schools s ON p.tenant_id = s.id
		WHERE 1=1
	`
	var args []interface{}
	argIdx := 1

	if statusFilter != "" && statusFilter != "Semua" {
		query += fmt.Sprintf(" AND (p.status = $%d", argIdx)
		if statusFilter == "Menunggu Pembayaran" {
			query += " OR p.status = 'MENUNGGU_VERIFIKASI'"
		} else if statusFilter == "Berhasil Dibayar" {
			query += " OR p.status = 'TERVERIFIKASI'"
		} else if statusFilter == "Dibatalkan" {
			query += " OR p.status = 'DITOLAK'"
		}
		query += ")"
		args = append(args, statusFilter)
		argIdx++
	}

	if tenantFilter != "" {
		query += fmt.Sprintf(" AND p.tenant_id::text = $%d", argIdx)
		args = append(args, tenantFilter)
		argIdx++
	}

	query += " ORDER BY p.created_at DESC"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar tagihan pembayaran: " + err.Error()})
		return
	}
	defer rows.Close()

	var list []PaymentConfirmationResponse
	for rows.Next() {
		var p PaymentConfirmationResponse
		var tid sql.NullString
		var rawStatus string
		var t time.Time

		if err := rows.Scan(&p.ID, &tid, &p.SchoolName, &p.Invoice, &p.Plan, &p.Amount, &p.Method, &p.SenderName, &p.BankName, &p.Notes, &p.ProofImage, &rawStatus, &t); err != nil {
			continue
		}

		if tid.Valid && tid.String != "" {
			str := tid.String
			p.TenantID = &str
		}

		// Standarisasi ENUM status
		if rawStatus == "TERVERIFIKASI" || rawStatus == "Berhasil Dibayar" {
			p.Status = "Berhasil Dibayar"
		} else if rawStatus == "DITOLAK" || rawStatus == "Dibatalkan" {
			p.Status = "Dibatalkan"
		} else {
			p.Status = "Menunggu Pembayaran"
		}

		p.Timestamp = t.Format(time.RFC3339)
		p.FormattedDate = t.Format("02 Jan 2006, 15:04")
		list = append(list, p)
	}

	if list == nil {
		list = []PaymentConfirmationResponse{}
	}

	c.JSON(http.StatusOK, list)
}

// PUT /api/v1/payment-confirmations/:id/approve
func ApprovePaymentConfirmation(c *gin.Context) {
	idParam := c.Param("id")

	var invoice, plan, senderName string
	var tid sql.NullString
	var amount int64

	err := database.DB.QueryRow(`
		UPDATE payment_confirmations
		SET status = 'Berhasil Dibayar'
		WHERE id::text = $1 OR invoice = $1
		RETURNING tenant_id::text, invoice, plan, sender_name, amount
	`, idParam).Scan(&tid, &invoice, &plan, &senderName, &amount)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyetujui pembayaran: " + err.Error()})
		return
	}

	// Tentukan durasi perpanjangan berdasarkan paket
	monthsToAdd := 6
	if strings.Contains(strings.ToLower(plan), "tahun") || strings.Contains(strings.ToLower(plan), "12") || amount >= 450000 {
		monthsToAdd = 12
	}

	// Perpanjang masa aktif tenant dan aktifkan statusnya
	if tid.Valid && tid.String != "" {
		intervalStr := fmt.Sprintf("%d months", monthsToAdd)
		_, _ = database.DB.Exec(`
			UPDATE schools
			SET valid_until = GREATEST(valid_until, CURRENT_TIMESTAMP) + $1::interval,
			    status = 'ACTIVE'
			WHERE id::text = $2
		`, intervalStr, tid.String)
	} else if senderName != "" {
		intervalStr := fmt.Sprintf("%d months", monthsToAdd)
		_, _ = database.DB.Exec(`
			UPDATE schools
			SET valid_until = GREATEST(valid_until, CURRENT_TIMESTAMP) + $1::interval,
			    status = 'ACTIVE'
			WHERE LOWER(name) = LOWER($2) OR LOWER(name) LIKE '%' || LOWER($2) || '%'
		`, intervalStr, senderName)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Invoice [%s] berhasil disetujui ('Berhasil Dibayar'). Lisensi diperpanjang +%d bulan!", invoice, monthsToAdd),
		"status":  "Berhasil Dibayar",
	})
}

// PUT /api/v1/payment-confirmations/:id/reject
func RejectPaymentConfirmation(c *gin.Context) {
	idParam := c.Param("id")

	_, err := database.DB.Exec(`
		UPDATE payment_confirmations
		SET status = 'Dibatalkan'
		WHERE id::text = $1 OR invoice = $1
	`, idParam)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membatalkan invoice pembayaran: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Status invoice berhasil diubah menjadi 'Dibatalkan'.",
		"status":  "Dibatalkan",
	})
}

// DELETE /api/v1/payment-confirmations/:id
func DeletePaymentConfirmation(c *gin.Context) {
	idParam := c.Param("id")

	_, err := database.DB.Exec(`
		DELETE FROM payment_confirmations
		WHERE id::text = $1 OR invoice = $1
	`, idParam)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus riwayat pembayaran: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Catatan invoice pembayaran berhasil dihapus."})
}
