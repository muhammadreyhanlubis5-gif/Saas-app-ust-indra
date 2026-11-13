import fs from 'node:fs'
import * as XLSX from 'xlsx'

const wb = XLSX.read(fs.readFileSync('docs/reference/Master_Jadwal_Jadikan.xlsb'), { type: 'buffer' })
const s = wb.Sheets['Rombel']

console.log('--- Rombel Rows 56 to 110 ---')
for (let r = 56; r <= 110; r++) {
  const row = []
  for (let c = 0; c <= 15; c++) {
    const addr = XLSX.utils.encode_cell({ r: r - 1, c })
    const cell = s[addr]
    const val = cell ? (cell.w || cell.v || '') : ''
    if (val !== '') {
      row.push(`${XLSX.utils.encode_col(c)}:${val}`)
    }
  }
  if (row.length > 0) {
    console.log(`R${r}: ${row.join(' | ')}`)
  }
}
