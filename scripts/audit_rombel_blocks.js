import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'

const filePath = path.resolve('docs/reference/Master_Jadwal_Jadikan.xlsb')
const fileBuffer = fs.readFileSync(filePath)
const wb = XLSX.read(fileBuffer, {
  type: 'buffer',
  bookVBA: false,
  cellFormula: true,
  cellStyles: true
})

const sheet = wb.Sheets['Rombel']

function getCell(col, row) {
  const addr = `${col}${row}`
  const cell = sheet[addr]
  if (!cell) return { val: '', text: '', formula: '', isFormula: false }
  const val = cell.v !== undefined ? cell.v : ''
  const text = String(cell.w !== undefined ? cell.w : val).trim()
  return {
    val,
    text,
    formula: cell.f || '',
    isFormula: !!cell.f
  }
}

// 1. Audit Classes (Cols B: No, C: Nama Kelas, D: Wali Kelas)
const classes = []
const classNames = new Map()
const classDuplicates = []
let classDataEndRow = 61

for (let r = 62; r <= 100; r++) {
  const noCell = getCell('B', r)
  const nameCell = getCell('C', r)
  const waliCell = getCell('D', r)

  if (!nameCell.text && !noCell.text) break

  classDataEndRow = r
  const noInt = parseInt(noCell.text, 10)
  const name = nameCell.text
  const wali = waliCell.text

  if (name) {
    if (classNames.has(name.toLowerCase())) {
      classDuplicates.push({ row: r, name, duplicateWithRow: classNames.get(name.toLowerCase()) })
    } else {
      classNames.set(name.toLowerCase(), r)
    }

    classes.push({
      row: r,
      no: noInt,
      name,
      waliKelas: wali,
      isFormula: nameCell.isFormula,
      isPlaceholder: name.toUpperCase().includes('TES')
    })
  }
}

// 2. Audit Teachers (Cols F: No, G: Nama Guru, H: Kode)
const teachers = []
const teacherCodes = new Map()
const teacherNames = new Map()
const teacherDuplicates = []
let teacherDataEndRow = 61

for (let r = 62; r <= 150; r++) {
  const noCell = getCell('F', r)
  const nameCell = getCell('G', r)
  const codeCell = getCell('H', r)

  if (!nameCell.text && !noCell.text && !codeCell.text) break

  teacherDataEndRow = r
  const noInt = parseInt(noCell.text, 10)
  const name = nameCell.text
  const code = codeCell.text.toUpperCase()

  if (name || code) {
    if (code && teacherCodes.has(code)) {
      teacherDuplicates.push({ row: r, type: 'code', value: code, duplicateWithRow: teacherCodes.get(code) })
    } else if (code) {
      teacherCodes.set(code, r)
    }

    if (name && teacherNames.has(name.toLowerCase())) {
      teacherDuplicates.push({ row: r, type: 'name', value: name, duplicateWithRow: teacherNames.get(name.toLowerCase()) })
    } else if (name) {
      teacherNames.set(name.toLowerCase(), r)
    }

    teachers.push({
      row: r,
      no: noInt,
      name,
      code,
      isFormula: nameCell.isFormula,
      isPlaceholder: name.toUpperCase().includes('TES') || code.toUpperCase().includes('TES')
    })
  }
}

// 3. Audit Subjects (Cols I: No, J: Nama Mapel, K: Kode)
const subjects = []
const subjectCodes = new Map()
const subjectNames = new Map()
const subjectDuplicates = []
let subjectDataEndRow = 61

for (let r = 62; r <= 150; r++) {
  const noCell = getCell('I', r)
  const nameCell = getCell('J', r)
  const codeCell = getCell('K', r)

  if (!nameCell.text && !noCell.text && !codeCell.text) break

  subjectDataEndRow = r
  const noInt = parseInt(noCell.text, 10)
  const name = nameCell.text
  const code = codeCell.text.toUpperCase()

  if (name || code) {
    if (code && subjectCodes.has(code)) {
      subjectDuplicates.push({ row: r, type: 'code', value: code, duplicateWithRow: subjectCodes.get(code) })
    } else if (code) {
      subjectCodes.set(code, r)
    }

    if (name && subjectNames.has(name.toLowerCase())) {
      subjectDuplicates.push({ row: r, type: 'name', value: name, duplicateWithRow: subjectNames.get(name.toLowerCase()) })
    } else if (name) {
      subjectNames.set(name.toLowerCase(), r)
    }

    subjects.push({
      row: r,
      no: noInt,
      name,
      code,
      isFormula: nameCell.isFormula,
      isPlaceholder: name.toUpperCase().includes('TES') || code.toUpperCase().includes('TES')
    })
  }
}

// Merged cell check in Rombel around R61-120
const merges = (sheet['!merges'] || []).filter(m => m.s.r >= 60 && m.e.r <= 120)

const report = {
  sheet: 'Rombel',
  blocks: {
    classes: {
      headerRow: 61,
      dataStartRow: 62,
      dataEndRow: classDataEndRow,
      count: classes.length,
      duplicates: classDuplicates,
      placeholderCount: classes.filter(c => c.isPlaceholder).length,
      sampleItems: classes.slice(0, 5)
    },
    teachers: {
      headerRow: 61,
      dataStartRow: 62,
      dataEndRow: teacherDataEndRow,
      count: teachers.length,
      duplicates: teacherDuplicates,
      placeholderCount: teachers.filter(t => t.isPlaceholder).length,
      sampleItems: teachers.slice(0, 5)
    },
    subjects: {
      headerRow: 61,
      dataStartRow: 62,
      dataEndRow: subjectDataEndRow,
      count: subjects.length,
      duplicates: subjectDuplicates,
      placeholderCount: subjects.filter(s => s.isPlaceholder).length,
      sampleItems: subjects.slice(0, 5)
    }
  },
  mergedCellsInMasterRange: merges.map(m => ({
    start: XLSX.utils.encode_cell(m.s),
    end: XLSX.utils.encode_cell(m.e)
  }))
}

fs.writeFileSync('docs/rombel_blocks_factual_audit.json', JSON.stringify(report, null, 2))
console.log('Rombel blocks factual audit complete. Saved to docs/rombel_blocks_factual_audit.json')
