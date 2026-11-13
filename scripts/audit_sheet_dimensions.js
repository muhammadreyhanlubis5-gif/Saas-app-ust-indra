import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'

const filePath = path.resolve('docs/reference/Master_Jadwal_Jadikan.xlsb')
const fileBuffer = fs.readFileSync(filePath)
const wb = XLSX.read(fileBuffer, {
  type: 'buffer',
  bookVBA: false,
  cellFormula: true,
  sheetStubs: true
})

console.log(`Auditing 29 sheets in ${wb.SheetNames.length} worksheets...`)

const results = []

for (let i = 0; i < wb.SheetNames.length; i++) {
  const sheetName = wb.SheetNames[i]
  const sheet = wb.Sheets[sheetName]
  const ref = sheet['!ref'] || 'A1:A1'
  const range = XLSX.utils.decode_range(ref)
  const physicalRows = range.e.r - range.s.r + 1
  const physicalCols = range.e.c - range.s.c + 1

  const rowsWithValues = new Set()
  const rowsWithFormulas = new Set()
  const rowsWithOnlyBlankOrStyle = new Set()
  let totalNonEmptyCells = 0

  for (const cellAddr of Object.keys(sheet)) {
    if (cellAddr.startsWith('!')) continue
    const cell = sheet[cellAddr]
    const decoded = XLSX.utils.decode_cell(cellAddr)
    const r = decoded.r + 1

    const val = cell.v !== undefined ? cell.v : ''
    const textVal = String(cell.w !== undefined ? cell.w : val).trim()
    const hasFormula = !!cell.f

    if (hasFormula) {
      rowsWithFormulas.add(r)
    }

    if (textVal !== '' && textVal !== '0' && cell.t !== 'z') {
      rowsWithValues.add(r)
      totalNonEmptyCells++
    } else if (cell.s || cell.t === 'z' || textVal === '') {
      rowsWithOnlyBlankOrStyle.add(r)
    }
  }

  // Actual data rows: rows with actual non-empty values (excluding header-only or pure decorative)
  const actualDataRows = rowsWithValues.size

  results.push({
    index: i + 1,
    sheet: sheetName,
    physicalRows,
    physicalCols,
    rowsWithValues: rowsWithValues.size,
    rowsWithFormulas: rowsWithFormulas.size,
    rowsWithStyleOnly: Math.max(0, physicalRows - rowsWithValues.size),
    actualDataRows,
    totalNonEmptyCells,
    ref
  })
}

fs.writeFileSync('docs/sheet_reality_audit.json', JSON.stringify(results, null, 2))
console.log('Sheet reality audit completed. Saved to docs/sheet_reality_audit.json')
