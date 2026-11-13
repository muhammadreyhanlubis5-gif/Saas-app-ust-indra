import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'

const filePath = path.resolve('docs/reference/Master_Jadwal_Jadikan.xlsb')
const fileBuffer = fs.readFileSync(filePath)
const wb = XLSX.read(fileBuffer, { type: 'buffer' })

const targetSheets = [
  'PPA',
  'Rombel',
  'TIME KBM',
  'Kegiatan Non Mapel',
  'Alokasi',
  'Pengampu',
  'Input Jadwal',
  'TT',
  'MJ',
  'Serti'
]

const results = {}

for (const name of targetSheets) {
  const sheet = wb.Sheets[name]
  if (!sheet) continue
  const ref = sheet['!ref']
  const range = XLSX.utils.decode_range(ref)
  
  const rows = []
  for (let r = range.s.r; r <= Math.min(range.s.r + 30, range.e.r); r++) {
    const row = []
    let hasVal = false
    for (let c = range.s.c; c <= Math.min(range.s.c + 20, range.e.c); c++) {
      const addr = XLSX.utils.encode_cell({ r, c })
      const val = sheet[addr] ? sheet[addr].v : ''
      row.push(val !== undefined && val !== null ? String(val).trim() : '')
      if (val !== undefined && val !== null && String(val).trim() !== '') hasVal = true
    }
    if (hasVal) {
      rows.push({ r: r + 1, row })
    }
  }
  results[name] = { ref, rows }
}

fs.writeFileSync('docs/core_sheets_detail.json', JSON.stringify(results, null, 2))
console.log('Saved core sheets detail to docs/core_sheets_detail.json')
