/**
 * GuruKu SaaS - Teacher Constraints Store & Logic Engine (Permintaan Jam Kosong)
 * 
 * Standard Data Structure:
 * teacherConstraints: [
 *   { teacher_code: "BS", day: "Rabu", blocked_slots: [1, 2, 3, 4] },
 *   ...
 * ]
 */

export const STORAGE_KEY_CONSTRAINTS = 'guruKu_teacher_constraints'
export const STORAGE_KEY_SCHEDULE = 'guruKu_schedule_payload'

export const DAY_ORDER = {
  'Senin': 1,
  'Selasa': 2,
  'Rabu': 3,
  'Kamis': 4,
  'Jumat': 5,
  'Sabtu': 6,
  'Minggu': 7
}

export const capitalizeDay = (day) => {
  if (!day) return 'Senin'
  const d = day.trim().toLowerCase()
  return d.charAt(0).toUpperCase() + d.slice(1)
}

/**
 * Normalizes any format (Array or Legacy Dictionary) into normalized teacherConstraints array
 * 
 * @param {Array|Object} rawData 
 * @returns {Array<{teacher_code: string, day: string, blocked_slots: number[]}>}
 */
export const normalizeTeacherConstraints = (rawData) => {
  if (!rawData) return []

  // If already array of { teacher_code, day, blocked_slots }
  if (Array.isArray(rawData)) {
    const map = new Map() // key: `${teacher_code}_${day}`

    rawData.forEach(item => {
      if (!item || !item.teacher_code || !item.day) return
      const tCode = item.teacher_code.trim().toUpperCase()
      const day = capitalizeDay(item.day)
      const slots = Array.isArray(item.blocked_slots)
        ? item.blocked_slots.map(s => Number(s)).filter(s => !isNaN(s) && s > 0)
        : []

      const key = `${tCode}__${day}`
      if (!map.has(key)) {
        map.set(key, { teacher_code: tCode, day, blocked_slots: new Set(slots) })
      } else {
        slots.forEach(s => map.get(key).blocked_slots.add(s))
      }
    })

    return Array.from(map.values()).map(entry => ({
      teacher_code: entry.teacher_code,
      day: entry.day,
      blocked_slots: Array.from(entry.blocked_slots).sort((a, b) => a - b)
    })).filter(entry => entry.blocked_slots.length > 0)
  }

  // If legacy dictionary format: { 'Senin-1-MH': true, 'Rabu-2-BS': true }
  if (typeof rawData === 'object') {
    const map = new Map()

    for (const [key, val] of Object.entries(rawData)) {
      if (!val) continue
      const parts = key.split('-')
      if (parts.length >= 3) {
        const day = capitalizeDay(parts[0])
        const slot = parseInt(parts[1], 10)
        const tCode = parts.slice(2).join('-').trim().toUpperCase()

        if (!isNaN(slot) && tCode) {
          const mapKey = `${tCode}__${day}`
          if (!map.has(mapKey)) {
            map.set(mapKey, { teacher_code: tCode, day, blocked_slots: new Set() })
          }
          map.get(mapKey).blocked_slots.add(slot)
        }
      }
    }

    return Array.from(map.values()).map(entry => ({
      teacher_code: entry.teacher_code,
      day: entry.day,
      blocked_slots: Array.from(entry.blocked_slots).sort((a, b) => a - b)
    })).filter(entry => entry.blocked_slots.length > 0)
  }

  return []
}

/**
 * Checks whether a specific slot is blocked for a teacher
 * 
 * @param {Array} constraints - List of teacher constraint objects
 * @param {string} teacherCode 
 * @param {string} day 
 * @param {number|string} slotIndex 
 * @returns {boolean}
 */
