import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.js'

export const useWorkspaceStore = defineStore('workspace', () => {
  // State machine: 'idle' | 'loading' | 'ready' | 'error' | 'offline'
  const status = ref('idle')
  const step = ref('Menyiapkan Ruang Kerja...')
  const progress = ref(0)
  const initError = ref(null)
  const isOnline = ref(navigator.onLine)
  const schoolProfile = ref({
    name: '',
    npsn: '',
    address: '',
    headmaster_name: '',
    vice_curriculum: '',
    academic_year: '2025-2026'
  })

  // Master stats
  const stats = ref({
    totalGuru: 0,
    totalKelas: 0,
    totalMapel: 0,
    jamMengajar: 0,
    progress: 0
  })

  const isLoading = computed(() => status.value === 'loading')
  const isReady = computed(() => status.value === 'ready')
  const hasError = computed(() => status.value === 'error')

  // Helper structured logging
  function logStartupStep(stepName, stepProgress, extra = {}) {
    console.info('[GuruKu Startup]', {
      timestamp: new Date().toISOString(),
      step: stepName,
      progress: `${stepProgress}%`,
      status: status.value,
      isOnline: isOnline.value,
      ...extra
    })
  }

  // Listener status jaringan
  window.addEventListener('online', () => {
    isOnline.value = true
    if (status.value === 'offline') status.value = 'ready'
    console.info('[GuruKu Network] Koneksi online terdeteksi kembali.')
  })
  window.addEventListener('offline', () => {
    isOnline.value = false
    status.value = 'offline'
    console.warn('[GuruKu Network] Mode offline diaktifkan.')
  })

  // Timeout wrapper dengan AbortSignal
  async function fetchWithTimeout(url, options = {}, timeoutMs = 4500) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Otomatis menyertakan HttpOnly cookie
        signal: controller.signal
      })
      return response
    } finally {
      clearTimeout(timer)
    }
  }

  // Load School Profile dengan toleransi kegagalan (tidak memblokir dashboard)
  async function loadSchoolProfile(schoolId) {
    if (!schoolId) {
      const cached = localStorage.getItem('guruKu_lembaga_data') || localStorage.getItem('guruKu_school_profile')
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          schoolProfile.value = { ...schoolProfile.value, ...parsed }
        } catch (_) {}
      }
      return schoolProfile.value
    }

    try {
      const res = await fetchWithTimeout('/api/v1/school/profile', {
        headers: {
          'X-School-ID': schoolId
        }
      }, 4000)

      if (res.ok) {
        const data = await res.json()
        if (data && data.name) {
          schoolProfile.value = { ...schoolProfile.value, ...data }
          localStorage.setItem('school_name', data.name)
          localStorage.setItem('guruKu_school_profile', JSON.stringify(schoolProfile.value))
        }
      } else {
        // Fallback local cache
        const cached = localStorage.getItem('guruKu_lembaga_data') || localStorage.getItem('guruKu_school_profile')
        if (cached) {
          schoolProfile.value = { ...schoolProfile.value, ...JSON.parse(cached) }
        }
      }
    } catch (e) {
      console.warn('[Workspace] Profile fetch timeout/network issue, using local cache fallback:', e.message)
      const cached = localStorage.getItem('guruKu_lembaga_data') || localStorage.getItem('guruKu_school_profile')
      if (cached) {
        try {
          schoolProfile.value = { ...schoolProfile.value, ...JSON.parse(cached) }
        } catch (_) {}
      }
    }

    return schoolProfile.value
  }

  // Load Master Data penting untuk menghitung metrik kesiapan (Guru, Kelas, Mapel, Pengampu)
  async function loadMasterData() {
    let teacherCount = 0
    let classCount = 0
    let mapelCount = 0
    let totalJam = 0

    // 1. Baca data dari local cache
    try {
      const teachers = JSON.parse(localStorage.getItem('guruKu_teachers') || '[]')
      if (Array.isArray(teachers)) teacherCount = teachers.length
    } catch (_) {}

    try {
      const classes = JSON.parse(localStorage.getItem('guruKu_classes') || '[]')
      if (Array.isArray(classes)) classCount = classes.length
    } catch (_) {}

    try {
      const mapel = JSON.parse(localStorage.getItem('guruKu_mapel') || '[]')
      if (Array.isArray(mapel)) mapelCount = mapel.length
    } catch (_) {}

    try {
      const pengampu = JSON.parse(localStorage.getItem('guruKu_pengampu') || '{}')
      if (pengampu.rows && Array.isArray(pengampu.rows)) {
        pengampu.rows.forEach(r => {
          if (r.hours && Array.isArray(r.hours)) {
            r.hours.forEach(h => {
              totalJam += Number(h) || 0
            })
          }
        })
      }
    } catch (_) {}

    // Hitung progress kelengkapan (0-100%)
    let p = 0
    const isLembaga = localStorage.getItem('guruKu_lembaga_data') || localStorage.getItem('guruKu_lembaga_valid')
    if (isLembaga) p += 10
    if (classCount > 0) p += 20
    if (localStorage.getItem('guruKu_sesi_kbm')) p += 20
    if (teacherCount > 0) p += 20
    if (mapelCount > 0) p += 15
    if (totalJam > 0) p += 15

    stats.value = {
      totalGuru: teacherCount,
      totalKelas: classCount,
      totalMapel: mapelCount,
      jamMengajar: totalJam,
      progress: Math.min(p, 100)
    }

    return stats.value
  }

  // Inisialisasi Ruang Kerja dengan Pola Aman (try/catch/finally & hard timeout)
  async function initializeWorkspace(options = {}) {
    const authStore = useAuthStore()
    status.value = 'loading'
    initError.value = null
    progress.value = 10
    step.value = 'Memvalidasi kredensial & sesi akun...'
    logStartupStep(step.value, progress.value)

    let hardTimeoutId = null
    const hardTimeoutPromise = new Promise((_, reject) => {
      hardTimeoutId = setTimeout(() => {
        reject(new Error('WAKTU_INISIALISASI_HABIS'))
      }, 7000)
    })

    try {
      await Promise.race([
        (async () => {
          // Tahap 1: Validasi Sesi
          if (!options.skipAuthCheck) {
            const isValidSession = await authStore.restoreSession()
            if (!isValidSession) {
              throw new Error('SESI_TIDAK_VALID')
            }
          }

          progress.value = 35
          step.value = 'Memeriksa profil lembaga & status lisensi...'
          logStartupStep(step.value, progress.value)

          // Tahap 2: Load Profil Sekolah (dengan fallback)
          const sid = authStore.schoolId || localStorage.getItem('school_id')
          const profile = await loadSchoolProfile(sid)

          progress.value = 65
          const schoolDisplayName = profile?.name || 'sekolah tervalidasi'
          step.value = `Menyiapkan ruang kerja (${schoolDisplayName})...`
          logStartupStep(step.value, progress.value, { school: schoolDisplayName })

          // Tahap 3: Load Master Data
          await loadMasterData()

          progress.value = 90
          step.value = 'Sinkronisasi instan selesai...'
          logStartupStep(step.value, progress.value)

          await new Promise(r => setTimeout(r, 200))
          progress.value = 100
          status.value = 'ready'
          step.value = 'Ruang kerja siap digunakan'
          logStartupStep(step.value, progress.value)
        })(),
        hardTimeoutPromise
      ])
    } catch (err) {
      console.warn('[Workspace Init Warning]', err.message)
      if (err.message === 'SESI_TIDAK_VALID') {
        status.value = 'error'
        initError.value = {
          code: 'SESSION_INVALID',
          message: 'Sesi masuk Anda telah berakhir atau tidak valid. Silakan masuk kembali.',
          canRetry: false
        }
        await authStore.logout()
      } else if (err.message === 'WAKTU_INISIALISASI_HABIS') {
        // Fallback Cepat: Jangan biarkan aplikasi stuck selamanya! Masuk ke dashboard dengan data cached
        console.info('[Workspace] Melewati inisialisasi jaringan penuh (Fallback Cepat).')
        await loadMasterData()
        status.value = 'ready'
        progress.value = 100
        step.value = 'Ruang kerja siap (Mode Cepat)'
        logStartupStep(step.value, progress.value, { fallback: true })
      } else {
        status.value = 'error'
        initError.value = {
          code: 'INIT_FAILED',
          message: err.message || 'Terjadi gangguan saat memuat data ruang kerja.',
          canRetry: true
        }
      }
    } finally {
      if (hardTimeoutId) clearTimeout(hardTimeoutId)
      // Jaminan absolut: Status loading wajib berakhir
      if (status.value === 'loading') {
        status.value = 'ready'
      }
    }
  }

  // Retry initialization
  async function retry() {
    initError.value = null
    await initializeWorkspace()
  }

  // Reset status
  function reset() {
    status.value = 'idle'
    step.value = 'Menyiapkan Ruang Kerja...'
    progress.value = 0
    initError.value = null
  }

  return {
    status,
    step,
    progress,
    initError,
    isOnline,
    schoolProfile,
    stats,
    isLoading,
    isReady,
    hasError,
    initializeWorkspace,
    loadSchoolProfile,
    loadMasterData,
    retry,
    reset
  }
})
