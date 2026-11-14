import '@fontsource/playfair-display/latin-600.css'
import '@fontsource/playfair-display/latin-700.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import './style.css'

import config from './config.js'
import guests from './guests.json'
import { buildIndex, search, words } from './search.js'

const $ = (id) => document.getElementById(id)
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ── Header & footer from config ────────────────────────────────
$('celebrant-name').textContent = config.celebrantName
$('milestone').textContent = config.milestone
$('welcome').textContent = config.welcome
$('footer-message').textContent = config.footerMessage
document.title = `${config.celebrantName} · ${config.milestone}`

const meta = [config.eventDate, config.venue].filter(Boolean).join(' · ')
if (meta) {
  $('event-meta').textContent = meta
  $('event-meta').hidden = false
}
const footerMeta = [config.signOff, config.eventDate].filter(Boolean).join(' · ')
if (footerMeta) {
  $('footer-meta').textContent = footerMeta
  $('footer-meta').hidden = false
}

if (config.photo) {
  const img = new Image()
  img.src = config.photo
  img.alt = `Portrait of ${config.celebrantName}`
  img.decoding = 'async'
  img.onload = () => {
    $('medallion').remove()
    $('portrait').appendChild(img)
  }
}

// ── Helpers ────────────────────────────────────────────────────
function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = text
  return node
}

function formatTable(table) {
  const t = String(table).trim()
  return /^\d+$/.test(t) ? `Table ${t}` : t
}

// "Table 04" for numbers; "the High Table" for named tables.
function destination(table) {
  const t = formatTable(table)
  return /^\d+$/.test(String(table).trim()) || /^the\s/i.test(t) ? t : `the ${t}`
}

// ── Decorative petals in the header ────────────────────────────
if (!reduceMotion) {
  const petals = $('petals')
  const shapes = ['dot', 'diamond', 'ring']
  const colors = ['pink', 'wine', 'navy']
  for (let i = 0; i < 14; i++) {
    const p = el('span', `petal ${shapes[i % 3]} ${colors[(i * 7) % 3]}`)
    p.style.left = `${(i * 73) % 100}%`
    p.style.setProperty('--size', `${8 + ((i * 5) % 12)}px`)
    p.style.setProperty('--dur', `${11 + ((i * 3) % 9)}s`)
    p.style.setProperty('--delay', `${-((i * 1.7) % 14)}s`)
    p.style.setProperty('--drift', `${((i % 5) - 2) * 18}px`)
    petals.append(p)
  }
}

// ── Celebration burst when a guest is found ────────────────────
function burst(target) {
  if (reduceMotion) return
  const layer = el('div', 'confetti')
  const colors = ['#7B1E3A', '#F4B6C6', '#1E2A4F', '#E58FA8', '#ffffff']
  for (let i = 0; i < 34; i++) {
    const c = el('i')
    const angle = (Math.PI * 2 * i) / 34 + Math.random() * 0.3
    const dist = 90 + Math.random() * 110
    c.style.setProperty('--x', `${Math.cos(angle) * dist}px`)
    c.style.setProperty('--y', `${Math.sin(angle) * dist - 40}px`)
    c.style.setProperty('--r', `${Math.random() * 720 - 360}deg`)
    c.style.background = colors[i % colors.length]
    c.style.animationDelay = `${Math.random() * 80}ms`
    layer.append(c)
  }
  target.append(layer)
  setTimeout(() => layer.remove(), 1600)
}

// ── Find Your Table search ─────────────────────────────────────
const index = buildIndex(guests)
const input = $('search')
const clearBtn = $('clear')
const results = $('results')
let celebrated = null
let burstTimer

function resultCard(guest, single, i) {
  const card = el('article', 'result-card')
  card.style.animationDelay = `${i * 70}ms`
  card.append(el('p', 'result-label', single ? 'Guest found' : 'Guest'))
  card.append(el('p', 'result-name', guest.name))
  if (guest.note) card.append(el('p', 'result-note', guest.note))
  card.append(el('p', 'table-label', 'Your assigned table'))
  card.append(el('p', 'table-number', formatTable(guest.table)))
  card.append(
    el('p', 'result-message', `Please proceed to ${destination(guest.table)}. Enjoy the celebration!`),
  )
  return card
}

