import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

import {
  createDefaultClass,
  validateClass,
  validateClassExcelRow,
  createDefaultTeacher,
  validateTeacher,
  createDefaultSubject,
  validateSubject,
  MASTER_DATA_CACHE_SCHEMA_VERSION
} from '../src/types/masterData.js'

import { MasterDataRepository } from '../src/core/masterDataRepository.js'

// Simple mock for browser localStorage in Node test environment
class MockLocalStorage {
  constructor() {
    this.store = new Map()
  }
  getItem(key) {
    return this.store.get(key) || null
  }
  setItem(key, value) {
    this.store.set(key, String(value))
  }
  removeItem(key) {
    this.store.delete(key)
  }
  clear() {
    this.store.clear()
  }
}

describe('PHASE B — MASTER DATA VALIDATION & REPOSITORY TESTS', () => {
  let originalLocalStorage
  let mockStorage

  beforeEach(() => {
    mockStorage = new MockLocalStorage()
    originalLocalStorage = globalThis.localStorage
    globalThis.localStorage = mockStorage
  })

  afterEach(() => {
    globalThis.localStorage = originalLocalStorage
  })

  describe('1. Domain Model & Validation Rules', () => {
    test('validateClass: Validates required name, academic year, and student_count >= 0', () => {
      // 1. Valid Class
      const valid = createDefaultClass({
        name: '7 A',
        academic_year: '2024/2025',
        student_count: 32
      })
      const resValid = validateClass(valid)
      assert.strictEqual(resValid.valid, true)
      assert.deepStrictEqual(resValid.errors, {})

      // 2. Missing Name
      const invalidName = createDefaultClass({ name: '', academic_year: '2024/2025' })
      const resName = validateClass(invalidName)
      assert.strictEqual(resName.valid, false)
      assert.ok(resName.errors.name, 'Expected error on empty name')

      // 3. Missing Academic Year
      const invalidYear = createDefaultClass({ name: '7 A', academic_year: '' })
      const resYear = validateClass(invalidYear)
      assert.strictEqual(resYear.valid, false)
      assert.ok(resYear.errors.academic_year, 'Expected error on empty academic_year')

      // 4. Negative Student Count
      const invalidCount = createDefaultClass({ name: '7 A', academic_year: '2024/2025', student_count: -1 })
      const resCount = validateClass(invalidCount)
      assert.strictEqual(resCount.valid, false)
      assert.ok(resCount.errors.student_count, 'Expected error on negative student_count')
    })

    test('validateTeacher: Validates teacher name is required', () => {
      const valid = createDefaultTeacher({ name: 'Budi Santoso, S.Pd' })
      assert.strictEqual(validateTeacher(valid).valid, true)

      const invalid = createDefaultTeacher({ name: '   ' })
      const res = validateTeacher(invalid)
      assert.strictEqual(res.valid, false)
      assert.ok(res.errors.name, 'Expected error on empty teacher name')
    })

    test('validateSubject: Validates required code, name, and weekly hours >= 0', () => {
      const valid = createDefaultSubject({
        code: 'MTK',
        name: 'Matematika',
        weekly_default_hours: 4
      })
      assert.strictEqual(validateSubject(valid).valid, true)

      // Empty code
      const noCode = createDefaultSubject({ code: '', name: 'Matematika' })
      assert.strictEqual(validateSubject(noCode).valid, false)

      // Empty name
      const noName = createDefaultSubject({ code: 'MTK', name: '' })
      assert.strictEqual(validateSubject(noName).valid, false)

      // Negative hours
      const negHours = createDefaultSubject({ code: 'MTK', name: 'Matematika', weekly_default_hours: -3 })
      const res = validateSubject(negHours)
      assert.strictEqual(res.valid, false)
      assert.ok(res.errors.weekly_default_hours)
    })
  })

  describe('2. Excel Row-Level Validation (Classes)', () => {
    test('validateClassExcelRow: Parses valid row correctly with case-insensitive column headers', () => {
      const rawRow = {
        'Nama Kelas': '10 MIPA 1',
        'Tingkat': '10',
        'Jurusan': 'MIPA',
        'Wali Kelas': 'Dewi Lestari, S.Pd',
        'Jumlah Siswa': '36'
      }
      const seen = new Set()
      const res = validateClassExcelRow(rawRow, 1, seen)

      assert.strictEqual(res.valid, true)
      assert.strictEqual(res.errors.length, 0)
      assert.strictEqual(res.parsedData.name, '10 MIPA 1')
      assert.strictEqual(res.parsedData.grade_level, 10)
      assert.strictEqual(res.parsedData.major, 'MIPA')
      assert.strictEqual(res.parsedData.homeroom_teacher_name, 'Dewi Lestari, S.Pd')
      assert.strictEqual(res.parsedData.student_count, 36)
      assert.strictEqual(res.parsedData.is_active, true)
    })

    test('validateClassExcelRow: Catches missing class name and invalid negative count', () => {
      const rawRow = {
        'Nama Kelas': '',
        'Jumlah Siswa': '-5'
      }
      const res = validateClassExcelRow(rawRow, 2, new Set())
      assert.strictEqual(res.valid, false)
      assert.strictEqual(res.errors.length, 2)
      assert.ok(res.errors.some(e => e.includes('Nama kelas kosong')))
      assert.ok(res.errors.some(e => e.includes('tidak boleh negatif')))
    })

    test('validateClassExcelRow: Warns on duplicate class name within the batch', () => {
      const seen = new Set()
      const row1 = { 'Nama Kelas': '7 A', 'Jumlah Siswa': 30 }
      const row2 = { 'Nama Kelas': '7 a', 'Jumlah Siswa': 32 }

      const res1 = validateClassExcelRow(row1, 1, seen)
      assert.strictEqual(res1.valid, true)
      assert.strictEqual(res1.warnings.length, 0)

      const res2 = validateClassExcelRow(row2, 2, seen)
      assert.strictEqual(res2.valid, true)
      assert.strictEqual(res2.warnings.length, 1)
      assert.ok(res2.warnings[0].includes('terduplikasi dalam file Excel'))
    })
  })

  describe('3. MasterDataRepository Cache & Tenant Isolation', () => {
    test('Cache Envelope guarantees schema versioning and tenant isolation', () => {
      const repo = new MasterDataRepository('http://localhost:8080')
      const tenantA = 'tenant-school-alpha'
      const tenantB = 'tenant-school-beta'

      const classesA = [{ id: 'cls-1', name: '7 A', student_count: 30 }]
      const classesB = [{ id: 'cls-2', name: '8 B', student_count: 32 }]

      // Write cache for Tenant A
      repo.writeCacheEnvelope('classes', classesA, tenantA)
      // Write cache for Tenant B
      repo.writeCacheEnvelope('classes', classesB, tenantB)

      // Verify Tenant A reads only Tenant A
      const readA = repo.readCacheEnvelope('classes', tenantA)
      assert.deepStrictEqual(readA, classesA)

      // Verify Tenant B reads only Tenant B
      const readB = repo.readCacheEnvelope('classes', tenantB)
      assert.deepStrictEqual(readB, classesB)

      // Verify raw cache envelope structure
      const rawEnvelope = JSON.parse(mockStorage.getItem('guruku_md_classes_tenant-school-alpha'))
      assert.strictEqual(rawEnvelope.schemaVersion, MASTER_DATA_CACHE_SCHEMA_VERSION)
      assert.strictEqual(rawEnvelope.tenantId, tenantA)
      assert.ok(rawEnvelope.updatedAt)

      // Clear Tenant A does NOT affect Tenant B
      repo.clearTenantCache(tenantA)
      assert.strictEqual(repo.readCacheEnvelope('classes', tenantA), null)
      assert.deepStrictEqual(repo.readCacheEnvelope('classes', tenantB), classesB)
    })

    test('Cache Envelope invalidates on mismatched schema version', () => {
      const repo = new MasterDataRepository()
      const tenant = 'tenant-schema-test'

      mockStorage.setItem('guruku_md_classes_tenant-schema-test', JSON.stringify({
        schemaVersion: 999, // Outdated/mismatched version
        tenantId: tenant,
        updatedAt: new Date().toISOString(),
        data: [{ id: '1', name: 'Outdated' }]
      }))

      const result = repo.readCacheEnvelope('classes', tenant)
      assert.strictEqual(result, null, 'Cache must be ignored if schemaVersion does not match')
    })
  })

  describe('4. MasterDataRepository HTTP Retry & Error Handling Policy', () => {
    test('requestWithTimeout does NOT retry client errors (400, 401, 403, 404, 422)', async () => {
      const repo = new MasterDataRepository()
      let callCount = 0

      // Mock global fetch returning HTTP 422
      const originalFetch = globalThis.fetch
      globalThis.fetch = async () => {
        callCount++
        return {
          ok: false,
          status: 422,
          json: async () => ({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Nama kelas wajib diisi' }
          })
        }
      }

      try {
        const res = await repo.requestWithTimeout('/api/v1/school/classes', { method: 'POST' })
        assert.strictEqual(res.status, 422)
        assert.strictEqual(callCount, 1, '422 must return immediately without retry')
      } finally {
        globalThis.fetch = originalFetch
      }
    })

    test('requestWithTimeout retries transient errors (500, 503) up to maxRetries', async () => {
      const repo = new MasterDataRepository()
      let callCount = 0

      const originalFetch = globalThis.fetch
      globalThis.fetch = async () => {
        callCount++
        if (callCount < 2) {
          return { ok: false, status: 503 }
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: [] })
        }
      }

      try {
        const res = await repo.requestWithTimeout('/api/v1/school/classes', { method: 'GET' }, 2000, 2)
        assert.strictEqual(res.status, 200)
        assert.strictEqual(callCount, 2, 'Should succeed on second attempt after retry')
      } finally {
        globalThis.fetch = originalFetch
      }
    })
  })

  describe('5. MasterDataRepository CRUD & Batch Contracts', () => {
    test('getClasses falls back to cached data when network fails', async () => {
      const repo = new MasterDataRepository()
      const tenant = 'offline-test-tenant'
      mockStorage.setItem('school_id', tenant)

      const cachedClasses = [{ id: 'cls-cache-1', name: '7 C', student_count: 28 }]
      repo.writeCacheEnvelope('classes', cachedClasses, tenant)

      // Simulate complete network failure
      const originalFetch = globalThis.fetch
      globalThis.fetch = async () => {
        throw new TypeError('Failed to fetch (offline network)')
      }

      try {
        const result = await repo.getClasses()
        assert.strictEqual(result.fromCache, true)
        assert.deepStrictEqual(result.data, cachedClasses)
        assert.ok(result.error)
      } finally {
        globalThis.fetch = originalFetch
      }
    })

    test('batchImportClasses posts valid payload and parses batch results', async () => {
      const repo = new MasterDataRepository()
      const originalFetch = globalThis.fetch

      let postedBody = null
      globalThis.fetch = async (url, options) => {
        postedBody = JSON.parse(options.body)
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              total: 2,
              inserted: 2,
              updated: 0,
              skipped: 0,
              failed: 0,
              errors: []
            }
          })
        }
      }

      try {
        const classesToImport = [
          { name: '7 A', student_count: 30 },
          { name: '7 B', student_count: 32 }
        ]
        const result = await repo.batchImportClasses(classesToImport, 'upsert')

        assert.strictEqual(postedBody.mode, 'upsert')
        assert.strictEqual(postedBody.classes.length, 2)
        assert.strictEqual(result.inserted, 2)
        assert.strictEqual(result.failed, 0)
      } finally {
        globalThis.fetch = originalFetch
      }
    })
  })
})
