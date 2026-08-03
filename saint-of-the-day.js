/**
 * saint-of-the-day.js
 * Shared client-side logic for index.html and archive.html.
 * No build step, no dependencies — vanilla JS, works directly on GitHub Pages.
 */

const MONTH_NAMES = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

async function loadManifest() {
  const res = await fetch("assets/manifest.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load manifest.json");
  const data = await res.json();
  return (data.saints || []).filter(s => s.slug); // ignore malformed entries
}

function todayMMDD(date = new Date()) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

/** All saints whose primary OR any alternate-tradition feast falls on `mmdd`. */
function saintsForDate(saints, mmdd) {
  return saints.filter(s => {
    if (s.feast_day === mmdd) return true;
    if (Array.isArray(s.feast_days_other)) {
      return s.feast_days_other.some(f => f.date === mmdd);
    }
    return false;
  });
}

/** Deterministic fallback so every visit on a non-matching day still shows
 *  someone, and the same saint shows all day (not on every reload). */
function featuredSaint(saints) {
  if (saints.length === 0) return null;
  const idx = dayOfYear() % saints.length;
  return saints[idx];
}

/** Which tradition(s)/date labels justify showing this saint today. */
function matchLabelsForDate(saint, mmdd) {
  const labels = [];
  if (saint.feast_day === mmdd) {
    labels.push(saint.feast_day_tradition || "Feast day");
  }
  if (Array.isArray(saint.feast_days_other)) {
    saint.feast_days_other.forEach(f => {
      if (f.date === mmdd) labels.push(f.tradition);
    });
  }
  return labels;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

/** Renders the homepage hero: today's saint if one matches, else a
 *  clearly-labeled "featured" pick from the archive. */
function renderHero(container, saints) {
  if (!saints.length) {
    container.innerHTML = `
      <div class="hero-empty">
        <p>No saints have been added to the archive yet.</p>
        <p class="hero-empty-sub">Run the page-generator workflow for a saint, then add an entry to <code>assets/manifest.json</code>.</p>
      </div>`;
    return;
  }

  const mmdd = todayMMDD();
  const matches = saintsForDate(saints, mmdd);
  const isRealFeast = matches.length > 0;
  const shown = isRealFeast ? matches : [featuredSaint(saints)];

  container.innerHTML = shown.map(saint => {
    const labels = isRealFeast ? matchLabelsForDate(saint, mmdd) : [];
    const eyebrow = isRealFeast
      ? `Feast day today${labels.length ? " &middot; " + labels.map(escapeHtml).join(", ") : ""}`
      : "From the archive";
    return `
      <article class="hero-card" style="--saint-primary:${saint.colors?.primary || "#4b2e6b"};--saint-accent:${saint.colors?.accent || "#c9862f"}">
        <p class="hero-eyebrow">${eyebrow}</p>
        <h2 class="hero-name">${escapeHtml(saint.name)}</h2>
        <p class="hero-tagline">${escapeHtml(saint.tagline)}</p>
        <div class="hero-chips">
          <span class="chip">${escapeHtml(saint.era || "")}</span>
          <span class="chip">${escapeHtml(saint.patronage ? "Patron of " + saint.patronage : "")}</span>
          <span class="chip chip-rubric">${escapeHtml(saint.feast_day_display || "")}</span>
        </div>
        <a class="hero-link" href="${saint.page}">Read her page &rarr;</a>
      </article>`;
  }).join("");
}

/** Renders a 7-day strip (today + next 6 days) of upcoming feasts, for the homepage. */
function renderWeekStrip(container, saints) {
  const today = new Date();
  const rows = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const mmdd = todayMMDD(d);
    const matches = saintsForDate(saints, mmdd);
    rows.push({ date: d, mmdd, matches });
  }
  container.innerHTML = rows.map(row => `
    <li class="week-row${row.matches.length ? " week-row-active" : ""}">
      <span class="week-date">${MONTH_NAMES[row.date.getMonth()].slice(0,3)} ${row.date.getDate()}</span>
      <span class="week-names">
        ${row.matches.length
          ? row.matches.map(s => `<a href="${s.page}">${escapeHtml(s.name)}</a>`).join(", ")
          : "&mdash;"}
      </span>
    </li>`).join("");
}

/** Renders the full archive grouped by month for archive.html */
function renderArchiveGrid(container, saints) {
  if (!saints.length) {
    container.innerHTML = `<p class="archive-empty">No saints in the archive yet.</p>`;
    return;
  }
  const sorted = [...saints].sort((a, b) => (a.feast_day || "").localeCompare(b.feast_day || ""));
  const byMonth = {};
  sorted.forEach(s => {
    const month = (s.feast_day || "00-00").slice(0, 2);
    byMonth[month] = byMonth[month] || [];
    byMonth[month].push(s);
  });

  container.innerHTML = Object.keys(byMonth).sort().map(month => {
    const monthIdx = parseInt(month, 10) - 1;
    const monthName = MONTH_NAMES[monthIdx] || "Undated";
    const cards = byMonth[month].map(s => `
      <a class="archive-card" href="${s.page}" style="--saint-primary:${s.colors?.primary || "#4b2e6b"}">
        <span class="archive-date">${escapeHtml(s.feast_day_display || "")}</span>
        <span class="archive-name">${escapeHtml(s.name)}</span>
        <span class="archive-tagline">${escapeHtml(s.tagline || "")}</span>
      </a>`).join("");
    return `
      <section class="archive-month">
        <h3 class="archive-month-title">${monthName}</h3>
        <div class="archive-month-grid">${cards}</div>
      </section>`;
  }).join("");
}
