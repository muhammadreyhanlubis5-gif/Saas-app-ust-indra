import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'

const filePath = path.resolve('docs/reference/Master_Jadwal_Jadikan.xlsb')
const fileBuffer = fs.readFileSync(filePath)
const wb = XLSX.read(fileBuffer, { type: 'buffer' })

const sheet = wb.Sheets['Rombel']
const ref = sheet['!ref']
const range = XLSX.utils.decode_range(ref)

console.log('=== ROMBEL ROWS 1 to 25 ===')
for (let r = 0; r < 25; r++) {
  const cells = []
  for (let c = 0; c < 45; c++) {
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
