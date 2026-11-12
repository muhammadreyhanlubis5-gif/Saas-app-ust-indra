/**
 * GuruKu SaaS - Real-Time Conflict Engine & Validation Rules
 * 
 * Strict Validation Rules:
 * - RULE A (Subject Duplication): Prevents multiple teachers from being assigned the same subject in the same class.
 * - RULE B (Time Clash / Double Booking): Prevents a teacher from being assigned to the same time period across multiple classes simultaneously.
 * - RULE C (Teacher Daily Limit Constraint): Limits a teacher to MAX_DAILY_TEACHER_JP = 4 JP per day across all classes.
 * - MAX WORKLOAD: Alerts if a teacher exceeds the maximum 40 JP weekly limit.
 */

import { ref, computed, watch, reactive } from 'vue'

export const MAX_DAILY_TEACHER_JP = 4

/**
 * Scheduling Engine Constraint Helper
 * Checks if placing a block of size `blockSize` on `day` for `teacherCode` is allowed.
 * If it hits the 4 JP limit, it indicates that placement must be blocked and moved to the next day.
 */
export const validateDailyTeacherLimit = (currentSlots = [], teacherCode, day, blockSize = 2) => {
  const normTeacher = (teacherCode || '').trim().toUpperCase()
  const normDay = (day || '').trim().toUpperCase()

  const currentDailyJP = currentSlots
    .filter(s => {
      const sTeacher = (s.teacher_code || s.guru || '').trim().toUpperCase()
      const sDay = (s.day || '').trim().toUpperCase()
      return sTeacher === normTeacher && sDay === normDay
    })
    .reduce((sum, s) => sum + (Number(s.hours || s.jp || s.duration) || 1), 0)

  const projectedJP = currentDailyJP + blockSize
  const allowed = projectedJP <= MAX_DAILY_TEACHER_JP

  return {
    allowed,
    currentDailyJP,
    projectedJP,
    maxDailyJP: MAX_DAILY_TEACHER_JP,
    reason: allowed
      ? null
      : `Batas Harian Terlampaui: Penempatan ${blockSize} JP pada hari ${normDay} menghasilkan total ${projectedJP} JP (Maksimal ${MAX_DAILY_TEACHER_JP} JP/hari). Blok harus dipindahkan ke hari berikutnya.`
  }
}

