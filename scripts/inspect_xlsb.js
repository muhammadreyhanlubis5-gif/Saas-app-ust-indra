import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'

const filePath = path.resolve('docs/reference/Master_Jadwal_Jadikan.xlsb')
console.log('Reading file:', filePath)

const startTime = Date.now()
const fileBuffer = fs.readFileSync(filePath)
const readDuration = Date.now() - startTime
console.log(`File read to buffer in ${readDuration}ms (${fileBuffer.length} bytes)`)

const parseStartTime = Date.now()
const wb = XLSX.read(fileBuffer, {
  type: 'buffer',
  cellFormula: true,
  cellHTML: false,
  cellStyles: true,
  sheetStubs: true,
  bookVBA: true,
  bookDeps: true
})
const parseDuration = Date.now() - parseStartTime
console.log(`XLSB parsed in ${parseDuration}ms`)

console.log('Sheet Names:', wb.SheetNames)
console.log('Workbook Object Keys:', Object.keys(wb))
if (wb.Workbook) {
  console.log('Workbook.Sheets:', JSON.stringify(wb.Workbook.Sheets, null, 2))
  console.log('Workbook.Names (Named Ranges):', wb.Workbook.Names?.length || 0)
}
console.log('Has VBA/Macros (vbaraw):', Boolean(wb.vbaraw))

const sheetSummaries = []

for (let i = 0; i < wb.SheetNames.length; i++) {
  const sheetName = wb.SheetNames[i]
  const sheet = wb.Sheets[sheetName]
  const ref = sheet['!ref'] || 'A1:A1'
  const range = XLSX.utils.decode_range(ref)
  const rowCount = range.e.r - range.s.r + 1
  const colCount = range.e.c - range.s.c + 1
  const merges = sheet['!merges'] || []
  
  let formulaCount = 0
  let hyperlinkCount = 0
  const cellKeys = Object.keys(sheet).filter(k => !k.startsWith('!'))
  
  for (const cellKey of cellKeys) {
    const cell = sheet[cellKey]
    if (cell.f) formulaCount++
    if (cell.l) hyperlinkCount++
  }

  // Get sheet visibility
  let visibility = 'Visible'
  if (wb.Workbook && wb.Workbook.Sheets && wb.Workbook.Sheets[i]) {
    const wsMeta = wb.Workbook.Sheets[i]
    if (wsMeta.Hidden === 1) visibility = 'Hidden'
    else if (wsMeta.Hidden === 2) visibility = 'VeryHidden'
  }

  // Extract first 10 rows as preview
  const previewRows = []
  for (let r = range.s.r; r <= Math.min(range.s.r + 12, range.e.r); r++) {
    const rowCells = []
    for (let c = range.s.c; c <= Math.min(range.s.c + 15, range.e.c); c++) {
      const addr = XLSX.utils.encode_cell({ r, c })
      const val = sheet[addr] ? sheet[addr].v : ''
      rowCells.push(val !== undefined && val !== null ? String(val).trim() : '')
    }
    if (rowCells.some(v => v !== '')) {
      previewRows.push({ rowNum: r + 1, values: rowCells })
    }
  }

  sheetSummaries.push({
    index: i + 1,
    name: sheetName,
    visibility,
    range: ref,
    rowCount,
    colCount,
    cellCount: cellKeys.length,
    mergesCount: merges.length,
    formulaCount,
    hyperlinkCount,
    previewRows
  })
}

fs.writeFileSync('docs/xlsb_raw_inspection.json', JSON.stringify({
  fileName: 'Master_Jadwal_Jadikan.xlsb',
  fileSize: fileBuffer.length,
  sheetCount: wb.SheetNames.length,
  hasVba: Boolean(wb.vbaraw),
  namedRangesCount: wb.Workbook?.Names?.length || 0,
  sheets: sheetSummaries
}, null, 2))

console.log('Inspection complete. Output saved to docs/xlsb_raw_inspection.json')
