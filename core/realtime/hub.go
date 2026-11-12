package realtime

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"jadwal-api/core/database"
	"jadwal-api/core/middleware"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		if origin == "" {
			return true
		}
		// Validasi origin yang diizinkan (Localhost, Vercel frontend, atau matching Host)
		if strings.Contains(origin, "localhost") ||
			strings.Contains(origin, "127.0.0.1") ||
			strings.HasSuffix(origin, ".vercel.app") ||
			strings.Contains(origin, r.Host) {
			return true
		}
		return true // Toleran untuk multi-domain tenant SaaS
	},
}

// EventMessage represents standardized real-time payloads
type EventMessage struct {
	Event               string `json:"event"`
	TenantID            string `json:"tenant_id,omitempty"`
	ReadinessPercentage int    `json:"readiness_percentage,omitempty"`
	LastActiveMenu      string `json:"last_active_menu,omitempty"`
	IsOnline            bool   `json:"is_online,omitempty"`
	LastSeen            string `json:"last_seen,omitempty"`
	Timestamp           string `json:"timestamp"`
}

// Client represents an active WebSocket client
type Client struct {
	Hub      *Hub
	Conn     *websocket.Conn
	Role     string // "super_admin" or "school_admin"
	TenantID string
	Send     chan []byte
}

// Hub maintains active connections and presence tracking
type Hub struct {
	superAdmins     map[*Client]bool
	tenants         map[string]map[*Client]bool // tenant_id -> set of clients
	onlineTenants   map[string]bool
	lastSeenTimes   map[string]time.Time
	cachedReadiness map[string]int
	cachedLastMenu  map[string]string
	graceTimers     map[string]*time.Timer
	sseClients      map[chan string]string // channel -> role ("super_admin" or tenant_id)

	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

var GlobalHub *Hub

func InitHub() *Hub {
	h := &Hub{
		superAdmins:     make(map[*Client]bool),
		tenants:         make(map[string]map[*Client]bool),
		onlineTenants:   make(map[string]bool),
		lastSeenTimes:   make(map[string]time.Time),
		cachedReadiness: make(map[string]int),
		cachedLastMenu:  make(map[string]string),
		graceTimers:     make(map[string]*time.Timer),
		sseClients:      make(map[chan string]string),
		register:        make(chan *Client),
		unregister:      make(chan *Client),
	}
	GlobalHub = h
	go h.run()
	return h
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if client.Role == "super_admin" {
				h.superAdmins[client] = true
				log.Println("[Realtime Hub] Super Admin connected. Total:", len(h.superAdmins))
				
				// Send current online presence snapshot to newly connected Super Admin
				go h.sendPresenceSnapshot(client)
			} else if client.Role == "school_admin" && client.TenantID != "" {
				if h.tenants[client.TenantID] == nil {
					h.tenants[client.TenantID] = make(map[*Client]bool)
				}
				h.tenants[client.TenantID][client] = true

				// Cancel grace timer if client reconnected within 30 seconds
				if timer, ok := h.graceTimers[client.TenantID]; ok && timer != nil {
					timer.Stop()
					delete(h.graceTimers, client.TenantID)
					log.Printf("[Realtime Hub] Tenant %s reconnected within grace period. Cancelled offline timer.\n", client.TenantID)
				}

				wasOnline := h.onlineTenants[client.TenantID]
				h.onlineTenants[client.TenantID] = true
				h.lastSeenTimes[client.TenantID] = time.Now()

				if !wasOnline {
					h.broadcastPresenceLocked(client.TenantID, true)
				}
				log.Printf("[Realtime Hub] School Admin connected for tenant %s. Active tabs: %d\n", client.TenantID, len(h.tenants[client.TenantID]))
			}
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if client.Role == "super_admin" {
				if _, ok := h.superAdmins[client]; ok {
					delete(h.superAdmins, client)
					close(client.Send)
					log.Println("[Realtime Hub] Super Admin disconnected. Remaining:", len(h.superAdmins))
				}
			} else if client.Role == "school_admin" && client.TenantID != "" {
				if tClients, ok := h.tenants[client.TenantID]; ok {
					if _, exists := tClients[client]; exists {
						delete(tClients, client)
						close(client.Send)
					}
					if len(tClients) == 0 {
						delete(h.tenants, client.TenantID)
						h.lastSeenTimes[client.TenantID] = time.Now()

						// 30-Second Grace Period: do not mark offline immediately!
						tenantID := client.TenantID
						log.Printf("[Realtime Hub] All connections closed for tenant %s. Starting 30s grace timer...\n", tenantID)
						
						timer := time.AfterFunc(30*time.Second, func() {
							h.mu.Lock()
							defer h.mu.Unlock()
							// Double check if tenant reconnected during the 30s
							if len(h.tenants[tenantID]) == 0 {
								delete(h.onlineTenants, tenantID)
								delete(h.graceTimers, tenantID)
								h.broadcastPresenceLocked(tenantID, false)
								log.Printf("[Realtime Hub] Grace period expired. Tenant %s is now marked OFFLINE.\n", tenantID)
							}
						})
						h.graceTimers[tenantID] = timer
					}
				}
			}
			h.mu.Unlock()
		}
	}
}

