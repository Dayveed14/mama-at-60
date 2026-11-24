import '@fontsource/playfair-display/latin-600.css'
import '@fontsource/playfair-display/latin-700.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import './style.css'

import config from './config.js'

const $ = (id) => document.getElementById(id)
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Event branding and details.
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

// Decorative petals.
if (!reduceMotion) {
  const petals = $('petals')
  const shapes = ['dot', 'diamond', 'ring']
  const colors = ['pink', 'wine', 'navy']
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('span')
    p.className = `petal ${shapes[i % 3]} ${colors[(i * 7) % 3]}`
    p.style.left = `${(i * 73) % 100}%`
    p.style.setProperty('--size', `${8 + ((i * 5) % 12)}px`)
    p.style.setProperty('--dur', `${11 + ((i * 3) % 9)}s`)
    p.style.setProperty('--delay', `${-((i * 1.7) % 14)}s`)
    p.style.setProperty('--drift', `${((i % 5) - 2) * 18}px`)
    petals.append(p)
  }
}

// A table-specific QR opens /table/01 through /table/30 directly.
// The root URL intentionally reveals no guest list or table directory.
const match = window.location.pathname.match(/^\/table\/(\d{1,2})\/?$/)
const tableNumber = match ? Number(match[1]) : null

if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
  $('table-card').hidden = true
  $('welcome-card').hidden = false
} else if (tableNumber && tableNumber >= 1 && tableNumber <= 30) {
  $('assigned-table').textContent = `TABLE ${String(tableNumber).padStart(2, '0')}`
  $('table-instruction').textContent = 'Please proceed to your assigned table. We look forward to celebrating with you!'
} else {
  $('table-card').hidden = true
  $('invalid-card').hidden = false
}

// Reveal sections as they scroll into view.
const toReveal = document.querySelectorAll('.reveal, .reveal-on-scroll')
if (reduceMotion || !('IntersectionObserver' in window)) {
  toReveal.forEach((node) => node.classList.add('is-visible'))
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.08 })
  toReveal.forEach((node) => observer.observe(node))
}
