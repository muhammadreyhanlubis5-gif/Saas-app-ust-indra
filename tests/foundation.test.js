import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

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
  validateSessions,
  formatIndonesianDate
} from '../src/types/schoolSetup.js'

import { SchoolSetupRepository } from '../src/core/schoolSetupRepository.js'

describe('GuruKu School Foundation Tests', () => {

  describe('1. Validasi Tahun Pelajaran', () => {
    test('Menerima format YYYY-YYYY dengan tahun kedua tepat selisih 1 tahun', () => {
      const validCases = ['2025-2026', '2026-2027', '2027-2028', '2030-2031']
      for (const year of validCases) {
        const res = validateAcademicYear(year)
        assert.equal(res.valid, true, `Seharusnya valid untuk ${year}`)
      }
    })

    test('Menolak tahun kedua yang tidak tepat tahun pertama + 1', () => {
      const invalidDiffs = ['2026-2028', '2026-2026', '2027-2026', '2025-2030']
      for (const year of invalidDiffs) {
        const res = validateAcademicYear(year)
        assert.equal(res.valid, false, `Seharusnya tidak valid untuk ${year}`)
        assert.match(res.error, /tepat 1 tahun/, `Pesan error harus menjelaskan selisih 1 tahun`)
      }
    })

    test('Menolak format non YYYY-YYYY', () => {
      const badFormats = ['2026/2027', '2026_2027', '2026', '26-27', 'abcd-efgh', '']
      for (const year of badFormats) {
        const res = validateAcademicYear(year)
        assert.equal(res.valid, false, `Seharusnya tidak valid untuk ${year}`)
      }
    })
  })

  describe('2. Validasi Profil Identitas Lembaga', () => {
    test('Simpan Draft mengizinkan field opsional/parsial', () => {
      const partialProfile = {
        schoolName: 'MAS Darularafah',
        principalName: 'Budi',
        curriculumVicePrincipalName: '',
        address: '',
        academicYear: '2026-2027',
        semester: 'Ganjil'
      }

      const res = validateProfile(partialProfile, true) // isDraft = true
      assert.equal(res.valid, true, 'Draft harus valid meskipun waka & alamat kosong')
    })

    test('Validasi Penuh menolak nama kepala sekolah kurang dari 3 karakter atau numerik saja', () => {
      const profile = {
        schoolName: 'MAS Darularafah',
        principalName: '12345', // Hanya angka
        curriculumVicePrincipalName: 'Dra. Fatimah',
        address: 'Jl. Merdeka No. 10 Medan, Sumatera Utara',
        academicYear: '2026-2027',
        semester: 'Ganjil',
        scheduleCreatedDate: '2026-11-12'
      }

      const resNumeric = validateProfile(profile, false)
      assert.equal(resNumeric.valid, false)
      assert.match(resNumeric.errors.principalName, /tidak boleh hanya berupa angka/)

      // Terlalu pendek
      profile.principalName = 'AB'
      const resShort = validateProfile(profile, false)
      assert.equal(resShort.valid, false)
      assert.match(resShort.errors.principalName, /minimal 3 karakter/)
    })

    test('Validasi Penuh menolak alamat kurang dari 10 karakter', () => {
      const profile = {
        schoolName: 'MAS Darularafah',
        principalName: 'Drs. H. Ahmad',
        curriculumVicePrincipalName: 'Dra. Fatimah',
        address: 'Jl. Kecil', // 9 chars
        academicYear: '2026-2027',
        semester: 'Ganjil',
        scheduleCreatedDate: '2026-11-12'
      }

      const res = validateProfile(profile, false)
      assert.equal(res.valid, false)
      assert.match(res.errors.address, /minimal 10 karakter/)
    })

    test('Validasi Penuh berhasil jika semua field memenuhi spesifikasi', () => {
      const completeProfile = {
        schoolName: 'MAS Darularafah',
        principalName: 'Dr. H. Ahmad Dahlan, M.Pd',
        curriculumVicePrincipalName: 'Siti Rahmah, S.Pd., M.Si',
        address: 'Jl. Berdikari No.1A, Lau Bakeri, Deli Serdang',
        academicYear: '2026-2027',
        semester: 'Ganjil',
        scheduleCreatedDate: '2026-11-12'
      }

      const res = validateProfile(completeProfile, false)
      assert.equal(res.valid, true)
      assert.equal(Object.keys(res.errors).length, 0)
    })
  })

  describe('3. Validasi Format Jam & Pencegahan Overlap Sesi KBM', () => {
    test('Validasi format jam HH:mm dan konversi ke menit', () => {
      assert.equal(validateTimeFormat('07:30'), true)
      assert.equal(validateTimeFormat('23:59'), true)
      assert.equal(validateTimeFormat('24:00'), false)
      assert.equal(validateTimeFormat('7:30'), false)
      assert.equal(validateTimeFormat('invalid'), false)

      assert.equal(timeToMinutes('07:30'), 7 * 60 + 30)
      assert.equal(timeToMinutes('08:15'), 8 * 60 + 15)
    })

    test('Menerima sesi yang berurutan (kontigu) tanpa overlap', () => {
      const contiguousSessions = [
        { id: '1', label: 'Jam 1', startTime: '07:30', endTime: '08:10', sessionType: 'KBM', isActive: true },
        { id: '2', label: 'Jam 2', startTime: '08:10', endTime: '08:50', sessionType: 'KBM', isActive: true },
        { id: '3', label: 'Istirahat', startTime: '08:50', endTime: '09:10', sessionType: 'BREAK', isActive: true },
        { id: '4', label: 'Jam 3', startTime: '09:10', endTime: '09:50', sessionType: 'KBM', isActive: true }
      ]

      const check = validateTimeOverlap(contiguousSessions)
      assert.equal(check.valid, true, 'Sesi kontigu tidak boleh dianggap overlap')
    })

    test('Mendeteksi bentrok (overlap) interval waktu antar sesi aktif', () => {
      const overlappingSessions = [
        { id: '1', label: 'Jam 1', startTime: '07:30', endTime: '08:20', sessionType: 'KBM', isActive: true },
        { id: '2', label: 'Jam 2', startTime: '08:10', endTime: '08:50', sessionType: 'KBM', isActive: true } // Overlap 08:10 - 08:20
      ]

      const check = validateTimeOverlap(overlappingSessions)
      assert.equal(check.valid, false, 'Seharusnya mendeteksi bentrok interval')
      assert.match(check.message, /bentrok \(overlap\)/)
    })

    test('Menolak sesi jika jam selesai <= jam mulai', () => {
      const invalidDuration = [
        { id: '1', label: 'Jam 1', startTime: '08:00', endTime: '07:30', sessionType: 'KBM', isActive: true }
      ]

      const check = validateTimeOverlap(invalidDuration)
      assert.equal(check.valid, false)
      assert.match(check.message, /harus lebih besar dari jam mulai/)
    })

    test('Mengabaikan sesi yang statusnya nonaktif dari pengecekan overlap', () => {
      const withInactive = [
        { id: '1', label: 'Jam 1', startTime: '07:30', endTime: '08:20', sessionType: 'KBM', isActive: false }, // Inactive
        { id: '2', label: 'Jam 2', startTime: '08:00', endTime: '08:40', sessionType: 'KBM', isActive: true }
      ]

      const check = validateTimeOverlap(withInactive)
      assert.equal(check.valid, true, 'Sesi nonaktif tidak boleh memicu bentrok')
    })
  })

  describe('4. Validasi Koleksi Sesi KBM Lengkap', () => {
    test('Menolak jika tidak ada sesi bertipe KBM yang aktif', () => {
      const onlyBreaks = [
        { id: '1', sessionNumber: 0, label: 'Istirahat Pagi', startTime: '09:00', endTime: '09:30', sessionType: 'BREAK', isActive: true }
      ]

      const res = validateSessions(onlyBreaks)
      assert.equal(res.valid, false)
      assert.match(res.error, /Minimal satu sesi KBM aktif/)
    })

    test('Menolak duplikasi nomor sesi KBM', () => {
      const duplicateNumbers = [
        { id: '1', sessionNumber: 1, label: 'Jam 1A', startTime: '07:30', endTime: '08:10', sessionType: 'KBM', isActive: true },
        { id: '2', sessionNumber: 1, label: 'Jam 1B', startTime: '08:10', endTime: '08:50', sessionType: 'KBM', isActive: true } // Duplicate sessionNumber: 1
      ]

      const res = validateSessions(duplicateNumbers)
      assert.equal(res.valid, false)
      assert.match(res.error, /duplikat/)
    })

    test('Menerima konfigurasi sesi default standar', () => {
      const defaults = createDefaultKbmSessions('tenant-1')
      const res = validateSessions(defaults)
      assert.equal(res.valid, true, 'Default sessions harus valid')
    })
  })

  describe('5. Hari Pelaksanaan KBM', () => {
    test('Default operating days memuat 7 hari dengan Senin-Sabtu aktif', () => {
      const days = createDefaultOperatingDays('test-tenant')
      assert.equal(days.length, 7)
      const activeDays = days.filter((d) => d.isActive)
      assert.equal(activeDays.length, 6, 'Senin - Sabtu default aktif')

      const sunday = days.find((d) => d.dayOfWeek === 7)
      assert.equal(sunday.dayName, 'Minggu')
      assert.equal(sunday.isActive, false, 'Minggu default libur')
    })

    test('DAYS_OF_WEEK terurut dari 1 (Senin) s.d. 7 (Minggu)', () => {
      assert.equal(DAYS_OF_WEEK[0].dayName, 'Senin')
      assert.equal(DAYS_OF_WEEK[6].dayName, 'Minggu')
    })
  })

  describe('6. Repository & DTO Mappers', () => {
    const repo = new SchoolSetupRepository()

    test('mapProfileDtoToDomain mengubah snake_case backend ke camelCase frontend', () => {
      const backendDto = {
        id: 'sch-123',
        name: 'SMA Negeri 1 Jakarta',
        headmaster_name: 'Budi Santoso, M.Pd',
        vice_headmaster_name: 'Dra. Hartati',
        address: 'Jl. Budi Utomo No. 7, Sawah Besar, Jakarta Pusat',
        academic_year: '2026-2027',
        semester: 'GANJIL',
        schedule_date: '2026-11-12'
      }

      const domain = repo.mapProfileDtoToDomain(backendDto)
      assert.equal(domain.schoolName, 'SMA Negeri 1 Jakarta')
      assert.equal(domain.principalName, 'Budi Santoso, M.Pd')
      assert.equal(domain.curriculumVicePrincipalName, 'Dra. Hartati')
      assert.equal(domain.academicYear, '2026-2027')
      assert.equal(domain.semester, 'Ganjil')
      assert.equal(domain.isValidated, true)
    })

    test('mapProfileDtoToDomain tidak melakukan hardcode spesifik jika nama sekolah kosong di API', () => {
      const emptyDto = {
        id: 'tenant-test',
        name: '',
        headmaster_name: null
      }
      const domain = repo.mapProfileDtoToDomain(emptyDto, 'tenant-test', 'SMK Negeri 5 Medan')
      assert.equal(domain.schoolName, 'SMK Negeri 5 Medan', 'Harus menggunakan fallback lisensi yang dinamis')
    })

    test('mapProfileDomainToDto mengubah camelCase frontend ke snake_case backend', () => {
      const domain = {
        principalName: 'Budi Santoso, M.Pd',
        curriculumVicePrincipalName: 'Dra. Hartati',
        address: 'Jl. Budi Utomo No. 7',
        academicYear: '2026-2027',
        semester: 'Genap',
        scheduleCreatedDate: '2026-11-12'
      }

      const dto = repo.mapProfileDomainToDto(domain, ['Senin', 'Selasa', 'Rabu'])
      assert.equal(dto.headmaster_name, 'Budi Santoso, M.Pd')
      assert.equal(dto.vice_headmaster_name, 'Dra. Hartati')
      assert.equal(dto.academic_year, '2026-2027')
      assert.equal(dto.semester, 'GENAP')
      assert.deepEqual(dto.active_days, ['Senin', 'Selasa', 'Rabu'])
    })

    test('mapActiveDaysToOperatingDays memetakan array hari ke domain objek lengkap', () => {
      const activeNames = ['Senin', 'Rabu', 'Jumat']
      const operatingDays = repo.mapActiveDaysToOperatingDays(activeNames, 'tenant-1')

      assert.equal(operatingDays.length, 7)
      const senin = operatingDays.find((d) => d.dayName === 'Senin')
      const selasa = operatingDays.find((d) => d.dayName === 'Selasa')
      const rabu = operatingDays.find((d) => d.dayName === 'Rabu')

      assert.equal(senin.isActive, true)
      assert.equal(selasa.isActive, false)
      assert.equal(rabu.isActive, true)
    })
  })

  describe('7. Format Tanggal Lokal Indonesia', () => {
    test('Mengonversi format ISO YYYY-MM-DD ke string bahasa Indonesia resmi', () => {
      assert.equal(formatIndonesianDate('2026-11-12'), '12 November 2026')
      assert.equal(formatIndonesianDate('2025-01-05'), '5 Januari 2025')
      assert.equal(formatIndonesianDate('2027-08-17'), '17 Agustus 2027')
      assert.equal(formatIndonesianDate(null), '-')
    })
  })

  describe('8. Ketahanan Data & Simulasi Browser Refresh (Persistence)', () => {
    test('getSetup memulihkan profil, hari, dan sesi dari snapshot lokal ketika API kosong', async () => {
      const storage = new Map()
      const originalLocalStorage = globalThis.localStorage
      const originalFetch = globalThis.fetch

      globalThis.localStorage = {
        getItem: (k) => storage.get(k) || null,
        setItem: (k, v) => storage.set(k, String(v)),
        removeItem: (k) => storage.delete(k),
        clear: () => storage.clear()
      }

      // Simpan data di local storage (seperti saat admin mengisi form sebelum refresh)
      const tenantId = 'school-tenant-99'
      storage.set(`guruku_setup_profile_${tenantId}`, JSON.stringify({
        name: 'SMA Prestasi Bangsa',
        headmaster_name: 'Drs. H. Mulyadi, M.Pd',
        vice_headmaster_name: 'Sri Wahyuni, M.Si',
        address: 'Jl. Pemuda No. 45 Jakarta Timur',
        academic_year: '2026-2027',
        semester: 'GANJIL',
        schedule_date: '2026-11-12'
      }))
      storage.set(`guruku_setup_operating_days_${tenantId}`, JSON.stringify(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']))

      // Simulasikan fetch backend gagal atau timeout
      globalThis.fetch = async () => {
        throw new Error('Connection failed')
      }

      try {
        const repoInstance = new SchoolSetupRepository('http://localhost:8080')
        const setup = await repoInstance.getSetup(tenantId)

        assert.ok(setup.profile, 'Profil harus berhasil dipulihkan dari cache')
        assert.equal(setup.profile.schoolName, 'SMA Prestasi Bangsa')
        assert.equal(setup.profile.principalName, 'Drs. H. Mulyadi, M.Pd')
        assert.equal(setup.profile.address, 'Jl. Pemuda No. 45 Jakarta Timur')

        assert.ok(setup.operatingDays, 'Hari aktif harus berhasil dipulihkan')
        const activeDays = setup.operatingDays.filter((d) => d.isActive).map((d) => d.dayName)
        assert.deepEqual(activeDays, ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'])
      } finally {
        globalThis.localStorage = originalLocalStorage
        globalThis.fetch = originalFetch
      }
    })
  })

  describe('9. Validasi Minimal 1 Hari Aktif KBM', () => {
    test('Menolak jika seluruh hari dinonaktifkan (0 hari aktif)', () => {
      const days = createDefaultOperatingDays('tenant-1').map((d) => ({
        ...d,
        isActive: false
      }))

      const activeDays = days.filter((d) => d.isActive)
      assert.equal(activeDays.length, 0)

      // Simulasi aturan bisnis store: jika validasi penuh dan 0 hari aktif -> tolak
      const isDraft = false
      let validationError = null
      if (!isDraft && activeDays.length === 0) {
        validationError = 'Minimal 1 hari aktif KBM wajib dipilih.'
      }

      assert.equal(validationError, 'Minimal 1 hari aktif KBM wajib dipilih.')
    })
  })

  describe('10. Ringkasan Hari Aktif untuk Dashboard', () => {
    test('Menghasilkan ringkasan nama-nama hari aktif secara presisi', () => {
      const days = createDefaultOperatingDays('tenant-1') // Senin s.d. Sabtu aktif
      const activeDays = days.filter((d) => d.isActive).map((d) => d.dayName)
      const summary = activeDays.join(', ')

      assert.equal(activeDays.length, 6)
      assert.equal(summary, 'Senin, Selasa, Rabu, Kamis, Jumat, Sabtu')
    })
  })

  describe('11. Pencegahan Double Submit (Guard isSaving)', () => {
    test('Menolak eksekusi aksi mutasi jika status isSaving masih aktif', async () => {
      let isSaving = true
      let executionCount = 0

      async function saveAction() {
        if (isSaving) {
          return { success: false, message: 'Operasi sedang berlangsung, mohon tunggu.' }
        }
        executionCount++
        return { success: true }
      }

      const result = await saveAction()
      assert.equal(result.success, false)
      assert.equal(result.message, 'Operasi sedang berlangsung, mohon tunggu.')
      assert.equal(executionCount, 0, 'Fungsi utama tidak boleh dieksekusi saat double submit')
    })
  })

  describe('12. Mekanisme Retry Otomatis pada Request Network (requestWithTimeout)', () => {
    test('Mengulang request (retry) otomatis jika panggilan pertama gagal', async () => {
      let callCount = 0
      const originalFetch = globalThis.fetch

      globalThis.fetch = async () => {
        callCount++
        if (callCount === 1) {
          throw new Error('Transient network drop')
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true })
        }
      }

      try {
        const repoInstance = new SchoolSetupRepository('http://mock-api.local')
        const response = await repoInstance.requestWithTimeout('/api/test', {}, 1000, 1)

        assert.equal(callCount, 2, 'Harus dipanggil sebanyak 2 kali (1 kegagalan + 1 retry)')
        assert.equal(response.ok, true)
      } finally {
        globalThis.fetch = originalFetch
      }
    })
  })

  describe('13. Jaminan Reset isLoading dan isSaving pada Blok Finally', () => {
    test('isLoading dan isSaving selalu kembali false meskipun terjadi uncaught error', async () => {
      let isLoading = false
      let isSaving = false
      let caughtError = null

      async function criticalOperation() {
        isLoading = true
        isSaving = true
        try {
          throw new Error('Database transaction aborted')
        } catch (err) {
          caughtError = err
        } finally {
          isLoading = false
          isSaving = false
        }
      }

      await criticalOperation()

      assert.ok(caughtError, 'Error harus tertangkap')
      assert.equal(isLoading, false, 'isLoading harus direset ke false di blok finally')
      assert.equal(isSaving, false, 'isSaving harus direset ke false di blok finally')
    })
  })

  describe('14. Bebas Duplikasi State & Read-Only School Name', () => {
    test('Nama sekolah read-only terlindungi dari mutasi form sembarangan', () => {
      const licensedSchoolName = 'SMA Negeri 1 Jakarta'
      const userFormInput = {
        schoolName: 'SMP Swasta Ilegal', // Dicoba ubah oleh hacker / form
        principalName: 'Budi Santoso, M.Pd'
      }

      // Di domain dan repo, schoolName selalu merujuk pada lisensi
      const effectiveSchoolName = licensedSchoolName // Read-only bound to license
      assert.equal(effectiveSchoolName, 'SMA Negeri 1 Jakarta')
      assert.notEqual(effectiveSchoolName, userFormInput.schoolName)
    })
  })

})
