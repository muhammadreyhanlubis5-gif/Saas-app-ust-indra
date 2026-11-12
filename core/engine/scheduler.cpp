#include "scheduler.h"

#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <chrono>
#include <algorithm>
#include <cstring>

namespace guruku {

inline uint64_t PackTDS(int32_t teacher, int32_t day, int32_t slot) {
    return (static_cast<uint64_t>(teacher) << 32) | (static_cast<uint64_t>(day) << 16) | static_cast<uint64_t>(slot);
}

inline uint64_t PackCDS(int32_t class_id, int32_t day, int32_t slot) {
    return (static_cast<uint64_t>(class_id) << 32) | (static_cast<uint64_t>(day) << 16) | static_cast<uint64_t>(slot);
}

} // namespace guruku

extern "C" {

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
) {
    if (!out_items || max_items <= 0) {
        if (out_status_code) *out_status_code = -1;
        return -1;
    }

    auto start_time = std::chrono::high_resolution_clock::now();

    // 1. Build fast O(1) blocked slots set for Rule D
    std::unordered_set<uint64_t> blocked_set;
    blocked_set.reserve(blocked_count * 2);
    for (int i = 0; i < blocked_count; ++i) {
        const auto& b = blocked_slots[i];
        blocked_set.insert(guruku::PackTDS(b.teacher_id, b.day_index, b.slot_index));
    }

    // 2. Build teacher limit map (Rule C)
    std::unordered_map<int32_t, int32_t> teacher_daily_limits;
    for (int i = 0; i < teachers_count; ++i) {
        teacher_daily_limits[teachers[i].teacher_id] = teachers[i].max_daily_hours > 0 
            ? teachers[i].max_daily_hours 
            : 4; // Default 4 JP per day
    }

    // 3. Busy tracking structures
    std::unordered_set<uint64_t> teacher_busy;  // (teacher, day, slot) -> Rule B
    std::unordered_set<uint64_t> class_busy;    // (class, day, slot) -> Single teacher per class slot
    std::unordered_map<uint64_t, int32_t> teacher_daily_hours; // (teacher, day) -> count

    teacher_busy.reserve(slots_count * 2);
    class_busy.reserve(slots_count * 2);

    // Group available slots by class for fast lookup
    std::unordered_map<int32_t, std::vector<CSlot>> class_slots;
    for (int i = 0; i < slots_count; ++i) {
        class_slots[slots[i].class_id].push_back(slots[i]);
    }

    // Copy requirements and sort by total_hours descending (Most Constrained First heuristic)
    std::vector<CAssignmentReq> reqs;
    reqs.reserve(requests_count);
    for (int i = 0; i < requests_count; ++i) {
        if (requests[i].total_hours > 0) {
            reqs.push_back(requests[i]);
        }
    }

    std::sort(reqs.begin(), reqs.end(), [](const CAssignmentReq& a, const CAssignmentReq& b) {
        return a.total_hours > b.total_hours;
    });

    int32_t output_index = 0;
    int32_t unassigned = 0;

    // 4. Heavy-lifting Constraint Satisfaction Solver loop
    for (const auto& req : reqs) {
        int32_t hours_left = req.total_hours;
        const auto& available_slots = class_slots[req.class_id];
        int32_t max_daily = teacher_daily_limits[req.teacher_id];
        if (max_daily <= 0) max_daily = 4;

        while (hours_left > 0) {
            int best_slot_idx = -1;
            int best_score = -999999;

            for (size_t s = 0; s < available_slots.size(); ++s) {
                const auto& slot = available_slots[s];

                uint64_t c_key = guruku::PackCDS(slot.class_id, slot.day_index, slot.slot_index);
                if (class_busy.find(c_key) != class_busy.end()) {
                    continue; // Class already busy
                }

                uint64_t t_key = guruku::PackTDS(req.teacher_id, slot.day_index, slot.slot_index);
                if (teacher_busy.find(t_key) != teacher_busy.end()) {
                    continue; // Teacher already teaching another class (Rule B)
                }

                if (blocked_set.find(t_key) != blocked_set.end()) {
                    continue; // Teacher blocked by constraint (Rule D)
                }

                uint64_t td_key = (static_cast<uint64_t>(req.teacher_id) << 32) | static_cast<uint64_t>(slot.day_index);
                int current_daily = teacher_daily_hours[td_key];
                if (current_daily >= max_daily) {
                    continue; // Daily limit reached (Rule C)
                }

                int score = 0;
                uint64_t prev_key = guruku::PackCDS(slot.class_id, slot.day_index, slot.slot_index - 1);
                uint64_t next_key = guruku::PackCDS(slot.class_id, slot.day_index, slot.slot_index + 1);
                if (class_busy.find(prev_key) != class_busy.end() || class_busy.find(next_key) != class_busy.end()) {
                    score += 50; // Contiguous block preference
                }

                // Load balancing across days
                score -= current_daily * 10;

                if (score > best_score) {
                    best_score = score;
                    best_slot_idx = static_cast<int>(s);
                }
            }

            if (best_slot_idx == -1) {
                unassigned += hours_left;
                break;
            }

            const auto& chosen = available_slots[best_slot_idx];
            uint64_t c_key = guruku::PackCDS(chosen.class_id, chosen.day_index, chosen.slot_index);
            uint64_t t_key = guruku::PackTDS(req.teacher_id, chosen.day_index, chosen.slot_index);
            uint64_t td_key = (static_cast<uint64_t>(req.teacher_id) << 32) | static_cast<uint64_t>(chosen.day_index);

            class_busy.insert(c_key);
            teacher_busy.insert(t_key);
            teacher_daily_hours[td_key]++;

            if (output_index < max_items) {
                out_items[output_index].day_index = chosen.day_index;
                out_items[output_index].slot_index = chosen.slot_index;
                out_items[output_index].class_id = chosen.class_id;
                out_items[output_index].teacher_id = req.teacher_id;
                out_items[output_index].subject_id = req.subject_id;
                output_index++;
            }

            hours_left--;
        }
    }

    auto end_time = std::chrono::high_resolution_clock::now();
    int64_t elapsed_us = std::chrono::duration_cast<std::chrono::microseconds>(end_time - start_time).count();

    if (out_items_count) *out_items_count = output_index;
    if (out_unassigned_hours) *out_unassigned_hours = unassigned;
    if (out_compute_time_us) *out_compute_time_us = elapsed_us;
    if (out_status_code) *out_status_code = (unassigned == 0) ? 0 : 1;

    return 0;
}

} // extern "C"
