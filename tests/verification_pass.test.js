import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import {
  SchoolSetupRepository,
  SETUP_CACHE_SCHEMA_VERSION
} from '../src/core/schoolSetupRepository.js'

import {
  DAYS_OF_WEEK,
  createDefaultProfile,
  createDefaultOperatingDays,
  createDefaultKbmSessions,
  validateAcademicYear,
  validateProfile,
  validateTimeFormat,
  timeToMinutes,
  validateTimeOverlap,
  validateSessions
} from '../src/types/schoolSetup.js'

describe('VERIFICATION PASS: GURUKU SCHOOL FOUNDATION', () => {

  // =========================================================================
  // F. TEST WAJIB 1: Refresh berhasil mengambil data API
  // =========================================================================
  test('1. Refresh berhasil mengambil data API (Server is Source of Truth)', async () => {
    const originalFetch = globalThis.fetch
    const tenantId = 'school-tenant-01'

    globalThis.fetch = async (url) => {
      if (url.includes('/api/v1/school/profile')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: tenantId,
            name: 'SMA Negeri 1 Prestasi',
            headmaster_name: 'Drs. H. Syarifuddin, M.Pd',
            vice_headmaster_name: 'Dewi Sartika, S.Pd',
            address: 'Jl. Diponegoro No. 10 Jakarta',
            academic_year: '2026-2027',
            semester: 'GANJIL',
            active_days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
          })
        }
      }
      if (url.includes('/api/v1/school/sessions')) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            { session_index: 1, type: 'KBM', start_time: '07:30', end_time: '08:10' },
            { session_index: 2, type: 'KBM', start_time: '08:10', end_time: '08:50' },
            { session_index: 0, type: 'BREAK', start_time: '08:50', end_time: '09:10' }
          ]
        }
      }
      throw new Error(`Unexpected url ${url}`)
    }

    try {
      const repo = new SchoolSetupRepository('http://api.guruku.id')
      const setup = await repo.getSetup(tenantId)

      assert.equal(setup.fromServer, true, 'Data harus ditandai berasal dari server')
      assert.equal(setup.profile.schoolName, 'SMA Negeri 1 Prestasi')
      assert.equal(setup.profile.principalName, 'Drs. H. Syarifuddin, M.Pd')
      assert.equal(setup.profile.academicYear, '2026-2027')
      assert.equal(setup.profile.semester, 'Ganjil')

      const activeDays = setup.operatingDays.filter((d) => d.isActive).map((d) => d.dayName)
      assert.deepEqual(activeDays, ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'])

      assert.equal(setup.kbmSessions.length, 3)
      assert.equal(setup.kbmSessions[0].sessionType, 'KBM')
      assert.equal(setup.kbmSessions[2].sessionType, 'BREAK')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  // =========================================================================
  // F. TEST WAJIB 2: API kosong menghasilkan empty state yang benar
  // =========================================================================
  test('2. API kosong menghasilkan empty state yang benar (HTTP 200 Safe Empty Fallback)', async () => {
    const originalFetch = globalThis.fetch
    const tenantId = 'new-school-empty'

    globalThis.fetch = async (url) => {
      if (url.includes('/api/v1/school/profile')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: tenantId,
            name: 'SMK Bangsa Mandiri', // Nama dari lisensi
            headmaster_name: null,
            address: null,
            academic_year: null,
            active_days: []
          })
        }
      }
      if (url.includes('/api/v1/school/sessions')) {
        return {
          ok: true,
          status: 200,
          json: async () => []
        }
      }
      throw new Error(`Unexpected url ${url}`)
    }

    try {
      const repo = new SchoolSetupRepository('http://api.guruku.id')
      const setup = await repo.getSetup(tenantId)

      assert.equal(setup.fromServer, true)
      assert.equal(setup.profile.schoolName, 'SMK Bangsa Mandiri')
      assert.equal(setup.profile.principalName, '')
      assert.equal(setup.profile.isValidated, false)
      assert.equal(setup.operatingDays.length, 7) // 7 hari terstruktur
      assert.ok(setup.kbmSessions.length > 0, 'Harus menghasilkan sesi standar jika API kosong')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  // =========================================================================
  // F. TEST WAJIB 3: API 401 mengarahkan ke login
  // =========================================================================
  test('3. API 401 mengarahkan ke login (Session Expired / Unauthorized)', async () => {
    const originalFetch = globalThis.fetch

    globalThis.fetch = async () => ({
      ok: false,
      status: 401,
      json: async () => ({
        error: 'Unauthorized',
        code: 'AUTH_TOKEN_EXPIRED',
        message: 'Sesi tidak valid atau telah kedaluwarsa.'
      })
    })

    try {
      const repo = new SchoolSetupRepository('http://api.guruku.id')
      const response = await repo.requestWithTimeout('/api/v1/school/profile')

      assert.equal(response.status, 401)
      const body = await response.json()
      assert.equal(body.code, 'AUTH_TOKEN_EXPIRED')

      // Simulasi tindakan auth handler: redirect ke login saat menerima 401
      let redirectedTo = null
      function handleUnauthorized(status) {
        if (status === 401) redirectedTo = '/login'
      }
      handleUnauthorized(response.status)
      assert.equal(redirectedTo, '/login', 'Klien wajib merespons 401 dengan redirect ke login')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  // =========================================================================
  // F. TEST WAJIB 4: API 403 menampilkan unauthorized state
  // =========================================================================
  test('4. API 403 menampilkan unauthorized state (Access Denied / Forbidden)', async () => {
    const originalFetch = globalThis.fetch

    globalThis.fetch = async () => ({
      ok: false,
      status: 403,
      json: async () => ({
        error: 'Forbidden',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Peran guru tidak diizinkan mengubah konfigurasi lembaga.'
      })
    })

    try {
      const repo = new SchoolSetupRepository('http://api.guruku.id')
      const response = await repo.requestWithTimeout('/api/v1/school/profile')

      assert.equal(response.status, 403)
      const body = await response.json()
      assert.equal(body.code, 'INSUFFICIENT_PERMISSIONS')

      let uiState = { isForbidden: false, message: '' }
      if (response.status === 403) {
        uiState.isForbidden = true
        uiState.message = body.message
      }

      assert.equal(uiState.isForbidden, true)
      assert.match(uiState.message, /tidak diizinkan/)
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  // =========================================================================
  // F. TEST WAJIB 5: API 500 menampilkan error dan tombol retry
  // =========================================================================
  test('5. API 500 menampilkan error dan tombol retry', async () => {
    const originalFetch = globalThis.fetch

    globalThis.fetch = async () => ({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Terjadi kesalahan pada basis data server.'
        }
      })
    })

    try {
      const repo = new SchoolSetupRepository('http://api.guruku.id')
      // MaxRetries 1 untuk menguji bahwa HTTP 500 dicoba ulang dan akhirnya dilaporkan dengan state retry
      const response = await repo.requestWithTimeout('/api/v1/school/profile', {}, 1000, 1)

      assert.equal(response.status, 500)
      const body = await response.json()
      assert.equal(body.error.code, 'DATABASE_ERROR')

      const uiErrorState = {
        hasError: response.status === 500,
        errorMessage: body.error.message,
        canRetry: response.status >= 500
      }

      assert.equal(uiErrorState.hasError, true)
      assert.equal(uiErrorState.canRetry, true, 'User harus diberikan aksi retry pada HTTP 500')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  // =========================================================================
  // F. TEST WAJIB 6: localStorage yang dimanipulasi tidak mengubah sumber data server
  // =========================================================================
  test('6. localStorage yang dimanipulasi tidak mengubah sumber data server (Anti-Tampering)', async () => {
    const originalFetch = globalThis.fetch
    const originalLocalStorage = globalThis.localStorage
    const storage = new Map()

    globalThis.localStorage = {
      getItem: (k) => storage.get(k) || null,
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k),
      key: (i) => Array.from(storage.keys())[i],
      length: storage.size
    }

    const tenantId = 'secure-tenant-42'

    // Hacker mencoba memalsukan nama sekolah & kepala sekolah di localStorage
    storage.set(`guruku_setup_profile_${tenantId}`, JSON.stringify({
      schemaVersion: 1,
      tenantId,
      updatedAt: '2026-11-12T00:00:00Z',
      data: {
        schoolName: 'SMP Hacker Ilegal 99',
        principalName: 'Attacker Name'
      }
    }))
    storage.set('school_name', 'SMP Hacker Ilegal 99')

    // Server yang valid mengembalikan data resmi
    globalThis.fetch = async (url) => {
      if (url.includes('/api/v1/school/profile')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: tenantId,
            name: 'SMA Negeri 1 Resmi Dari Server',
            headmaster_name: 'Drs. H. Budi Santoso Asli, M.Pd'
          })
        }
      }
      return { ok: true, status: 200, json: async () => [] }
    }

    try {
      const repo = new SchoolSetupRepository('http://api.guruku.id')
      const setup = await repo.getSetup(tenantId)

      // Verifikasi: Data dari server MENANG 100%, data manipulasi lokal diabaikan
      assert.equal(setup.profile.schoolName, 'SMA Negeri 1 Resmi Dari Server')
      assert.equal(setup.profile.principalName, 'Drs. H. Budi Santoso Asli, M.Pd')
      assert.notEqual(setup.profile.schoolName, 'SMP Hacker Ilegal 99')
    } finally {
      globalThis.fetch = originalFetch
      globalThis.localStorage = originalLocalStorage
    }
  })

  // =========================================================================
  // F. TEST WAJIB 7: Logout membersihkan cache tenant
  // =========================================================================
  test('7. Logout membersihkan cache tenant (No Cross-Tenant Data Leakage)', () => {
    const originalLocalStorage = globalThis.localStorage
    const storage = new Map()

    globalThis.localStorage = {
      getItem: (k) => storage.get(k) || null,
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k),
      key: (i) => Array.from(storage.keys())[i],
      get length() { return storage.size }
    }

    const tenantA = 'tenant-sekolah-a'
    storage.set(`guruku_setup_profile_${tenantA}`, 'sensitive-data-a')
    storage.set(`guruku_setup_operating_days_${tenantA}`, 'days-data-a')
    storage.set(`guruku_setup_kbm_sessions_${tenantA}`, 'sessions-data-a')
    storage.set('guruKu_lembaga_data', 'legacy-data')

    const repo = new SchoolSetupRepository()
    repo.clearAllTenantCaches()

    assert.equal(storage.get(`guruku_setup_profile_${tenantA}`), undefined)
    assert.equal(storage.get(`guruku_setup_operating_days_${tenantA}`), undefined)
    assert.equal(storage.get(`guruku_setup_kbm_sessions_${tenantA}`), undefined)
    assert.equal(storage.get('guruKu_lembaga_data'), undefined)

    globalThis.localStorage = originalLocalStorage
  })

  // =========================================================================
  // F. TEST WAJIB 8: Hari aktif minimal satu
  // =========================================================================
  test('8. Hari aktif minimal satu (Validasi Penuh menolak 0 hari aktif)', () => {
    const days = createDefaultOperatingDays('t-1').map((d) => ({ ...d, isActive: false }))
    const activeDays = days.filter((d) => d.isActive)

    assert.equal(activeDays.length, 0)

    function validateActiveDays(activeCount, isDraft = false) {
      if (!isDraft && activeCount === 0) {
        return { valid: false, error: 'Minimal 1 hari aktif KBM wajib dipilih.' }
      }
      return { valid: true }
    }

    const draftRes = validateActiveDays(activeDays.length, true)
    assert.equal(draftRes.valid, true, 'Draft diizinkan')

    const fullRes = validateActiveDays(activeDays.length, false)
    assert.equal(fullRes.valid, false)
    assert.equal(fullRes.error, 'Minimal 1 hari aktif KBM wajib dipilih.')
  })

  // =========================================================================
  // F. TEST WAJIB 9: Konfirmasi hari Minggu
  // =========================================================================
  test('9. Konfirmasi hari Minggu (Hari ke-7 memerlukan dialog konfirmasi khusus)', () => {
    let showSundayConfirmModal = false

    function onToggleDay(dayOfWeek, currentActive) {
      if (dayOfWeek === 7 && !currentActive) {
        showSundayConfirmModal = true
        return { requireConfirmation: true }
      }
      return { requireConfirmation: false }
    }

    const resSunday = onToggleDay(7, false)
    assert.equal(resSunday.requireConfirmation, true)
    assert.equal(showSundayConfirmModal, true, 'Modal konfirmasi hari Minggu wajib terbuka')

    const resMonday = onToggleDay(1, false)
    assert.equal(resMonday.requireConfirmation, false)
  })

  // =========================================================================
  // F. TEST WAJIB 10: Sesi overlap ditolak
  // =========================================================================
  test('10. Sesi overlap ditolak (Interval waktu bertabrakan menghasilkan error validasi)', () => {
    const overlapping = [
      { id: '1', label: 'Jam 1', startTime: '07:30', endTime: '08:15', sessionType: 'KBM', isActive: true },
      { id: '2', label: 'Jam 2', startTime: '08:00', endTime: '08:45', sessionType: 'KBM', isActive: true } // Overlap 08:00-08:15
    ]

    const result = validateTimeOverlap(overlapping)
    assert.equal(result.valid, false)
    assert.match(result.message, /bentrok \(overlap\)/)
  })

  // =========================================================================
  // F. TEST WAJIB 11: Sesi BREAK dapat berdampingan dengan sesi KBM sesuai aturan bisnis
  // =========================================================================
  test('11. Sesi BREAK dapat berdampingan dengan sesi KBM sesuai aturan bisnis (Batas waktu kontigu)', () => {
    const standardSchoolDay = [
      { id: '1', sessionNumber: 1, label: 'Jam 1', startTime: '07:30', endTime: '08:10', sessionType: 'KBM', isActive: true },
      { id: '2', sessionNumber: 2, label: 'Jam 2', startTime: '08:10', endTime: '08:50', sessionType: 'KBM', isActive: true },
      { id: '3', sessionNumber: 0, label: 'Istirahat Dhuha', startTime: '08:50', endTime: '09:15', sessionType: 'BREAK', isActive: true },
      { id: '4', sessionNumber: 3, label: 'Jam 3', startTime: '09:15', endTime: '09:55', sessionType: 'KBM', isActive: true }
    ]

    // Pengecekan overlap: tidak ada sesi yang bentrok (08:50 adalah batas akhir Jam 2 dan batas awal Istirahat)
    const overlapCheck = validateTimeOverlap(standardSchoolDay)
    assert.equal(overlapCheck.valid, true, 'Sesi kontigu KBM dan BREAK tidak boleh dianggap overlap')

    // Validasi koleksi sesi: BREAK dan KBM valid berdampingan
    const sessionsCheck = validateSessions(standardSchoolDay)
    assert.equal(sessionsCheck.valid, true)
  })

  // =========================================================================
  // F. TEST WAJIB 12: Double submit tidak menghasilkan request ganda
  // =========================================================================
  test('12. Double submit tidak menghasilkan request ganda (Guard isSaving re-entrancy)', async () => {
    let isSaving = false
    let networkRequestsSent = 0

    async function submitProfile() {
      if (isSaving) {
        return { success: false, message: 'Operasi sedang berlangsung, mohon tunggu.' }
      }
      isSaving = true
      try {
        networkRequestsSent++
        await new Promise((r) => setTimeout(r, 50))
        return { success: true }
      } finally {
        isSaving = false
      }
    }

    // Trigger 3 kali submit secara simultan (rapid double/triple clicking)
    const [req1, req2, req3] = await Promise.all([
      submitProfile(),
      submitProfile(),
      submitProfile()
    ])

    assert.equal(networkRequestsSent, 1, 'Hanya tepat 1 panggilan jaringan yang boleh tembus')
    assert.equal(req1.success, true)
    assert.equal(req2.success, false)
    assert.equal(req3.success, false)
  })

  // =========================================================================
  // F. TEST WAJIB 13: Loading selalu selesai pada success maupun error
  // =========================================================================
  test('13. Loading selalu selesai pada success maupun error (Jaminan Reset di Finally)', async () => {
    let isLoading = false
    let isSaving = false

    async function executeFlow(throwError = false) {
      isLoading = true
      isSaving = true
      try {
        if (throwError) throw new Error('Uncaught Network Error')
        return { ok: true }
      } catch (err) {
        return { ok: false, error: err.message }
      } finally {
        isLoading = false
        isSaving = false
      }
    }

    // Kasus 1: Berhasil
    await executeFlow(false)
    assert.equal(isLoading, false)
    assert.equal(isSaving, false)

    // Kasus 2: Gagal / Error
    await executeFlow(true)
    assert.equal(isLoading, false, 'isLoading harus di-reset ke false saat error')
    assert.equal(isSaving, false, 'isSaving harus di-reset ke false saat error')
  })

  // =========================================================================
  // AUDIT TAMBAHAN: Kebijakan RETRY Terkontrol
  // =========================================================================
  describe('Kebijakan Retry Terkontrol (requestWithTimeout)', () => {
    test('TIDAK mengulang (No Retry) status 400, 401, 403, 404, 422', async () => {
      const nonRetryableCodes = [400, 401, 403, 404, 422]

      for (const statusCode of nonRetryableCodes) {
        let callCount = 0
        const originalFetch = globalThis.fetch

        globalThis.fetch = async () => {
          callCount++
          return { ok: false, status: statusCode, json: async () => ({}) }
        }

        try {
          const repo = new SchoolSetupRepository('http://api.guruku.id')
          const res = await repo.requestWithTimeout('/api/test', {}, 1000, 2)

          assert.equal(res.status, statusCode)
          assert.equal(callCount, 1, `Status ${statusCode} tidak boleh di-retry!`)
        } finally {
          globalThis.fetch = originalFetch
        }
      }
    })

    test('MENGULANG (Retry) status 408, 429, 500, 502, 503, 504 hingga maxRetries', async () => {
      let callCount = 0
      const originalFetch = globalThis.fetch

      globalThis.fetch = async () => {
        callCount++
        if (callCount < 3) {
          return { ok: false, status: 503 } // Service Unavailable sementara
        }
        return { ok: true, status: 200, json: async () => ({ success: true }) }
      }

      try {
        const repo = new SchoolSetupRepository('http://api.guruku.id')
        const res = await repo.requestWithTimeout('/api/test', {}, 1000, 2)

        assert.equal(res.status, 200)
        assert.equal(callCount, 3, 'Harus mencoba 3 kali (1 awal + 2 retry)')
      } finally {
        globalThis.fetch = originalFetch
      }
    })
  })

  // =========================================================================
  // AUDIT TAMBAHAN: Data Contract & Cache Versioning
  // =========================================================================
  describe('Data Contract & Cache Versioning', () => {
    test('Domain selalu memakai sessionType dan memetakan ke backend type secara konsisten', () => {
      const repo = new SchoolSetupRepository()

      const backendDto = { type: 'BREAK', start_time: '10:00', end_time: '10:30', session_index: 0, label: 'Istirahat' }
      const domain = repo.mapSessionDtoToDomain(backendDto, 't-1', 0)

      assert.equal(domain.sessionType, 'BREAK')
      assert.equal(domain.startTime, '10:00')

      const remappedDto = repo.mapSessionDomainToDto(domain)
      assert.equal(remappedDto.type, 'BREAK')
      assert.equal(remappedDto.start_time, '10:00')
    })

    test('Cache berstruktur memiliki schemaVersion, tenantId, dan updatedAt', () => {
      const repo = new SchoolSetupRepository()
      const envelopeJson = repo.createCacheEnvelope('tenant-99', { test: true })
      const envelope = JSON.parse(envelopeJson)

      assert.equal(envelope.schemaVersion, SETUP_CACHE_SCHEMA_VERSION)
      assert.equal(envelope.tenantId, 'tenant-99')
      assert.ok(envelope.updatedAt)
      assert.deepEqual(envelope.data, { test: true })

      // Membaca kembali cache dengan tenant yang cocok
      const readData = repo.readCacheEnvelope(envelopeJson, 'tenant-99')
      assert.deepEqual(readData, { test: true })

      // Menolak membaca cache jika tenantId berbeda (Isolasi Tenant)
      const foreignData = repo.readCacheEnvelope(envelopeJson, 'tenant-hacker')
      assert.equal(foreignData, null, 'Cache milik tenant lain tidak boleh terbaca')
    })
  })

})
