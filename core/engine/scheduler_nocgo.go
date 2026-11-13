//go:build !cgo

package engine

// SolveScheduleNativeCGO provides a fallback to the pure Go CSP engine when CGO is disabled.
// This ensures cross-compilation and serverless deployment environments without CGO/C++ toolchains compile cleanly.
func SolveScheduleNativeCGO(
	slots []SlotInput,
	teachers []TeacherLimitInput,
	blockedSlots []BlockedSlotInput,
	requests []AssignmentRequestInput,
) ScheduleSolveResult {
	return SolveScheduleEngine(slots, teachers, blockedSlots, requests)
}
