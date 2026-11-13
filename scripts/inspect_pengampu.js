import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'

const filePath = path.resolve('docs/reference/Master_Jadwal_Jadikan.xlsb')
const fileBuffer = fs.readFileSync(filePath)
const wb = XLSX.read(fileBuffer, { type: 'buffer' })

function inspectSheetHeader(sheetName, maxRows = 10, maxCols = 25) {
  const sheet = wb.Sheets[sheetName]
  const ref = sheet['!ref']
  const range = XLSX.utils.decode_range(ref)
  console.log(`\n=== SHEET: ${sheetName} (Ref: ${ref}) ===`)
  for (let r = range.s.r; r <= Math.min(range.s.r + maxRows, range.e.r); r++) {
    const cells = []
    for (let c = range.s.c; c <= Math.min(range.s.c + maxCols, range.e.c); c++) {
      const addr = XLSX.utils.encode_cell({ r, c })
      const val = sheet[addr] ? sheet[addr].v : ''
      cells.push(val !== undefined && val !== null ? String(val).trim() : '')
    }
    if (cells.some(Boolean)) {
      console.log(`R${r + 1}: ${cells.join(' | ')}`)
    }
  }
}

inspectSheetHeader('Pengampu', 12, 20)
inspectSheetHeader('Rombel', 15, 15)
inspectSheetHeader('TIME KBM', 15, 12)
