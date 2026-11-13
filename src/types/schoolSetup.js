/**
 * GuruKu School Setup Domain Models & Centralized Business Validators
 * Strictly standardized to prevent data fragmentation across views.
 */

/**
 * @typedef {Object} SchoolProfile
 * @property {string} id
 * @property {string} tenantId
 * @property {string} schoolName
 * @property {string} principalName
 * @property {string} curriculumVicePrincipalName
 * @property {string} address
 * @property {string} academicYear - Format YYYY-YYYY (e.g. "2026-2027")
 * @property {'Ganjil' | 'Genap'} semester
 * @property {string | null} scheduleCreatedDate - ISO YYYY-MM-DD
 * @property {boolean} isValidated
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} SchoolOperatingDay
 * @property {string} id
 * @property {string} tenantId
 * @property {number} dayOfWeek - 1: Senin, 2: Selasa, ..., 7: Minggu
 * @property {string} dayName
 * @property {boolean} isActive
 * @property {number} sortOrder
 */

/**
 * @typedef {Object} KbmSession
 * @property {string} id
 * @property {string} tenantId
 * @property {number} sessionNumber
 * @property {string} label
 * @property {string} startTime - Format "HH:mm" (e.g. "07:30")
 * @property {string} endTime   - Format "HH:mm" (e.g. "08:10")
 * @property {'KBM' | 'BREAK'} sessionType
 * @property {boolean} isActive
 * @property {number} sortOrder
 */

/**
 * @typedef {Object} SchoolSetupStatus
 * @property {boolean} profileComplete
 * @property {boolean} operatingDaysComplete
 * @property {boolean} kbmSessionsComplete
 * @property {boolean} teachersComplete
 * @property {boolean} classesComplete
 * @property {boolean} subjectsComplete
 * @property {boolean} schedulingReady
 * @property {number} completionPercentage
 */

export const DAYS_OF_WEEK = [
  { dayOfWeek: 1, dayName: 'Senin', sortOrder: 1 },
  { dayOfWeek: 2, dayName: 'Selasa', sortOrder: 2 },
  { dayOfWeek: 3, dayName: 'Rabu', sortOrder: 3 },
  { dayOfWeek: 4, dayName: 'Kamis', sortOrder: 4 },
  { dayOfWeek: 5, dayName: 'Jumat', sortOrder: 5 },
  { dayOfWeek: 6, dayName: 'Sabtu', sortOrder: 6 },
  { dayOfWeek: 7, dayName: 'Minggu', sortOrder: 7 }
]

export const createDefaultOperatingDays = (tenantId = '') => {
  return DAYS_OF_WEEK.map((d) => ({
    id: `day-${d.dayOfWeek}`,
    tenantId,
    dayOfWeek: d.dayOfWeek,
    dayName: d.dayName,
    isActive: d.dayOfWeek <= 6, // Senin - Sabtu default aktif
    sortOrder: d.sortOrder
  }))
}

export const createDefaultKbmSessions = (tenantId = '') => {
  return [
    { id: 'sess-1', tenantId, sessionNumber: 1, label: 'Jam Ke-1', startTime: '07:30', endTime: '08:10', sessionType: 'KBM', isActive: true, sortOrder: 1 },
    { id: 'sess-2', tenantId, sessionNumber: 2, label: 'Jam Ke-2', startTime: '08:10', endTime: '08:50', sessionType: 'KBM', isActive: true, sortOrder: 2 },
    { id: 'sess-3', tenantId, sessionNumber: 3, label: 'Jam Ke-3', startTime: '08:50', endTime: '09:30', sessionType: 'KBM', isActive: true, sortOrder: 3 },
    { id: 'sess-4', tenantId, sessionNumber: 0, label: 'Istirahat Pagi', startTime: '09:30', endTime: '10:00', sessionType: 'BREAK', isActive: true, sortOrder: 4 },
    { id: 'sess-5', tenantId, sessionNumber: 4, label: 'Jam Ke-4', startTime: '10:00', endTime: '10:40', sessionType: 'KBM', isActive: true, sortOrder: 5 },
    { id: 'sess-6', tenantId, sessionNumber: 5, label: 'Jam Ke-5', startTime: '10:40', endTime: '11:20', sessionType: 'KBM', isActive: true, sortOrder: 6 },
    { id: 'sess-7', tenantId, sessionNumber: 6, label: 'Jam Ke-6', startTime: '11:20', endTime: '12:00', sessionType: 'KBM', isActive: true, sortOrder: 7 },
    { id: 'sess-8', tenantId, sessionNumber: 0, label: 'Istirahat Siang / Sholat', startTime: '12:00', endTime: '13:00', sessionType: 'BREAK', isActive: true, sortOrder: 8 },
    { id: 'sess-9', tenantId, sessionNumber: 7, label: 'Jam Ke-7', startTime: '13:00', endTime: '13:40', sessionType: 'KBM', isActive: true, sortOrder: 9 },
    { id: 'sess-10', tenantId, sessionNumber: 8, label: 'Jam Ke-8', startTime: '13:40', endTime: '14:20', sessionType: 'KBM', isActive: true, sortOrder: 10 }
  ]
}

