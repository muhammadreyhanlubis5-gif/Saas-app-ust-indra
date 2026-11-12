package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"jadwal-api/core/engine"
)

type SolveScheduleRequest struct {
	Slots        []engine.SlotInput              `json:"slots" binding:"required"`
	Teachers     []engine.TeacherLimitInput      `json:"teachers" binding:"required"`
	BlockedSlots []engine.BlockedSlotInput       `json:"blocked_slots"`
	Requests     []engine.AssignmentRequestInput `json:"requests" binding:"required"`
	UseNativeCGO bool                            `json:"use_native_cgo"`
}

type SolveScheduleResponse struct {
	Items           []engine.ScheduledOutputItem `json:"items"`
	TotalAssigned   int                          `json:"total_assigned"`
	UnassignedHours int32                        `json:"unassigned_hours"`
	ComputeTimeUs   int64                        `json:"compute_time_us"`
	StatusCode      int32                        `json:"status_code"`
	EngineUsed      string                       `json:"engine_used"`
}

/**
 * HandleSolveSchedule
 * High-performance scheduling endpoint.
 * Dispatches heavy mathematical constraint satisfaction computation to C++ or Go engine.
 */
func HandleSolveSchedule(c *gin.Context) {
	var req SolveScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": "Format payload data penjadwalan tidak valid: " + err.Error(),
		})
		return
	}

	var result engine.ScheduleSolveResult
	engineUsed := "Go-ZeroAlloc-Engine"

	// Select native C++ or Go CSP engine
	if req.UseNativeCGO {
		result = engine.SolveScheduleNativeCGO(req.Slots, req.Teachers, req.BlockedSlots, req.Requests)
		engineUsed = "C++-Native-CGO-Engine"
	} else {
		result = engine.SolveScheduleEngine(req.Slots, req.Teachers, req.BlockedSlots, req.Requests)
	}

	if result.StatusCode == -1 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Solver Error",
			"message": "Gagal menyelesaikan matriks jadwal sekolah.",
		})
		return
	}

	c.JSON(http.StatusOK, SolveScheduleResponse{
		Items:           result.Items,
		TotalAssigned:   len(result.Items),
		UnassignedHours: result.UnassignedHours,
		ComputeTimeUs:   result.ComputeTimeUs,
		StatusCode:      result.StatusCode,
		EngineUsed:      engineUsed,
	})
}
