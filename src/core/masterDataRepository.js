/**
 * GuruKu Master Data Repository (Enterprise Data Access Layer)
 * Manages Classes, Teachers, and Subjects API interaction with offline-resilient caching.
 * Decouples Vue UI components from direct API or LocalStorage calls.
 * 
 * Strict architectural rules:
 * - Server is the single source of truth; LocalStorage is only an offline fallback.
 * - Cache schema is versioned (MASTER_DATA_CACHE_SCHEMA_VERSION) and isolated strictly by tenantId.
 * - Cache must NEVER overwrite fresher or valid server responses.
 * - Retry is strictly restricted to transient errors (timeout, network drop, 408, 429, 500, 502, 503, 504).
 * - Non-retryable HTTP statuses (400, 401, 403, 404, 422) return immediately without retry loops.
 */

import { MASTER_DATA_CACHE_SCHEMA_VERSION } from '../types/masterData.js'

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])
const NON_RETRYABLE_STATUS_CODES = new Set([400, 401, 403, 404, 422])

export class MasterDataRepository {
  constructor(apiBaseUrl = '') {
    this.apiBaseUrl = apiBaseUrl || (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)) || ''
    this.storagePrefix = 'guruku_md_'
    this.schemaVersion = MASTER_DATA_CACHE_SCHEMA_VERSION
  }

  /**
   * Resolusi Tenant ID dari session/localStorage
   */
  getTenantId() {
    if (typeof localStorage === 'undefined') return 'default_school'
    return localStorage.getItem('school_id') || localStorage.getItem('tenant_id') || 'default_school'
  }

  /**
   * Safe fetch with AbortController timeout protection and strictly scoped retry
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
        const tenantHeader = this.getTenantId() && this.getTenantId() !== 'default_school' ? { 'X-School-ID': this.getTenantId() } : {}

        const response = await fetch(fullUrl, {
          ...options,
          headers: {
            ...authHeader,
            ...tenantHeader,
            ...(options.headers || {})
          },
          signal: controller.signal,
          credentials: 'include'
        })
        clearTimeout(timer)

        if (response.ok || NON_RETRYABLE_STATUS_CODES.has(response.status)) {
          return response
        }

        if (RETRYABLE_STATUS_CODES.has(response.status)) {
          if (attempt === maxRetries) {
            return response
          }
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
    throw new Error('Permintaan ke server gagal setelah beberapa kali percobaan.')
  }

  // ==========================================================================
  // CACHE ENVELOPE HELPERS (Isolated by Tenant)
  // ==========================================================================

  createCacheEnvelope(data, tenantId = null) {
    return {
      schemaVersion: this.schemaVersion,
      tenantId: tenantId || this.getTenantId(),
      updatedAt: new Date().toISOString(),
      data
    }
  }

  readCacheEnvelope(key, tenantId = null) {
    if (typeof localStorage === 'undefined') return null
    const targetTenant = tenantId || this.getTenantId()
    const raw = localStorage.getItem(`${this.storagePrefix}${key}_${targetTenant}`)
    if (!raw) return null

    try {
      const envelope = JSON.parse(raw)
      if (!envelope || envelope.schemaVersion !== this.schemaVersion || envelope.tenantId !== targetTenant) {
        return null
      }
      return envelope.data
    } catch {
      return null
    }
  }

  writeCacheEnvelope(key, data, tenantId = null) {
    if (typeof localStorage === 'undefined') return
    const targetTenant = tenantId || this.getTenantId()
    const envelope = this.createCacheEnvelope(data, targetTenant)
    localStorage.setItem(`${this.storagePrefix}${key}_${targetTenant}`, JSON.stringify(envelope))
  }

  clearTenantCache(tenantId = null) {
    if (typeof localStorage === 'undefined') return
    const targetTenant = tenantId || this.getTenantId()
    const keys = ['classes', 'teachers', 'subjects']
    keys.forEach((k) => {
      localStorage.removeItem(`${this.storagePrefix}${k}_${targetTenant}`)
    })
  }

  // ==========================================================================
  // CLASSES (DAFTAR KELAS)
  // ==========================================================================

  /**
   * Ambil daftar kelas dari server dengan offline-cache fallback
   */
  async getClasses(filters = {}) {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.search) params.set('search', filters.search)
    if (filters.academic_year) params.set('academic_year', filters.academic_year)
    if (filters.is_active !== undefined && filters.is_active !== null && filters.is_active !== '') {
      params.set('is_active', String(filters.is_active))
    }
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))

    const queryString = params.toString() ? `?${params.toString()}` : ''
    const url = `/api/v1/school/classes${queryString}`

    try {
      const res = await this.requestWithTimeout(url, { method: 'GET' })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const error = new Error(errorData?.error?.message || `Gagal memuat kelas (HTTP ${res.status})`)
        error.status = res.status
        error.code = errorData?.error?.code
        error.fields = errorData?.error?.fields
        throw error
      }

      const body = await res.json()
      const data = body.data || []
      const pagination = body.pagination || { page: 1, limit: data.length, total: data.length, total_pages: 1 }

      // Simpan ke cache tenant
      this.writeCacheEnvelope('classes', data)

      // Backward compatibility sync ke legacy key guruKu_classes
      if (typeof localStorage !== 'undefined' && (!filters.q && !filters.search)) {
        localStorage.setItem('guruKu_classes', JSON.stringify(data))
      }

      return {
        data,
        pagination,
        fromCache: false
      }
    } catch (err) {
      // Fallback ke cache jika network error
      const cached = this.readCacheEnvelope('classes')
      if (cached && Array.isArray(cached)) {
        return {
          data: cached,
          pagination: { page: 1, limit: cached.length, total: cached.length, total_pages: 1 },
          fromCache: true,
          error: err
        }
      }
      throw err
    }
  }

  async getClassById(id) {
    const res = await this.requestWithTimeout(`/api/v1/school/classes/${id}`, { method: 'GET' })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const error = new Error(errorData?.error?.message || `Kelas tidak ditemukan (HTTP ${res.status})`)
      error.status = res.status
      error.code = errorData?.error?.code
      throw error
    }
    const body = await res.json()
    return body.data
  }

  async createClass(payload) {
    const res = await this.requestWithTimeout('/api/v1/school/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const error = new Error(body?.error?.message || `Gagal menambahkan kelas (HTTP ${res.status})`)
      error.status = res.status
      error.code = body?.error?.code
      error.fields = body?.error?.fields || {}
      throw error
    }
    return body.data
  }

  async updateClass(id, payload) {
    const res = await this.requestWithTimeout(`/api/v1/school/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const error = new Error(body?.error?.message || `Gagal memperbarui kelas (HTTP ${res.status})`)
      error.status = res.status
      error.code = body?.error?.code
      error.fields = body?.error?.fields || {}
      throw error
    }
    return body.data
  }

  async deleteClass(id) {
    const res = await this.requestWithTimeout(`/api/v1/school/classes/${id}`, { method: 'DELETE' })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const error = new Error(body?.error?.message || `Gagal menghapus kelas (HTTP ${res.status})`)
      error.status = res.status
      error.code = body?.error?.code
      throw error
    }
    return true
  }

  async batchImportClasses(classesList, mode = 'upsert') {
    const res = await this.requestWithTimeout('/api/v1/school/classes/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classes: classesList, mode })
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const error = new Error(body?.error?.message || `Gagal import batch kelas (HTTP ${res.status})`)
      error.status = res.status
      error.code = body?.error?.code
      error.fields = body?.error?.fields || {}
      throw error
    }
    return body.data
  }

  // ==========================================================================
  // TEACHERS (DAFTAR GURU)
  // ==========================================================================

  async getTeachers(filters = {}) {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.search) params.set('search', filters.search)
    if (filters.is_active !== undefined && filters.is_active !== null && filters.is_active !== '') {
      params.set('is_active', String(filters.is_active))
    }
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))

    const queryString = params.toString() ? `?${params.toString()}` : ''
    const url = `/api/v1/school/teachers${queryString}`

    try {
      const res = await this.requestWithTimeout(url, { method: 'GET' })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const error = new Error(errorData?.error?.message || `Gagal memuat guru (HTTP ${res.status})`)
        error.status = res.status
        error.code = errorData?.error?.code
        throw error
      }
      const body = await res.json()
      const data = body.data || []
      const pagination = body.pagination || { page: 1, limit: data.length, total: data.length, total_pages: 1 }

      this.writeCacheEnvelope('teachers', data)

      if (typeof localStorage !== 'undefined' && (!filters.q && !filters.search)) {
        localStorage.setItem('guruKu_teachers', JSON.stringify(data))
      }

      return { data, pagination, fromCache: false }
    } catch (err) {
      const cached = this.readCacheEnvelope('teachers')
      if (cached && Array.isArray(cached)) {
        return {
          data: cached,
          pagination: { page: 1, limit: cached.length, total: cached.length, total_pages: 1 },
          fromCache: true,
          error: err
        }
      }
      throw err
    }
  }

  async getTeacherById(id) {
    const res = await this.requestWithTimeout(`/api/v1/school/teachers/${id}`, { method: 'GET' })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const error = new Error(errorData?.error?.message || `Guru tidak ditemukan (HTTP ${res.status})`)
      error.status = res.status
      throw error
    }
    const body = await res.json()
    return body.data
  }

  async createTeacher(payload) {
    const res = await this.requestWithTimeout('/api/v1/school/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const error = new Error(body?.error?.message || `Gagal menambahkan guru (HTTP ${res.status})`)
      error.status = res.status
      error.code = body?.error?.code
      error.fields = body?.error?.fields || {}
      throw error
    }
    return body.data
  }

  async updateTeacher(id, payload) {
    const res = await this.requestWithTimeout(`/api/v1/school/teachers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const error = new Error(body?.error?.message || `Gagal memperbarui guru (HTTP ${res.status})`)
      error.status = res.status
      error.code = body?.error?.code
      error.fields = body?.error?.fields || {}
      throw error
    }
    return body.data
  }

  async deleteTeacher(id) {
    const res = await this.requestWithTimeout(`/api/v1/school/teachers/${id}`, { method: 'DELETE' })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const error = new Error(body?.error?.message || `Gagal menghapus guru (HTTP ${res.status})`)
      error.status = res.status
      error.code = body?.error?.code
      throw error
    }
    return true
  }

  async batchImportTeachers(teachersList, mode = 'upsert') {
    const res = await this.requestWithTimeout('/api/v1/school/teachers/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teachers: teachersList, mode })
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const error = new Error(body?.error?.message || `Gagal import batch guru (HTTP ${res.status})`)
      error.status = res.status
      error.code = body?.error?.code
      error.fields = body?.error?.fields || {}
      throw error
    }
    return body.data
  }

  // ==========================================================================
  // SUBJECTS (MATA PELAJARAN)
  // ==========================================================================

  async getSubjects(filters = {}) {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.search) params.set('search', filters.search)
    if (filters.is_active !== undefined && filters.is_active !== null && filters.is_active !== '') {
      params.set('is_active', String(filters.is_active))
    }
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))

    const queryString = params.toString() ? `?${params.toString()}` : ''
    const url = `/api/v1/school/subjects${queryString}`

    try {
      const res = await this.requestWithTimeout(url, { method: 'GET' })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const error = new Error(errorData?.error?.message || `Gagal memuat mata pelajaran (HTTP ${res.status})`)
        error.status = res.status
        error.code = errorData?.error?.code
        throw error
      }
      const body = await res.json()
      const data = body.data || []
      const pagination = body.pagination || { page: 1, limit: data.length, total: data.length, total_pages: 1 }

      this.writeCacheEnvelope('subjects', data)

      if (typeof localStorage !== 'undefined' && (!filters.q && !filters.search)) {
        localStorage.setItem('guruKu_mapel', JSON.stringify(data))
      }

      return { data, pagination, fromCache: false }
    } catch (err) {
      const cached = this.readCacheEnvelope('subjects')
      if (cached && Array.isArray(cached)) {
        return {
          data: cached,
          pagination: { page: 1, limit: cached.length, total: cached.length, total_pages: 1 },
          fromCache: true,
          error: err
        }
      }
      throw err
    }
  }

  async getSubjectById(id) {
    const res = await this.requestWithTimeout(`/api/v1/school/subjects/${id}`, { method: 'GET' })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const error = new Error(errorData?.error?.message || `Mata pelajaran tidak ditemukan (HTTP ${res.status})`)
      error.status = res.status
      throw error
    }
    const body = await res.json()
    return body.data
  }

  async createSubject(payload) {
    const res = await this.requestWithTimeout('/api/v1/school/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const error = new Error(body?.error?.message || `Gagal menambahkan mata pelajaran (HTTP ${res.status})`)
      error.status = res.status
      error.code = body?.error?.code
      error.fields = body?.error?.fields || {}
      throw error
    }
    return body.data
  }

  async updateSubject(id, payload) {
    const res = await this.requestWithTimeout(`/api/v1/school/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const error = new Error(body?.error?.message || `Gagal memperbarui mata pelajaran (HTTP ${res.status})`)
      error.status = res.status
      error.code = body?.error?.code
      error.fields = body?.error?.fields || {}
      throw error
    }
    return body.data
  }

  async deleteSubject(id) {
    const res = await this.requestWithTimeout(`/api/v1/school/subjects/${id}`, { method: 'DELETE' })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const error = new Error(body?.error?.message || `Gagal menghapus mata pelajaran (HTTP ${res.status})`)
      error.status = res.status
      error.code = body?.error?.code
      throw error
    }
    return true
  }

  async batchImportSubjects(subjectsList, mode = 'upsert') {
    const res = await this.requestWithTimeout('/api/v1/school/subjects/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjects: subjectsList, mode })
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const error = new Error(body?.error?.message || `Gagal import batch mata pelajaran (HTTP ${res.status})`)
      error.status = res.status
      error.code = body?.error?.code
      error.fields = body?.error?.fields || {}
      throw error
    }
    return body.data
  }
}

export const masterDataRepository = new MasterDataRepository()
