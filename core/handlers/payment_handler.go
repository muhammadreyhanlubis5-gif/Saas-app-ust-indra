package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"jadwal-api/core/database"
)

type PaymentConfirmationRequest struct {
	Invoice    string `json:"invoice" binding:"required"`
	Plan       string `json:"plan" binding:"required"`
	Amount     int64  `json:"amount" binding:"required"`
	Method     string `json:"method" binding:"required"`
	SenderName string `json:"senderName" binding:"required"`
	BankName   string `json:"bankName" binding:"required"`
	Notes      string `json:"notes"`
	ProofImage string `json:"proofImage"`
}

type PaymentConfirmationResponse struct {
	ID            int    `json:"id"`
	Invoice       string `json:"invoice"`
	Plan          string `json:"plan"`
	Amount        int64  `json:"amount"`
	Method        string `json:"method"`
	SenderName    string `json:"senderName"`
	BankName      string `json:"bankName"`
	Notes         string `json:"notes"`
	ProofImage    string `json:"proofImage"`
	Status        string `json:"status"`
	Timestamp     string `json:"timestamp"`
	FormattedDate string `json:"formattedDate"`
}

// POST /api/v1/payment-confirmations
func CreatePaymentConfirmation(c *gin.Context) {
	var req PaymentConfirmationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua data konfirmasi pembayaran wajib diisi: " + err.Error()})
		return
	}

	var newID int
	var createdAt time.Time
	// Upsert berdasarkan nomor invoice agar pengiriman ulang memperbarui data
	err := database.DB.QueryRow(`
		INSERT INTO payment_confirmations (invoice, plan, amount, method, sender_name, bank_name, notes, proof_image, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'MENUNGGU_VERIFIKASI')
		ON CONFLICT (invoice) DO UPDATE SET
			plan = EXCLUDED.plan,
			amount = EXCLUDED.amount,
			method = EXCLUDED.method,
			sender_name = EXCLUDED.sender_name,
			bank_name = EXCLUDED.bank_name,
			notes = EXCLUDED.notes,
			proof_image = EXCLUDED.proof_image,
			status = 'MENUNGGU_VERIFIKASI',
			created_at = CURRENT_TIMESTAMP
		RETURNING id, created_at
	`, req.Invoice, req.Plan, req.Amount, req.Method, req.SenderName, req.BankName, req.Notes, req.ProofImage).Scan(&newID, &createdAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan konfirmasi pembayaran ke database: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Konfirmasi pembayaran berhasil disimpan dan sedang menunggu verifikasi Super Admin.",
		"payment": PaymentConfirmationResponse{
			ID:            newID,
			Invoice:       req.Invoice,
			Plan:          req.Plan,
			Amount:        req.Amount,
			Method:        req.Method,
			SenderName:    req.SenderName,
			BankName:      req.BankName,
			Notes:         req.Notes,
			ProofImage:    req.ProofImage,
			Status:        "MENUNGGU_VERIFIKASI",
			Timestamp:     createdAt.Format(time.RFC3339),
			FormattedDate: createdAt.Format("02 Jan 2006, 15:04"),
		},
	})
}

// GET /api/v1/payment-confirmations
func GetPaymentConfirmations(c *gin.Context) {
	rows, err := database.DB.Query(`
		SELECT id, invoice, plan, amount, method, sender_name, bank_name, COALESCE(notes, ''), COALESCE(proof_image, ''), status, created_at
		FROM payment_confirmations
		ORDER BY created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar pembayaran: " + err.Error()})
		return
	}
	defer rows.Close()

	var list []PaymentConfirmationResponse
	for rows.Next() {
		var p PaymentConfirmationResponse
		var t time.Time
		if err := rows.Scan(&p.ID, &p.Invoice, &p.Plan, &p.Amount, &p.Method, &p.SenderName, &p.BankName, &p.Notes, &p.ProofImage, &p.Status, &t); err != nil {
			continue
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

	var invoice, senderName string
	err := database.DB.QueryRow(`
		UPDATE payment_confirmations
		SET status = 'TERVERIFIKASI'
		WHERE id::text = $1 OR invoice = $1
		RETURNING invoice, sender_name
	`, idParam).Scan(&invoice, &senderName)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyetujui pembayaran: " + err.Error()})
		return
	}

	// Otomatis perpanjang masa aktif sekolah jika nama sekolah cocok
	if senderName != "" {
		_, _ = database.DB.Exec(`
			UPDATE schools
			SET valid_until = GREATEST(valid_until, CURRENT_DATE) + INTERVAL '30 days'
			WHERE LOWER(name) LIKE LOWER($1) OR LOWER($2) LIKE '%' || LOWER(name) || '%'
		`, "%"+senderName+"%", senderName)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Pembayaran invoice [%s] berhasil diverifikasi!", invoice),
	})
}

// PUT /api/v1/payment-confirmations/:id/reject
func RejectPaymentConfirmation(c *gin.Context) {
	idParam := c.Param("id")

	_, err := database.DB.Exec(`
		UPDATE payment_confirmations
		SET status = 'DITOLAK'
		WHERE id::text = $1 OR invoice = $1
	`, idParam)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menolak pembayaran: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status pembayaran berhasil diubah menjadi DITOLAK."})
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

	c.JSON(http.StatusOK, gin.H{"message": "Catatan pembayaran berhasil dihapus."})
}
