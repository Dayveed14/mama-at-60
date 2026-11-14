// Forgiving name search: case-insensitive, ignores extra spaces,
// punctuation, word order and titles like "Chief", "Mrs", "Dr".

const TITLES = new Set([
  'mr', 'mrs', 'ms', 'miss', 'mister', 'madam', 'master',
  'dr', 'doctor', 'prof', 'professor',
  'chief', 'oba', 'olori', 'otunba', 'oloye', 'baale',
  'alhaji', 'alhaja', 'hajia', 'haji',
  'engr', 'eng', 'arc', 'arch', 'barr', 'barrister', 'esq', 'pharm', 'pst',
  'hon', 'honourable', 'honorable', 'sen', 'senator', 'gov', 'amb',
  'rev', 'revd', 'pastor', 'bishop', 'apostle', 'evang', 'deacon', 'deaconess',
  'elder', 'fr', 'father', 'sister', 'brother', 'imam',
  'prince', 'princess', 'sir', 'lady', 'dame', 'hrh', 'hrm', 'his', 'her',
  'royal', 'highness', 'excellency', 'he', 'gen', 'col', 'capt', 'maj', 'lt',
  'and', 'jnr', 'jr', 'snr', 'sr',
])

/** Lowercase words, punctuation removed, titles dropped. */
export function words(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w && !TITLES.has(w))
}

export function buildIndex(guests) {
  return guests.map((g) => ({
    guest: g,
    words: words(`${g.name} ${g.aliases ?? ''}`),
  }))
}

/**
 * Returns { status: 'idle' | 'found' | 'none', matches, total }.
 * Every typed word must appear somewhere in the guest's name (any order).
 */
export function search(index, query, { minChars = 2, limit = 8 } = {}) {
  const q = words(query)
  if (q.join('').length < minChars) return { status: 'idle', matches: [], total: 0 }

  const scored = []
  for (const entry of index) {
    let score = 0
    const ok = q.every((qw) => {
      let best = 0
      for (const w of entry.words) {
        if (w === qw) best = Math.max(best, 3)
        else if (w.startsWith(qw)) best = Math.max(best, 2)
        else if (w.includes(qw)) best = Math.max(best, 1)
      }
      score += best
      return best > 0
    })
    if (ok) scored.push({ guest: entry.guest, score })
  }

  scored.sort(
    (a, b) => b.score - a.score || a.guest.name.localeCompare(b.guest.name),
  )

  return {
    status: scored.length ? 'found' : 'none',
    matches: scored.slice(0, limit).map((s) => s.guest),
    total: scored.length,
  }
}
