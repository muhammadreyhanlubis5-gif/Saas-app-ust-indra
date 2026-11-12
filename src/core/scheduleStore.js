/**
 * GuruKu SaaS - Unified Schedule Store & Normalizer
 * 
 * Single source of truth for both "Jadwal Guru" and "Jadwal Kelas":
 * Normalized Relational Array Structure:
 * SchedulePayload: [
 *   { day: "Senin", slot_index: 1, start: "07.30", end: "08.10", class_id: "1A", teacher_code: "SB", subject: "NAH" },
 *   ...
 * ]
 */

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
 * Normalizes raw schedule data into a relational array structure
 * 
 * @param {Array|Object} rawData - Array or Dictionary
 * @param {Object} sessionsMatrix - Sessions per day
 * @returns {Array<Object>} SchedulePayload
 */
export const normalizeSchedulePayload = (rawData, sessionsMatrix = {}) => {
  if (!rawData) return []

  // If already normalized array
  if (Array.isArray(rawData)) {
    return rawData.map(item => ({
      day: capitalizeDay(item.day),
      slot_index: Number(item.slot_index || item.session || 1),
      start: (item.start || item.start_time || '07.30').replace(':', '.'),
      end: (item.end || item.end_time || '08.10').replace(':', '.'),
      class_id: (item.class_id || item.cls || item.className || '').trim().toUpperCase(),
      teacher_code: (item.teacher_code || item.guru || '').trim().toUpperCase(),
      subject: (item.subject || item.mapel || '').trim().toUpperCase()
    }))
  }

  // If legacy dictionary format: { "SENIN-1-1A": { guru: "SB", mapel: "NAH" } }
  const result = []
  for (const [key, val] of Object.entries(rawData)) {
    if (!val) continue
    const parts = key.split('-')
    if (parts.length >= 3) {
      const day = capitalizeDay(parts[0])
      const slotIndex = parseInt(parts[1], 10) || 1
      const classId = parts.slice(2).join('-').trim().toUpperCase()

      let start = '07.30'
      let end = '08.10'

      if (sessionsMatrix && sessionsMatrix[day]) {
        const kbmSessions = sessionsMatrix[day].filter(s => s.type === 'KBM')
        const sess = kbmSessions[slotIndex - 1]
        if (sess) {
          start = (sess.start_time || start).replace(':', '.')
          end = (sess.end_time || end).replace(':', '.')
        }
      }

      result.push({
        day,
        slot_index: slotIndex,
        start,
        end,
        class_id: classId,
        teacher_code: (val.guru || val.teacher_code || '').trim().toUpperCase(),
        subject: (val.mapel || val.subject || '').trim().toUpperCase()
      })
    }
  }

  return result
}

/**
 * Filter schedule by Teacher Code
 */
export const filterScheduleByTeacher = (schedulePayload, teacherCode) => {
  if (!schedulePayload || !teacherCode) return []
  const normCode = teacherCode.trim().toUpperCase()
  return schedulePayload.filter(item => item.teacher_code === normCode)
}

/**
 * Filter schedule by Class ID
 */
export const filterScheduleByClass = (schedulePayload, classId) => {
  if (!schedulePayload || !classId) return []
  const normClass = classId.trim().toUpperCase()
  return schedulePayload.filter(item => item.class_id === normClass)
}

/**
 * Calculate Summary Stats for a Teacher
 */
export const calculateTeacherStats = (schedulePayload, teacherCode, tugasTambahanJP = 0) => {
  const teacherItems = filterScheduleByTeacher(schedulePayload, teacherCode)
  const kbmJP = teacherItems.length
  const totalJP = kbmJP + Number(tugasTambahanJP || 0)

  const uniqueClasses = new Set(teacherItems.map(i => i.class_id))
  const uniqueSubjects = new Set(teacherItems.map(i => i.subject))
  const activeDays = new Set(teacherItems.map(i => i.day))

  return {
    kbmJP,
    tugasTambahanJP: Number(tugasTambahanJP || 0),
    totalJP,
    classesCount: uniqueClasses.size,
    subjectsCount: uniqueSubjects.size,
    activeDaysCount: activeDays.size
  }
}

/**
 * Calculate Summary Stats for a Class
 */
export const calculateClassStats = (schedulePayload, classId) => {
  const classItems = filterScheduleByClass(schedulePayload, classId)
  const totalJP = classItems.length

  const uniqueTeachers = new Set(classItems.map(i => i.teacher_code))
  const uniqueSubjects = new Set(classItems.map(i => i.subject))

  return {
    totalJP,
    teachersCount: uniqueTeachers.size,
    subjectsCount: uniqueSubjects.size
  }
}

/**
 * Fetch unified schedule payload from backend / localStorage
 */
export const fetchSchedulePayload = async (schoolId, sessionsMatrix = {}) => {
  const headers = { 'X-School-ID': schoolId || '' }
  try {
    const res = await fetch('/api/v1/school/jadwal', { headers })
    if (res.ok) {
      const data = await res.json()
      if (data) {
        const normalized = normalizeSchedulePayload(data, sessionsMatrix)
        localStorage.setItem('guruKu_schedule_payload', JSON.stringify(normalized))
        return normalized
      }
    }
  } catch (e) {
    console.warn('Gagal fetch jadwal dari server, menggunakan local storage', e)
  }

  // Fallback to localStorage
  const localUnified = localStorage.getItem('guruKu_schedule_payload')
  if (localUnified) {
    try {
      return JSON.parse(localUnified)
    } catch (e) {}
  }

  const localLegacy = localStorage.getItem('guruKu_schedule') || localStorage.getItem('guruKu_jadwal')
  if (localLegacy) {
    try {
      const parsed = JSON.parse(localLegacy)
      const normalized = normalizeSchedulePayload(parsed, sessionsMatrix)
      localStorage.setItem('guruKu_schedule_payload', JSON.stringify(normalized))
      return normalized
    } catch (e) {}
  }

  return []
}

/**
 * Save unified schedule payload to backend & localStorage
 */
export const saveSchedulePayload = async (schoolId, payload) => {
  localStorage.setItem('guruKu_schedule_payload', JSON.stringify(payload))
  try {
    await fetch('/api/v1/school/jadwal', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': schoolId || ''
      },
      body: JSON.stringify(payload)
    })
  } catch (e) {
    console.error('Error saving schedule payload to backend:', e)
  }
}
