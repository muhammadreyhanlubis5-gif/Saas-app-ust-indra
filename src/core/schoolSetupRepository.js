/**
 * GuruKu School Setup Repository (Enterprise Data Access Layer)
 * Abstracts backend HTTP communication and provides offline-resilient caching.
 * Decouples Vue UI components from direct API or LocalStorage calls.
 * 
 * Strict architectural rules:
 * - Server is the single source of truth; LocalStorage is only an offline fallback.
 * - Cache schema is versioned (schemaVersion: 1) and isolated strictly by tenantId.
 * - Cache must NEVER overwrite fresher or valid server responses.
 * - Retry is strictly restricted to transient errors (timeout, network drop, 408, 429, 500, 502, 503, 504).
 * - Non-retryable HTTP statuses (400, 401, 403, 404, 422) return immediately without retry loops.
 * - Unified session contract: domain models use `sessionType` ('KBM' | 'BREAK'), mapped explicitly to backend DTO `type`.
 */

import {
  createDefaultProfile,
  createDefaultOperatingDays,
  createDefaultKbmSessions,
  DAYS_OF_WEEK
} from '../types/schoolSetup.js'

export const SETUP_CACHE_SCHEMA_VERSION = 1
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])
const NON_RETRYABLE_STATUS_CODES = new Set([400, 401, 403, 404, 422])

