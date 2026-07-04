# STATUS — MycoFilter

> **Purpose:** This is the project's running handoff file. It records where the work stands so any new session (even a cold start days later) can resume without re-deriving context. **Claude updates this at every checkpoint.** To resume: open a session and say *"Read STATUS.md and continue."*

_Last updated: 2026-07-04_

---

## 🎯 Current goal

**Decision made: build.** The vertical slice is now scaffolded and verified working locally: upload a colorimetric-strip + reference-card photo → tap-to-mark the two color zones → normalized reading → stored in SQLite → shown on a live Leaflet map. Plan account: **Claude Pro** (rolling usage limits — build in small committed increments).

**Not yet committed to git** — the new app code is sitting in the working tree, ready for the user to review/commit.

## ✅ Done

- Full blueprint written in two forms: `BLUEPRINT.md` (Markdown) and `index.html` (interactive, with toxicity-map demo + KPI dashboard). Published live via GitHub Pages at **https://elpinyeknom.github.io/mycoFilter/** (mobile-friendly, proper document shell/favicon).
- **Vertical slice built and verified locally** (Next.js 14 App Router + TypeScript + Tailwind, SQLite via `better-sqlite3`, `sharp` for pixel sampling, Leaflet/OSM via `react-leaflet` — all local-first, zero external accounts):
  - `/` — submit flow: photo upload, tap-to-mark reference patch + test-strip color, geolocation capture (with manual fallback), safety disclaimer.
  - `/map` — live map, colored markers by severity, popup with thumbnail + estimated ppm.
  - `POST/GET /api/readings` — samples both tapped points, applies gray-world white-balance correction using the reference patch, looks up an estimated lead ppm via a **placeholder** calibration curve, persists to SQLite.
  - Verified end-to-end via the preview browser tool: synthetic test photo submitted successfully (150.0 ppm, matching the calibration table exactly since inputs were exact control-point colors), reading appeared correctly on the map, mobile viewport (375×812) confirmed no horizontal overflow on either page.
  - Two real bugs were found and fixed during verification: (1) invalid `sharp().ensureAlpha(false)` call — `ensureAlpha` takes a numeric alpha value or nothing, not a boolean; (2) `react-leaflet`'s `MapContainer` only applies `center`/`zoom` props at initial mount, so the map never recentered once readings loaded asynchronously — fixed with a `useMap()`-based `FitToReadings` helper component.
  - `README.md` updated (roadmap + "Running locally" section); `.gitignore` updated (`.next/`, SQLite db, uploaded photos).

## 🔜 Next step

**Review and commit the vertical-slice code**, then decide the next increment:
- Hosted deploy (Supabase Postgres/storage + Vercel) — deferred on purpose to keep the first commits account-free.
- Real reference-card auto-detection (currently manual tap-to-mark).
- Real lab-derived calibration curve (currently a labeled placeholder).

## 🧭 Scoping decisions for the vertical slice (so future sessions don't relitigate)

- **Platform:** mobile-friendly responsive web app (not native).
- **Stack:** single Next.js app, no separate backend service.
- **Dev setup:** local-first (SQLite + local file storage). Hosted Postgres/deploy is an explicit *later* commit.
- **Normalization approach:** user manually taps the reference patch and test-strip zone on the uploaded photo (no CV marker detection in v1) — this was a deliberate scope cut to keep the slice buildable in one pass; documented in `README.md`'s "Known simplifications."
- **Calibration:** hardcoded placeholder lookup table for lead only (rhodizonate-style pink→maroon), explicitly labeled as non-lab-validated in both code (`lib/colorimetry.ts`) and UI copy.

## 🗝️ Key decisions & context

- **Naming:** project is **mycoFilter** (old name "mycotechnix" retired).
- **Git identity:** name `elpinyeknom`, email `rbalws@pm.me`.
- **Safety framing:** citizen colorimetric screening is triage only, never a lab substitute — kept as a visible disclaimer on the submit page; carry into any future screens.
- **Model-cost note:** for building, lead with Sonnet 5 (cheapest capable coder, intro pricing through Aug 2026), Opus 4.8 for hard parts; Fable 5 reserved for the hardest reasoning only.
- **Dependency note:** pinned `next` to `^14.2.35` (latest 14.x patch) during this build — `npm audit` still flags a couple of advisories in features this app doesn't use (image optimizer, middleware, WebSocket upgrades); fine for local dev, worth revisiting before hosted deploy.

## ⚠️ Open questions

- None blocking — next step is a user decision on committing + picking the next increment (hosted deploy vs. real CV vs. real calibration).
