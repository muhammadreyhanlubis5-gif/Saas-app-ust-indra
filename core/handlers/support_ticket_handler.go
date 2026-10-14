package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"jadwal-api/core/database"
)

type SupportTicketRequest struct {
	Name     string `json:"name" binding:"required"`
	Contact  string `json:"contact" binding:"required"`
	School   string `json:"school"`
	Category string `json:"category" binding:"required"`
	Message  string `json:"message" binding:"required"`
}

type SupportTicketResponse struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Contact  string `json:"contact"`
	School   string `json:"school"`
	Category string `json:"category"`
	Message  string `json:"message"`
	Status   string `json:"status"`
	Date     string `json:"date"`
}

// POST /api/v1/support-tickets
func CreateSupportTicket(c *gin.Context) {
	var req SupportTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua kolom wajib diisi dengan benar"})
		return
	}

	if req.School == "" {
		req.School = "Pengguna Mandiri"
	}

	var newID int
	var createdAt time.Time
	err := database.DB.QueryRow(`
		INSERT INTO support_tickets (name, contact, school, category, message, status)
		VALUES ($1, $2, $3, $4, $5, 'MENUNGGU')
		RETURNING id, created_at
	`, req.Name, req.Contact, req.School, req.Category, req.Message).Scan(&newID, &createdAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan tiket aduan ke database: " + err.Error()})
		return
	}

	dateStr := createdAt.Format("02 Jan 2006, 15:04")
	ticketResp := SupportTicketResponse{
		ID:       fmt.Sprintf("TICK-%04d", newID),
		Name:     req.Name,
		Contact:  req.Contact,
		School:   req.School,
		Category: req.Category,
		Message:  req.Message,
		Status:   "MENUNGGU",
		Date:     dateStr,
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Aduan / saran Anda berhasil terkirim ke Administrator!",
		"ticket":  ticketResp,
	})
}

// GET /api/v1/support-tickets
func GetSupportTickets(c *gin.Context) {
	rows, err := database.DB.Query(`
		SELECT id, name, contact, school, category, message, status, created_at
		FROM support_tickets
		ORDER BY created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar aduan: " + err.Error()})
		return
	}
	defer rows.Close()

	var list []SupportTicketResponse
	for rows.Next() {
		var id int
		var name, contact, school, category, message, status string
		var t time.Time

		if err := rows.Scan(&id, &name, &contact, &school, &category, &message, &status, &t); err != nil {
			continue
		}

		list = append(list, SupportTicketResponse{
			ID:       fmt.Sprintf("TICK-%04d", id),
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
	// Handle TICK-0001 or raw numeric id
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status wajib ditentukan"})
		return
	}

	_, err := database.DB.Exec(`
		UPDATE support_tickets 
		SET status = $1 
		WHERE id = $2
	`, body.Status, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui status tiket: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status tiket berhasil diperbarui"})
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