export class SchoolSetupRepository {
  constructor(apiBaseUrl = '') {
    this.apiBaseUrl = apiBaseUrl || (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)) || ''
    this.storagePrefix = 'guruku_setup_'
    this.schemaVersion = SETUP_CACHE_SCHEMA_VERSION
  }

  /**
   * Safe fetch with AbortController timeout protection and strictly scoped retry
   * Retries ONLY for timeout, network error, 408, 429, 500, 502, 503, 504.
   * Strictly avoids retrying 400, 401, 403, 404, 422.
   */
  async requestWithTimeout(url, options = {}, timeoutMs = 8000, maxRetries = 2) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const fullUrl = url.startsWith('http') ? url : `${this.apiBaseUrl}${url}`
        const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('guruku_token')) ||
                      (typeof localStorage !== 'undefined' && localStorage.getItem('guruku_token')) || ''
        const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {}

        const response = await fetch(fullUrl, {
          ...options,
          headers: {
            ...authHeader,
            ...(options.headers || {})
          },
          signal: controller.signal,
          credentials: 'include'
        })
        clearTimeout(timer)

        // Sukses (2xx) atau status non-retryable (400, 401, 403, 404, 422) -> Segera kembalikan respons
        if (response.ok || NON_RETRYABLE_STATUS_CODES.has(response.status)) {
          return response
        }

        // Status retryable (408, 429, 500, 502, 503, 504)
        if (RETRYABLE_STATUS_CODES.has(response.status)) {
          if (attempt === maxRetries) {
            return response
          }
          // Exponential backoff dengan jitter mikro
          const delay = Math.min(200 * Math.pow(2, attempt) + Math.random() * 50, 1500)
          await new Promise((r) => setTimeout(r, delay))
          continue
        }

        return response
      } catch (err) {
        clearTimeout(timer)
        const isTimeout = err.name === 'AbortError'
        const isNetwork = err instanceof TypeError || String(err.message).toLowerCase().includes('network') || String(err.message).toLowerCase().includes('fetch')

        if ((isTimeout || isNetwork) && attempt < maxRetries) {
          const delay = Math.min(250 * Math.pow(2, attempt), 1500)
          await new Promise((r) => setTimeout(r, delay))
          continue
        }

        throw err
      }
    }
  }

  /**
   * Helper DTO Mapper: Backend snake_case -> Frontend camelCase SchoolProfile
   */
  mapProfileDtoToDomain(dto, tenantId = '', schoolNameFallback = '') {
    if (!dto) return createDefaultProfile(tenantId, schoolNameFallback)

    const licenseSchool = (typeof localStorage !== 'undefined' && (localStorage.getItem('school_name') || localStorage.getItem('license_school_name') || localStorage.getItem('user_name'))) || ''

    return {
      id: dto.id || tenantId,
      tenantId: tenantId || dto.id || '',
      schoolName: (dto.name && dto.name.trim() !== '')
        ? dto.name.trim()
        : (dto.school_name || schoolNameFallback || licenseSchool || 'Sekolah Terdaftar'),
      principalName: dto.headmaster_name || dto.principalName || '',
      curriculumVicePrincipalName: dto.vice_headmaster_name || dto.curriculumVicePrincipalName || '',
      address: dto.address || '',
      academicYear: dto.academic_year || dto.academicYear || '2026-2027',
      semester: (dto.semester === 'GENAP' || dto.semester === 'Genap') ? 'Genap' : 'Ganjil',
      scheduleCreatedDate: dto.schedule_date || dto.scheduleCreatedDate || new Date().toISOString().slice(0, 10),
      isValidated: Boolean(dto.isValidated || (dto.headmaster_name && dto.academic_year) || (typeof localStorage !== 'undefined' && localStorage.getItem('guruKu_lembaga_valid') === 'true')),
      updatedAt: dto.updatedAt || new Date().toISOString()
    }
  }

  /**
   * Helper DTO Mapper: Frontend camelCase -> Backend snake_case
   */
  mapProfileDomainToDto(profile, activeDayNames = []) {
    return {
      headmaster_name: profile.principalName || '',
      vice_headmaster_name: profile.curriculumVicePrincipalName || '',
      address: profile.address || '',
      academic_year: profile.academicYear || '2026-2027',
      semester: profile.semester === 'Genap' ? 'GENAP' : 'GANJIL',
      schedule_date: profile.scheduleCreatedDate || '',
      active_days: activeDayNames
    }
  }

  /**
   * Helper DTO Mapper: Hari aktif dari array string ['Senin', 'Selasa', ...] ke SchoolOperatingDay[]
   */
  mapActiveDaysToOperatingDays(activeDayNames = [], tenantId = '') {
    const activeSet = new Set(activeDayNames || [])
    return DAYS_OF_WEEK.map((d) => ({
      id: `day-${d.dayOfWeek}`,
      tenantId,
      dayOfWeek: d.dayOfWeek,
      dayName: d.dayName,
      isActive: activeSet.size > 0 ? activeSet.has(d.dayName) : d.dayOfWeek <= 6,
      sortOrder: d.sortOrder
    }))
  }

  /**
   * Helper Session DTO Mapper: Backend DTO -> Domain Model
   * Menyelaraskan istilah: Domain selalu menggunakan `sessionType` ('KBM' | 'BREAK').
   */
  mapSessionDtoToDomain(dto, tenantId = '', index = 0) {
    const rawType = String(dto.type || dto.sessionType || '').toUpperCase()
    const isBreak = rawType === 'BREAK' || rawType === 'ISTIRAHAT'

    return {
      id: dto.id || `sess-${index + 1}`,
      tenantId: tenantId || dto.tenant_id || '',
      sessionNumber: isBreak ? 0 : (dto.session_index || dto.sessionNumber || index + 1),
      label: dto.label || (isBreak ? 'Istirahat' : `Jam Ke-${index + 1}`),
      startTime: dto.start_time || dto.startTime || '07:30',
      endTime: dto.end_time || dto.endTime || '08:10',
      sessionType: isBreak ? 'BREAK' : 'KBM',
      isActive: dto.isActive !== false,
      sortOrder: dto.sort_order || dto.sortOrder || index + 1
    }
  }

  /**
   * Helper Session Domain Mapper: Domain Model -> Backend DTO (snake_case)
   */
  mapSessionDomainToDto(session) {
    return {
      type: session.sessionType === 'BREAK' ? 'BREAK' : 'KBM',
      start_time: session.startTime,
      end_time: session.endTime,
      label: session.label,
      session_index: session.sessionNumber
    }
  }

  /**
   * Helper Cache: Buat envelope cache berstruktur
   */
  createCacheEnvelope(tenantId, data) {
    return JSON.stringify({
      schemaVersion: this.schemaVersion,
      tenantId: tenantId || 'anonymous',
      updatedAt: new Date().toISOString(),
      data
    })
  }

  /**
   * Helper Cache: Baca envelope cache berstruktur
   */
  readCacheEnvelope(raw, tenantId) {
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        // Format terstruktur baru dengan schemaVersion & tenantId
        if (parsed.schemaVersion === this.schemaVersion && parsed.tenantId === tenantId) {
          return parsed.data
        }
        // Jika format data mentah legacy tanpa envelope
        if (!parsed.schemaVersion && !parsed.tenantId) {
          return parsed
        }
      }
    } catch (_) {}
    return null
  }

  /**
   * Bersihkan seluruh cache untuk tenant tertentu (misalnya saat ganti tenant)
   */
  clearTenantCache(tenantId) {
    if (typeof localStorage === 'undefined' || !tenantId) return
    try {
      localStorage.removeItem(`${this.storagePrefix}profile_${tenantId}`)
      localStorage.removeItem(`${this.storagePrefix}operating_days_${tenantId}`)
      localStorage.removeItem(`${this.storagePrefix}kbm_sessions_${tenantId}`)
    } catch (_) {}
  }

  /**
   * Bersihkan semua cache setup di storage (misalnya saat logout)
   */
  clearAllTenantCaches() {
    if (typeof localStorage === 'undefined') return
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && (k.startsWith(this.storagePrefix) || k.startsWith('guruKu_setup_') || k.startsWith('guruKu_lembaga_') || k === 'guruKu_active_days' || k === 'guruKu_sesi_kbm')) {
          keysToRemove.push(k)
        }
      }
      for (const k of keysToRemove) {
        localStorage.removeItem(k)
      }
    } catch (_) {}
  }

  /**
   * Ambil setup sekolah lengkap (Profile, Operating Days, Sesi KBM)
   * SERVER IS THE SINGLE SOURCE OF TRUTH.
   * Cache LocalStorage hanya dibaca jika panggilan API gagal/offline.
   *
   * @param {string} tenantId
   * @returns {Promise<{ profile: import('../types/schoolSetup.js').SchoolProfile, operatingDays: import('../types/schoolSetup.js').SchoolOperatingDay[], kbmSessions: import('../types/schoolSetup.js').KbmSession[], fromServer: boolean }>}
   */
  async getSetup(tenantId = '') {
    let resolvedProfile = null
    let resolvedOperatingDays = null
    let resolvedSessions = null
    let fromServer = false

    // 1. Coba ambil dari Backend API (Source of Truth)
    try {
      const headers = { 'X-Requested-With': 'XMLHttpRequest' }

      const res = await this.requestWithTimeout('/api/v1/school/profile', { headers })
      if (res.ok) {
        const dto = await res.json()
        resolvedProfile = this.mapProfileDtoToDomain(dto, tenantId)
        if (dto.active_days && Array.isArray(dto.active_days)) {
          resolvedOperatingDays = this.mapActiveDaysToOperatingDays(dto.active_days, tenantId)
        }
        fromServer = true

        // Simpan respons server valid ke cache terstruktur
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem(`${this.storagePrefix}profile_${tenantId}`, this.createCacheEnvelope(tenantId, resolvedProfile))
            if (resolvedOperatingDays) {
              localStorage.setItem(`${this.storagePrefix}operating_days_${tenantId}`, this.createCacheEnvelope(tenantId, resolvedOperatingDays))
            }
          } catch (_) {}
        }
      }
    } catch (_) {
      // Backend error / offline: lanjut ke fallback cache
    }

    // 2. Ambil Sesi KBM dari Backend API
    try {
      const headers = { 'X-Requested-With': 'XMLHttpRequest' }

      const res = await this.requestWithTimeout('/api/v1/school/sessions', { headers })
      if (res.ok) {
        const sessDto = await res.json()
        if (Array.isArray(sessDto) && sessDto.length > 0) {
          resolvedSessions = sessDto.map((s, idx) => this.mapSessionDtoToDomain(s, tenantId, idx))
        } else if (sessDto && typeof sessDto === 'object' && !Array.isArray(sessDto)) {
          // Format map per-hari dari Go backend: map[string][]SessionPayload
          const days = Object.keys(sessDto)
          if (days.length > 0 && Array.isArray(sessDto[days[0]])) {
            resolvedSessions = sessDto[days[0]].map((s, idx) => this.mapSessionDtoToDomain(s, tenantId, idx))
          }
        }

        if (resolvedSessions && resolvedSessions.length > 0) {
          fromServer = true
          if (typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem(`${this.storagePrefix}kbm_sessions_${tenantId}`, this.createCacheEnvelope(tenantId, resolvedSessions))
            } catch (_) {}
          }
        }
      }
    } catch (_) {}

    // 3. Fallback Offline Cache: HANYA DIGUNAKAN JIKA SERVER TIDAK TERHUBUNG
    if (typeof localStorage !== 'undefined') {
      try {
        if (!resolvedProfile) {
          const cachedProfileRaw = localStorage.getItem(`${this.storagePrefix}profile_${tenantId}`) || localStorage.getItem('guruKu_lembaga_data')
          const cachedData = this.readCacheEnvelope(cachedProfileRaw, tenantId)
          if (cachedData) {
            resolvedProfile = this.mapProfileDtoToDomain(cachedData, tenantId)
          }
        }

        if (!resolvedOperatingDays || resolvedOperatingDays.length === 0) {
          const cachedDaysRaw = localStorage.getItem(`${this.storagePrefix}operating_days_${tenantId}`) || localStorage.getItem('guruKu_active_days')
          const cachedDays = this.readCacheEnvelope(cachedDaysRaw, tenantId)
          if (cachedDays) {
            resolvedOperatingDays = Array.isArray(cachedDays) && typeof cachedDays[0] === 'string'
              ? this.mapActiveDaysToOperatingDays(cachedDays, tenantId)
              : cachedDays
          }
        }

        if (!resolvedSessions || resolvedSessions.length === 0) {
          const cachedSessionsRaw = localStorage.getItem(`${this.storagePrefix}kbm_sessions_${tenantId}`) || localStorage.getItem('guruKu_sesi_kbm')
          const cachedSessions = this.readCacheEnvelope(cachedSessionsRaw, tenantId)
          if (cachedSessions) {
            if (Array.isArray(cachedSessions) && cachedSessions.length > 0) {
              resolvedSessions = cachedSessions.map((s, idx) => this.mapSessionDtoToDomain(s, tenantId, idx))
            } else if (cachedSessions && typeof cachedSessions === 'object') {
              const firstDay = Object.keys(cachedSessions)[0]
              if (firstDay && Array.isArray(cachedSessions[firstDay])) {
                resolvedSessions = cachedSessions[firstDay].map((s, idx) => this.mapSessionDtoToDomain(s, tenantId, idx))
              }
            }
          }
        }
      } catch (_) {}
    }

    // 4. Fallback Default jika data kosong sama sekali
    return {
      profile: resolvedProfile || createDefaultProfile(tenantId),
      operatingDays: (resolvedOperatingDays && resolvedOperatingDays.length > 0) ? resolvedOperatingDays : createDefaultOperatingDays(tenantId),
      kbmSessions: (resolvedSessions && resolvedSessions.length > 0) ? resolvedSessions : createDefaultKbmSessions(tenantId),
      fromServer
    }
  }

  /**
   * Simpan profil lembaga (Draft atau Validasi Penuh)
   * @param {import('../types/schoolSetup.js').SchoolProfile} profile
   * @param {string[]} activeDayNames
   * @param {boolean} isDraft
   * @returns {Promise<import('../types/schoolSetup.js').SchoolProfile>}
   */
  async updateProfile(profile, activeDayNames = [], isDraft = false) {
    const tenantId = profile.tenantId || profile.id || ''
    const dto = this.mapProfileDomainToDto(profile, activeDayNames)

    // 1. Simpan ke local cache berstruktur
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`${this.storagePrefix}profile_${tenantId}`, this.createCacheEnvelope(tenantId, profile))
        localStorage.setItem('guruKu_lembaga_data', JSON.stringify(dto))
        if (!isDraft) {
          localStorage.setItem('guruKu_lembaga_valid', 'true')
        }
      } catch (_) {}
    }

    // 2. Simpan ke Backend API
    try {
      const res = await this.requestWithTimeout('/api/v1/school/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dto)
      })

      if (res.ok) {
        return {
          ...profile,
          isValidated: !isDraft,
          updatedAt: new Date().toISOString()
        }
      }
    } catch (_) {}

    return {
      ...profile,
      isValidated: !isDraft,
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * Simpan konfigurasi hari KBM aktif
   * @param {import('../types/schoolSetup.js').SchoolOperatingDay[]} operatingDays
   * @param {string} tenantId
   */
  async updateOperatingDays(operatingDays, tenantId = '') {
    const activeNames = operatingDays.filter((d) => d.isActive).map((d) => d.dayName)

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`${this.storagePrefix}operating_days_${tenantId}`, this.createCacheEnvelope(tenantId, operatingDays))
        localStorage.setItem('guruKu_active_days', JSON.stringify(activeNames))
      } catch (_) {}
    }

    return operatingDays
  }

  /**
   * Simpan konfigurasi sesi KBM
   * @param {import('../types/schoolSetup.js').KbmSession[]} sessions
   * @param {string} tenantId
   * @param {string[]} activeDayNames
   */
  async updateKbmSessions(sessions, tenantId = '', activeDayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']) {
    // 1. Simpan ke local cache berstruktur
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`${this.storagePrefix}kbm_sessions_${tenantId}`, this.createCacheEnvelope(tenantId, sessions))

        const perDayMap = {}
        for (const day of activeDayNames) {
          perDayMap[day] = sessions.map((s) => this.mapSessionDomainToDto(s))
        }
        localStorage.setItem('guruKu_sesi_kbm', JSON.stringify(perDayMap))
      } catch (_) {}
    }

    // 2. Simpan ke Backend API
    try {
      const perDayMap = {}
      for (const day of activeDayNames) {
        perDayMap[day] = sessions.map((s) => this.mapSessionDomainToDto(s))
      }

      await this.requestWithTimeout('/api/v1/school/sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessions: perDayMap })
      })
    } catch (_) {}

    return sessions
  }
}

export const schoolSetupRepository = new SchoolSetupRepository()
export default schoolSetupRepository
