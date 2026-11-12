/**
 * GuruKu SaaS - Schedule Export & PDF/Print Utilities
 * 
 * Generates official Indonesian school timetable spreadsheets (.xlsx)
 * and controls print/PDF output with formal headers, borders, and signature blocks.
 */

import * as XLSX from 'xlsx'

/**
 * Exports a Teacher or Class schedule to an official Excel (.xlsx) file
 * 
 * @param {Object} options
 * @param {'guru'|'kelas'} options.type - Type of schedule ('guru' or 'kelas')
 * @param {string} options.targetName - Teacher name or Class name (e.g. "T. Saiful Bahri, Lc" or "5 MAPK")
 * @param {string} options.targetCode - Teacher code or Wali Kelas name (e.g. "SB" or "Drs. Ahmad")
 * @param {Array<string>} options.activeDays - List of active days (e.g. ['Senin', 'Selasa', ...])
 * @param {Array<Object>} options.sessions - Sesi KBM & Istirahat (e.g. [{ label: '1', waktu: '07.30 - 08.10', type: 'KBM' }])
 * @param {Function} options.getCellData - (day, sessionLabel) => { text: string, subtext: string }
 * @param {Object} options.profile - School profile { name, address, academic_year, semester, headmaster_name, vice_headmaster_name, city }
 * @param {Object} options.summaryStats - { totalJP, kbmJP, tugasJP, ... }
 */
export const exportScheduleToExcel = ({
  type = 'guru',
  targetName = '',
  targetCode = '',
  activeDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  sessions = [],
  getCellData = () => null,
  profile = {},
  summaryStats = {}
}) => {
  const isTeacher = type === 'guru'
  const schoolName = (profile.name || 'GURUKU SAAS MANAGEMENT SEKOLAH').toUpperCase()
  const academicYear = profile.academic_year || '2026/2027'
  const semester = profile.semester ? `SEMESTER ${profile.semester.toUpperCase()}` : 'SEMESTER GANJIL'
  const docTitle = isTeacher ? 'JADWAL MENGAJAR GURU' : 'JADWAL PELAJARAN KELAS'
  const cityName = profile.city || profile.address?.split(',')[0] || 'Nusantara'

  // Build rows array for SheetJS
  const sheetData = []

  // Row 1: Kop Lembaga
  sheetData.push([schoolName])
  // Row 2: Judul Dokumen
  sheetData.push([`${docTitle} - ${semester}`])
  // Row 3: Tahun Pelajaran
  sheetData.push([`TAHUN PELAJARAN ${academicYear}`])
  sheetData.push([]) // Spacer

  // Row 5 & 6: Metadata Target & Statistik
  if (isTeacher) {
    sheetData.push(['KODE GURU', ':', targetCode, '', 'JUMLAH JAM KBM', ':', `${summaryStats.kbmJP || 0} JP`])
    sheetData.push(['NAMA GURU', ':', targetName, '', 'TUGAS TAMBAHAN', ':', `${summaryStats.tugasJP || 0} JP`])
    sheetData.push(['STATUS', ':', 'Pendidik Resmi', '', 'TOTAL BEBAN', ':', `${summaryStats.totalJP || 0} JP`])
  } else {
    sheetData.push(['KELAS / ROMBEL', ':', targetName, '', 'TOTAL JAM KELAS', ':', `${summaryStats.totalJP || 0} JP / Minggu`])
    sheetData.push(['WALI KELAS', ':', targetCode || '-', '', 'JUMLAH MAPEL', ':', `${summaryStats.subjectsCount || 0} Mata Pelajaran`])
  }
  sheetData.push([]) // Spacer before table

  // Table Header Row: NO, JAM, WAKTU, ...Days
  const tableHeader = ['JAM KE', 'WAKTU']
  activeDays.forEach(day => {
    tableHeader.push(day.toUpperCase())
  })
  sheetData.push(tableHeader)

  // Table Rows: Data Sesi KBM & Istirahat
  sessions.forEach(sess => {
    if (sess.type === 'ISTIRAHAT') {
      const istirahatRow = ['ISTIRAHAT', sess.waktu || '']
      for (let i = 0; i < activeDays.length; i++) {
        istirahatRow.push('--- ISTIRAHAT ---')
      }
      sheetData.push(istirahatRow)
    } else {
      const kbmRow = [`Jam ${sess.label}`, sess.waktu || '']
      activeDays.forEach(day => {
        const cell = getCellData(day, sess.label)
        if (cell) {
          if (isTeacher) {
            // Teacher View: Mapel - Kelas (e.g. "NAH - 5 MAPK")
            kbmRow.push(cell.subtext ? `${cell.text} (${cell.subtext})` : cell.text)
          } else {
            // Class View: Mapel - Kode Guru (e.g. "NAH - SB")
            kbmRow.push(cell.subtext ? `${cell.text} [${cell.subtext}]` : cell.text)
          }
        } else {
          kbmRow.push('-')
        }
      })
      sheetData.push(kbmRow)
    }
  })

  // Spacers after table
  sheetData.push([])
  sheetData.push([])

  // Signature Block Rows
  const sigRow1 = ['Mengetahui,']
  const sigRow2 = ['Kepala Sekolah,']
  const sigRowSpace = ['', '']
  const sigRowName = [profile.headmaster_name || '...........................................']

  // Align Wakasek / Wali kelas to the right
  const dateStr = `${cityName}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
  const emptyCols = new Array(Math.max(0, activeDays.length - 1)).fill('')

  sheetData.push([...sigRow1, ...emptyCols, dateStr])
  sheetData.push([...sigRow2, ...emptyCols, isTeacher ? 'Wakil Kepala Sekolah Bid. Kurikulum,' : 'Wali Kelas,'])
  sheetData.push([])
  sheetData.push([])
  sheetData.push([])
  sheetData.push([...sigRowName, ...emptyCols, isTeacher ? (profile.vice_headmaster_name || '...........................................') : (targetCode || '...........................................')])

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(sheetData)

  // Configure column widths
  const colWidths = [
    { wch: 12 }, // Jam Ke
    { wch: 18 }  // Waktu
  ]
  activeDays.forEach(() => {
    colWidths.push({ wch: 22 }) // Each Day column
  })
  ws['!cols'] = colWidths

  // Create workbook and export
  const wb = XLSX.utils.book_new()
  const sheetName = (isTeacher ? `Jadwal_${targetCode || 'Guru'}` : `Jadwal_${targetName || 'Kelas'}`).substring(0, 31)
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  const filename = `${docTitle.replace(/\s+/g, '_')}_${(isTeacher ? targetCode : targetName).replace(/[^a-zA-Z0-9]/g, '_')}_${academicYear.replace(/[^0-9]/g, '-')}.xlsx`
  XLSX.writeFile(wb, filename)
}

/**
 * Triggers clean browser print with A4 landscape optimization
 */
export const printScheduleElement = () => {
  window.print()
}
