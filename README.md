# 60th Birthday — Find Your Table

A one-page site for Ogundana Elizabeth Abosede's 60th birthday. Guests scan the QR code on the banner, type their name and see their table. A full guest list you can filter and sort sits below the search.
There is no backend: the guest list is built into the site when it is deployed.

## Before the event — what to fill in

| What | Where |
|---|---|
| Celebrant's name, date, venue, footer sign-off | `src/config.js` |
| Celebrant's portrait | Put the photo in `public/` (e.g. `public/celebrant.jpg`) and set `photo: '/celebrant.jpg'` in `src/config.js`. Square-ish photos work best; keep it under ~300 KB. Until a photo is added, a "60" medallion shows instead. |
| Guest list | `data/guests.xlsx` |

## The guest list (Excel)

`data/guests.xlsx` has these columns in the first row:

| Column | Required | Example |
|---|---|---|
| `name` | yes | `Chief (Mrs) Grace Okafor` |
| `table` | yes | `04`, `12`, or `High Table` |
| `note` | no | `Family friend, Lagos` — shown under the name; use it when two guests share a name |
| `aliases` | no | `Auntie Bisi` — other names a guest might type |

- Titles (Chief, Mrs, Dr, Engr, Alhaji, Pastor…) are ignored when searching, so "grace okafor" finds "Chief (Mrs) Grace Okafor".
- Single-digit tables become two digits (`4` → `04`).
- Couples can share one row, e.g. `Mr & Mrs Tunde Bakare`. Searching "bakare" or "tunde" finds it.

When the site builds, the spreadsheet is converted into `src/guests.json`. The build also lists any rows with missing details, and any repeated names that have no note. Prefer JSON? Delete `data/guests.xlsx` and edit `src/guests.json` directly.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Deploy

**Vercel** or **Netlify**: push this folder to a GitHub repo and import it. Both detect Vite automatically.

- Build command: `npm run build`
- Output directory: `dist`

To update the guest list later, edit `data/guests.xlsx` and push. The site redeploys in about a minute.

## Notes

- Animations (floating petals, a confetti burst when a guest is found, cards that pop in) switch off automatically on phones set to "reduce motion".
- Colours are in the `:root` block at the top of `src/style.css`.
- Fonts are bundled with the site (no Google Fonts calls), and the page totals about 130 KB, so it loads on weak venue signal.
- Anyone with the link can search the list. Don't put phone numbers or other private details in it.
- Only make the QR code once the final URL is settled (a custom domain is safest), and test the printed QR code on a few phones.
