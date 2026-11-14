// Converts data/guests.xlsx → src/guests.json.
// Runs automatically before every build (npm run build), and on demand with `npm run guests`.
//
// Expected columns (first row = headers, case doesn't matter):
//   name   (required)  e.g. Chief (Mrs) Grace Okafor
//   table  (required)  e.g. 04  or  High Table
//   note   (optional)  extra detail shown to tell apart guests with the same name
//   aliases(optional)  other names a guest might type, e.g. "Auntie Bisi"

import { existsSync, writeFileSync } from 'node:fs'
import { readSheet } from 'read-excel-file/node'

const SRC = 'data/guests.xlsx'
const OUT = 'src/guests.json'

if (!existsSync(SRC)) {
  console.log(`[guests] ${SRC} not found — using existing ${OUT}.`)
  process.exit(0)
}

const rows = await readSheet(SRC)
const headers = rows[0].map((h) => String(h ?? '').trim().toLowerCase())
const col = (name) => headers.indexOf(name)
const iName = col('name')
const iTable = col('table')

if (iName < 0 || iTable < 0) {
  console.error(`[guests] ${SRC} must have "name" and "table" columns in the first row.`)
  process.exit(1)
}

const cell = (row, i) => (i < 0 || row[i] == null ? '' : String(row[i]).trim())

const guests = []
const problems = []

rows.slice(1).forEach((row, n) => {
  const name = cell(row, iName).replace(/\s+/g, ' ')
  let table = cell(row, iTable)
  if (!name && !table) return // blank line
  if (!name || !table) {
    problems.push(`row ${n + 2}: missing ${!name ? 'name' : 'table'}`)
    return
  }
  // Excel turns "04" into 4 — put the leading zero back.
  if (/^\d$/.test(table)) table = table.padStart(2, '0')

  const g = { id: String(guests.length + 1).padStart(3, '0'), name, table }
  const note = cell(row, col('note'))
  const aliases = cell(row, col('aliases'))
  if (note) g.note = note
  if (aliases) g.aliases = aliases
  guests.push(g)
})

// Warn about duplicate names that have no note to tell them apart.
const seen = new Map()
for (const g of guests) {
  const key = g.name.toLowerCase()
  seen.set(key, [...(seen.get(key) ?? []), g])
}
for (const [, list] of seen) {
  if (list.length > 1 && list.some((g) => !g.note)) {
    problems.push(`"${list[0].name}" appears ${list.length} times — add a note to tell them apart`)
  }
}

writeFileSync(OUT, JSON.stringify(guests, null, 2) + '\n')
console.log(`[guests] Wrote ${guests.length} guests to ${OUT}.`)
if (problems.length) {
  console.warn('[guests] Please check:\n  - ' + problems.join('\n  - '))
}
