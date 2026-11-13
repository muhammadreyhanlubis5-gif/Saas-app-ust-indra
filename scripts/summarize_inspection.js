import fs from 'node:fs'

const data = JSON.parse(fs.readFileSync('docs/xlsb_deep_inspection.json', 'utf-8'))

console.log('| No | Sheet | Visible | Range | Rows | Cols | Merges | Formulas | Formula Errors | Header Row | Top Columns |')
console.log('|---|---|---|---|---|---|---|---|---|---|---|')

for (const s of data) {
  const topCols = s.headerColumns.map(c => c.name).filter(Boolean).slice(0, 4).join(', ') || '-'
  console.log(`| ${s.index} | ${s.name} | ${s.visibility} | ${s.range} | ${s.rowCount} | ${s.colCount} | ${s.mergesCount} | ${s.formulaCount} | ${s.formulaErrorCount} | ${s.detectedHeaderRow} | ${topCols} |`)
}