export const isTeacherBlocked = (constraints = [], teacherCode, day, slotIndex) => {
  if (!constraints || !teacherCode || !day) return false
  const tCode = teacherCode.trim().toUpperCase()
  const dayCap = capitalizeDay(day)
  const slotNum = Number(slotIndex)

  const entry = constraints.find(c => 
    c.teacher_code.trim().toUpperCase() === tCode && 
    capitalizeDay(c.day) === dayCap
  )

  return entry ? entry.blocked_slots.includes(slotNum) : false
}

/**
 * Checks if teacher has an active scheduled class on that day & slot in the current active schedule
 * 
 * @param {Array} schedulePayload 
 * @param {string} teacherCode 
 * @param {string} day 
 * @param {number|string} slotIndex 
 * @returns {Object|null} The conflicting schedule item or null
 */
export const findActiveScheduleConflict = (schedulePayload = [], teacherCode, day, slotIndex) => {
  if (!schedulePayload || !teacherCode || !day) return null
  const tCode = teacherCode.trim().toUpperCase()
  const dayCap = capitalizeDay(day)
  const slotNum = Number(slotIndex)

  return schedulePayload.find(item => {
    const itemTeacher = (item.teacher_code || item.guru || '').trim().toUpperCase()
    const itemDay = capitalizeDay(item.day)
    const itemSlot = Number(item.slot_index || item.session || 0)
    return itemTeacher === tCode && itemDay === dayCap && itemSlot === slotNum
  }) || null
}

/**
 * Toggle a slot constraint for a teacher with Active Schedule validation check
 * 
 * @param {Array} constraints - Reactive array
 * @param {string} teacherCode 
 * @param {string} day 
 * @param {number|string} slotIndex 
 * @param {Array} schedulePayload - Active schedule payload
 * @returns {{ success: boolean, blocked: boolean, conflict: boolean, message?: string }}
 */
export const toggleSlotConstraint = (constraints, teacherCode, day, slotIndex, schedulePayload = []) => {
  const tCode = teacherCode.trim().toUpperCase()
  const dayCap = capitalizeDay(day)
  const slotNum = Number(slotIndex)

  let entry = constraints.find(c => 
    c.teacher_code.trim().toUpperCase() === tCode && 
    capitalizeDay(c.day) === dayCap
  )

  const currentlyBlocked = entry ? entry.blocked_slots.includes(slotNum) : false

  // If currently NOT blocked, user wants to BLOCK this slot
  if (!currentlyBlocked) {
    // REAL-TIME VALIDATION: Check active schedule
    const conflict = findActiveScheduleConflict(schedulePayload, tCode, dayCap, slotNum)
    if (conflict) {
      return {
        success: false,
        blocked: false,
        conflict: true,
        message: `Gagal: Guru sudah memiliki jadwal aktif pada waktu ini (${conflict.subject} - Kelas ${conflict.class_id}). Hapus jadwal terlebih dahulu.`
      }
    }

    if (!entry) {
      entry = { teacher_code: tCode, day: dayCap, blocked_slots: [slotNum] }
      constraints.push(entry)
    } else {
      entry.blocked_slots.push(slotNum)
      entry.blocked_slots.sort((a, b) => a - b)
    }
    return { success: true, blocked: true, conflict: false }
  } else {
    // Currently blocked -> UNBLOCK
    entry.blocked_slots = entry.blocked_slots.filter(s => s !== slotNum)
    if (entry.blocked_slots.length === 0) {
      const idx = constraints.indexOf(entry)
      if (idx !== -1) constraints.splice(idx, 1)
    }
    return { success: true, blocked: false, conflict: false }
  }
}

/**
 * Quick-select Column Header: Toggle all slots in a day for a teacher
 * 
 * @param {Array} constraints - Reactive array
 * @param {string} teacherCode 
 * @param {string} day 
 * @param {number[]} allSlotNumbers - e.g. [1, 2, 3, 4, 5, 6, 7]
 * @param {Array} schedulePayload 
 * @returns {{ success: boolean, blockedAll: boolean, conflict: boolean, message?: string }}
 */
