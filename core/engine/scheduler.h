#ifndef GURUKU_SCHEDULER_H
#define GURUKU_SCHEDULER_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

// Compact C-compatible representation of a school time slot
typedef struct {
    int32_t day_index;   // 0=Senin, 1=Selasa, etc.
    int32_t slot_index;  // 1-based (Jam ke-1, Jam ke-2...)
    int32_t class_id;    // Integer ID of class
} CSlot;

// Teacher workload limits (Rule C: daily limit; Rule Workload: weekly limit)
typedef struct {
    int32_t teacher_id;
    int32_t max_daily_hours;  // default 4
    int32_t max_weekly_hours; // default 40
} CTeacherLimit;

// Teacher constraint: Rule D (Permintaan Jam Kosong)
typedef struct {
    int32_t teacher_id;
    int32_t day_index;
    int32_t slot_index;
} CBlockedSlot;

// Assignment requirement from Master Pengampu Mapel
typedef struct {
    int32_t req_id;
    int32_t teacher_id;
    int32_t class_id;
    int32_t subject_id;
    int32_t total_hours;
} CAssignmentReq;

// Scheduled outcome item
typedef struct {
    int32_t day_index;
    int32_t slot_index;
    int32_t class_id;
    int32_t teacher_id;
    int32_t subject_id;
} CScheduledItem;

/**
 * SolveScheduleNative
 * Direct parameter passing - 100% compliant with Go cgo pointer rules.
 * No nested pointers inside structs.
 */
int SolveScheduleNative(
    const CSlot* slots, int32_t slots_count,
    const CTeacherLimit* teachers, int32_t teachers_count,
    const CBlockedSlot* blocked_slots, int32_t blocked_count,
    const CAssignmentReq* requests, int32_t requests_count,
    CScheduledItem* out_items, int32_t max_items,
    int32_t* out_items_count,
    int32_t* out_unassigned_hours,
    int64_t* out_compute_time_us,
    int32_t* out_status_code
);

#ifdef __cplusplus
}
#endif

#endif // GURUKU_SCHEDULER_H
