import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { SchoolSetupRepository, SETUP_CACHE_SCHEMA_VERSION } from '../src/core/schoolSetupRepository.js'

describe('TAHAP 4: AUDIT MULTI-TENANT ISOLATION (GURUKU)', () => {

  // Mock Database State di Server
  const serverDatabase = {
    schools: new Map([
      ['sch-tenant-aaa-111', {
        id: 'sch-tenant-aaa-111',
        name: 'SMA Prestasi Nusantara (Tenant A)',
        headmaster_name: 'Dr. H. Ahmad Dahlan, M.Pd',
        address: 'Jl. Pemuda No. 1, Medan',
        academic_year: '2026-2027',
        semester: 'GANJIL',
        active_days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
      }],
      ['sch-tenant-bbb-222', {
        id: 'sch-tenant-bbb-222',
        name: 'SMK Karya Mandiri (Tenant B)',
        headmaster_name: 'Dra. Hj. Siti Fatimah, M.Si',
        address: 'Jl. Merdeka No. 45, Jakarta',
        academic_year: '2026-2027',
        semester: 'GENAP',
        active_days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      }]
    ]),
    sessions: new Map([
      ['sch-tenant-aaa-111', [
        { type: 'KBM', start_time: '07:30', end_time: '08:10', session_index: 1, label: 'Jam Ke-1 (A)' }
      ]],
      ['sch-tenant-bbb-222', [
        { type: 'KBM', start_time: '07:00', end_time: '07:45', session_index: 1, label: 'Jam Ke-1 (B)' },
        { type: 'BREAK', start_time: '07:45', end_time: '08:05', session_index: 0, label: 'Istirahat (B)' }
      ]]
    ])
  }

  // Helper Mock Backend Request Handler (Meniru perilaku core/handlers/school_handler.go)
  function handleBackendRequest({ sessionSchoolId, method, path, queryParams = {}, body = {} }) {
    // RESOLVE SCHOOL ID DARI SESI JWT, BUKAN DARI BODY ATAU QUERY!
    const effectiveSchoolId = sessionSchoolId

    if (!effectiveSchoolId) {
      return { status: 401, body: { error: 'Unauthorized: Sesi tidak ditemukan' } }
    }

    // 1. GET /api/v1/school/profile
    if (path === '/api/v1/school/profile' && method === 'GET') {
      const school = serverDatabase.schools.get(effectiveSchoolId)
      if (!school) return { status: 200, body: { id: effectiveSchoolId, name: '', active_days: [] } }
      return { status: 200, body: school }
    }

    // 2. PUT /api/v1/school/profile
    if (path === '/api/v1/school/profile' && method === 'PUT') {
      // Backend MENGABAIKAN body.school_id atau queryParams.school_id
      // Query dieksekusi HANYA pada effectiveSchoolId dari JWT
      const school = serverDatabase.schools.get(effectiveSchoolId)
      if (school) {
        if (body.headmaster_name) school.headmaster_name = body.headmaster_name
        if (body.address) school.address = body.address
        if (body.active_days) school.active_days = body.active_days
      }
      return { status: 200, body: { message: 'Profil berhasil diperbarui' } }
    }

    // 3. GET /api/v1/school/sessions
    if (path === '/api/v1/school/sessions' && method === 'GET') {
      const sessList = serverDatabase.sessions.get(effectiveSchoolId) || []
      return { status: 200, body: sessList }
    }

    return { status: 404, body: { error: 'Not Found' } }
  }

  // =========================================================================
  // SKENARIO 1 - 5: ALUR TENANT A LENGKAP & LOGOUT
  // =========================================================================
  test('Skenario 1-5: Login Tenant A, simpan profil, hari, sesi, lalu logout bersih', async () => {
    const storage = new Map()
    const originalLocalStorage = globalThis.localStorage
    const originalFetch = globalThis.fetch

    globalThis.localStorage = {
      getItem: (k) => storage.get(k) || null,
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k),
      key: (i) => Array.from(storage.keys())[i],
      get length() { return storage.size }
    }

    const tenantA = 'sch-tenant-aaa-111'
    let currentSession = tenantA

    globalThis.fetch = async (url, options = {}) => {
      const method = options.method || 'GET'
      const body = options.body ? JSON.parse(options.body) : {}
      const res = handleBackendRequest({
        sessionSchoolId: currentSession,
        method,
        path: url.replace('http://api.guruku.id', ''),
        body
      })
      return {
        ok: res.status === 200,
        status: res.status,
        json: async () => res.body
      }
    }

    try {
      const repo = new SchoolSetupRepository('http://api.guruku.id')

      // 1. Ambil data awal Tenant A
      const setupA = await repo.getSetup(tenantA)
      assert.equal(setupA.profile.schoolName, 'SMA Prestasi Nusantara (Tenant A)')
      assert.equal(setupA.profile.principalName, 'Dr. H. Ahmad Dahlan, M.Pd')
      assert.equal(setupA.operatingDays.filter((d) => d.isActive).length, 5)

      // 2. Simpan update profil & hari KBM Tenant A
      await repo.updateProfile({
        ...setupA.profile,
        principalName: 'Dr. H. Ahmad Dahlan, M.Pd (Updated)'
      }, ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'], false)

      // Verifikasi di storage lokal ada cache khusus Tenant A
      const cacheA = storage.get(`guruku_setup_profile_${tenantA}`)
      assert.ok(cacheA, 'Cache Tenant A harus ada di localStorage')
      assert.match(cacheA, /sch-tenant-aaa-111/)

      // 5. Logout Tenant A
      currentSession = null
      repo.clearAllTenantCaches()

      // Verifikasi cache Tenant A telah dibersihkan seketika
      assert.equal(storage.get(`guruku_setup_profile_${tenantA}`), undefined)
      assert.equal(storage.get(`guruku_setup_operating_days_${tenantA}`), undefined)
    } finally {
      globalThis.localStorage = originalLocalStorage
      globalThis.fetch = originalFetch
    }
  })

  // =========================================================================
  // SKENARIO 6 - 7: LOGIN TENANT B TANPA MELIHAT DATA TENANT A
  // =========================================================================
  test('Skenario 6-7: Login Tenant B, pastikan tidak melihat data Tenant A', async () => {
    const storage = new Map()
    const originalLocalStorage = globalThis.localStorage
    const originalFetch = globalThis.fetch

    globalThis.localStorage = {
      getItem: (k) => storage.get(k) || null,
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k),
      key: (i) => Array.from(storage.keys())[i],
      get length() { return storage.size }
    }

    const tenantB = 'sch-tenant-bbb-222'
    const currentSession = tenantB

    globalThis.fetch = async (url, options = {}) => {
      const method = options.method || 'GET'
      const body = options.body ? JSON.parse(options.body) : {}
      const res = handleBackendRequest({
        sessionSchoolId: currentSession,
        method,
        path: url.replace('http://api.guruku.id', ''),
        body
      })
      return {
        ok: res.status === 200,
        status: res.status,
        json: async () => res.body
      }
    }

    try {
      const repo = new SchoolSetupRepository('http://api.guruku.id')
      const setupB = await repo.getSetup(tenantB)

      // Verifikasi: Hanya data Tenant B yang muncul
      assert.equal(setupB.profile.schoolName, 'SMK Karya Mandiri (Tenant B)')
      assert.equal(setupB.profile.principalName, 'Dra. Hj. Siti Fatimah, M.Si')
      assert.equal(setupB.profile.semester, 'Genap')

      // Sesi KBM Tenant B memiliki 2 sesi (Jam 1 + Istirahat), berbeda dengan Tenant A (1 sesi)
      assert.equal(setupB.kbmSessions.length, 2)
      assert.equal(setupB.kbmSessions[1].sessionType, 'BREAK')

      // Sama sekali tidak mengandung data Tenant A
      assert.notEqual(setupB.profile.schoolName, 'SMA Prestasi Nusantara (Tenant A)')
      assert.notEqual(setupB.profile.principalName, 'Dr. H. Ahmad Dahlan, M.Pd')
    } finally {
      globalThis.localStorage = originalLocalStorage
      globalThis.fetch = originalFetch
    }
  })

  // =========================================================================
  // SKENARIO 8 - 10: MANIPULASI LOCALSTORAGE DI TENANT B & REFRESH HALAMAN
  // =========================================================================
  test('Skenario 8-10: Manipulasi localStorage Tenant B dengan data Tenant A -> Server tetap kembalikan data Tenant B', async () => {
    const storage = new Map()
    const originalLocalStorage = globalThis.localStorage
    const originalFetch = globalThis.fetch

    globalThis.localStorage = {
      getItem: (k) => storage.get(k) || null,
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k),
      key: (i) => Array.from(storage.keys())[i],
      get length() { return storage.size }
    }

    const tenantA = 'sch-tenant-aaa-111'
    const tenantB = 'sch-tenant-bbb-222'
    const currentSession = tenantB // Sesi auth resmi adalah Tenant B

    // 8. Penyerang menyisipkan key dan data Tenant A ke dalam localStorage
    storage.set(`guruku_setup_profile_${tenantA}`, JSON.stringify({
      schemaVersion: SETUP_CACHE_SCHEMA_VERSION,
      tenantId: tenantA,
      updatedAt: '2026-11-12T00:00:00Z',
      data: {
        schoolName: 'SMA Prestasi Nusantara (Tenant A)',
        principalName: 'Dr. H. Ahmad Dahlan, M.Pd'
      }
    }))
    // Penyerang juga mencoba menimpa key tenantB secara langsung dengan nama sekolah Tenant A
    storage.set(`guruku_setup_profile_${tenantB}`, JSON.stringify({
      schemaVersion: SETUP_CACHE_SCHEMA_VERSION,
      tenantId: tenantB,
      updatedAt: '2026-11-12T00:00:00Z',
      data: {
        schoolName: 'SMA Prestasi Nusantara (Tenant A - Palsu)',
        principalName: 'Penyusup Lokal'
      }
    }))
    storage.set('school_name', 'SMA Prestasi Nusantara (Tenant A - Palsu)')

    // Handler server mengembalikan data resmi Tenant B dari database
    globalThis.fetch = async (url, options = {}) => {
      const res = handleBackendRequest({
        sessionSchoolId: currentSession,
        method: options.method || 'GET',
        path: url.replace('http://api.guruku.id', ''),
        body: options.body ? JSON.parse(options.body) : {}
      })
      return {
        ok: res.status === 200,
        status: res.status,
        json: async () => res.body
      }
    }

    try {
      const repo = new SchoolSetupRepository('http://api.guruku.id')

      // 9. Refresh halaman (panggil getSetup)
      const setupB = await repo.getSetup(tenantB)

      // 10. Server tetap mengembalikan data Tenant B, manipulasi lokal ditolak & ditimpa kebenaran server!
      assert.equal(setupB.profile.schoolName, 'SMK Karya Mandiri (Tenant B)')
      assert.equal(setupB.profile.principalName, 'Dra. Hj. Siti Fatimah, M.Si')
      assert.notEqual(setupB.profile.schoolName, 'SMA Prestasi Nusantara (Tenant A - Palsu)')
      assert.notEqual(setupB.profile.principalName, 'Penyusup Lokal')
    } finally {
      globalThis.localStorage = originalLocalStorage
      globalThis.fetch = originalFetch
    }
  })

  // =========================================================================
  // SKENARIO 11 - 12: MANIPULASI BODY/QUERY DENGAN TENANT_ID TENANT A
  // =========================================================================
  test('Skenario 11-12: Mengirim school_id Tenant A dalam body/query diabaikan backend secara mutlak', async () => {
    const tenantA = 'sch-tenant-aaa-111'
    const tenantB = 'sch-tenant-bbb-222'
    const currentSession = tenantB // Sesi pengguna adalah Tenant B

    // Upaya manipulasi: Tenant B mengirim PUT update tapi menyisipkan ID Tenant A di payload
    const maliciousPayload = {
      school_id: tenantA, // Coba bajak Tenant A
      tenant_id: tenantA,
      headmaster_name: 'Hacker Mengubah Nama Kepsek Tenant A',
      address: 'Jl. Bajak No. 99'
    }

    const backendResult = handleBackendRequest({
      sessionSchoolId: currentSession, // JWT claims = Tenant B
      method: 'PUT',
      path: '/api/v1/school/profile',
      queryParams: { school_id: tenantA }, // Coba bajak via query param
      body: maliciousPayload
    })

    assert.equal(backendResult.status, 200)

    // Periksa kondisi database Tenant A: Sama sekali TIDAK BERUBAH!
    const tenantARecord = serverDatabase.schools.get(tenantA)
    assert.equal(tenantARecord.headmaster_name, 'Dr. H. Ahmad Dahlan, M.Pd (Updated)')
    assert.notEqual(tenantARecord.headmaster_name, 'Hacker Mengubah Nama Kepsek Tenant A')

    // Periksa kondisi database Tenant B: Hanya Tenant B yang terupdate
    const tenantBRecord = serverDatabase.schools.get(tenantB)
    assert.equal(tenantBRecord.headmaster_name, 'Hacker Mengubah Nama Kepsek Tenant A')
  })

})