export const createDefaultProfile = (tenantId = '', schoolName = '') => {
  const licenseSchoolName = (typeof localStorage !== 'undefined' && (localStorage.getItem('school_name') || localStorage.getItem('license_school_name') || localStorage.getItem('user_name'))) || ''
  return {
    id: tenantId || '',
    tenantId: tenantId || '',
    schoolName: schoolName || licenseSchoolName || 'Sekolah Terdaftar',
    principalName: '',
    curriculumVicePrincipalName: '',
    address: '',
    academicYear: '2026-2027',
    semester: 'Ganjil',
    scheduleCreatedDate: new Date().toISOString().slice(0, 10),
    isValidated: false,
    updatedAt: new Date().toISOString()
  }
}

// ==============================================================================
// VALIDATORS BISNIS
// ==============================================================================

/**
 * Validasi Tahun Pelajaran format YYYY-YYYY dan tahun kedua harus tahun pertama + 1
 * @param {string} academicYear
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAcademicYear(academicYear) {
  if (!academicYear || typeof academicYear !== 'string') {
    return { valid: false, error: 'Tahun pelajaran wajib diisi' }
  }

  const trimmed = academicYear.trim()
  const match = trimmed.match(/^(\d{4})-(\d{4})$/)
  if (!match) {
    return { valid: false, error: 'Format tahun pelajaran wajib YYYY-YYYY (contoh: 2026-2027)' }
  }

  const y1 = parseInt(match[1], 10)
  const y2 = parseInt(match[2], 10)

  if (y2 !== y1 + 1) {
    return { valid: false, error: `Tahun kedua (${y2}) harus tepat 1 tahun setelah tahun pertama (${y1}), contoh: ${y1}-${y1 + 1}` }
  }

  return { valid: true }
}

/**
 * Validasi profil identitas sekolah
 * @param {Partial<SchoolProfile>} profile
 * @param {boolean} [isDraft=false]
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateProfile(profile, isDraft = false) {
  const errors = {}

  if (!profile.schoolName || profile.schoolName.trim().length === 0) {
    errors.schoolName = 'Nama sekolah wajib tersedia dari data registrasi'
  }

  // Jika simpan draft, field lainnya boleh kosong/parsial
  if (isDraft) {
    return { valid: Object.keys(errors).length === 0, errors }
  }

  // Validasi Final "Validasi dan Simpan":
  const principal = (profile.principalName || '').trim()
  if (principal.length < 3) {
    errors.principalName = 'Nama Kepala Sekolah wajib diisi minimal 3 karakter'
  } else if (/^\d+$/.test(principal)) {
    errors.principalName = 'Nama Kepala Sekolah tidak boleh hanya berupa angka'
  }

  const curriculumVice = (profile.curriculumVicePrincipalName || '').trim()
  if (curriculumVice.length < 3) {
    errors.curriculumVicePrincipalName = 'Nama Waka Kurikulum wajib diisi minimal 3 karakter'
  }

  const address = (profile.address || '').trim()
  if (address.length < 10) {
    errors.address = 'Alamat/lokasi sekolah wajib diisi minimal 10 karakter lengkap'
  }

  const yearValidation = validateAcademicYear(profile.academicYear || '')
  if (!yearValidation.valid) {
    errors.academicYear = yearValidation.error || 'Tahun pelajaran tidak valid'
  }

  if (!profile.semester || (profile.semester !== 'Ganjil' && profile.semester !== 'Genap')) {
    errors.semester = 'Semester wajib dipilih (Ganjil atau Genap)'
  }

  if (!profile.scheduleCreatedDate || !/^\d{4}-\d{2}-\d{2}$/.test(profile.scheduleCreatedDate)) {
    errors.scheduleCreatedDate = 'Tanggal pembuatan jadwal wajib diisi dengan tanggal yang valid'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validasi format jam HH:mm (00:00 - 23:59)
 * @param {string} timeStr
 */
