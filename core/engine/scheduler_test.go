package engine

import (
	"testing"
)

func TestSolveScheduleEngine(t *testing.T) {
	// 2 Classes, 5 Days (0..4), 7 Slots (1..7) each
	slots := make([]SlotInput, 0, 70)
	for day := int32(0); day < 5; day++ {
		for slot := int32(1); slot <= 7; slot++ {
			slots = append(slots, SlotInput{DayIndex: day, SlotIndex: slot, ClassID: 1})
			slots = append(slots, SlotInput{DayIndex: day, SlotIndex: slot, ClassID: 2})
		}
	}

	// 2 Teachers (Teacher 101, Teacher 102) with max 4 JP per day
	teachers := []TeacherLimitInput{
		{TeacherID: 101, MaxDailyHours: 4, MaxWeeklyHours: 24},
		{TeacherID: 102, MaxDailyHours: 4, MaxWeeklyHours: 24},
	}

	// Teacher 101 blocked on Monday (day 0) slot 1 and 2 (Rule D)
	blockedSlots := []BlockedSlotInput{
		{TeacherID: 101, DayIndex: 0, SlotIndex: 1},
		{TeacherID: 101, DayIndex: 0, SlotIndex: 2},
	}

	// Assignment requests:
	requests := []AssignmentRequestInput{
		{ReqID: 1, TeacherID: 101, ClassID: 1, SubjectID: 10, TotalHours: 6},
		{ReqID: 2, TeacherID: 101, ClassID: 2, SubjectID: 10, TotalHours: 6},
		{ReqID: 3, TeacherID: 102, ClassID: 1, SubjectID: 20, TotalHours: 8},
		{ReqID: 4, TeacherID: 102, ClassID: 2, SubjectID: 20, TotalHours: 8},
	}

	// Test Go engine
	resultGo := SolveScheduleEngine(slots, teachers, blockedSlots, requests)
	if resultGo.StatusCode != 0 {
		t.Fatalf("Go Engine failed: %d", resultGo.StatusCode)
	}

	// Test C++ Engine via CGO
	resultCGO := SolveScheduleNativeCGO(slots, teachers, blockedSlots, requests)
	if resultCGO.StatusCode != 0 {
		t.Fatalf("CGO Native Engine failed: %d", resultCGO.StatusCode)
	}

	expectedTotal := int32(6 + 6 + 8 + 8)
	if int32(len(resultCGO.Items)) != expectedTotal {
		t.Fatalf("Expected %d assigned items in CGO, got %d", expectedTotal, len(resultCGO.Items))
	}

	// Verify Rule B, Rule C, Rule D on CGO result
	teacherOccupied := make(map[uint64]bool)
	teacherDailyHours := make(map[uint64]int32)

	for _, item := range resultCGO.Items {
		// Rule D:
		if item.TeacherID == 101 && item.DayIndex == 0 && (item.SlotIndex == 1 || item.SlotIndex == 2) {
			t.Fatalf("CGO Rule D Violated: Teacher 101 in blocked slot %d on day 0", item.SlotIndex)
		}

		tKey := (uint64(item.TeacherID) << 32) | (uint64(item.DayIndex) << 16) | uint64(item.SlotIndex)
		if teacherOccupied[tKey] {
			t.Fatalf("CGO Rule B Violated: Double-booking on day %d, slot %d", item.DayIndex, item.SlotIndex)
		}
		teacherOccupied[tKey] = true

		tdKey := (uint64(item.TeacherID) << 32) | uint64(item.DayIndex)
		teacherDailyHours[tdKey]++
		if teacherDailyHours[tdKey] > 4 {
			t.Fatalf("CGO Rule C Violated: Teacher %d daily hours exceeded on day %d: %d", item.TeacherID, item.DayIndex, teacherDailyHours[tdKey])
		}
	}

	t.Logf("Both Go and C++ Native Engines verified! C++ compute time: %d us", resultCGO.ComputeTimeUs)
}
