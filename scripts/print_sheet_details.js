import fs from 'node:fs'

const data = JSON.parse(fs.readFileSync('docs/core_sheets_detail.json', 'utf-8'))

for (const [name, sheet] of Object.entries(data)) {
  console.log(`\n=================== SHEET: ${name} (Range: ${sheet.ref}) ===================`)
  for (const r of sheet.rows.slice(0, 15)) {
    console.log(`Row ${String(r.r).padStart(2)}: ${r.row.filter(Boolean).join(' | ')}`)
  }
}
