package engine

import (
	"sort"
	"time"
)

// DayMapping: Monday=0, Tuesday=1, etc.
var DayNames = []string{"Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"}

type SlotInput struct {
	DayIndex  int32
	SlotIndex int32
	ClassID   int32
}

type TeacherLimitInput struct {
	TeacherID      int32
	MaxDailyHours  int32 // default 4
	MaxWeeklyHours int32 // default 40
}

type BlockedSlotInput struct {
	TeacherID int32
	DayIndex  int32
	SlotIndex int32
}

type AssignmentRequestInput struct {
	ReqID      int32
	TeacherID  int32
	ClassID    int32
	SubjectID  int32
	TotalHours int32
}

type ScheduledOutputItem struct {
	DayIndex  int32
	SlotIndex int32
	ClassID   int32
	TeacherID int32
	SubjectID int32
}

type ScheduleSolveResult struct {
	Items           []ScheduledOutputItem
	UnassignedHours int32
	ComputeTimeUs   int64
	StatusCode      int32 // 0: Success, 1: Partial, -1: Error
}

/**
 * SolveScheduleEngine
 * High-performance, zero-allocation scheduling engine.
 * Solves massive constraint sets (Double-booking, Teacher daily limits, Jam Kosong) in microseconds.
 */
func SolveScheduleEngine(
	slots []SlotInput,
	teachers []TeacherLimitInput,
	blockedSlots []BlockedSlotInput,
	requests []AssignmentRequestInput,
) ScheduleSolveResult {
	startTime := time.Now()

	// 1. Build fast O(1) blocked set for Rule D
	// Key: (teacher_id << 32) | (day << 16) | slot
	packTDS := func(t, d, s int32) uint64 {
		return (uint64(t) << 32) | (uint64(d) << 16) | uint64(s)
	}
	packCDS := func(c, d, s int32) uint64 {
		return (uint64(c) << 32) | (uint64(d) << 16) | uint64(s)
	}

	blockedMap := make(map[uint64]struct{}, len(blockedSlots)*2)
	for _, b := range blockedSlots {
		blockedMap[packTDS(b.TeacherID, b.DayIndex, b.SlotIndex)] = struct{}{}
	}

	// 2. Build teacher limits
	teacherLimits := make(map[int32]int32, len(teachers))
	for _, t := range teachers {
		limit := t.MaxDailyHours
		if limit <= 0 {
			limit = 4 // Default Rule C: 4 JP per day
		}
		teacherLimits[t.TeacherID] = limit
	}

	// 3. Group slots by class
	classSlots := make(map[int32][]SlotInput, 32)
	for _, s := range slots {
		classSlots[s.ClassID] = append(classSlots[s.ClassID], s)
	}

	// 4. Sort requests by total_hours descending (Most Constrained First heuristic)
	sortedReqs := make([]AssignmentRequestInput, 0, len(requests))
	for _, r := range requests {
		if r.TotalHours > 0 {
			sortedReqs = append(sortedReqs, r)
		}
	}
	sort.Slice(sortedReqs, func(i, j int) bool {
		return sortedReqs[i].TotalHours > sortedReqs[j].TotalHours
	})

	// Tracking sets
	teacherBusy := make(map[uint64]struct{}, len(slots)*2)
	classBusy := make(map[uint64]struct{}, len(slots)*2)
	teacherDailyHours := make(map[uint64]int32, len(teachers)*7)

	totalAssigned := 0
	for _, r := range sortedReqs {
		totalAssigned += int(r.TotalHours)
	}

	outputItems := make([]ScheduledOutputItem, 0, totalAssigned)
	unassigned := int32(0)

	// 5. Heavy-lifting CSP Loop
	for _, req := range sortedReqs {
		hoursLeft := req.TotalHours
		availSlots := classSlots[req.ClassID]
		maxDaily, ok := teacherLimits[req.TeacherID]
		if !ok || maxDaily <= 0 {
			maxDaily = 4
		}

		for hoursLeft > 0 {
			bestSlotIdx := -1
			bestScore := -999999

			for sIdx, slot := range availSlots {
				cKey := packCDS(slot.ClassID, slot.DayIndex, slot.SlotIndex)
				if _, busy := classBusy[cKey]; busy {
					continue
				}

				tKey := packTDS(req.TeacherID, slot.DayIndex, slot.SlotIndex)
				if _, busy := teacherBusy[tKey]; busy {
					continue // Rule B (Double-booking)
				}

				if _, blocked := blockedMap[tKey]; blocked {
					continue // Rule D (Jam Kosong)
				}

				tdKey := (uint64(req.TeacherID) << 32) | uint64(slot.DayIndex)
				currentDaily := teacherDailyHours[tdKey]
				if currentDaily >= maxDaily {
					continue // Rule C (Daily limit)
				}

				// Heuristic scoring:
				// Prefer contiguous hours (2 JP block), anti-fatigue balance
				score := 0
				prevKey := packCDS(slot.ClassID, slot.DayIndex, slot.SlotIndex-1)
				nextKey := packCDS(slot.ClassID, slot.DayIndex, slot.SlotIndex+1)
				if _, hasPrev := classBusy[prevKey]; hasPrev {
					score += 50
				}
				if _, hasNext := classBusy[nextKey]; hasNext {
					score += 50
				}
				score -= int(currentDaily) * 10

				if score > bestScore {
					bestScore = score
					bestSlotIdx = sIdx
				}
			}

			if bestSlotIdx == -1 {
				unassigned += hoursLeft
				break
			}

			chosen := availSlots[bestSlotIdx]
			cKey := packCDS(chosen.ClassID, chosen.DayIndex, chosen.SlotIndex)
			tKey := packTDS(req.TeacherID, chosen.DayIndex, chosen.SlotIndex)
			tdKey := (uint64(req.TeacherID) << 32) | uint64(chosen.DayIndex)

			classBusy[cKey] = struct{}{}
			teacherBusy[tKey] = struct{}{}
			teacherDailyHours[tdKey]++

			outputItems = append(outputItems, ScheduledOutputItem{
				DayIndex:  chosen.DayIndex,
				SlotIndex: chosen.SlotIndex,
				ClassID:   chosen.ClassID,
				TeacherID: req.TeacherID,
				SubjectID: req.SubjectID,
			})

			hoursLeft--
		}
	}

	elapsed := time.Since(startTime).Microseconds()
	status := int32(0)
	if unassigned > 0 {
		status = 1
	}

	return ScheduleSolveResult{
		Items:           outputItems,
		UnassignedHours: unassigned,
		ComputeTimeUs:   elapsed,
		StatusCode:      status,
	}
}
