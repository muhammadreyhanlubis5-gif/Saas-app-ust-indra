import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createDefaultProfile,
  createDefaultOperatingDays,
  createDefaultKbmSessions,
  validateProfile,
  validateSessions,
  validateTimeOverlap,
  validateAcademicYear,
  formatIndonesianDate,
  DAYS_OF_WEEK
} from '../types/schoolSetup.js'
import { schoolSetupRepository } from '../core/schoolSetupRepository.js'

export const useSchoolSetupStore = defineStore('schoolSetup', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const schoolProfile = ref(createDefaultProfile())
  const operatingDays = ref(createDefaultOperatingDays())
  const kbmSessions = ref(createDefaultKbmSessions())

  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref(null)
  const validationErrors = ref({})
  const lastSavedAt = ref(null)
  const isDirty = ref(false)
  const isInitialized = ref(false)

  // ============================================================================
  // GETTERS / COMPUTED
  // ============================================================================
  const activeOperatingDays = computed(() => {
    return (operatingDays.value || []).filter((d) => d.isActive)
  })

  const activeOperatingDayNames = computed(() => {
    return activeOperatingDays.value.map((d) => d.dayName)
  })

  const activeKbmSessions = computed(() => {
    return (kbmSessions.value || []).filter((s) => s.isActive)
  })

  const kbmOnlySessions = computed(() => {
    return activeKbmSessions.value.filter((s) => s.sessionType === 'KBM')
  })

  const breakOnlySessions = computed(() => {
    return activeKbmSessions.value.filter((s) => s.sessionType === 'BREAK')
  })

  const totalTeachingHoursPerDay = computed(() => {
    return kbmOnlySessions.value.length
  })

  const totalWeeklyTeachingHours = computed(() => {
    return totalTeachingHoursPerDay.value * activeOperatingDays.value.length
  })

  // Status Validasi Langkah
  const isProfileValid = computed(() => {
    const res = validateProfile(schoolProfile.value, false)
    return res.valid
  })

  const isProfileComplete = computed(() => {
    return Boolean(schoolProfile.value.isValidated && isProfileValid.value)
  })

  const isOperatingDaysComplete = computed(() => {
    return activeOperatingDays.value.length >= 1
  })

  const isKbmSessionsComplete = computed(() => {
    if (kbmOnlySessions.value.length < 1) return false
    const res = validateSessions(kbmSessions.value)
    return res.valid
  })

  // Kesiapan Menuju Tahap Penjadwalan
  const isSchedulingReady = computed(() => {
    return isProfileComplete.value && isOperatingDaysComplete.value && isKbmSessionsComplete.value
  })

  // Persentase Kelengkapan Fondasi Sekolah (0 - 100%)
  const foundationCompletionPercentage = computed(() => {
    let score = 0
    if (isProfileComplete.value) score += 34
    else if (schoolProfile.value.principalName || schoolProfile.value.curriculumVicePrincipalName) score += 15

    if (isOperatingDaysComplete.value) score += 33
    if (isKbmSessionsComplete.value) score += 33
    return Math.min(score, 100)
  })

  // Format Tampilan Tanggal Pembuatan Jadwal dalam Bahasa Indonesia
  const formattedScheduleDate = computed(() => {
    return formatIndonesianDate(schoolProfile.value.scheduleCreatedDate)
  })

  // Teks Ringkasan Hari Aktif
  const activeDaysSummary = computed(() => {
    const names = activeOperatingDayNames.value
    if (names.length === 0) return 'Belum ada hari KBM aktif'
    return `${names.join(', ')} (${names.length} hari)`
  })

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Muat data setup sekolah dari repository (API + local fallback)
   */
  async function loadSchoolSetup(forcedTenantId = '') {
    isLoading.value = true
    error.value = null

    try {
      const tenantId = forcedTenantId || 
        (typeof localStorage !== 'undefined' ? (localStorage.getItem('school_id') || localStorage.getItem('tenant_id') || '') : '')

      const schoolNameFallback = typeof localStorage !== 'undefined'
        ? (localStorage.getItem('school_name') || localStorage.getItem('license_school_name') || localStorage.getItem('user_name') || 'Sekolah Terdaftar')
        : 'Sekolah Terdaftar'

      const data = await schoolSetupRepository.getSetup(tenantId)

      if (data.profile) {
        schoolProfile.value = {
          ...data.profile,
          schoolName: data.profile.schoolName || schoolNameFallback
        }
      }

      if (data.operatingDays && data.operatingDays.length > 0) {
        operatingDays.value = data.operatingDays
      }

      if (data.kbmSessions && data.kbmSessions.length > 0) {
        kbmSessions.value = data.kbmSessions
      }

      isDirty.value = false
      isInitialized.value = true
    } catch (err) {
      console.error('[SchoolSetupStore] Gagal memuat data setup:', err)
      error.value = err.message || 'Gagal memuat konfigurasi sekolah.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Simpan Profil Sekolah (Draft vs Validasi Penuh)
   * @param {boolean} [isDraft=false]
   * @returns {Promise<{ success: boolean, errors?: Record<string, string>, message?: string }>}
   */
  async function saveSchoolProfile(isDraft = false) {
    if (isSaving.value) {
      return { success: false, message: 'Proses penyimpanan profil sedang berjalan. Mohon tunggu.' }
    }
    validationErrors.value = {}
    error.value = null

    // Validasi aturan bisnis
    const validation = validateProfile(schoolProfile.value, isDraft)
    if (!validation.valid) {
      validationErrors.value = validation.errors
      const firstErr = Object.values(validation.errors)[0]
      error.value = firstErr || 'Validasi formulir tidak terpenuhi.'
      return { success: false, errors: validation.errors, message: error.value }
    }

    // Validasi minimal 1 hari KBM aktif jika validasi penuh
    if (!isDraft && activeOperatingDays.value.length === 0) {
      error.value = 'Minimal 1 hari aktif KBM wajib dipilih.'
      return { success: false, message: error.value }
    }

    isSaving.value = true
    try {
      const updatedProfile = await schoolSetupRepository.updateProfile(
        schoolProfile.value,
        activeOperatingDayNames.value,
        isDraft
      )

      schoolProfile.value = {
        ...updatedProfile,
        isValidated: !isDraft
      }

      // Sinkronkan juga operating days ke repository
      await schoolSetupRepository.updateOperatingDays(
        operatingDays.value,
        schoolProfile.value.tenantId
      )

      lastSavedAt.value = new Date().toISOString()
      isDirty.value = false

      return {
        success: true,
        message: isDraft
          ? 'Draft data lembaga berhasil disimpan.'
          : 'Data validasi lembaga dan hari KBM berhasil diverifikasi & disimpan.'
      }
    } catch (err) {
      console.error('[SchoolSetupStore] Gagal menyimpan profil:', err)
      error.value = err.message || 'Gagal menyimpan profil sekolah.'
      return { success: false, message: error.value }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Simpan Konfigurasi Hari Pelaksanaan KBM
   * @param {import('../types/schoolSetup.js').SchoolOperatingDay[]} [customDays]
   */
  async function saveOperatingDays(customDays = null) {
    if (isSaving.value) {
      return { success: false, message: 'Proses penyimpanan hari KBM sedang berjalan. Mohon tunggu.' }
    }
    if (customDays) {
      operatingDays.value = customDays
    }

    if (activeOperatingDays.value.length === 0) {
      error.value = 'Pilih minimal 1 hari aktif KBM di sekolah Anda.'
      return { success: false, message: error.value }
    }

    isSaving.value = true
    error.value = null
    try {
      await schoolSetupRepository.updateOperatingDays(
        operatingDays.value,
        schoolProfile.value.tenantId
      )
      isDirty.value = false
      lastSavedAt.value = new Date().toISOString()
      return { success: true, message: 'Hari pelaksanaan KBM berhasil disimpan.' }
    } catch (err) {
      error.value = err.message || 'Gagal menyimpan hari KBM.'
      return { success: false, message: error.value }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Toggle status aktif suatu hari
   * @param {number} dayOfWeek (1 - 7)
   */
  function toggleDay(dayOfWeek) {
    const day = operatingDays.value.find((d) => d.dayOfWeek === dayOfWeek)
    if (!day) return { success: false }

    // Jika ingin menonaktifkan, pastikan bukan hari aktif terakhir
    if (day.isActive && activeOperatingDays.value.length <= 1) {
      error.value = 'Minimal harus ada 1 hari pelaksanaan KBM yang aktif.'
      return { success: false, message: error.value }
    }

    day.isActive = !day.isActive
    isDirty.value = true
    return { success: true, isActive: day.isActive }
  }

  /**
   * Simpan Sesi & Waktu KBM dengan validasi overlap ketat
   * @param {import('../types/schoolSetup.js').KbmSession[]} [customSessions]
   */
  async function saveKbmSessions(customSessions = null) {
    if (isSaving.value) {
      return { success: false, message: 'Proses penyimpanan sesi KBM sedang berjalan. Mohon tunggu.' }
    }
    if (customSessions) {
      kbmSessions.value = customSessions
    }

    // Validasi bisnis sesi
    const validation = validateSessions(kbmSessions.value)
    if (!validation.valid) {
      error.value = validation.error || 'Konfigurasi sesi KBM tidak valid.'
      return { success: false, message: error.value }
    }

    isSaving.value = true
    error.value = null

    try {
      await schoolSetupRepository.updateKbmSessions(
        kbmSessions.value,
        schoolProfile.value.tenantId,
        activeOperatingDayNames.value
      )

      isDirty.value = false
      lastSavedAt.value = new Date().toISOString()
      return { success: true, message: 'Konfigurasi sesi KBM berhasil disimpan.' }
    } catch (err) {
      error.value = err.message || 'Gagal menyimpan sesi KBM.'
      return { success: false, message: error.value }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Tambah sesi KBM baru secara otomatis
   * @param {'KBM' | 'BREAK'} sessionType
   */
  function addSession(sessionType = 'KBM') {
    const list = kbmSessions.value
    let nextStart = '07:30'
    let nextEnd = sessionType === 'BREAK' ? '08:00' : '08:10'

    if (list.length > 0) {
      const last = list[list.length - 1]
      if (last.endTime) {
        nextStart = last.endTime
        const [h, m] = last.endTime.split(':').map(Number)
        const duration = sessionType === 'BREAK' ? 20 : 40
        const totalMin = h * 60 + m + duration
        const endH = String(Math.floor(totalMin / 60) % 24).padStart(2, '0')
        const endM = String(totalMin % 60).padStart(2, '0')
        nextEnd = `${endH}:${endM}`
      }
    }

    const currentKbmCount = list.filter((s) => s.sessionType === 'KBM').length
    const nextKbmNum = sessionType === 'KBM' ? currentKbmCount + 1 : 0
    const label = sessionType === 'BREAK' ? 'Istirahat' : `Jam Ke-${nextKbmNum}`

    const newSession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tenantId: schoolProfile.value.tenantId,
      sessionNumber: nextKbmNum,
      label,
      startTime: nextStart,
      endTime: nextEnd,
      sessionType,
      isActive: true,
      sortOrder: list.length + 1
    }

    kbmSessions.value.push(newSession)
    isDirty.value = true
    return newSession
  }

  /**
   * Update sesi tertentu
   * @param {string} id
   * @param {Partial<import('../types/schoolSetup.js').KbmSession>} updates
   */
  function updateSession(id, updates) {
    const idx = kbmSessions.value.findIndex((s) => s.id === id)
    if (idx === -1) return false

    kbmSessions.value[idx] = {
      ...kbmSessions.value[idx],
      ...updates
    }
    isDirty.value = true
    return true
  }

  /**
   * Hapus sesi berdasarkan id
   * @param {string} id
   */
  function removeSession(id) {
    const idx = kbmSessions.value.findIndex((s) => s.id === id)
    if (idx === -1) return false

    kbmSessions.value.splice(idx, 1)

    // Re-index sortOrder & sessionNumber untuk tipe KBM
    let kbmCount = 0
    kbmSessions.value.forEach((s, i) => {
      s.sortOrder = i + 1
      if (s.sessionType === 'KBM') {
        kbmCount++
        s.sessionNumber = kbmCount
        if (!s.label || s.label.startsWith('Jam Ke-')) {
          s.label = `Jam Ke-${kbmCount}`
        }
      }
    })

    isDirty.value = true
    return true
  }

  /**
   * Geser urutan sesi ke atas atau ke bawah
   * @param {string} id
   * @param {'up' | 'down'} direction
   */
  function reorderSession(id, direction) {
    const idx = kbmSessions.value.findIndex((s) => s.id === id)
    if (idx === -1) return false

    if (direction === 'up' && idx > 0) {
      const temp = kbmSessions.value[idx]
      kbmSessions.value[idx] = kbmSessions.value[idx - 1]
      kbmSessions.value[idx - 1] = temp
    } else if (direction === 'down' && idx < kbmSessions.value.length - 1) {
      const temp = kbmSessions.value[idx]
      kbmSessions.value[idx] = kbmSessions.value[idx + 1]
      kbmSessions.value[idx + 1] = temp
    } else {
      return false
    }

    // Refresh sortOrder & KBM numbers
    let kbmCount = 0
    kbmSessions.value.forEach((s, i) => {
      s.sortOrder = i + 1
      if (s.sessionType === 'KBM') {
        kbmCount++
        s.sessionNumber = kbmCount
      }
    })

    isDirty.value = true
    return true
  }

  /**
   * Toggle status aktif suatu sesi
   * @param {string} id
   */
  function toggleSessionActive(id) {
    const session = kbmSessions.value.find((s) => s.id === id)
    if (!session) return false

    session.isActive = !session.isActive
    isDirty.value = true
    return true
  }

  /**
   * Reset Sesi ke Konfigurasi Awal
   */
  function resetToDefaultSessions() {
    kbmSessions.value = createDefaultKbmSessions(schoolProfile.value.tenantId)
    isDirty.value = true
    return kbmSessions.value
  }

  /**
   * Update flag dirty
   */
  function markDirty(val = true) {
    isDirty.value = val
  }

  /**
   * Reset status error
   */
  function resetError() {
    error.value = null
    validationErrors.value = {}
  }

  return {
    // State
    schoolProfile,
    operatingDays,
    kbmSessions,
    isLoading,
    isSaving,
    error,
    validationErrors,
    lastSavedAt,
    isDirty,
    isInitialized,

    // Computed / Getters
    activeOperatingDays,
    activeOperatingDayNames,
    activeKbmSessions,
    kbmOnlySessions,
    breakOnlySessions,
    totalTeachingHoursPerDay,
    totalWeeklyTeachingHours,
    isProfileValid,
    isProfileComplete,
    isOperatingDaysComplete,
    isKbmSessionsComplete,
    isSchedulingReady,
    foundationCompletionPercentage,
    formattedScheduleDate,
    activeDaysSummary,

    // Actions
    loadSchoolSetup,
    saveSchoolProfile,
    saveOperatingDays,
    toggleDay,
    saveKbmSessions,
    addSession,
    updateSession,
    removeSession,
    reorderSession,
    toggleSessionActive,
    resetToDefaultSessions,
    markDirty,
    resetError
  }
})
