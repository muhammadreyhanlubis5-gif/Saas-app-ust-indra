/**
 * GuruKu Master Data Domain Models & Validators
 * Classes, Teachers, Subjects
 */

export const MASTER_DATA_CACHE_SCHEMA_VERSION = 1

/**
 * Factory untuk Default Class Model
 */
export function createDefaultClass(overrides = {}) {
  const currentYear = new Date().getFullYear()
  return {
    id: null,
    name: '',
    grade_level: null,
    major: 'Umum',
    academic_year: `${currentYear}/${currentYear + 1}`,
    homeroom_teacher_id: null,
    homeroom_teacher_name: '',
    student_count: 0,
    is_active: true,
    ...overrides
  }
}

/**
 * Validasi Entitas Kelas
 */
export function validateClass(cls) {
  const errors = {}

  const name = String(cls?.name || '').trim()
  if (!name) {
    errors.name = 'Nama kelas wajib diisi'
  }

  const academicYear = String(cls?.academic_year || '').trim()
  if (!academicYear) {
    errors.academic_year = 'Tahun pelajaran wajib diisi'
  }

  const studentCount = Number(cls?.student_count)
  if (isNaN(studentCount) || studentCount < 0) {
    errors.student_count = 'Jumlah siswa tidak boleh bernilai negatif'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validasi Baris Excel untuk Kelas
 */
export function validateClassExcelRow(rawRow, rowIndex = 1, seenNames = new Set()) {
  const normalized = {}
  for (const k in rawRow) {
    normalized[k.trim().toLowerCase()] = rawRow[k]
  }

  const name = String(
    normalized['nama kelas'] ||
    normalized['nama_kelas'] ||
    normalized['kelas'] ||
    normalized['rombel'] ||
    ''
  ).trim()

  const homeroom = String(
    normalized['wali kelas'] ||
    normalized['wali_kelas'] ||
    normalized['wali'] ||
    normalized['nama wali'] ||
    ''
  ).trim()

  const rawCount = normalized['jumlah siswa'] ?? normalized['jumlah_siswa'] ?? normalized['jumlah'] ?? normalized['siswa'] ?? 30
  const studentCount = parseInt(rawCount, 10)

  const gradeRaw = normalized['tingkat'] || normalized['tingkat kelas'] || normalized['grade'] || ''
  let gradeLevel = parseInt(gradeRaw, 10)
  if (isNaN(gradeLevel)) {
    // Ekstrak angka dari nama kelas jika mungkin (misal "10 IPA 1" -> 10, "4 A" -> 4)
    const match = name.match(/^(\d+)/)
    gradeLevel = match ? parseInt(match[1], 10) : null
  }

  const major = String(normalized['jurusan'] || normalized['program'] || 'Umum').trim()
  const academicYear = String(normalized['tahun pelajaran'] || normalized['tahun_ajaran'] || '').trim()

  const errors = []
  const warnings = []

  if (!name) {
    errors.push('Nama kelas kosong pada baris ini')
  } else {
    const lowerName = name.toLowerCase()
    if (seenNames.has(lowerName)) {
      warnings.push(`Nama kelas "${name}" terduplikasi dalam file Excel (akan diperbarui/upsert)`)
    } else {
      seenNames.add(lowerName)
    }
  }

  if (isNaN(studentCount) || studentCount < 0) {
    errors.push('Jumlah siswa harus berupa angka dan tidak boleh negatif')
  }

  const parsedData = {
    row: rowIndex,
    name: name.toUpperCase(),
    grade_level: gradeLevel,
    major: major || 'Umum',
    academic_year: academicYear,
    homeroom_teacher_name: homeroom,
    student_count: isNaN(studentCount) ? 0 : studentCount,
    is_active: true
  }

  return {
    row: rowIndex,
    valid: errors.length === 0,
    errors,
    warnings,
    parsedData
  }
}

/**
 * Factory untuk Default Teacher Model
 */
export function createDefaultTeacher(overrides = {}) {
  return {
    id: null,
    nip_nuptk: null,
    name: '',
    gender: 'Laki-laki',
    employment_status: 'PNS',
    is_certified: false,
    subject_specialty: '',
    is_active: true,
    ...overrides
  }
}

/**
 * Validasi Entitas Guru
 */
export function validateTeacher(teacher) {
  const errors = {}

  const name = String(teacher?.name || '').trim()
  if (!name) {
    errors.name = 'Nama guru wajib diisi'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Factory untuk Default Subject Model
 */
export function createDefaultSubject(overrides = {}) {
  return {
    id: null,
    code: '',
    name: '',
    category: 'Wajib',
    weekly_default_hours: 2,
    is_active: true,
    ...overrides
  }
}

/**
 * Validasi Entitas Mata Pelajaran
 */
export function validateSubject(subject) {
  const errors = {}

  const code = String(subject?.code || '').trim()
  if (!code) {
    errors.code = 'Kode mata pelajaran wajib diisi'
  }

  const name = String(subject?.name || '').trim()
  if (!name) {
    errors.name = 'Nama mata pelajaran wajib diisi'
  }

  const hours = Number(subject?.weekly_default_hours)
  if (isNaN(hours) || hours < 0) {
    errors.weekly_default_hours = 'Beban jam default tidak boleh negatif'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
