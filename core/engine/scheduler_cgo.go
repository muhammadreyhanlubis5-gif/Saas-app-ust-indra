package engine

/*
#cgo CXXFLAGS: -O3 -std=c++17
#cgo LDFLAGS: -lstdc++
#include "scheduler.h"
*/
import "C"
import (
	"unsafe"
)

// SolveScheduleNativeCGO offloads raw mathematical CSP scheduling to the optimized C++ engine.
// Go handles I/O and Goroutines; C++ handles CPU-bound combinatorial optimization.
// Memory handoff is contiguous and flat to eliminate CGO boundary overhead.
func SolveScheduleNativeCGO(
	slots []SlotInput,
	teachers []TeacherLimitInput,
	blockedSlots []BlockedSlotInput,
	requests []AssignmentRequestInput,
) ScheduleSolveResult {
	if len(slots) == 0 || len(requests) == 0 {
		return ScheduleSolveResult{StatusCode: -1}
	}

	// 1. Pack CSlot contiguous array
	cSlots := make([]C.CSlot, len(slots))
	for i, s := range slots {
		cSlots[i] = C.CSlot{
			day_index:  C.int32_t(s.DayIndex),
			slot_index: C.int32_t(s.SlotIndex),
			class_id:   C.int32_t(s.ClassID),
		}
	}

	// 2. Pack CTeacherLimit contiguous array
	cTeachers := make([]C.CTeacherLimit, len(teachers))
	for i, t := range teachers {
		cTeachers[i] = C.CTeacherLimit{
			teacher_id:       C.int32_t(t.TeacherID),
			max_daily_hours:  C.int32_t(t.MaxDailyHours),
			max_weekly_hours: C.int32_t(t.MaxWeeklyHours),
		}
	}

	// 3. Pack CBlockedSlot contiguous array
	cBlocked := make([]C.CBlockedSlot, len(blockedSlots))
	for i, b := range blockedSlots {
		cBlocked[i] = C.CBlockedSlot{
			teacher_id: C.int32_t(b.TeacherID),
			day_index:  C.int32_t(b.DayIndex),
			slot_index: C.int32_t(b.SlotIndex),
		}
	}

	// 4. Pack CAssignmentReq contiguous array
	cRequests := make([]C.CAssignmentReq, len(requests))
	totalHours := int32(0)
	for i, r := range requests {
		cRequests[i] = C.CAssignmentReq{
			req_id:      C.int32_t(r.ReqID),
			teacher_id:  C.int32_t(r.TeacherID),
			class_id:    C.int32_t(r.ClassID),
			subject_id:  C.int32_t(r.SubjectID),
			total_hours: C.int32_t(r.TotalHours),
		}
		totalHours += r.TotalHours
	}

	var pSlots *C.CSlot
	if len(cSlots) > 0 {
		pSlots = (*C.CSlot)(unsafe.Pointer(&cSlots[0]))
	}

	var pTeachers *C.CTeacherLimit
	if len(cTeachers) > 0 {
		pTeachers = (*C.CTeacherLimit)(unsafe.Pointer(&cTeachers[0]))
	}

	var pBlocked *C.CBlockedSlot
	if len(cBlocked) > 0 {
		pBlocked = (*C.CBlockedSlot)(unsafe.Pointer(&cBlocked[0]))
	}

	var pRequests *C.CAssignmentReq
	if len(cRequests) > 0 {
		pRequests = (*C.CAssignmentReq)(unsafe.Pointer(&cRequests[0]))
	}

	// Allocate output buffer
	maxOutput := totalHours + 32
	cOutputItems := make([]C.CScheduledItem, maxOutput)

	var (
		cItemsCount      C.int32_t
		cUnassignedHours C.int32_t
		cComputeTimeUs   C.int64_t
		cStatusCode      C.int32_t
	)

	// Single CGO boundary hop with direct slice pointers
	resCode := C.SolveScheduleNative(
		pSlots, C.int32_t(len(cSlots)),
		pTeachers, C.int32_t(len(cTeachers)),
		pBlocked, C.int32_t(len(cBlocked)),
		pRequests, C.int32_t(len(cRequests)),
		(*C.CScheduledItem)(unsafe.Pointer(&cOutputItems[0])),
		C.int32_t(maxOutput),
		&cItemsCount,
		&cUnassignedHours,
		&cComputeTimeUs,
		&cStatusCode,
	)

	if resCode != 0 {
		return ScheduleSolveResult{StatusCode: -1}
	}

	count := int(cItemsCount)
	goItems := make([]ScheduledOutputItem, count)
	for i := 0; i < count; i++ {
		goItems[i] = ScheduledOutputItem{
			DayIndex:  int32(cOutputItems[i].day_index),
			SlotIndex: int32(cOutputItems[i].slot_index),
			ClassID:   int32(cOutputItems[i].class_id),
			TeacherID: int32(cOutputItems[i].teacher_id),
			SubjectID: int32(cOutputItems[i].subject_id),
		}
	}

	return ScheduleSolveResult{
		Items:           goItems,
		UnassignedHours: int32(cUnassignedHours),
		ComputeTimeUs:   int64(cComputeTimeUs),
		StatusCode:      int32(cStatusCode),
	}
}
