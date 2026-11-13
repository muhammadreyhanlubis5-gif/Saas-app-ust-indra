import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  toCanonicalClass,
  toCanonicalTeacher,
  toCanonicalSubject,
  computeUpsertKey,
  UPSERT_ERROR_UNSAFE_KEY
} from '../src/core/canonicalMapper.js'

describe('PHASE C.2 — CANONICAL MAPPER & DETERMINISTIC UPSERT KEY TESTS', () => {
  const tenantId = '11111111-1111-4111-a111-111111111111'

  test('1. toCanonicalClass menormalkan beragam variasi field Excel/API', () => {
    const raw = {
      nama_kelas: ' 4 TM ',
      tingkat: '4',
      tahun_pelajaran: '2026/2027',
      wali_kelas: 'Muhammad Fahmi',
      jumlah_siswa: '32'
    }

    const canonical = toCanonicalClass(raw)
    assert.strictEqual(canonical.name, '4 TM')
    assert.strictEqual(canonical.grade_level, 4)
    assert.strictEqual(canonical.academic_year, '2026/2027')
    assert.strictEqual(canonical.homeroom_teacher_name, 'Muhammad Fahmi')
    assert.strictEqual(canonical.student_count, 32)
    assert.strictEqual(canonical.is_active, true)
  })

  test('2. toCanonicalTeacher menormalkan kode dan gelar guru', () => {
    const raw = {
      teacher_code: 'mh ',
      teacher_name: ' Marwan Halim, M.Ag ',
      nip: ' 198001012005011001 '
    }

    const canonical = toCanonicalTeacher(raw)
    assert.strictEqual(canonical.code, 'MH')
    assert.strictEqual(canonical.name, 'Marwan Halim, M.Ag')
    assert.strictEqual(canonical.nip_nuptk, '198001012005011001')
  })

  test('3. toCanonicalSubject menormalkan kode mapel dan alokasi default', () => {
    const raw = {
      kode_mapel: 'bio ',
      nama_mapel: ' Biologi ',
      kategori: 'MIPA',
      jam_mingguan: '4'
    }

    const canonical = toCanonicalSubject(raw)
    assert.strictEqual(canonical.code, 'BIO')
    assert.strictEqual(canonical.name, 'Biologi')
    assert.strictEqual(canonical.category, 'MIPA')
    assert.strictEqual(canonical.weekly_default_hours, 4)
  })

  test('4. computeUpsertKey menghasilkan key stabil deterministik untuk classes', () => {
    const cls = { name: '4 SAINS', academic_year: '2026/2027' }
    const key = computeUpsertKey('classes', cls, tenantId)
    assert.strictEqual(key, `${tenantId}:2026/2027:4 sains`)
  })

  test('5. computeUpsertKey menghasilkan key stabil deterministik untuk teachers (prefer code)', () => {
    const tchr = { code: 'PHY', name: 'Prasilo Heri' }
    const key = computeUpsertKey('teachers', tchr, tenantId)
    assert.strictEqual(key, `${tenantId}:code:PHY`)
  })

  test('6. computeUpsertKey melempar UPSERT_UNSAFE_KEY jika data tidak memiliki key stabil', () => {
    const invalidClass = { name: '', academic_year: '2026/2027' }
    assert.throws(
      () => computeUpsertKey('classes', invalidClass, tenantId),
      (err) => err.code === UPSERT_ERROR_UNSAFE_KEY
    )

    const invalidSubject = { name: 'Matematika' } // missing code
    assert.throws(
      () => computeUpsertKey('subjects', invalidSubject, tenantId),
      (err) => err.code === UPSERT_ERROR_UNSAFE_KEY
    )
  })
})
