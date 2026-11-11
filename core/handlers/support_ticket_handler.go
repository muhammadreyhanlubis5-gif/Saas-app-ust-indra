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

type SupportTicketRequest struct {
	TenantID *string `json:"tenant_id"`
	Name     string  `json:"name" binding:"required"`
	Contact  string  `json:"contact" binding:"required"`
	School   string  `json:"school"`
	Category string  `json:"category" binding:"required"`
	Message  string  `json:"message" binding:"required"`
}

type SupportTicketResponse struct {
	ID       string  `json:"id"`
	TenantID *string `json:"tenant_id"`
	Name     string  `json:"name"`
	Contact  string  `json:"contact"`
	School   string  `json:"school"`
	Category string  `json:"category"`
	Message  string  `json:"message"`
	Status   string  `json:"status"` // "Open", "In Progress", "Resolved"
	Date     string  `json:"date"`
}

// POST /api/v1/support-tickets
func CreateSupportTicket(c *gin.Context) {
	var req SupportTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua kolom wajib diisi dengan benar: " + err.Error()})
		return
	}

	if req.School == "" {
		req.School = "Pengguna Mandiri"
	}

	// Jika tenant_id disertakan, coba cocokkan nama sekolah jika masih default
	if req.TenantID != nil && *req.TenantID != "" {
		var schoolName string
		err := database.DB.QueryRow("SELECT name FROM schools WHERE id::text = $1", *req.TenantID).Scan(&schoolName)
		if err == nil && schoolName != "" {
			req.School = schoolName
		}
	}

	var newID int
	var createdAt time.Time
	err := database.DB.QueryRow(`
		INSERT INTO support_tickets (tenant_id, name, contact, school, category, message, status)
		VALUES ($1, $2, $3, $4, $5, $6, 'Open')
		RETURNING id, created_at
	`, req.TenantID, req.Name, req.Contact, req.School, req.Category, req.Message).Scan(&newID, &createdAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan tiket aduan ke database: " + err.Error()})
		return
	}

	dateStr := createdAt.Format("02 Jan 2006, 15:04")
	ticketResp := SupportTicketResponse{
		ID:       fmt.Sprintf("TICK-%04d", newID),
		TenantID: req.TenantID,
		Name:     req.Name,
		Contact:  req.Contact,
		School:   req.School,
		Category: req.Category,
		Message:  req.Message,
		Status:   "Open",
		Date:     dateStr,
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Tiket bantuan berhasil diajukan dengan status Open!",
		"ticket":  ticketResp,
	})
}

// GET /api/v1/support-tickets
// Mendukung filter status: "Open", "In Progress", "Resolved"
func GetSupportTickets(c *gin.Context) {
	statusFilter := strings.TrimSpace(c.Query("status"))
	tenantFilter := strings.TrimSpace(c.Query("tenant_id"))

	query := `
		SELECT st.id, st.tenant_id::text, st.name, st.contact, 
		       COALESCE(s.name, st.school) as school, 
		       st.category, st.message, st.status, st.created_at
		FROM support_tickets st
		LEFT JOIN schools s ON st.tenant_id = s.id
		WHERE 1=1
	`
	var args []interface{}
	argIdx := 1

	if statusFilter != "" && statusFilter != "Semua" {
		query += fmt.Sprintf(" AND (LOWER(st.status) = LOWER($%d)", argIdx)
		// Pemetaan status jika legacy
		if strings.EqualFold(statusFilter, "Open") {
			query += fmt.Sprintf(" OR st.status = 'MENUNGGU'")
		} else if strings.EqualFold(statusFilter, "In Progress") {
			query += fmt.Sprintf(" OR st.status = 'DIPROSES'")
		} else if strings.EqualFold(statusFilter, "Resolved") {
			query += fmt.Sprintf(" OR st.status = 'SELESAI'")
		}
		query += ")"
		args = append(args, statusFilter)
		argIdx++
	}

	if tenantFilter != "" {
		query += fmt.Sprintf(" AND st.tenant_id::text = $%d", argIdx)
		args = append(args, tenantFilter)
		argIdx++
	}

	query += " ORDER BY st.created_at DESC"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar tiket: " + err.Error()})
		return
	}
	defer rows.Close()

	var list []SupportTicketResponse
	for rows.Next() {
		var id int
		var tenantID sql.NullString
		var name, contact, school, category, message, rawStatus string
		var t time.Time

		if err := rows.Scan(&id, &tenantID, &name, &contact, &school, &category, &message, &rawStatus, &t); err != nil {
			continue
		}

		// Normalisasi status ke standar B2B SaaS: "Open", "In Progress", "Resolved"
		status := "Open"
		if strings.EqualFold(rawStatus, "In Progress") || strings.EqualFold(rawStatus, "DIPROSES") {
			status = "In Progress"
		} else if strings.EqualFold(rawStatus, "Resolved") || strings.EqualFold(rawStatus, "SELESAI") {
			status = "Resolved"
		}

		var tidPtr *string
		if tenantID.Valid && tenantID.String != "" {
			str := tenantID.String
			tidPtr = &str
		}

		list = append(list, SupportTicketResponse{
			ID:       fmt.Sprintf("TICK-%04d", id),
			TenantID: tidPtr,
			Name:     name,
			Contact:  contact,
			School:   school,
			Category: category,
			Message:  message,
			Status:   status,
			Date:     t.Format("02 Jan 2006, 15:04"),
		})
	}

	if list == nil {
		list = []SupportTicketResponse{}
	}

	c.JSON(http.StatusOK, list)
}

// PUT /api/v1/support-tickets/:id/status
func UpdateSupportTicketStatus(c *gin.Context) {
	ticketIDStr := c.Param("id")
	var id int
	if _, err := fmt.Sscanf(ticketIDStr, "TICK-%d", &id); err != nil {
		if _, err2 := fmt.Sscanf(ticketIDStr, "%d", &id); err2 != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID tiket tidak valid"})
			return
		}
	}

	var body struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status tiket wajib ditentukan (Open, In Progress, Resolved)"})
		return
	}

	// Normalisasi ke standar B2B SaaS
	newStatus := "Open"
	if strings.EqualFold(body.Status, "In Progress") || strings.EqualFold(body.Status, "DIPROSES") {
		newStatus = "In Progress"
	} else if strings.EqualFold(body.Status, "Resolved") || strings.EqualFold(body.Status, "SELESAI") {
		newStatus = "Resolved"
	}

	_, err := database.DB.Exec(`
		UPDATE support_tickets 
		SET status = $1 
		WHERE id = $2
	`, newStatus, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui status tiket: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Status tiket berhasil diperbarui menjadi '%s'", newStatus),
		"status":  newStatus,
	})
}

// DELETE /api/v1/support-tickets/:id
func DeleteSupportTicket(c *gin.Context) {
	ticketIDStr := c.Param("id")
	var id int
	if _, err := fmt.Sscanf(ticketIDStr, "TICK-%d", &id); err != nil {
		if _, err2 := fmt.Sscanf(ticketIDStr, "%d", &id); err2 != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID tiket tidak valid"})
			return
		}
	}

	_, err := database.DB.Exec("DELETE FROM support_tickets WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus tiket: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tiket aduan berhasil dihapus"})
}