export const toggleDayConstraint = (constraints, teacherCode, day, allSlotNumbers = [], schedulePayload = []) => {
  const tCode = teacherCode.trim().toUpperCase()
  const dayCap = capitalizeDay(day)
  
  let entry = constraints.find(c => 
    c.teacher_code.trim().toUpperCase() === tCode && 
    capitalizeDay(c.day) === dayCap
  )

  const currentSlots = entry ? entry.blocked_slots : []
  const allBlocked = allSlotNumbers.length > 0 && allSlotNumbers.every(s => currentSlots.includes(s))

  if (allBlocked) {
    // UNBLOCK all for this day
    if (entry) {
      const idx = constraints.indexOf(entry)
      if (idx !== -1) constraints.splice(idx, 1)
    }
    return { success: true, blockedAll: false, conflict: false }
  } else {
    // Attempt to BLOCK all slots
    // Check conflicts for all slots to be blocked
    for (const slotNum of allSlotNumbers) {
      if (!currentSlots.includes(slotNum)) {
        const conflict = findActiveScheduleConflict(schedulePayload, tCode, dayCap, slotNum)
        if (conflict) {
          return {
            success: false,
            blockedAll: false,
            conflict: true,
            message: `Gagal: Guru sudah memiliki jadwal aktif pada ${dayCap} Jam ke-${slotNum} (${conflict.subject} - Kelas ${conflict.class_id}). Hapus jadwal terlebih dahulu.`
          }
        }
      }
    }

    if (!entry) {
      entry = { teacher_code: tCode, day: dayCap, blocked_slots: [...allSlotNumbers].sort((a, b) => a - b) }
      constraints.push(entry)
    } else {
      entry.blocked_slots = Array.from(new Set([...entry.blocked_slots, ...allSlotNumbers])).sort((a, b) => a - b)
    }
    return { success: true, blockedAll: true, conflict: false }
  }
}

/**
 * Gets total blocked slots count for a teacher
 */
export const getTeacherTotalBlockedSlots = (constraints = [], teacherCode) => {
  if (!constraints || !teacherCode) return 0
  const tCode = teacherCode.trim().toUpperCase()
  return constraints
    .filter(c => c.teacher_code.trim().toUpperCase() === tCode)
    .reduce((sum, c) => sum + (c.blocked_slots ? c.blocked_slots.length : 0), 0)
}

/**
 * Formats a clean constraint summary text for the teacher card in the main view
 * e.g., "0 Jam Kosong", "4 Jam Kosong (Rabu)", "6 Jam Kosong (Senin, Rabu)"
 */
export const formatTeacherConstraintSummary = (constraints = [], teacherCode) => {
  if (!constraints || !teacherCode) return '0 Jam Kosong'
  const tCode = teacherCode.trim().toUpperCase()

  const teacherEntries = constraints.filter(c => 
    c.teacher_code.trim().toUpperCase() === tCode && 
    c.blocked_slots && 
    c.blocked_slots.length > 0
  )

  const totalHours = teacherEntries.reduce((sum, c) => sum + c.blocked_slots.length, 0)
  if (totalHours === 0) return '0 Jam Kosong'

  // Sort days by standard calendar order
  const daysWithSlots = teacherEntries
    .map(c => capitalizeDay(c.day))
    .sort((a, b) => (DAY_ORDER[a] || 99) - (DAY_ORDER[b] || 99))

  const uniqueDays = Array.from(new Set(daysWithSlots))
  return `${totalHours} Jam Kosong (${uniqueDays.join(', ')})`
}

/**
 * Converts constraints array back to legacy dictionary format if needed
 * { "Senin-1-MH": true, ... }
 */
export const constraintsToLegacyDict = (constraints = []) => {
  const dict = {}
  constraints.forEach(c => {
    const day = capitalizeDay(c.day)
    const tCode = c.teacher_code.trim().toUpperCase()
    ;(c.blocked_slots || []).forEach(slot => {
      dict[`${day}-${slot}-${tCode}`] = true
    })
  })
  return dict
}