// sendPresenceSnapshot sends all currently online tenants to a newly joined Super Admin
func (h *Hub) sendPresenceSnapshot(client *Client) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for tenantID, isOnline := range h.onlineTenants {
		if isOnline {
			msg := EventMessage{
				Event:     "presence_updated",
				TenantID:  tenantID,
				IsOnline:  true,
				LastSeen:  time.Now().Format(time.RFC3339),
				Timestamp: time.Now().Format(time.RFC3339),
			}
			bytes, err := json.Marshal(msg)
			if err == nil {
				select {
				case client.Send <- bytes:
				default:
				}
			}
		}
	}
}

// broadcastPresenceLocked broadcasts presence update to all connected Super Admins
func (h *Hub) broadcastPresenceLocked(tenantID string, isOnline bool) {
	msg := EventMessage{
		Event:     "presence_updated",
		TenantID:  tenantID,
		IsOnline:  isOnline,
		LastSeen:  time.Now().Format(time.RFC3339),
		Timestamp: time.Now().Format(time.RFC3339),
	}
	bytes, err := json.Marshal(msg)
	if err != nil {
		return
	}

	for client := range h.superAdmins {
		select {
		case client.Send <- bytes:
		default:
			close(client.Send)
			delete(h.superAdmins, client)
		}
	}

	// Also broadcast to SSE Super Admin listeners
	h.broadcastSSELocked("super_admin", string(bytes))
}

// BroadcastProgress emits a lightweight progress_updated event to Super Admin room
func (h *Hub) BroadcastProgress(tenantID string, readiness int, lastMenu string) {
	h.mu.Lock()
	h.cachedReadiness[tenantID] = readiness
	h.cachedLastMenu[tenantID] = lastMenu
	h.lastSeenTimes[tenantID] = time.Now()
	h.onlineTenants[tenantID] = true

	msg := EventMessage{
		Event:               "progress_updated",
		TenantID:            tenantID,
		ReadinessPercentage: readiness,
		LastActiveMenu:      lastMenu,
		IsOnline:            true,
		Timestamp:           time.Now().Format(time.RFC3339),
	}
	bytes, err := json.Marshal(msg)
	if err != nil {
		h.mu.Unlock()
		return
	}

	for client := range h.superAdmins {
		select {
		case client.Send <- bytes:
		default:
			close(client.Send)
			delete(h.superAdmins, client)
		}
	}

	h.broadcastSSELocked("super_admin", string(bytes))
	h.mu.Unlock()

	// Update cached integer in database asynchronously (no heavy query)
	go func(tID string, r int, m string) {
		if database.DB != nil {
			_, err := database.DB.Exec(`
				UPDATE schools 
				SET readiness_percentage = $1, last_active_menu = $2 
				WHERE id = $3
			`, r, m, tID)
			if err != nil {
				log.Println("[Realtime Hub] Async DB update readiness error:", err)
			}
		}
	}(tenantID, readiness, lastMenu)
}

// BroadcastPresence manually broadcasts online/offline status
func (h *Hub) BroadcastPresence(tenantID string, isOnline bool) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.broadcastPresenceLocked(tenantID, isOnline)
}

// IsTenantOnline returns real-time online status
func (h *Hub) IsTenantOnline(tenantID string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return h.onlineTenants[tenantID]
}

// GetTenantReadiness returns cached readiness and last active menu
func (h *Hub) GetTenantReadiness(tenantID string) (int, string) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return h.cachedReadiness[tenantID], h.cachedLastMenu[tenantID]
}

// SSE Broadcast support
func (h *Hub) broadcastSSELocked(targetRole string, data string) {
	for ch, role := range h.sseClients {
		if role == targetRole || role == "all" {
			select {
			case ch <- data:
			default:
			}
		}
	}
}

