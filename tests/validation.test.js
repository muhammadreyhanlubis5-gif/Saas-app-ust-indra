import test from 'node:test'
import assert from 'node:assert/strict'

import { generateTimeBlocks, formatBlockSplit } from '../src/composables/useAutoDistribution.js'
import {
  normalizeSchedulePayload,
  filterScheduleByTeacher,
  filterScheduleByClass,
  capitalizeDay
} from '../src/core/scheduleStore.js'
import {
  normalizeTeacherConstraints,
  isTeacherBlocked,
  findActiveScheduleConflict,
  toggleSlotConstraint
} from '../src/core/teacherConstraintsStore.js'
import { validateDailyTeacherLimit, MAX_DAILY_TEACHER_JP } from '../src/composables/useConflictValidation.js'

test('1. Dynamic JP Auto-Splitter (generateTimeBlocks)', () => {
  assert.deepEqual(generateTimeBlocks(2), [2])
  assert.deepEqual(generateTimeBlocks(3), [2, 1])
  assert.deepEqual(generateTimeBlocks(4), [2, 2])
  assert.deepEqual(generateTimeBlocks(5), [2, 2, 1])
  assert.deepEqual(generateTimeBlocks(6), [2, 2, 2])
  assert.deepEqual(generateTimeBlocks(1), [1])
  assert.deepEqual(generateTimeBlocks(0), [])
  assert.deepEqual(generateTimeBlocks(-3), [])

  assert.match(formatBlockSplit(3), /2 JP & 1 JP/)
  assert.match(formatBlockSplit(4), /2 JP & 2 JP/)
})

test('2. SchedulePayload Normalizer & Query Filters', () => {
  const rawArray = [
    { day: 'senin', slot_index: 1, start: '07:30', end: '08:10', class_id: '7A', teacher_code: 'BS', subject: 'MAT' },
    { day: 'Selasa', slot_index: 2, start: '08:10', end: '08:50', class_id: '7B', teacher_code: 'MH', subject: 'IPA' }
  ]

  const normalized = normalizeSchedulePayload(rawArray)
  assert.equal(normalized.length, 2)
  assert.equal(normalized[0].day, 'Senin')
  assert.equal(normalized[0].start, '07.30')
  assert.equal(normalized[0].end, '08.10')
  assert.equal(normalized[0].class_id, '7A')
  assert.equal(normalized[0].teacher_code, 'BS')

  // Filter by Teacher
  const bsSchedule = filterScheduleByTeacher(normalized, 'bs')
  assert.equal(bsSchedule.length, 1)
  assert.equal(bsSchedule[0].teacher_code, 'BS')

  // Filter by Class
  const class7B = filterScheduleByClass(normalized, '7B')
  assert.equal(class7B.length, 1)
  assert.equal(class7B[0].teacher_code, 'MH')

  // Legacy format support
  const legacyDict = {
    'SENIN-1-7A': { guru: 'BS', mapel: 'MAT' }
  }
  const fromLegacy = normalizeSchedulePayload(legacyDict)
  assert.equal(fromLegacy.length, 1)
  assert.equal(fromLegacy[0].day, 'Senin')
  assert.equal(fromLegacy[0].slot_index, 1)
  assert.equal(fromLegacy[0].teacher_code, 'BS')
})

test('3. Teacher Blocked Slot Matrix & Constraint Validation (Rule D)', () => {
  const rawConstraints = [
    { teacher_code: 'BS', day: 'Senin', blocked_slots: [1, 2] },
    { teacher_code: 'MH', day: 'Rabu', blocked_slots: [3, 4] }
  ]

  const normalized = normalizeTeacherConstraints(rawConstraints)
  assert.equal(normalized.length, 2)

  // Verify O(1) / Fast lookup
  assert.equal(isTeacherBlocked(normalized, 'BS', 'Senin', 1), true)
  assert.equal(isTeacherBlocked(normalized, 'BS', 'Senin', 2), true)
  assert.equal(isTeacherBlocked(normalized, 'BS', 'Senin', 3), false)
  assert.equal(isTeacherBlocked(normalized, 'BS', 'Selasa', 1), false)
  assert.equal(isTeacherBlocked(normalized, 'MH', 'Rabu', 4), true)

  // Check Active Schedule conflict preventing block
  const activeSchedule = [
    { day: 'Senin', slot_index: 3, teacher_code: 'BS', class_id: '7A', subject: 'MAT' }
  ]
  const conflict = findActiveScheduleConflict(activeSchedule, 'BS', 'Senin', 3)
  assert.ok(conflict)
  assert.equal(conflict.class_id, '7A')

  // Attempting to toggle blocked slot on active schedule must fail safely
  const toggleResult = toggleSlotConstraint(normalized, 'BS', 'Senin', 3, activeSchedule)
  assert.equal(toggleResult.success, false)
  assert.equal(toggleResult.conflict, true)
})

test('4. Rule C - Teacher Daily Limit Constraint (Max 4 JP/Day)', () => {
  const currentSlots = [
    { day: 'Senin', teacher_code: 'BS', hours: 2 },
    { day: 'Senin', teacher_code: 'BS', hours: 1 }
  ]

  // BS currently has 3 JP on Senin.
  // Placing 1 JP -> 3 + 1 = 4 JP <= 4 -> ALLOWED
  const check1 = validateDailyTeacherLimit(currentSlots, 'BS', 'Senin', 1)
  assert.equal(check1.allowed, true)
  assert.equal(check1.projectedJP, 4)

  // Placing 2 JP -> 3 + 2 = 5 JP > 4 -> BLOCKED
  const check2 = validateDailyTeacherLimit(currentSlots, 'BS', 'Senin', 2)
  assert.equal(check2.allowed, false)
  assert.equal(check2.projectedJP, 5)
  assert.match(check2.reason, /Batas Harian Terlampaui/)

  // Other teacher or other day -> 0 + 2 = 2 <= 4 -> ALLOWED
  const check3 = validateDailyTeacherLimit(currentSlots, 'MH', 'Senin', 2)
  assert.equal(check3.allowed, true)
  assert.equal(check3.projectedJP, 2)
})
