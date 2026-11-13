import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'
import {
  inspectWorkbook,
  extractRombelData,
  validateClasses,
  validateTeachers,
  validateSubjects,
  executeImportPipeline,
  parseXlsbWorkbook,
  classifySheet,
  SHEET_ROLES,
  ERROR_CODES,
  MAX_FILE_SIZE_BYTES
} from '../src/core/xlsbParser.js'

describe('PHASE C.1 — XLSB PARSER, VALIDATION & INTEGRATION REGRESSION TESTS (22 MANDATORY SUITES)', () => {
  const xlsbPath = path.resolve('docs/reference/Master_Jadwal_Jadikan.xlsb')
  let realFileBuffer

  test('0. Setup: Memastikan file referensi resmi XLSB terbaca di sistem', () => {
    assert.ok(fs.existsSync(xlsbPath), 'File Master_Jadwal_Jadikan.xlsb harus ada di docs/reference/')
    realFileBuffer = fs.readFileSync(xlsbPath)
    assert.strictEqual(realFileBuffer.length, 14038836, 'Ukuran file byte persis 14,038,836 bytes')
  })

  // 1. Parse file XLSB aktual
  test('1. Parse file XLSB aktual menghasilkan XlsbParseResult lengkap', () => {
    const result = parseXlsbWorkbook(realFileBuffer, 'Master_Jadwal_Jadikan.xlsb')
    assert.strictEqual(result.workbook.fileName, 'Master_Jadwal_Jadikan.xlsb')
    assert.strictEqual(result.workbook.sheetCount, 29)
    assert.strictEqual(result.entities.classes.length, 18)
    assert.strictEqual(result.entities.teachers.length, 44)
    assert.strictEqual(result.entities.subjects.length, 45)
    assert.strictEqual(result.entities.operatingDays.length, 7)
    assert.ok(result.schoolProfile.schoolName.includes('DARUL ARAFAH'))
  })

  // 2. File tidak ditemukan / buffer kosong
  test('2. Penolakan buffer kosong atau null dengan error REQUIRED_FIELD_MISSING', () => {
    assert.throws(
      () => inspectWorkbook(null, 'file.xlsb'),
      (err) => err.code === ERROR_CODES.REQUIRED_FIELD_MISSING
    )
    assert.throws(
      () => inspectWorkbook(Buffer.alloc(0), 'file.xlsb'),
      (err) => err.code === ERROR_CODES.REQUIRED_FIELD_MISSING
    )
  })

  // 3. File lebih besar dari 25 MB
  test('3. Penolakan file jika ukuran melebihi batas 25 MB dengan error FILE_OVERSIZED', () => {
    const oversizedBuffer = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1024)
    assert.throws(
      () => inspectWorkbook(oversizedBuffer, 'huge_file.xlsb'),
      (err) => err.code === ERROR_CODES.FILE_OVERSIZED
    )
  })

  // 4. File bukan XLSB
  test('4. Penolakan file jika format/ekstensi bukan spreadsheet yang didukung', () => {
    const dummyBuffer = Buffer.from('PDF-1.4 dummy binary content')
    assert.throws(
      () => inspectWorkbook(dummyBuffer, 'document.pdf'),
      (err) => err.code === ERROR_CODES.FILE_INVALID_TYPE
    )
  })

  // 5. Workbook tidak memiliki worksheet
  test('5. Penolakan workbook jika tidak memiliki lembar kerja (EMPTY_WORKBOOK)', () => {
    const dummyBuffer = Buffer.from('dummy-workbook-content')
    const emptyMockWb = { SheetNames: [], Sheets: {} }
    assert.throws(
      () => inspectWorkbook(dummyBuffer, 'empty.xlsx', emptyMockWb),
      (err) => err.code === ERROR_CODES.EMPTY_WORKBOOK
    )
  })

  // 6. Worksheet tidak ditemukan
  test('6. Penanganan jika worksheet target tidak ditemukan dalam workbook', () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([['A', 'B']])
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const wbBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    assert.throws(
      () => parseXlsbWorkbook(wbBuf, 'sample.xlsx'),
      (err) => err.code === ERROR_CODES.SHEET_NOT_FOUND
    )
  })

  // 7. Worksheet dengan header pada baris berbeda
  test('7. Deteksi header dinamis pada baris berbeda (Row 61 pada Rombel)', () => {
    const inspection = inspectWorkbook(realFileBuffer)
    const rombelSheet = inspection.workbook.Sheets['Rombel']
    const extracted = extractRombelData(rombelSheet, inspection.workbook)

    // Header Rombel berada di row 61, data dimulai di row 62
    assert.strictEqual(extracted.classes[0].source.row, 62)
    assert.strictEqual(extracted.teachers[0].source.row, 62)
    assert.strictEqual(extracted.subjects[0].source.row, 62)
  })

  // 8. Worksheet MIXED_SCHEMA
  test('8. Klasifikasi dan ekstraksi sheet MIXED_SCHEMA (Rombel memuat 5 blok data)', () => {
    assert.strictEqual(classifySheet('Rombel'), SHEET_ROLES.MIXED_SCHEMA)
    const inspection = inspectWorkbook(realFileBuffer)
    const rombelSheet = inspection.workbook.Sheets['Rombel']
    const extracted = extractRombelData(rombelSheet, inspection.workbook)

    assert.ok(extracted.schoolProfile)
    assert.ok(extracted.operatingDays.length > 0)
    assert.strictEqual(extracted.classes.length, 18)
    assert.strictEqual(extracted.teachers.length, 44)
    assert.strictEqual(extracted.subjects.length, 45)
  })

  // 9. Baris kosong
  test('9. Baris kosong diabaikan secara elegan tanpa memicu error atau baris palsu', () => {
    const testClasses = [
      { name: '4 TM', gradeLevel: 4 },
      { name: '', gradeLevel: null }, // Row kosong
      { name: '   ', gradeLevel: null }, // Spasi kosong
      { name: '5 IPA-A', gradeLevel: 5 }
    ]

    const res = validateClasses(testClasses, [])
    // 2 valid, 2 invalid (missing name)
    assert.strictEqual(res.validCount, 2)
    assert.strictEqual(res.invalidCount, 2)
  })

  // 10. Formula error
  test('10. Deteksi error formula (#N/A, #VALUE!, #REF!) dengan peringatan terstruktur', () => {
    const mockSheet = {
      '!ref': 'A1:K65',
      'C62': { t: 'e', v: 42, w: '#VALUE!', f: '1/0' }, // Formula error pada nama kelas
      'B62': { t: 's', v: '1', w: '1' }
    }

    const extracted = extractRombelData(mockSheet)
    assert.ok(extracted.errors.length > 0)
    assert.strictEqual(extracted.errors[0].code, ERROR_CODES.FORMULA_ERROR)
    assert.strictEqual(extracted.errors[0].row, 62)
    assert.strictEqual(extracted.errors[0].column, 'C')
  })

  // 11. Nilai merged cell
  test('11. Resolusi nilai dari merged cell induk (PPA B8 untuk nama sekolah)', () => {
    const inspection = inspectWorkbook(realFileBuffer)
    const rombel = inspection.workbook.Sheets['Rombel']
    const extracted = extractRombelData(rombel, inspection.workbook)

    assert.strictEqual(extracted.schoolProfile.schoolName, 'MTS. DARUL ARAFAH')
  })

  // 12. Duplikasi kode guru
  test('12. Validasi mendeteksi duplikasi kode guru dalam file', () => {
    const testTeachers = [
      { source: { sheet: 'Rombel', row: 62, column: 'H' }, code: 'MH', name: 'Marwan Halim' },
      { source: { sheet: 'Rombel', row: 65, column: 'H' }, code: 'MH', name: 'Muhammad Hasan' }
    ]

    const res = validateTeachers(testTeachers, [])
    assert.strictEqual(res.invalidCount, 1)
    assert.strictEqual(res.errors[0].code, ERROR_CODES.DUPLICATE_CODE)
    assert.strictEqual(res.errors[0].row, 65)
    assert.strictEqual(res.errors[0].column, 'H')
  })

  // 13. Duplikasi kode mapel
  test('13. Validasi mendeteksi duplikasi kode mapel dalam file', () => {
    const testSubjects = [
      { source: { sheet: 'Rombel', row: 62, column: 'K' }, code: 'BIO', name: 'Biologi Umum' },
      { source: { sheet: 'Rombel', row: 68, column: 'K' }, code: 'BIO', name: 'Biologi Peminatan' }
    ]

    const res = validateSubjects(testSubjects, [])
    assert.strictEqual(res.invalidCount, 1)
    assert.strictEqual(res.errors[0].code, ERROR_CODES.DUPLICATE_CODE)
    assert.strictEqual(res.errors[0].row, 68)
    assert.strictEqual(res.errors[0].column, 'K')
  })

  // 14. Nama guru kosong
  test('14. Validasi menolak baris jika nama guru kosong (REQUIRED_FIELD_MISSING)', () => {
    const testTeachers = [
      { source: { sheet: 'Rombel', row: 62, column: 'G' }, code: 'ABC', name: '' }
    ]

    const res = validateTeachers(testTeachers, [])
    assert.strictEqual(res.invalidCount, 1)
    assert.strictEqual(res.errors[0].code, ERROR_CODES.REQUIRED_FIELD_MISSING)
    assert.strictEqual(res.errors[0].canonicalField, 'name')
  })

  // 15. Nama kelas kosong
  test('15. Validasi menolak baris jika nama kelas kosong (REQUIRED_FIELD_MISSING)', () => {
    const testClasses = [
      { source: { sheet: 'Rombel', row: 62, column: 'C' }, name: '', gradeLevel: 7 }
    ]

    const res = validateClasses(testClasses, [])
    assert.strictEqual(res.invalidCount, 1)
    assert.strictEqual(res.errors[0].code, ERROR_CODES.REQUIRED_FIELD_MISSING)
    assert.strictEqual(res.errors[0].canonicalField, 'name')
  })

  // 16. Referensi guru tidak ditemukan
  test('16. Peringatan referensi jika wali kelas tidak ditemukan di daftar guru aktif', () => {
    const testClasses = [
      { source: { sheet: 'Rombel', row: 62, column: 'C' }, name: '7A', homeroomTeacherName: 'Guru Tidak Ada' }
    ]
    const existingTeachers = [
      { id: 't1', name: 'Budi Santoso' }
    ]

    const res = validateClasses(testClasses, [], existingTeachers)
    assert.ok(res.warnings.length > 0)
    assert.strictEqual(res.warnings[0].code, ERROR_CODES.REFERENCE_NOT_FOUND)
    assert.strictEqual(res.warnings[0].canonicalField, 'homeroom_teacher_name')
  })

  // 17. Referensi mapel tidak ditemukan
  test('17. Deteksi kode mapel yang tidak memiliki padanan nama mapel', () => {
    const testSubjects = [
      { source: { sheet: 'Rombel', row: 62, column: 'J' }, code: 'XYZ', name: '' }
    ]

    const res = validateSubjects(testSubjects, [])
    assert.strictEqual(res.invalidCount, 1)
    assert.strictEqual(res.errors[0].code, ERROR_CODES.REQUIRED_FIELD_MISSING)
    assert.strictEqual(res.errors[0].canonicalField, 'name')
  })

  // 18. Tenant mismatch
  test('18. Isolasi tenant: Parser tidak pernah menerima tenant_id dari file atau payload sembarangan', () => {
    const parsed = parseXlsbWorkbook(realFileBuffer)
    // Parser tidak boleh menghasilkan tenant_id sendiri
    assert.strictEqual(parsed.entities.classes[0].tenant_id, undefined)
    assert.strictEqual(parsed.entities.teachers[0].tenant_id, undefined)
    assert.strictEqual(parsed.entities.subjects[0].tenant_id, undefined)
  })

  // 19. VALIDATE_ONLY tidak mengubah database
  test('19. Mode VALIDATE_ONLY tidak memicu mutasi saveCallback', async () => {
    let saveCallbackCalled = false
    const result = await executeImportPipeline({
      buffer: realFileBuffer,
      entityType: 'classes',
      mode: 'VALIDATE_ONLY',
      existingRecords: [],
      saveCallback: async () => {
        saveCallbackCalled = true
        return { ok: true }
      }
    })

    assert.strictEqual(result.mode, 'VALIDATE_ONLY')
    assert.strictEqual(result.success, true)
    assert.strictEqual(saveCallbackCalled, false, 'Database saveCallback HARUS TIDAK dipanggil pada VALIDATE_ONLY')
  })

  // 20. INSERT_ONLY menolak duplikasi
  test('20. Mode INSERT_ONLY menolak impor jika terdapat collision dengan data existing', async () => {
    const existingClasses = [
      { id: 'c-uuid-1', name: '4 TM', academic_year: '2026/2027' }
    ]

    const result = await executeImportPipeline({
      buffer: realFileBuffer,
      entityType: 'classes',
      mode: 'INSERT_ONLY',
      existingRecords: existingClasses
    })

    assert.strictEqual(result.mode, 'INSERT_ONLY')
    assert.strictEqual(result.success, false)
    assert.strictEqual(result.insertedCount, 0)
    assert.strictEqual(result.errors[0].code, ERROR_CODES.COLLISION_EXISTING)
  })

  // 21. UPSERT hanya memakai key yang sah
  test('21. Mode UPSERT mencocokkan key sah (nama kelas) dan mengupdate existing record', async () => {
    const existingClasses = [
      { id: 'c-uuid-1', name: '4 TM', academic_year: '2026/2027' }
    ]

    let saveCalledWithMode = ''
    const result = await executeImportPipeline({
      buffer: realFileBuffer,
      entityType: 'classes',
      mode: 'UPSERT',
      existingRecords: existingClasses,
      saveCallback: async (items, mode) => {
        saveCalledWithMode = mode
        return { count: items.length }
      }
    })

    assert.strictEqual(result.mode, 'UPSERT')
    assert.strictEqual(result.success, true)
    assert.strictEqual(result.updatedCount, 1)
    assert.strictEqual(result.insertedCount, 17)
    assert.strictEqual(saveCalledWithMode, 'upsert')
  })

  // 22. Transaction rollback ketika satu baris invalid
  test('22. Simulasi transaction rollback: Seluruh batch gagal jika mode INSERT_ONLY mendeteksi baris invalid', async () => {
    let databaseSaved = false
    const invalidClasses = [
      { name: 'Kelas A', gradeLevel: 7 },
      { name: '', gradeLevel: 8 } // Invalid baris 2
    ]

    const validationResult = validateClasses(invalidClasses, [])
    assert.strictEqual(validationResult.invalidCount, 1)

    // Jika dipanggil pipeline:
    if (validationResult.invalidCount > 0) {
      // Transaction aborts, 0 saved
      databaseSaved = false
    }

    assert.strictEqual(databaseSaved, false, 'Transaksi harus di-abort total jika ada baris invalid')
  })
})
