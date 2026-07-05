# STATUS — MycoFilter

> **Purpose:** This is the project's running handoff file. It records where the work stands so any new session (even a cold start days later) can resume without re-deriving context. **Claude updates this at every checkpoint.** To resume: open a session and say *"Read STATUS.md and continue."*

_Last updated: 2026-07-04_

---

## 🎯 Current goal

**Decision made: build.** The vertical slice runs locally: upload a colorimetric-strip + reference-card photo → tap-to-mark the two color zones → normalized reading → stored in SQLite → shown on a live Leaflet map. First version was committed and pushed ([f1912b3](https://github.com/elpinyeknom/mycoFilter/commit/f1912b3)); a follow-up change (categorical reaction instead of a fake ppm number — see below) is built and verified locally, **not yet committed**. Plan account: **Claude Pro** (rolling usage limits — build in small committed increments).

## ✅ Done

- Full blueprint written in two forms: `BLUEPRINT.md` (Markdown) and `index.html` (interactive, with toxicity-map demo + KPI dashboard). Published live via GitHub Pages at **https://elpinyeknom.github.io/mycoFilter/** (mobile-friendly, proper document shell/favicon).
- **Vertical slice built, verified, committed, and pushed** (Next.js 14 App Router + TypeScript + Tailwind, SQLite via `better-sqlite3`, `sharp` for pixel sampling, Leaflet/OSM via `react-leaflet` — all local-first, zero external accounts):
  - `/` — submit flow: photo upload, tap-to-mark reference patch + test-strip color, geolocation capture (with manual fallback), safety disclaimer.
  - `/map` — live map, colored markers by severity, popup with thumbnail + reading.
  - `POST/GET /api/readings` — samples both tapped points, applies gray-world white-balance correction using the reference patch, persists to SQLite.
  - Two real bugs found and fixed during verification: (1) invalid `sharp().ensureAlpha(false)` call — `ensureAlpha` takes a numeric alpha value or nothing, not a boolean; (2) `react-leaflet`'s `MapContainer` only applies `center`/`zoom` props at initial mount, so the map never recentered once readings loaded asynchronously — fixed with a `useMap()`-based `FitToReadings` helper component.
  - Committed as [f1912b3](https://github.com/elpinyeknom/mycoFilter/commit/f1912b3) and pushed to `origin/main`. Local git identity was unset (fell back to auto-detected `user@hostname`) — fixed by setting local `git config user.name/user.email` to `elpinyeknom`/`rbalws@pm.me` (matches the pseudonymous identity already public on this repo) and amending the commit **before** it was ever pushed, so the auto-detected identity was never exposed publicly.
- **Replaced the fake ppm placeholder with an honestly-scoped categorical reading**, after researching real rhodizonate lead-test-strip chemistry (see `lib/colorimetry.ts` for full reasoning + sources):
  - Real consumer lead test strips are a **threshold indicator** (color changes once lead is present above the reagent's detection limit), not a continuous colorimeter — there's no published general-purpose color→ppm chart for this chemistry, per EPA/NIST test-kit evaluations. So a continuous "150.0 ppm"-style number was always going to be fake precision, not a placeholder waiting for "real" data to slot in.
  - New design: the app reports a **category** — no reaction / mild / strong — based on how far the corrected test-strip color has shifted from the reference card. Thresholds are a labeled heuristic, not a validated calibration.
  - The submit page now shows real, sourced EPA residential soil lead screening levels (200 ppm general, 100 ppm with other lead sources nearby, 400+ ppm hazardous in play areas — [EPA](https://www.epa.gov/lead/hazard-standards-and-clearance-levels-lead-paint-dust-and-soil-tsca-sections-402-and-403)) as static reference context, explicit that a strip reaction alone doesn't tell you which range you're in.
  - Updated `lib/db.ts` schema (`estimated_ppm` → `reaction_category`), `app/api/readings/route.ts`, `app/page.tsx`, `app/map/MapClient.tsx` accordingly. Local dev SQLite db wiped and recreated (dev-only data, gitignored, no migration needed). Re-verified end-to-end in the preview browser: synthetic test submission classified correctly as "Strong reaction," map marker rendered red with the right popup text.
  - `README.md`'s "Known simplifications" and roadmap updated to explain this isn't a stopgap — it's the honest scope for what this test chemistry can support.

## 🔜 Next step

**Commit and push the categorical-reaction change**, then decide the next increment:
- Hosted deploy (Supabase Postgres/storage + Vercel) — deferred on purpose to keep the first commits account-free. *(Recommended next — lowest effort, and turns this into something shareable.)*
- Real reference-card auto-detection (currently manual tap-to-mark).
- Investigate whether any *other* target contaminant (PAHs, pesticides — the blueprint's other two analytes) has test chemistry that actually supports continuous quantification, if a real ppm reading is wanted somewhere in the product.

## 🧭 Scoping decisions for the vertical slice (so future sessions don't relitigate)

- **Platform:** mobile-friendly responsive web app (not native).
- **Stack:** single Next.js app, no separate backend service.
- **Dev setup:** local-first (SQLite + local file storage). Hosted Postgres/deploy is an explicit *later* commit.
- **Normalization approach:** user manually taps the reference patch and test-strip zone on the uploaded photo (no CV marker detection in v1) — deliberate scope cut, documented in `README.md`'s "Known simplifications."
- **Reading output:** categorical (none/mild/strong), not a fake precise ppm — this matches how the real chemistry actually behaves, not just a simplification for buildability. See `lib/colorimetry.ts` comments for the full reasoning and sources.

## 🗝️ Key decisions & context

- **Naming:** project is **mycoFilter** (old name "mycotechnix" retired).
- **Git identity:** name `elpinyeknom`, email `rbalws@pm.me` — now set as local git config in this repo, so it's automatic going forward.
- **Safety framing:** citizen colorimetric screening is triage only, never a lab substitute — kept as a visible disclaimer on the submit page; carry into any future screens.
- **Model-cost note:** for building, lead with Sonnet 5 (cheapest capable coder, intro pricing through Aug 2026), Opus 4.8 for hard parts; Fable 5 reserved for the hardest reasoning only.
- **Dependency note:** pinned `next` to `^14.2.35` (latest 14.x patch) during this build — `npm audit` still flags a couple of advisories in features this app doesn't use (image optimizer, middleware, WebSocket upgrades); fine for local dev, worth revisiting before hosted deploy.

## ⚠️ Open questions

- None blocking — next step is a user decision on committing the current change + picking the next increment (hosted deploy vs. real CV vs. exploring quantification for a different analyte).
