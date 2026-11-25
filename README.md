# Mama at 60 — Table QR Assignments

A lightweight, static Vite website for Ogundana Elizabeth Abosede's 60th birthday. Each guest receives the QR code for their assigned table. Scanning it opens a page that displays that table number and its table label.

## Guest experience

- `/` shows a general birthday welcome and asks guests to scan the QR code shared with them.
- `/table/01` through `/table/30` show both the table number and its assigned table name directly.
- Invalid table paths show a help message.
- There is no guest search, guest directory, guest-name data, database, or backend in the deployed application.

## Configure the event

Edit `src/config.js` to set the celebrant's name, event date, venue, welcome message, footer message, and optional portrait. To add a portrait, put the approved image in `public/` and set `photo` to its public path, for example `/celebrant.jpg`.

## Run locally

```bash
npm install
npm run dev
```

Test a table directly at `http://localhost:5173/table/10`.

## Build and deploy

```bash
npm run build
npm run preview
```

Deploy the `dist` folder to Vercel or Netlify. The included `vercel.json` and `public/_redirects` configure SPA route fallback so direct visits to `/table/NN` work when hosted on those platforms.

## Generate the 30 QR codes

First deploy the site and decide its final HTTPS domain. Then install the QR-code generator dependency:

```bash
python -m pip install -r requirements.txt
```

Generate all codes using the final deployed origin:

```bash
python scripts/generate_qr_codes.py --base-url https://mama-at-60.vercel.app
```

This creates 30 labelled PNG files (for example, `table-01-lizzy.png` and `table-15-congress-court-residents.png`). Each QR points to its matching `/table/NN` page, and each image has the table number and table name printed below the QR code. The table labels are maintained in `src/main.js` and in the QR generator script; keep both lists in sync if labels change. You can choose another output folder with `--output`.

**Important:** generate the QR images only after the final domain is confirmed. Test each code with a phone before sending it to guests or printing it. Send each guest only the QR image for their assigned table.

## Privacy and security notes

The guest list is not part of this website or its production build. Keep the organiser's Excel guest list in a private location (not in the public GitHub repository or the deployed site's public folder). The original project contained `data/guests.xlsx` and `src/guests.json`; these guest-data files and the old conversion/search scripts have been left out of this revised project to avoid publishing the list accidentally.

These table URLs are intentionally shareable and are not authentication: anyone who receives or guesses `/table/10` can view Table 10. This design prevents the site from exposing the complete guest directory; it does not prevent forwarding or guessing an individual table link.
