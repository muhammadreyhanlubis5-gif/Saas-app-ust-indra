import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const role = ref((localStorage.getItem('role') || localStorage.getItem('user_role') || '').toUpperCase())
  const schoolId = ref(localStorage.getItem('school_id') || null)
  const schoolName = ref(localStorage.getItem('school_name') || '')
  const validUntil = ref(localStorage.getItem('valid_until') || null)
  const user = ref(null)
  const isSubmitting = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => {
    if (!token.value) return false
    try {
      const parts = token.value.split('.')
      if (parts.length !== 3) return false
      const payload = JSON.parse(atob(parts[1]))
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false
      }
      return true
    } catch {
      return false
    }
  })

  const isSuperAdmin = computed(() => role.value === 'SUPER_ADMIN')
  const isSchoolAdmin = computed(() => role.value === 'SCHOOL_ADMIN')
  const isTeacher = computed(() => role.value === 'TEACHER')

  // Helper untuk normalisasi role
  function normalizeRole(r) {
    if (!r) return ''
    const upper = String(r).toUpperCase().trim()
    if (upper === 'SUPER_ADMIN' || upper === 'SUPERADMIN') return 'SUPER_ADMIN'
    if (upper === 'SCHOOL_ADMIN' || upper === 'ADMIN_SEKOLAH') return 'SCHOOL_ADMIN'
    if (upper === 'TEACHER' || upper === 'GURU') return 'TEACHER'
    return upper
  }

  // Restore session dari token yang tersimpan di awal start
  function restoreSession() {
    try {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        logout()
        return false
      }

      const parts = storedToken.split('.')
      if (parts.length !== 3) {
        logout()
        return false
      }

      const payload = JSON.parse(atob(parts[1]))
      // Periksa masa berlaku token
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn('[AuthStore] Sesi token telah kedaluwarsa.')
        logout()
        return false
      }

      token.value = storedToken
      role.value = normalizeRole(payload.role)
      schoolId.value = payload.school_id || localStorage.getItem('school_id') || null
      validUntil.value = payload.valid_until || localStorage.getItem('valid_until') || null
      user.value = {
        id: payload.user_id,
        role: role.value,
        school_id: schoolId.value
      }

      // Sinkronkan localStorage agar guard router konsisten
      localStorage.setItem('role', role.value)
      localStorage.setItem('user_role', role.value)
      return true
    } catch (err) {
      console.error('[AuthStore] Gagal me-restore session:', err)
      logout()
      return false
    }
  }

  // Login dengan timeout controller & multi-attempt fallback
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
        body: JSON.stringify({ username: cleanUsername, password: passwordInput }),
        signal: controller.signal
      })

      // Fallback 1: Coba dengan suffix @guruku.id jika gagal dan belum berakhiran domain
      if (!response.ok && !cleanUsername.includes('@') && !['admin', 'superadmin', 'master'].includes(cleanUsername.toLowerCase())) {
        try {
          const retryRes = await fetch('/api/v1/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

      // Ambil token dari response
      const tokenString = data.token
      if (!tokenString) {
        throw new Error('Server tidak mengembalikan token autentikasi valid.')
      }

      // Parse payload token secara aman
      const payloadBase64 = tokenString.split('.')[1]
      const decodedPayload = JSON.parse(atob(payloadBase64))
      const normalized = normalizeRole(decodedPayload.role)

      token.value = tokenString
      role.value = normalized
      schoolId.value = decodedPayload.school_id || null
      validUntil.value = decodedPayload.valid_until || null
      user.value = {
        id: decodedPayload.user_id,
        role: normalized,
        school_id: schoolId.value
      }

      // Simpan ke localStorage dengan key terpadu untuk kompatibilitas
      localStorage.setItem('token', tokenString)
      localStorage.setItem('role', normalized)
      localStorage.setItem('user_role', normalized)
      if (schoolId.value) {
        localStorage.setItem('school_id', schoolId.value)
      }
      if (validUntil.value) {
        localStorage.setItem('valid_until', validUntil.value)
      }

      return {
        role: normalized,
        school_id: schoolId.value,
        valid_until: validUntil.value
      }
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

  // Logout terpadu
  async function logout() {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)
      await fetch('/api/v1/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

    // Hapus data sesi sensitif
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
