# Saint of the Day

A static, no-build-step website that surfaces one saint a day from a growing
archive of individually designed profile pages. Built to be committed
straight into GitHub Pages: no bundler, no framework, no server.

**Live idea:** every saint gets a fully custom, single-file HTML page (its
own palette, typography, and signature visual motif derived from their own
story). This repo is the *container* around that: a homepage that shows
whoever's feast day it is today, and an archive that lists everyone who's
been added so far.

---

## How "Saint of the Day" works

There's no backend and no scheduled job. `index.html` loads
[`assets/manifest.json`](assets/manifest.json) in the browser and, using the
visitor's local date, checks whether any saint's `feast_day` (or any of
their `feast_days_other`, for saints with denominational variance) matches
today.

- **If there's a match:** that saint (or saints — some days have more than
  one) is shown as "Feast day today."
- **If there's no match:** the homepage falls back to a deterministic pick
  from the existing archive, clearly labeled "From the archive" so it's
  never presented as if it were actually that saint's feast day. The pick
  rotates by day-of-year, so it's stable all day but changes daily.

This means the site "just works" on GitHub Pages with zero automation — but
it also means the homepage can only ever show what's already in
`manifest.json`. New saints have to be added deliberately (see below).

---

## Bulk-scheduling content ahead of time

You can write and commit a whole batch of saint pages at once — each one
stays completely invisible (no hero, no week-strip mention, no archive
card) until local midnight of its own `release_date`, then it appears on
its own and stays in the archive from then on. No scheduler, no GitHub
Action needed for this part — it's just a date comparison that runs in the
visitor's browser every time the page loads. See
[CONTRIBUTING.md](CONTRIBUTING.md#bulk-scheduling-saints-ahead-of-time) for
the exact field to set.

---

## Repository structure

```
.
├── index.html                      Homepage — today's saint + this week's feast days
├── archive.html                    Full archive, grouped by month, filterable
├── assets/
│   ├── manifest.json                The single source of truth — one entry per saint
│   ├── saint-of-the-day.js          Shared logic: date matching, fallback, rendering
│   └── hub.css                      Shared theme for index.html + archive.html only
├── saints/
│   ├── st-lydia.html                One saint page per saint (self-contained, own theme)
│   └── previews/
│       └── st-lydia.png             1200×630 social preview card, matches that page's theme
├── .github/
│   └── workflows/
│       └── validate-manifest.yml    CI: checks manifest.json against actual files on disk
├── CONTRIBUTING.md                  Step-by-step for adding a new saint
└── LICENSE
```

**Important distinction:** `assets/hub.css` and `assets/saint-of-the-day.js`
are only used by the two hub pages (`index.html`, `archive.html`). Every
file in `saints/` is fully self-contained — its own inline `<style>`, its
own inline SVG art, no dependency on `assets/`. That's intentional: each
saint page should be droppable into any repo on its own and still work.

---

## Adding a new saint

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full step-by-step. In short:

1. Ask Claude for the saint by name — the existing per-saint page-generator
   workflow researches, designs, and produces the `.html` page and matching
   preview `.png`.
2. Save the two files into `saints/` and `saints/previews/`.
3. Add one entry to `assets/manifest.json`.
4. Commit. The homepage and archive pick it up automatically — no rebuild
   step required.

---

## Before you publish: set your live URL

Every saint page includes Open Graph / Twitter Card meta tags so the link
looks right when shared on social media. Those tags need an **absolute**
URL, which means each page's `[BASE_URL]` placeholder has to be replaced
with your actual GitHub Pages URL once you know it, e.g.:

```
https://your-username.github.io/your-repo-name
```

`saints/st-lydia.html` in this scaffold still has `[BASE_URL]` as a literal
placeholder — find-and-replace it (and do the same for every future saint
page) before or right after your first deploy.

---

## Local preview

No build step is required, but `fetch()` for `manifest.json` won't work
from a `file://` URL in most browsers, so serve the folder locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/
```

---

## Design notes

- **Hub pages** (`index.html`, `archive.html`) use an "illuminated ordo"
  theme: deep ink background, gold-leaf accent, and rubric-red date labels
  — a nod to the old scribal convention of writing calendar/feast
  instructions in red ink (the literal origin of the word "rubric").
- **Each saint page** gets its own theme derived from their own story (see
  `saints/st-lydia.html` for the pattern: a "dye-ladder" gradient motif
  built from her trade as a seller of purple dye). Don't reuse one saint's
  signature motif for another — re-derive it every time.
- Fonts are loaded from Google Fonts only; no other external runtime
  dependency exists anywhere in this repo.
