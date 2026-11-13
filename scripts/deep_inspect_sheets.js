import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'

const filePath = path.resolve('docs/reference/Master_Jadwal_Jadikan.xlsb')
const fileBuffer = fs.readFileSync(filePath)
const wb = XLSX.read(fileBuffer, {
  type: 'buffer',
  cellFormula: true,
  cellHTML: false,
  sheetStubs: true,
  bookVBA: true
})

const inspection = JSON.parse(fs.readFileSync('docs/xlsb_raw_inspection.json', 'utf-8'))

const detailedSheets = []

for (let i = 0; i < wb.SheetNames.length; i++) {
  const sheetName = wb.SheetNames[i]
  const sheet = wb.Sheets[sheetName]
  const meta = inspection.sheets[i]
  
  const ref = sheet['!ref'] || 'A1:A1'
  const range = XLSX.utils.decode_range(ref)

  // Find non-empty rows up to row 30
  const sampleRows = []
  let detectedHeaderRow = -1
  let headerColumns = []

  for (let r = range.s.r; r <= Math.min(range.s.r + 35, range.e.r); r++) {
    const rowCells = []
    let nonEmptyCount = 0
    for (let c = range.s.c; c <= Math.min(range.s.c + 30, range.e.c); c++) {
      const addr = XLSX.utils.encode_cell({ r, c })
      const cell = sheet[addr]
      const val = cell ? (cell.w || cell.v || '') : ''
      const trimmed = String(val).trim()
      rowCells.push(trimmed)
      if (trimmed !== '') nonEmptyCount++
    }
    if (nonEmptyCount > 0) {
      sampleRows.push({ rowIdx: r + 1, nonEmptyCount, cells: rowCells.slice(0, 15) })
      // Heuristic for header: first row with multiple string values (e.g. >= 2 or 3)
      if (detectedHeaderRow === -1 && nonEmptyCount >= 2 && r > 0) {
        // check if values look like column names
        const texts = rowCells.filter(v => v !== '')
        if (texts.some(t => /no|nama|kode|kelas|guru|hari|jam|sesi|rombel|mapel|nip|kegiatan/i.test(t))) {
          detectedHeaderRow = r + 1
          headerColumns = rowCells.map((v, cIdx) => ({ colIdx: cIdx + 1, colLetter: XLSX.utils.encode_col(cIdx), name: v })).filter(c => c.name !== '')
        }
      }
    }
  }

  // Count formulas with error values like #N/A, #VALUE!, #REF!, #NAME?
  let formulaErrorCount = 0
  let sampleFormulas = []
  for (const k of Object.keys(sheet)) {
    if (k.startsWith('!')) continue
    const cell = sheet[k]
    if (cell.t === 'e' || (typeof cell.v === 'string' && cell.v.startsWith('#'))) {
      formulaErrorCount++
    }
    if (cell.f && sampleFormulas.length < 5) {
      sampleFormulas.push({ cell: k, formula: cell.f, val: cell.v })
    }
  }

  detailedSheets.push({
    index: i + 1,
    name: sheetName,
    visibility: meta.visibility,
    range: ref,
    rowCount: meta.rowCount,
    colCount: meta.colCount,
    mergesCount: meta.mergesCount,
    formulaCount: meta.formulaCount,
    formulaErrorCount,
    detectedHeaderRow,
    headerColumns: headerColumns.slice(0, 12),
    sampleRows: sampleRows.slice(0, 8),
    sampleFormulas
  })
}

fs.writeFileSync('docs/xlsb_deep_inspection.json', JSON.stringify(detailedSheets, null, 2))
console.log('Deep inspection complete. Saved to docs/xlsb_deep_inspection.json')
