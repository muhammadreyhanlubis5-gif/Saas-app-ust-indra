/**
 * GuruKu Canonical Domain Mapper & Key Determinism Engine
 * 
 * Single source of truth for canonical field mappings between
 * Excel XLSB, Vue frontend stores, API payloads, and database columns.
 * Prevents ad-hoc conversions and naming mismatches (snake_case vs camelCase).
 */

export const UPSERT_ERROR_UNSAFE_KEY = 'UPSERT_UNSAFE_KEY'

/**
 * Normalizes Class raw object to canonical schema
 */
export function toCanonicalClass(raw = {}, defaultAcademicYear = '2026/2027') {
  const name = String(raw.name || raw.class_name || raw.className || raw.nama_kelas || raw.rombel || '').trim()
  
  let gradeLevel = raw.grade_level ?? raw.gradeLevel ?? raw.tingkat ?? null
  if (gradeLevel !== null && gradeLevel !== undefined) {
    const parsed = parseInt(gradeLevel, 10)
    gradeLevel = isNaN(parsed) ? null : parsed
  } else if (name) {
    const m = name.match(/^(\d+)/)
    gradeLevel = m ? parseInt(m[1], 10) : null
  }

  const academicYear = String(
    raw.academic_year || raw.academicYear || raw.tahun_ajaran || raw.tahun_pelajaran || defaultAcademicYear
  ).trim()

  const major = String(raw.major || raw.jurusan || 'Umum').trim()
  const homeroomName = String(raw.homeroom_teacher_name || raw.homeroomTeacherName || raw.wali_kelas || '').trim()
  const homeroomId = raw.homeroom_teacher_id || raw.homeroomTeacherId || null
  const studentCount = parseInt(
    raw.student_count ?? raw.studentCount ?? raw.jumlah_siswa ?? raw.jumlahSiswa ?? raw.siswa ?? 0,
    10
  ) || 0
  const isActive = raw.is_active !== undefined ? !!raw.is_active : (raw.isActive !== undefined ? !!raw.isActive : true)

  return {
    id: raw.id || undefined,
    name,
    grade_level: gradeLevel,
    major,
    academic_year: academicYear,
    homeroom_teacher_id: homeroomId,
    homeroom_teacher_name: homeroomName,
    student_count: Math.max(0, studentCount),
    is_active: isActive,
    source: raw.source || undefined
  }
}

/**
 * Normalizes Teacher raw object to canonical schema
 */
export function toCanonicalTeacher(raw = {}) {
  const name = String(raw.name || raw.teacher_name || raw.teacherName || raw.nama_guru || '').trim()
  const code = String(raw.code || raw.teacher_code || raw.teacherCode || raw.kode || raw.kode_guru || '').trim().toUpperCase()
  
  let nip = raw.nip_nuptk || raw.nipNuptk || raw.nip || null
  if (nip) {
    nip = String(nip).trim()
    if (!nip) nip = null
  }

  const gender = String(raw.gender || raw.jenis_kelamin || '').trim()
  const employmentStatus = String(raw.employment_status || raw.employmentStatus || raw.status || 'Tetap').trim()
  const isCertified = raw.is_certified !== undefined ? !!raw.is_certified : (raw.isCertified !== undefined ? !!raw.isCertified : false)
  const subjectSpecialty = String(raw.subject_specialty || raw.subjectSpecialty || raw.spesialisasi || '').trim()
  const isActive = raw.is_active !== undefined ? !!raw.is_active : (raw.isActive !== undefined ? !!raw.isActive : true)

  return {
    id: raw.id || undefined,
    code: code || null,
    name,
    nip_nuptk: nip,
    gender: gender || null,
    employment_status: employmentStatus,
    is_certified: isCertified,
    subject_specialty: subjectSpecialty || null,
    is_active: isActive,
    source: raw.source || undefined
  }
}

/**
 * Normalizes Subject raw object to canonical schema
 */
export function toCanonicalSubject(raw = {}) {
  const code = String(raw.code || raw.subject_code || raw.subjectCode || raw.kode || raw.kode_mapel || '').trim().toUpperCase()
  const name = String(raw.name || raw.subject_name || raw.subjectName || raw.nama_mapel || '').trim()
  const category = String(raw.category || raw.kategori || raw.kelompok || 'Umum').trim()
  const weeklyHours = parseInt(raw.weekly_default_hours ?? raw.weeklyDefaultHours ?? raw.jam_mingguan ?? 2, 10) || 0
  const isActive = raw.is_active !== undefined ? !!raw.is_active : (raw.isActive !== undefined ? !!raw.isActive : true)

  return {
    id: raw.id || undefined,
    code,
    name,
    category,
    weekly_default_hours: Math.max(0, weeklyHours),
    is_active: isActive,
    source: raw.source || undefined
  }
}