export function validateTimeFormat(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return false
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr.trim())
}

/**
 * Konversi waktu "HH:mm" ke menit sejak 00:00 untuk komparasi numerik
 * @param {string} timeStr
 * @returns {number}
 */
export function timeToMinutes(timeStr) {
  if (!validateTimeFormat(timeStr)) return -1
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

/**
 * Validasi pencegahan overlap waktu antar sesi aktif
 * @param {KbmSession[]} sessions
 * @returns {{ valid: boolean, message?: string, overlappingPair?: [number, number] }}
 */
export function validateTimeOverlap(sessions) {
  const activeSessions = (sessions || []).filter((s) => s.isActive)

  for (let i = 0; i < activeSessions.length; i++) {
    const sA = activeSessions[i]
    const startA = timeToMinutes(sA.startTime)
    const endA = timeToMinutes(sA.endTime)

    if (startA < 0 || endA < 0) {
      return {
        valid: false,
        message: `Format jam pada sesi "${sA.label || 'Sesi ' + (i + 1)}" tidak valid (wajib format HH:mm)`
      }
    }

    if (endA <= startA) {
      return {
        valid: false,
        message: `Jam selesai (${sA.endTime}) pada sesi "${sA.label}" harus lebih besar dari jam mulai (${sA.startTime})`
      }
    }

    for (let j = i + 1; j < activeSessions.length; j++) {
      const sB = activeSessions[j]
      const startB = timeToMinutes(sB.startTime)
      const endB = timeToMinutes(sB.endTime)

      // Cek bentrok interval: [startA, endA) dan [startB, endB) overlap jika:
      // max(startA, startB) < min(endA, endB)
      if (Math.max(startA, startB) < Math.min(endA, endB)) {
        return {
          valid: false,
          message: `Sesi "${sA.label}" (${sA.startTime}-${sA.endTime}) bentrok (overlap) dengan sesi "${sB.label}" (${sB.startTime}-${sB.endTime})`,
          overlappingPair: [i, j]
        }
      }
    }
  }

  return { valid: true }
}

/**
 * Validasi koleksi sesi KBM lengkap
 * @param {KbmSession[]} sessions
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateSessions(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return { valid: false, error: 'Minimal harus ada 1 sesi waktu KBM' }
  }

  const activeSessions = sessions.filter((s) => s.isActive)
  if (activeSessions.length === 0) {
    return { valid: false, error: 'Minimal harus ada 1 sesi yang aktif' }
  }

  const kbmActive = activeSessions.filter((s) => s.sessionType === 'KBM')
  if (kbmActive.length === 0) {
    return { valid: false, error: 'Minimal satu sesi KBM aktif harus tersedia (tidak boleh hanya istirahat)' }
  }

  // Cek duplikasi nomor sesi pada KBM aktif
  const seenNumbers = new Set()
  for (const s of kbmActive) {
    if (s.sessionNumber > 0) {
      if (seenNumbers.has(s.sessionNumber)) {
        return { valid: false, error: `Nomor sesi Jam Ke-${s.sessionNumber} duplikat! Setiap sesi KBM harus memiliki nomor urut unik.` }
      }
      seenNumbers.add(s.sessionNumber)
    }
  }

  // Cek overlap waktu
  const overlapCheck = validateTimeOverlap(activeSessions)
  if (!overlapCheck.valid) {
    return { valid: false, error: overlapCheck.message }
  }

  return { valid: true }
}

/**
 * Format tanggal ISO (YYYY-MM-DD) ke string lokal Indonesia
 * @param {string | null | undefined} isoDate
 * @returns {string} Contoh: "12 November 2026"
 */
export function formatIndonesianDate(isoDate) {
  if (!isoDate) return '-'
  try {
    const [year, month, day] = isoDate.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  } catch (_) {
    return isoDate
  }
}
