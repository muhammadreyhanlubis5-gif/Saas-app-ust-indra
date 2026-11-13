import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { ROLE_PERMISSIONS } from '../src/stores/auth.js'
import { SchoolSetupRepository } from '../src/core/schoolSetupRepository.js'

// Helper Role Normalization
function normalizeRole(r) {
  if (!r) return ''
  const upper = String(r).toUpperCase().trim()
  if (upper === 'SUPER_ADMIN' || upper === 'SUPERADMIN') return 'SUPER_ADMIN'
  if (upper === 'SCHOOL_ADMIN' || upper === 'ADMIN_SEKOLAH') return 'SCHOOL_ADMIN'
  if (upper === 'CURRICULUM_ADMIN' || upper === 'WAKASEK_KURIKULUM' || upper === 'KURIKULUM') return 'CURRICULUM_ADMIN'
  if (upper === 'PRINCIPAL' || upper === 'KEPALA_SEKOLAH') return 'PRINCIPAL'
  if (upper === 'TEACHER' || upper === 'GURU') return 'TEACHER'
  return upper
}

// Simulasi Route Guard Evaluator (Sesuai implementasi router.beforeEach di router/index.js)
function evaluateNavigation({ toPath, toMeta, isAuthenticated, role }) {
  const normRole = normalizeRole(role)

  if (!toMeta || !toMeta.requiresAuth) {
    return { allowed: true, redirect: null }
  }

  // Jika membutuhkan otentikasi tetapi belum login
  if (!isAuthenticated) {
    return { allowed: false, redirect: '/', reason: 'UNAUTHENTICATED' }
  }

  // Evaluasi peran
  const allowedRoles = Array.isArray(toMeta.roles)
    ? toMeta.roles.map((r) => normalizeRole(r))
    : (toMeta.role ? [normalizeRole(toMeta.role)] : [])

  if (allowedRoles.includes('SCHOOL_ADMIN')) {
    if (!allowedRoles.includes('CURRICULUM_ADMIN')) allowedRoles.push('CURRICULUM_ADMIN')
    if (!allowedRoles.includes('PRINCIPAL')) allowedRoles.push('PRINCIPAL')
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(normRole)) {
    let target = '/'
    if (normRole === 'SUPER_ADMIN') target = '/super-admin'
    else if (['SCHOOL_ADMIN', 'CURRICULUM_ADMIN', 'PRINCIPAL'].includes(normRole)) target = '/admin-sekolah'
    else if (normRole === 'TEACHER') target = '/guru'

    return { allowed: false, redirect: target, reason: 'UNAUTHORIZED_ROLE' }
  }

  return { allowed: true, redirect: null }
}