/**
 * Normalizes Operating Day raw object to canonical schema
 */
export function toCanonicalOperatingDay(raw = {}) {
  const dayOfWeek = String(raw.day_of_week || raw.dayOfWeek || raw.hari || '').trim().toUpperCase()
  const dayName = String(raw.day_name || raw.dayName || raw.nama_hari || dayOfWeek).trim()
  const orderIndex = parseInt(raw.order_index ?? raw.orderIndex ?? 1, 10) || 1
  const isActive = raw.is_active !== undefined ? !!raw.is_active : (raw.isActive !== undefined ? !!raw.isActive : true)
  const totalSessions = parseInt(raw.total_sessions ?? raw.totalSessions ?? 0, 10) || 0

  return {
    id: raw.id || undefined,
    day_of_week: dayOfWeek,
    day_name: dayName,
    order_index: orderIndex,
    is_active: isActive,
    total_sessions: totalSessions,
    source: raw.source || undefined
  }
}

/**
 * Normalizes Time Session raw object to canonical schema
 */
export function toCanonicalTimeSession(raw = {}) {
  const sessionNumber = parseInt(raw.session_number ?? raw.sessionNumber ?? raw.jam_ke ?? 1, 10) || 1
  const sessionType = String(raw.session_type || raw.sessionType || raw.tipe || 'KBM').trim().toUpperCase()
  const name = String(raw.name || raw.nama_sesi || `Jam Ke-${sessionNumber}`).trim()
  const startTime = String(raw.start_time || raw.startTime || raw.waktu_mulai || '07:30').trim()
  const endTime = String(raw.end_time || raw.endTime || raw.waktu_selesai || '08:10').trim()
  const operatingDayId = raw.operating_day_id || raw.operatingDayId || null
  const isActive = raw.is_active !== undefined ? !!raw.is_active : (raw.isActive !== undefined ? !!raw.isActive : true)

  return {
    id: raw.id || undefined,
    operating_day_id: operatingDayId,
    session_number: sessionNumber,
    session_type: sessionType,
    name,
    start_time: startTime,
    end_time: endTime,
    is_active: isActive,
    source: raw.source || undefined
  }
}

/**
 * Computes deterministic UPSERT key for an entity
 * Throws UPSERT_UNSAFE_KEY if stable key components are missing
 */
export function computeUpsertKey(entityType, record, tenantId) {
  if (!tenantId) {
    const err = new Error('tenant_id wajib tersedia untuk komputasi upsert key')
    err.code = UPSERT_ERROR_UNSAFE_KEY
    throw err
  }

  const tid = String(tenantId).trim().toLowerCase()

  switch (entityType) {
    case 'classes': {
      const canonical = toCanonicalClass(record)
      if (!canonical.name || !canonical.academic_year) {
        const err = new Error(`Data kelas tidak memiliki name atau academic_year yang sah: ${JSON.stringify(record)}`)
        err.code = UPSERT_ERROR_UNSAFE_KEY
        throw err
      }
      return `${tid}:${canonical.academic_year}:${canonical.name.toLowerCase()}`
    }

    case 'teachers': {
      const canonical = toCanonicalTeacher(record)
      if (canonical.code) {
        return `${tid}:code:${canonical.code}`
      }
      if (canonical.name) {
        return `${tid}:name:${canonical.name.toLowerCase()}`
      }
      const err = new Error(`Data guru tidak memiliki code atau name yang sah untuk key upsert`)
      err.code = UPSERT_ERROR_UNSAFE_KEY
      throw err
    }

    case 'subjects': {
      const canonical = toCanonicalSubject(record)
      if (!canonical.code) {
        const err = new Error(`Data mapel wajib memiliki code unik untuk key upsert`)
        err.code = UPSERT_ERROR_UNSAFE_KEY
        throw err
      }
      return `${tid}:${canonical.code}`
    }

    case 'operating_days': {
      const canonical = toCanonicalOperatingDay(record)
      if (!canonical.day_of_week) {
        const err = new Error(`Data hari operasional tidak memiliki day_of_week`)
        err.code = UPSERT_ERROR_UNSAFE_KEY
        throw err
      }
      return `${tid}:${canonical.day_of_week}`
    }

    case 'time_sessions': {
      const canonical = toCanonicalTimeSession(record)
      if (!canonical.operating_day_id || !canonical.session_number) {
        const err = new Error(`Data sesi waktu memerlukan operating_day_id dan session_number`)
        err.code = UPSERT_ERROR_UNSAFE_KEY
        throw err
      }
      return `${tid}:${canonical.operating_day_id}:${canonical.session_number}`
    }

    default: {
      const err = new Error(`Entity type '${entityType}' tidak dikenali untuk UPSERT`)
      err.code = UPSERT_ERROR_UNSAFE_KEY
      throw err
    }
  }
}