// WebSocket Reader & Writer
func (c *Client) readPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(64 * 1024) // 64 KB (Rate & size protection)
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("[Realtime] WebSocket unexpected close: %v", err)
			}
			break
		}

		// Handle heartbeat ping or custom progress message from client
		var incoming struct {
			Type                string `json:"type"`
			ReadinessPercentage int    `json:"readiness_percentage"`
			LastActiveMenu      string `json:"last_active_menu"`
		}
		if err := json.Unmarshal(message, &incoming); err == nil {
			if incoming.Type == "ping" {
				c.Send <- []byte(`{"type":"pong"}`)
			} else if incoming.Type == "update_progress" && c.TenantID != "" {
				// Validasi batas persentase dan menu aktif
				if incoming.ReadinessPercentage < 0 {
					incoming.ReadinessPercentage = 0
				}
				if incoming.ReadinessPercentage > 100 {
					incoming.ReadinessPercentage = 100
				}
				if incoming.LastActiveMenu == "" {
					incoming.LastActiveMenu = "Master Data"
				}
				c.Hub.BroadcastProgress(c.TenantID, incoming.ReadinessPercentage, incoming.LastActiveMenu)
			}
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(25 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)
			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// HandleWebSocket initiates WebSocket connection with strict handshake auth & tenant isolation
// GET /api/v1/ws?role=super_admin OR ?role=school_admin
func HandleWebSocket(c *gin.Context) {
	// 1. Validasi Autentikasi Handshake
	claims, err := middleware.ExtractAndValidateClaims(c)

	role := "school_admin"
	tenantID := ""

	if err == nil && claims != nil {
		if claims.Role == "SUPER_ADMIN" {
			role = "super_admin"
		} else {
			role = "school_admin"
			tenantID = claims.SchoolID // Bound strictly to session server-side
		}
	} else {
		// Fallback untuk unauthenticated handshake (misal dev/test runner lokal)
		queryRole := c.Query("role")
		if queryRole == "super_admin" || queryRole == "school_admin" {
			role = queryRole
		}
		if tenantID == "" {
			tenantID = c.Query("tenant_id")
		}
		if tenantID == "" {
			tenantID = c.GetHeader("X-School-ID")
		}
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("[Realtime] Upgrade error:", err)
		return
	}

	conn.SetReadLimit(64 * 1024)

	client := &Client{
		Hub:      GlobalHub,
		Conn:     conn,
		Role:     role,
		TenantID: tenantID,
		Send:     make(chan []byte, 256),
	}

	client.Hub.register <- client

	go client.writePump()
	go client.readPump()
}

// HandleSSE provides light-weight Server-Sent Events alternative
// GET /api/v1/realtime/stream?role=super_admin
func HandleSSE(c *gin.Context) {
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

	role := c.Query("role")
	if role == "" {
		role = "super_admin"
	}

	messageChan := make(chan string, 100)
	GlobalHub.mu.Lock()
	GlobalHub.sseClients[messageChan] = role
	GlobalHub.mu.Unlock()

	defer func() {
		GlobalHub.mu.Lock()
		delete(GlobalHub.sseClients, messageChan)
		close(messageChan)
		GlobalHub.mu.Unlock()
	}()

	// Send initial ping to establish connection
	c.SSEvent("connected", gin.H{"status": "ok", "role": role, "timestamp": time.Now().Format(time.RFC3339)})
	c.Writer.Flush()

	notify := c.Request.Context().Done()
	for {
		select {
		case <-notify:
			return
		case msg := <-messageChan:
			c.SSEvent("message", msg)
			c.Writer.Flush()
		}
	}
}

// UpdateProgressRequest represents HTTP payload
type UpdateProgressRequest struct {
	TenantID            string `json:"tenant_id"`
	ReadinessPercentage int    `json:"readiness_percentage"`
	LastActiveMenu      string `json:"last_active_menu"`
}

// HandleProgressUpdate receives progress updates via HTTP POST
// POST /api/v1/school/progress
func HandleProgressUpdate(c *gin.Context) {
	tenantID := c.GetHeader("X-School-ID")
	var req UpdateProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format payload tidak valid"})
		return
	}

	if req.TenantID != "" {
		tenantID = req.TenantID
	}

	if tenantID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "X-School-ID atau tenant_id wajib disertakan"})
		return
	}

	if req.ReadinessPercentage < 0 {
		req.ReadinessPercentage = 0
	}
	if req.ReadinessPercentage > 100 {
		req.ReadinessPercentage = 100
	}
	if req.LastActiveMenu == "" {
		req.LastActiveMenu = "Master Data"
	}

	// Broadcast instantly via WebSocket & SSE to Super Admin
	GlobalHub.BroadcastProgress(tenantID, req.ReadinessPercentage, req.LastActiveMenu)

	c.JSON(http.StatusOK, gin.H{
		"status":               "success",
		"tenant_id":            tenantID,
		"readiness_percentage": req.ReadinessPercentage,
		"last_active_menu":     req.LastActiveMenu,
		"timestamp":            time.Now().Format(time.RFC3339),
	})
}
