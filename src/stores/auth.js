import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Token HANYA disimpan di memory (RAM), TIDAK PERNAH di localStorage
  const token = ref(null)
  const role = ref((localStorage.getItem('role') || localStorage.getItem('user_role') || '').toUpperCase())
  const schoolId = ref(localStorage.getItem('school_id') || null)
  const schoolName = ref(localStorage.getItem('school_name') || '')
  const validUntil = ref(localStorage.getItem('valid_until') || null)
  const user = ref(null)
  const isSubmitting = ref(false)
  const error = ref(null)
  const sessionChecked = ref(false)

  // Bersihkan sisa token usang di localStorage jika ada (Pencegahan Kebocoran XSS)
  if (localStorage.getItem('token')) {
    localStorage.removeItem('token')
  }

  const isAuthenticated = computed(() => {
    // Sesi valid jika objek user aktif terisi di memory dan belum kedaluwarsa
    if (!user.value && !role.value) return false
    if (validUntil.value) {
      const expDate = new Date(validUntil.value)
      if (!isNaN(expDate.getTime()) && expDate.getTime() < Date.now()) {
        return false
      }
    }
    return true
  })

  const isSuperAdmin = computed(() => role.value === 'SUPER_ADMIN')
  const isSchoolAdmin = computed(() => role.value === 'SCHOOL_ADMIN')
  const isTeacher = computed(() => role.value === 'TEACHER')

  // Helper normalisasi role
  function normalizeRole(r) {
    if (!r) return ''
    const upper = String(r).toUpperCase().trim()
    if (upper === 'SUPER_ADMIN' || upper === 'SUPERADMIN') return 'SUPER_ADMIN'
    if (upper === 'SCHOOL_ADMIN' || upper === 'ADMIN_SEKOLAH') return 'SCHOOL_ADMIN'
    if (upper === 'TEACHER' || upper === 'GURU') return 'TEACHER'
    return upper
  }

  // Restore session via HttpOnly Cookie (GET /api/v1/auth/session)
  async function restoreSession() {
    console.info('[AuthStore] Memulihkan sesi akun via HttpOnly cookie...')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4500)

    try {
      const res = await fetch('/api/v1/auth/session', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Mengirim cookie HttpOnly secara otomatis
        signal: controller.signal
      })

      if (res.ok) {
        const data = await res.json()
        if (data && data.authenticated && data.user) {
          const normalized = normalizeRole(data.user.role)
          role.value = normalized
          schoolId.value = data.user.school_id || null
          validUntil.value = data.user.valid_until || null
          user.value = {
            id: data.user.id,
            role: normalized,
            school_id: schoolId.value
          }

          localStorage.setItem('role', normalized)
          localStorage.setItem('user_role', normalized)
          if (schoolId.value) localStorage.setItem('school_id', schoolId.value)
          if (validUntil.value) localStorage.setItem('valid_until', validUntil.value)

          sessionChecked.value = true
          console.info('[AuthStore] Sesi berhasil dipulihkan untuk peran:', normalized)
          return true
        }
      }
      
      // Jika server mengembalikan 401 atau tidak terautentikasi
      console.warn('[AuthStore] Sesi server tidak ditemukan atau telah kedaluwarsa.')
      await logout()
      return false
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn('[AuthStore] Restore session timeout.')
      } else {
        console.warn('[AuthStore] Gagal menghubungi endpoint session server:', err.message)
      }
      
      // Mode Offline Fallback: Jika offline dan ada cached user_role di storage
      if (!navigator.onLine && (localStorage.getItem('role') || localStorage.getItem('user_role'))) {
        console.info('[AuthStore] Terdeteksi offline, mempertahankan peran lokal sementara.')
        role.value = normalizeRole(localStorage.getItem('role') || localStorage.getItem('user_role'))
        schoolId.value = localStorage.getItem('school_id')
        user.value = { role: role.value, school_id: schoolId.value, offline: true }
        return true
      }

      await logout()
      return false
    } finally {
      clearTimeout(timer)
      sessionChecked.value = true
    }
  }

  // Login dengan timeout & credential HttpOnly
  async function login(usernameInput, passwordInput) {
    if (isSubmitting.value) return false
    isSubmitting.value = true
    error.value = null

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 9000)

    try {
      const cleanUsername = String(usernameInput).trim()
      let response = await fetch('/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Set HttpOnly Cookie
        body: JSON.stringify({ username: cleanUsername, password: passwordInput }),
        signal: controller.signal
      })

      // Fallback 1: Coba dengan suffix @guruku.id jika gagal
      if (!response.ok && !cleanUsername.includes('@') && !['admin', 'superadmin', 'master'].includes(cleanUsername.toLowerCase())) {
        try {
          const retryRes = await fetch('/api/v1/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username: `${cleanUsername}@guruku.id`, password: passwordInput }),
            signal: controller.signal
          })
          if (retryRes.ok) {
            response = retryRes
          }
        } catch (_) {}
      } else if (!response.ok && cleanUsername.toLowerCase().endsWith('@guruku.id')) {
        // Fallback 2: Coba tanpa suffix @guruku.id
        try {
          const stripped = cleanUsername.replace(/@guruku\.id$/i, '')
          const retryRes = await fetch('/api/v1/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username: stripped, password: passwordInput }),
            signal: controller.signal
          })
          if (retryRes.ok) {
            response = retryRes
          }
        } catch (_) {}
      }

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Username atau password tidak sesuai.'
        error.value = errorMsg
        throw new Error(errorMsg)
      }

      // Token JWT disimpan HANYA di memory (RAM), TIDAK DISIMPAN di localStorage
      if (data.token) {
        token.value = data.token
        const payloadBase64 = data.token.split('.')[1]
        const decodedPayload = JSON.parse(atob(payloadBase64))
        const normalized = normalizeRole(decodedPayload.role)

        role.value = normalized
        schoolId.value = decodedPayload.school_id || null
        validUntil.value = decodedPayload.valid_until || null
        user.value = {
          id: decodedPayload.user_id,
          role: normalized,
          school_id: schoolId.value
        }

        // Simpan hanya preferensi UI non-sensitif (BUKAN TOKEN/JWT)
        localStorage.setItem('role', normalized)
        localStorage.setItem('user_role', normalized)
        if (schoolId.value) localStorage.setItem('school_id', schoolId.value)
        if (validUntil.value) localStorage.setItem('valid_until', validUntil.value)
        localStorage.removeItem('token') // Pastikan bersih dari localStorage

        return {
          role: normalized,
          school_id: schoolId.value,
          valid_until: validUntil.value
        }
      }

      throw new Error('Server tidak mengembalikan sesi yang valid.')
    } catch (err) {
      if (err.name === 'AbortError') {
        error.value = 'Waktu koneksi habis (Timeout). Mohon periksa jaringan Anda dan coba lagi.'
      } else if (!error.value) {
        error.value = err.message || 'Terjadi gangguan jaringan saat menghubungi server.'
      }
      throw err
    } finally {
      clearTimeout(timeoutId)
      isSubmitting.value = false
    }
  }

  // Logout terpadu: Hapus cookie server & bersihkan memory state
  async function logout() {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)
      await fetch('/api/v1/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal
      }).catch(() => {})
      clearTimeout(timeoutId)
    } catch (_) {}

    token.value = null
    role.value = ''
    schoolId.value = null
    schoolName.value = ''
    validUntil.value = null
    user.value = null
    error.value = null
    sessionChecked.value = false

    // Hapus data sesi di storage
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user_role')
    localStorage.removeItem('school_id')
    localStorage.removeItem('valid_until')
  }

  return {
    token,
    role,
    schoolId,
    schoolName,
    validUntil,
    user,
    isSubmitting,
    error,
    sessionChecked,
    isAuthenticated,
    isSuperAdmin,
    isSchoolAdmin,
    isTeacher,
    login,
    logout,
    restoreSession,
    normalizeRole
  }
})
