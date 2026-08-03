# Adding a new saint

This project uses a fixed workflow (defined as a Claude project's
instructions) to research, design, and generate each saint page. This file
is the checklist for getting a newly generated saint from "Claude's output"
into this repo correctly.

## 1. Generate the page

Send the saint's name (nothing else needed). The workflow will:

- Research and verify biography, feast day(s), patronage, legacy, and a
  quotable primary-source line, cross-checked across sources.
- Derive a one-off visual theme from that saint's actual story (palette,
  type, one signature motif) — never a reused template.
- Build a single self-contained HTML file with inline SVG art, 1–2 real
  YouTube embeds, and the required 7 content sections.
- Build a matching 1200×630 social preview PNG using the same theme.
- Write a ready-to-post social caption.

If the saint's name is ambiguous (multiple saints share it), you'll get one
clarifying question first.

## 2. Place the files

```
saints/st-[name].html            (all lowercase, hyphenated, diacritics dropped from the filename only)
saints/previews/st-[name].png
```

Examples: `st-lydia.html`, `st-maximilian-kolbe.html`,
`st-therese-of-lisieux.html`.

## 3. Set the real BASE_URL

Every saint page ships with `[BASE_URL]` placeholders in its Open Graph /
Twitter meta tags:

```html
<meta property="og:image" content="[BASE_URL]/saints/previews/st-[name].png">
<meta name="twitter:image" content="[BASE_URL]/saints/previews/st-[name].png">
```

Replace `[BASE_URL]` with your live GitHub Pages URL (e.g.
`https://your-username.github.io/your-repo-name`) before committing. Once
you've done this for the first saint, reuse the same value for every
subsequent one.

## 4. Add a manifest entry

Open `assets/manifest.json` and add one object to the `saints` array. Use
the `_schema` block at the top of the file as your field reference. Minimal
example:

```json
{
  "slug": "maximilian-kolbe",
  "name": "St. Maximilian Kolbe",
  "tagline": "The friar who traded his life for a stranger's at Auschwitz",
  "feast_day": "08-14",
  "feast_day_display": "August 14",
  "feast_day_tradition": "Catholic Church",
  "patronage": "Prisoners, families, journalists",
  "era": "20th century",
  "colors": { "primary": "#2b2b2b", "accent": "#8f7a4a" },
  "page": "saints/st-maximilian-kolbe.html",
  "preview": "saints/previews/st-maximilian-kolbe.png",
  "added": "2026-08-14",
  "release_date": "2026-08-14"
}
```

- `feast_day` must be `MM-DD` — this is what the homepage matches against
  the visitor's local date.
- If the saint has meaningfully different feast dates across traditions
  (common for saints venerated by both East and West, or by Protestant
  calendars), list them in `feast_days_other` so the homepage can still
  surface the page on those dates too. See the Lydia entry for the pattern.
- `colors.primary` should match that saint page's dominant/signature color
  — it's used as a left-border accent on their archive card.

## Bulk-scheduling saints ahead of time

You can commit many saint pages at once and have each one reveal itself
automatically on its own day — nothing stays visible early.

- Set `release_date` (a full `YYYY-MM-DD`, not just `MM-DD`) to the day you
  want that saint to go live.
- Until local midnight of that date, the saint is completely invisible
  everywhere on the site: no hero card, no entry in the "this week" strip,
  no card in the archive. The page file itself is technically reachable if
  someone has the direct URL, but nothing on the site links to it yet.
- The moment that date arrives, it appears automatically — no redeploy, no
  action needed. It then stays in the archive permanently going forward.
- `feast_day` (`MM-DD`) is separate and still does its normal job: once a
  saint is released, `feast_day` is what makes them show up as "Feast day
  today" on the anniversary of their feast in future years.
- If you omit `release_date`, it falls back to `added`, which is why
  existing entries don't need any changes.

So a realistic bulk workflow looks like: generate ten saint pages in one
sitting, add ten manifest entries with `release_date` spread across the
next ten days, commit once — and the site then "posts" one a day on its
own from a static file, no scheduler required.

## 5. Validate before committing

A GitHub Action (`.github/workflows/validate-manifest.yml`) runs on every
push and pull request and checks that:

- every manifest entry's `page` and `preview` paths actually exist,
- every `feast_day` (and any `feast_days_other` dates) match `MM-DD`,
- every `slug` is unique.

You can also run the same check locally — see the workflow file for the
plain Python/Node logic if you want a pre-commit version.

## 6. Commit

That's it — no build step. Once merged, the homepage and archive pick up
the new saint automatically on the next page load.

## Making changes to an existing saint

If you're asked to tweak a saint already in the repo ("make the palette
darker," "add a section on the persecution context," "regenerate the
caption") — treat it as an edit to the existing files, not a new page. If
the theme changes, regenerate `saints/previews/st-[name].png` to match, and
update the `colors` field in the manifest.