export function useConflictValidation() {
  // Map of rowId -> Array of conflict objects
  const conflicts = ref(new Map())
  
  // Track temporary success states (e.g. for glowing green border on save/edit)
  const successStates = reactive(new Map())

  // Timer handles for auto-reverting success state
  const successTimers = new Map()

  /**
   * Helper to get a stable unique row identifier
   */
  const getRowId = (row, index) => {
    if (row.id) return String(row.id)
    if (row.teacher_code && row.subject_code) {
      return `row_${row.teacher_code}_${row.subject_code}_${index}`
    }
    return `row_${index}`
  }

  /**
   * Runs validation against current rows, classes, and time slots
   * 
   * @param {Array} rows - Assignment rows
   * @param {Array} classes - List of class names
   * @param {Array|Object} timeSlots - Optional schedule time-slot entries for Rule B & Rule C
   * @returns {Map} Updated conflicts map
   */
  const validate = (rows = [], classes = [], timeSlots = []) => {
    const newConflicts = new Map()

    const addConflict = (rowId, conflictObj) => {
      if (!newConflicts.has(rowId)) {
        newConflicts.set(rowId, [])
      }
      newConflicts.get(rowId).push(conflictObj)
    }

    // -------------------------------------------------------------
    // RULE A: Subject Duplication Check
    // (Target_Class cannot have more than 1 teacher for the same Subject_Code)
    // -------------------------------------------------------------
    const classSubjectMap = new Map()

    rows.forEach((row, rIdx) => {
      const rowId = getRowId(row, rIdx)
      const subjCode = (row.subject_code || '').trim().toUpperCase()
      const tCode = (row.teacher_code || '').trim().toUpperCase()
      const tName = row.teacher_name || tCode || 'Guru'

      if (!subjCode || !row.hours) return

      row.hours.forEach((hrs, cIdx) => {
        if (hrs > 0) {
          if (!classSubjectMap.has(cIdx)) {
            classSubjectMap.set(cIdx, new Map())
          }
          const subjectMap = classSubjectMap.get(cIdx)
          if (!subjectMap.has(subjCode)) {
            subjectMap.set(subjCode, [])
          }
          subjectMap.get(subjCode).push({
            rowId,
            teacherCode: tCode,
            teacherName: tName,
            subjectCode: subjCode,
            subjectName: row.subject_name || subjCode,
            hours: hrs,
            classIndex: cIdx
          })
        }
      })
    })

    // Evaluate duplicates per class & subject
    for (const [cIdx, subjectMap] of classSubjectMap.entries()) {
      const className = classes[cIdx] || `Kelas ${cIdx + 1}`

      for (const [subjCode, assignments] of subjectMap.entries()) {
        const uniqueTeachers = new Set(assignments.map(a => a.teacherCode).filter(Boolean))
        
        if (uniqueTeachers.size > 1 || assignments.length > 1) {
          assignments.forEach(assign => {
            const otherTeachers = assignments
              .filter(a => a.rowId !== assign.rowId)
              .map(a => a.teacherName)
              .join(', ')

            addConflict(assign.rowId, {
              rule: 'RULE_A',
              type: 'SUBJECT_DUPLICATION',
              title: 'Bentrok Mata Pelajaran (Duplikasi Guru)',
              className,
              subjectCode: subjCode,
              subjectName: assign.subjectName,
              message: `Bentrok Mapel: Kelas ${className} sudah diajar Guru lain (${otherTeachers}) untuk ${assign.subjectName || subjCode}.`,
              severity: 'error'
            })
          })
        }
      }
    }

    // -------------------------------------------------------------
    // Normalize timeSlots for RULE B and RULE C
    // -------------------------------------------------------------
    let flatSlots = []
    if (Array.isArray(timeSlots)) {
      flatSlots = timeSlots
    } else if (typeof timeSlots === 'object' && timeSlots !== null) {
      for (const [key, val] of Object.entries(timeSlots)) {
        if (val && (val.guru || val.teacher_code)) {
          const parts = key.split('-')
          if (parts.length >= 3) {
            flatSlots.push({
              day: parts[0],
              period: parts[1],
              className: parts.slice(2).join('-'),
              teacher_code: (val.guru || val.teacher_code || '').toUpperCase(),
              subject_code: (val.mapel || val.subject_code || '').toUpperCase(),
              hours: Number(val.hours || val.jp || val.duration) || 1
            })
          }
        }
      }
    }

    // -------------------------------------------------------------
    // RULE B: Time Clash / Double Booking Check
    // (Teacher_ID cannot be in Class_A and Class_B at Period_X simultaneously)
    // -------------------------------------------------------------
    const periodTeacherMap = new Map()
    flatSlots.forEach(slot => {
      const tCode = (slot.teacher_code || '').trim().toUpperCase()
      const day = (slot.day || '').trim().toUpperCase()
      const period = (slot.period || '').toString().trim()
      const cls = (slot.className || slot.cls || '').trim().toUpperCase()

      if (!tCode || !day || !period) return

      const slotKey = `${day}__${period}__${tCode}`
      if (!periodTeacherMap.has(slotKey)) {
        periodTeacherMap.set(slotKey, [])
      }
      periodTeacherMap.get(slotKey).push({ ...slot, className: cls })
    })

    for (const [slotKey, bookings] of periodTeacherMap.entries()) {
      const uniqueClasses = new Set(bookings.map(b => b.className).filter(Boolean))

      if (uniqueClasses.size > 1) {
        const [day, period, tCode] = slotKey.split('__')
        const classNames = Array.from(uniqueClasses).join(' & ')

        rows.forEach((row, rIdx) => {
          const rowTCode = (row.teacher_code || '').trim().toUpperCase()
          if (rowTCode === tCode) {
            const rowId = getRowId(row, rIdx)
            addConflict(rowId, {
              rule: 'RULE_B',
              type: 'TIME_CLASH',
              title: 'Bentrok Waktu Mengajar (Double Booking)',
              day,
              period,
              classes: Array.from(uniqueClasses),
              teacherCode: tCode,
              message: `Bentrok Waktu: Mengajar di ${classNames} pada ${day} Jam ${period}.`,
              severity: 'error'
            })
          }
        })
      }
    }

    // -------------------------------------------------------------
    // RULE C: Teacher Daily Limit Constraint (MAX_DAILY_TEACHER_JP = 4)
    // (A teacher can only teach a maximum of 4 JP per day across all assigned classes)
    // -------------------------------------------------------------
    const teacherDailyJP = new Map()
    flatSlots.forEach(slot => {
      const tCode = (slot.teacher_code || '').trim().toUpperCase()
      const day = (slot.day || '').trim().toUpperCase()
      const jp = Number(slot.hours || slot.jp || slot.duration) || 1

      if (!tCode || !day) return

      const dailyKey = `${day}__${tCode}`
      teacherDailyJP.set(dailyKey, (teacherDailyJP.get(dailyKey) || 0) + jp)
    })

    for (const [dailyKey, totalDailyJP] of teacherDailyJP.entries()) {
      if (totalDailyJP > MAX_DAILY_TEACHER_JP) {
        const [day, tCode] = dailyKey.split('__')

        rows.forEach((row, rIdx) => {
          const rowTCode = (row.teacher_code || '').trim().toUpperCase()
          if (rowTCode === tCode) {
            const rowId = getRowId(row, rIdx)
            const tName = row.teacher_name || tCode
            addConflict(rowId, {
              rule: 'RULE_C',
              type: 'DAILY_LIMIT_EXCEEDED',
              title: `Batas Harian Guru Terlampaui (Max ${MAX_DAILY_TEACHER_JP} JP)`,
              day,
              teacherCode: tCode,
              dailyJP: totalDailyJP,
              maxDailyJP: MAX_DAILY_TEACHER_JP,
              message: `Batas Harian Terlampaui: Guru ${tName} (${tCode}) dijadwalkan ${totalDailyJP} JP pada hari ${day} (Batas maksimal ${MAX_DAILY_TEACHER_JP} JP/hari). Blok harus dipindahkan ke hari lain.`,
              severity: 'error'
            })
          }
        })
      }
    }

    // -------------------------------------------------------------
    // RULE D: Maximum Weekly Workload Check (Max 40 JP)
    // -------------------------------------------------------------
    const teacherTotalJP = new Map()
    rows.forEach(row => {
      const tCode = (row.teacher_code || '').trim().toUpperCase()
      if (!tCode) return
      const rowSum = (row.hours || []).reduce((sum, h) => sum + (Number(h) || 0), 0)
      teacherTotalJP.set(tCode, (teacherTotalJP.get(tCode) || 0) + rowSum)
    })

    rows.forEach((row, rIdx) => {
      const tCode = (row.teacher_code || '').trim().toUpperCase()
      const totalJP = teacherTotalJP.get(tCode) || 0
      if (totalJP > 40) {
        const rowId = getRowId(row, rIdx)
        addConflict(rowId, {
          rule: 'RULE_WORKLOAD',
          type: 'OVERLOAD',
          title: 'Beban Mingguan Melebihi Batas',
          totalJP,
          maxWorkload: 40,
          message: `Beban Mingguan Berlebih: Total ${totalJP} JP (Maksimal standar 40 JP/minggu).`,
          severity: 'warning'
        })
      }
    })

    conflicts.value = newConflicts
    return newConflicts
  }

  const hasConflict = (rowId) => {
    const list = conflicts.value.get(String(rowId))
    return Boolean(list && list.length > 0)
  }

  const getConflicts = (rowId) => {
    return conflicts.value.get(String(rowId)) || []
  }

  const getPrimaryConflict = (rowId) => {
    const list = getConflicts(rowId)
    if (list.length === 0) return null
    const errorConflict = list.find(c => c.severity === 'error')
    return errorConflict || list[0]
  }

  const getConflictTooltip = (rowId) => {
    const list = getConflicts(rowId)
    if (list.length === 0) return ''
    return list.map(c => c.message).join('\n• ')
  }

  const markSuccess = (rowIds, duration = 3500) => {
    const ids = Array.isArray(rowIds) ? rowIds : [rowIds]

    ids.forEach(id => {
      const strId = String(id)
      if (!hasConflict(strId)) {
        successStates.set(strId, true)

        if (successTimers.has(strId)) {
          clearTimeout(successTimers.get(strId))
        }

        const timer = setTimeout(() => {
          successStates.delete(strId)
          successTimers.delete(strId)
        }, duration)

        successTimers.set(strId, timer)
      }
    })
  }

  const markAllSuccess = (rows = [], duration = 3500) => {
    rows.forEach((row, idx) => {
      const rowId = getRowId(row, idx)
      if (!hasConflict(rowId)) {
        markSuccess(rowId, duration)
      }
    })
  }

  const getCardState = (rowId) => {
    const strId = String(rowId)
    if (hasConflict(strId)) {
      return 'error'
    }
    if (successStates.get(strId)) {
      return 'success'
    }
    return 'default'
  }

  const totalConflictCount = computed(() => {
    let count = 0
    for (const list of conflicts.value.values()) {
      count += list.length
    }
    return count
  })

  const hasAnyConflict = computed(() => totalConflictCount.value > 0)

  return {
    conflicts,
    validate,
    hasConflict,
    getConflicts,
    getPrimaryConflict,
    getConflictTooltip,
    markSuccess,
    markAllSuccess,
    getCardState,
    totalConflictCount,
    hasAnyConflict,
    getRowId,
    MAX_DAILY_TEACHER_JP
  }
}