function render() {
  const query = input.value
  clearBtn.hidden = query.trim() === ''
  const { status, matches, total } = search(index, query)

  results.replaceChildren()
  clearTimeout(burstTimer)

  if (status === 'idle') {
    celebrated = null
    return
  }

  if (status === 'none') {
    celebrated = null
    const box = el('div', 'no-result')
    box.append(el('p', 'no-result-title', "We couldn't find that name."))
    box.append(
      el(
        'p',
        null,
        'Please check the spelling or try another part of your name. ' +
          'If you still need help, kindly speak to an usher at the entrance.',
      ),
    )
    results.append(box)
    return
  }

  if (matches.length > 1) {
    results.append(el('p', 'result-count', `${total} guests match — please find your name below.`))
  }
  matches.forEach((g, i) => results.append(resultCard(g, matches.length === 1, i)))
  if (total > matches.length) {
    results.append(
      el('p', 'result-more', `Showing ${matches.length} of ${total}. Type more of your name to narrow the list.`),
    )
  }

  // Celebrate once, when a single guest is found and typing has paused.
  if (matches.length === 1 && celebrated !== matches[0].id) {
    const card = results.querySelector('.result-card')
    burstTimer = setTimeout(() => {
      celebrated = matches[0].id
      burst(card)
    }, 450)
  }
}

input.addEventListener('input', render)
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') input.blur() // hides the phone keyboard so the result is visible
})
clearBtn.addEventListener('click', () => {
  input.value = ''
  render()
  input.focus()
})

// ── Guest list table ───────────────────────────────────────────
const dirFilter = $('dir-filter')
const dirBody = $('dir-body')
const dirCount = $('dir-count')
const sortBtns = document.querySelectorAll('.sort-btn')
let sortMode = 'name'

// Sort by the name as written, ignoring titles like "Chief" or "Dr".
const sortKey = (g) => words(g.name).join(' ')
const tableKey = (t) => {
  const s = String(t).trim()
  return /^\d+$/.test(s) ? `1-${s.padStart(6, '0')}` : `0-${s.toLowerCase()}` // named tables first
}

function renderDirectory() {
  const q = words(dirFilter.value)
  let list = guests.filter((g) => {
    if (!q.length) return true
    const hay = words(`${g.name} ${g.aliases ?? ''} ${g.table} ${formatTable(g.table)}`)
    return q.every((qw) => hay.some((w) => w.includes(qw)))
  })

  list = [...list].sort((a, b) =>
    sortMode === 'table'
      ? tableKey(a.table).localeCompare(tableKey(b.table)) || sortKey(a).localeCompare(sortKey(b))
      : sortKey(a).localeCompare(sortKey(b)),
  )

  dirCount.textContent = q.length
    ? `${list.length} of ${guests.length} guests`
    : `${guests.length} guests`

  const frag = document.createDocumentFragment()
  let lastGroup = null
  list.forEach((g) => {
    const group = sortMode === 'table' ? formatTable(g.table) : (sortKey(g)[0] || '#').toUpperCase()
    if (group !== lastGroup) {
      const tr = el('tr', 'group-row')
      const th = el('th', null, group)
      th.colSpan = 2
      th.scope = 'colgroup'
      tr.append(th)
      frag.append(tr)
      lastGroup = group
    }
    const tr = el('tr', 'guest-row')
    const name = el('td', 'cell-name', g.name)
    if (g.note) name.append(el('span', 'cell-note', g.note))
    tr.append(name, el('td', 'cell-table', formatTable(g.table).replace(/^Table /, '')))
    frag.append(tr)
  })

  if (!list.length) {
    const tr = el('tr', 'empty-row')
    const td = el('td', null, 'No guests match that filter.')
    td.colSpan = 2
    tr.append(td)
    frag.append(tr)
  }

  dirBody.replaceChildren(frag)
}

dirFilter.addEventListener('input', renderDirectory)
sortBtns.forEach((btn) =>
  btn.addEventListener('click', () => {
    sortMode = btn.dataset.sort
    sortBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)))
    renderDirectory()
  }),
)
renderDirectory()

// ── Reveal sections as they scroll into view ───────────────────
const toReveal = document.querySelectorAll('.reveal-on-scroll')
if (reduceMotion || !('IntersectionObserver' in window)) {
  toReveal.forEach((n) => n.classList.add('is-visible'))
} else {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        }
      }),
    { threshold: 0.08 },
  )
  toReveal.forEach((n) => io.observe(n))
}
