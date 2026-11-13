import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'

const filePath = path.resolve('docs/reference/Master_Jadwal_Jadikan.xlsb')
const fileBuffer = fs.readFileSync(filePath)
const wb = XLSX.read(fileBuffer, { type: 'buffer' })

const sheet = wb.Sheets['Rombel']

console.log('=== ROMBEL ROWS 25 to 70 ===')
for (let r = 25; r < 70; r++) {
  const cells = []
  for (let c = 0; c < 30; c++) {
    const addr = XLSX.utils.encode_cell({ r, c })
    const val = sheet[addr] ? sheet[addr].v : ''
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      cells.push(`${XLSX.utils.encode_col(c)}${r + 1}: ${val}`)
    }
  }
  if (cells.length > 0) {
    console.log(`Row ${r + 1}: ${cells.join(' | ')}`)
  }
}