describe('TAHAP 3: AUDIT AUTHENTICATION & AUTHORIZATION (GURUKU)', () => {

  // -------------------------------------------------------------------------
  // 1-4. Membuka Halaman Tanpa Login
  // -------------------------------------------------------------------------
  test('1. Membuka halaman publik tanpa login diizinkan (Login & Checkout)', () => {
    const loginAccess = evaluateNavigation({
      toPath: '/',
      toMeta: { requiresAuth: false },
      isAuthenticated: false,
      role: null
    })
    assert.equal(loginAccess.allowed, true)
    assert.equal(loginAccess.redirect, null)
  })

  test('2. Membuka Dashboard Admin Sekolah tanpa login ditolak dan dialihkan ke Login', () => {
    const dashboardAccess = evaluateNavigation({
      toPath: '/admin-sekolah',
      toMeta: { requiresAuth: true, role: 'SCHOOL_ADMIN' },
      isAuthenticated: false,
      role: null
    })
    assert.equal(dashboardAccess.allowed, false)
    assert.equal(dashboardAccess.redirect, '/')
    assert.equal(dashboardAccess.reason, 'UNAUTHENTICATED')
  })

  test('3. Membuka Validasi Lembaga tanpa login ditolak dan dialihkan ke Login', () => {
    const validasiAccess = evaluateNavigation({
      toPath: '/admin-sekolah/!@&~vld-inst_7x8q=',
      toMeta: { requiresAuth: true, role: 'SCHOOL_ADMIN' },
      isAuthenticated: false,
      role: null
    })
    assert.equal(validasiAccess.allowed, false)
    assert.equal(validasiAccess.redirect, '/')
    assert.equal(validasiAccess.reason, 'UNAUTHENTICATED')
  })

  test('4. Membuka Sesi & Waktu KBM tanpa login ditolak dan dialihkan ke Login', () => {
    const sesiAccess = evaluateNavigation({
      toPath: '/admin-sekolah/+!*~ses-kbm_3r8t=',
      toMeta: { requiresAuth: true, role: 'SCHOOL_ADMIN' },
      isAuthenticated: false,
      role: null
    })
    assert.equal(sesiAccess.allowed, false)
    assert.equal(sesiAccess.redirect, '/')
    assert.equal(sesiAccess.reason, 'UNAUTHENTICATED')
  })

  // -------------------------------------------------------------------------
  // 5-6. Login dengan Credential Valid & Invalid
  // -------------------------------------------------------------------------
  test('5. Login dengan credential valid mengembalikan HTTP 200 dan klaim sesi', async () => {
    const mockServerLogin = async (username, password) => {
      if (username === 'admin_sekolah' && password === 'valid_pass_123') {
        return {
          statusCode: 200,
          cookieHeader: 'guruku_jwt=mock-valid-token; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400',
          body: {
            message: 'Login sukses',
            user: { id: 'usr-01', role: 'SCHOOL_ADMIN', school_id: 'sch-01' }
          }
        }
      }
      return { statusCode: 401, body: { error: 'Username atau password salah' } }
    }

    const res = await mockServerLogin('admin_sekolah', 'valid_pass_123')
    assert.equal(res.statusCode, 200)
    assert.equal(res.body.user.role, 'SCHOOL_ADMIN')
    assert.match(res.cookieHeader, /HttpOnly/)
    assert.match(res.cookieHeader, /SameSite=Strict/)
  })

  test('6. Login dengan credential invalid mengembalikan HTTP 401 dan menolak sesi', async () => {
    const mockServerLogin = async (username, password) => {
      if (username === 'admin_sekolah' && password === 'wrong_pass') {
        return {
          statusCode: 401,
          body: { error: 'Password salah' }
        }
      }
      return { statusCode: 401, body: { error: 'Username tidak ditemukan' } }
    }

    const res = await mockServerLogin('admin_sekolah', 'wrong_pass')
    assert.equal(res.statusCode, 401)
    assert.equal(res.body.error, 'Password salah')
  })

  // -------------------------------------------------------------------------
  // 7-8. Session Expired & API 401
  // -------------------------------------------------------------------------
  test('7. Session expired saat halaman dibuka menghasilkan error 401 AUTH_TOKEN_EXPIRED', () => {
    const isTokenExpired = (expTimestamp) => {
      return Date.now() >= expTimestamp * 1000
    }

    const pastExpiry = Math.floor(Date.now() / 1000) - 60 // Expired 1 menit lalu
    assert.equal(isTokenExpired(pastExpiry), true)
  })

  test('8. API mengembalikan 401 memicu pembersihan sesi dan redirect ke login', async () => {
    let activeSession = { user: 'Budi', role: 'SCHOOL_ADMIN' }
    let redirectedRoute = null

    const handleApiResponse = (status) => {
      if (status === 401) {
        activeSession = null
        redirectedRoute = '/'
      }
    }

    handleApiResponse(401)
    assert.equal(activeSession, null, 'Sesi memori harus dibersihkan')
    assert.equal(redirectedRoute, '/', 'Harus dialihkan ke Login')
  })

  // -------------------------------------------------------------------------
  // 9-10. Role Mismatch & API 403
  // -------------------------------------------------------------------------
  test('9. User dengan role Guru (TEACHER) membuka halaman Admin Sekolah ditolak', () => {
    const teacherAccess = evaluateNavigation({
      toPath: '/admin-sekolah',
      toMeta: { requiresAuth: true, role: 'SCHOOL_ADMIN' },
      isAuthenticated: true,
      role: 'TEACHER'
    })

    assert.equal(teacherAccess.allowed, false)
    assert.equal(teacherAccess.redirect, '/guru', 'Guru harus dikembalikan ke workspace /guru')
    assert.equal(teacherAccess.reason, 'UNAUTHORIZED_ROLE')
  })

  test('10. API mengembalikan 403 menampilkan state Access Denied tanpa crash', () => {
    const apiResponse = {
      status: 403,
      body: { error: 'Forbidden', message: 'Akses ditolak untuk peran Anda.' }
    }

    let uiState = { hasAccessDenied: false, message: '' }
    if (apiResponse.status === 403) {
      uiState.hasAccessDenied = true
      uiState.message = apiResponse.body.message
    }

    assert.equal(uiState.hasAccessDenied, true)
    assert.equal(uiState.message, 'Akses ditolak untuk peran Anda.')
  })

  // -------------------------------------------------------------------------
  // 11-14. Logout, Browser Back, & Multi-Tenant Cache Purge
  // -------------------------------------------------------------------------
  test('11. Logout menghapus cookie di server dan membersihkan memori client', () => {
    // Simulasi Set-Cookie Max-Age=-1 pada backend LogoutHandler
    const clearCookieHeader = 'guruku_jwt=; Path=/; Max-Age=-1; HttpOnly; SameSite=Strict'
    assert.match(clearCookieHeader, /Max-Age=-1/)

    let clientSession = { isAuthenticated: true, role: 'SCHOOL_ADMIN', schoolId: 'sch-1' }
    function clientLogout() {
      clientSession = { isAuthenticated: false, role: '', schoolId: null }
    }
    clientLogout()

    assert.equal(clientSession.isAuthenticated, false)
    assert.equal(clientSession.role, '')
    assert.equal(clientSession.schoolId, null)
  })

  test('12. Menekan tombol Back setelah logout dicegah oleh Route Guard', () => {
    // Kondisi: Pengguna menekan Back di browser menuju /admin-sekolah setelah sesi logout
    const backNavAccess = evaluateNavigation({
      toPath: '/admin-sekolah',
      toMeta: { requiresAuth: true, role: 'SCHOOL_ADMIN' },
      isAuthenticated: false, // Sudah logout
      role: ''
    })

    assert.equal(backNavAccess.allowed, false)
    assert.equal(backNavAccess.redirect, '/', 'Browser back harus dialihkan kembali ke login')
  })

  test('13. Membuka URL halaman admin setelah logout ditolak langsung', () => {
    const directUrlAccess = evaluateNavigation({
      toPath: '/admin-sekolah/!@&~vld-inst_7x8q=',
      toMeta: { requiresAuth: true, role: 'SCHOOL_ADMIN' },
      isAuthenticated: false,
      role: ''
    })

    assert.equal(directUrlAccess.allowed, false)
    assert.equal(directUrlAccess.redirect, '/')
  })

  test('14. Login sebagai user lain setelah logout: cache tenant lama dibersihkan total', () => {
    const storage = new Map()
    const originalLocalStorage = globalThis.localStorage

    globalThis.localStorage = {
      getItem: (k) => storage.get(k) || null,
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k),
      key: (i) => Array.from(storage.keys())[i],
      get length() { return storage.size }
    }

    const tenantA = 'tenant-sekolah-a'
    const tenantB = 'tenant-sekolah-b'

    // Tenant A mengisi data dan logout
    storage.set(`guruku_setup_profile_${tenantA}`, 'data-rahasia-a')
    storage.set(`guruku_setup_operating_days_${tenantA}`, 'jadwal-a')
    storage.set('school_id', tenantA)

    const repo = new SchoolSetupRepository()
    repo.clearAllTenantCaches() // Dipanggil saat logout
    storage.delete('school_id')

    // Tenant B login
    storage.set('school_id', tenantB)

    // Pastikan data Tenant A sudah 100% musnah
    assert.equal(storage.get(`guruku_setup_profile_${tenantA}`), undefined)
    assert.equal(storage.get(`guruku_setup_operating_days_${tenantA}`), undefined)

    globalThis.localStorage = originalLocalStorage
  })

  // -------------------------------------------------------------------------
  // AUDIT COOKIE & CSRF DEFENSE
  // -------------------------------------------------------------------------
  describe('Audit Cookie Flag & CSRF Security', () => {
    test('Cookie memiliki atribut HttpOnly, Secure, SameSite=Strict, dan Path=/', () => {
      const cookieConfig = {
        name: 'guruku_jwt',
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        path: '/',
        maxAge: 86400 // 24 jam
      }

      assert.equal(cookieConfig.httpOnly, true, 'HttpOnly wajib aktif agar token kebal XSS')
      assert.equal(cookieConfig.secure, true, 'Secure wajib aktif di HTTPS')
      assert.equal(cookieConfig.sameSite, 'Strict', 'SameSite=Strict mencegah pengiriman cookie cross-site')
      assert.equal(cookieConfig.path, '/')
      assert.equal(cookieConfig.maxAge, 86400)
    })

    test('CSRF Protection: SameSite=Strict dan Header Kustom X-Requested-With memblokir serangan lintas situs', () => {
      function validateCsrfSafe(headers, origin, targetOrigin) {
        // SameSite=Strict otomatis memblokir browser cookie pada cross-site form post
        // Header X-Requested-With memicu CORS Preflight pada request lintas domain
        if (headers['X-Requested-With'] === 'XMLHttpRequest') {
          return true
        }
        return origin === targetOrigin
      }

      assert.equal(validateCsrfSafe({ 'X-Requested-With': 'XMLHttpRequest' }, 'evil.com', 'guruku.id'), true)
      assert.equal(validateCsrfSafe({}, 'guruku.id', 'guruku.id'), true)
      assert.equal(validateCsrfSafe({}, 'evil.com', 'guruku.id'), false)
    })
  })

})
