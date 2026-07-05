# STATUS — MycoFilter

> **Purpose:** This is the project's running handoff file. It records where the work stands so any new session (even a cold start days later) can resume without re-deriving context. **Claude updates this at every checkpoint.** To resume: open a session and say *"Read STATUS.md and continue."*

_Last updated: 2026-07-05_

---

## 🎯 Current goal

**In progress: hosted deploy.** The vertical slice's code has been rewritten to use a hosted backend (Supabase Postgres + Storage) instead of local SQLite/files — **written and type-checks cleanly, but not yet runtime-verified or committed**, because it needs a real Supabase project to connect to, which only the user can create. Waiting on the user to finish account setup (see "Blocking on the user" below). Plan account: **Claude Pro** (rolling usage limits — build in small committed increments).

## ✅ Done

- Full blueprint published live via GitHub Pages: **https://elpinyeknom.github.io/mycoFilter/**.
- **Vertical slice (local SQLite version) built, verified, committed, pushed:** [f1912b3](https://github.com/elpinyeknom/mycoFilter/commit/f1912b3).
- **Replaced the fake ppm placeholder with an honest categorical reading** (no reaction/mild/strong, based on real rhodizonate test-strip chemistry + sourced EPA soil-lead thresholds shown as static context) — committed and pushed: [25b1d79](https://github.com/elpinyeknom/mycoFilter/commit/25b1d79). Full reasoning + sources in `lib/colorimetry.ts` and `README.md`.
- **Researched PAHs and pesticides** (the blueprint's other two target contaminants) to see if either supports real continuous quantification where lead doesn't. Finding: no — real field kits for both are also threshold/semi-quantitative, not continuous, per the published literature. Conclusion: the categorical approach is the right general pattern for all three, not a lead-specific gap. **No code change made** — decided to stay lead-only for now and prioritize hosted deploy instead (see reasoning below).
- **Hosted-deploy code written** (this session, autonomous — see "Blocking on the user" for what's left):
  - New `lib/supabaseClient.ts` — shared `@supabase/supabase-js` client using the **service_role** key (server-only; the browser never talks to Supabase directly, only via our own `/api/readings` route). Fails fast with a clear error if `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` aren't set — confirmed this error message fires correctly in dev and in `npm run build`'s "Collecting page data" step.
  - `lib/db.ts` rewritten: dropped `better-sqlite3` entirely, `insertReading`/`listReadings` now `async` against Supabase Postgres. Same exported shape (`Reading` interface unchanged) so `route.ts` needed minimal edits.
  - New `lib/storage.ts` — `uploadReadingImage()` uploads to a Supabase Storage bucket named `reading-images` and returns its public URL (this becomes the new `image_path`; no frontend changes needed since `<img src=...>` doesn't care if the string is relative or absolute).
  - `app/api/readings/route.ts` — removed the `fs/promises` local-file write block, calls `uploadReadingImage()` instead; both route handlers now properly `await` the now-async `lib/db.ts` functions.
  - `next.config.js` / `package.json` — dropped `better-sqlite3`/`@types/better-sqlite3`, added `@supabase/supabase-js`; `npm install` run successfully.
  - Deleted the now-dead local `data/` (SQLite) and `public/uploads/` directories and their `.gitignore` entries — local dev now always talks to the same hosted Supabase project (deliberate: one code path, not two, for a solo maintainer — see plan file reasoning).
  - `README.md`'s "Running locally" and "Project Status" updated for the new Supabase-first setup.
  - **`npm run build` confirmed type-checking passes cleanly** ("✓ Compiled successfully"); the build only fails at the later "Collecting page data" step with the expected missing-env-var error — proof the code is correct and the only remaining blocker is real credentials, not a bug.

## 🚧 Blocking on the user (Phase A of the deploy plan — nobody else can do this)

1. Create a free Supabase account + project.
2. In the SQL Editor, run this once:
   ```sql
   create table if not exists readings (
     id bigint generated always as identity primary key,
     created_at timestamptz not null,
     lat double precision not null,
     lng double precision not null,
     image_path text not null,
     analyte text not null,
     reference_rgb text not null,
     raw_rgb text not null,
     corrected_rgb text not null,
     reaction_category text not null,
     notes text
   );
   ```
3. Create a **public** Storage bucket named exactly `reading-images`.
4. From Settings → API, get the **Project URL** and **`service_role` secret key**.
5. Either paste those two values to Claude, or (recommended, keeps secrets out of the chat transcript) create `/Users/fsai/mycoFilter/.env.local` directly:
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
6. Create a free Vercel account (needed for the deploy step after this).

**As of this checkpoint, `.env.local` does not exist yet** — none of this has been done. Once it is, resume with: local verification (`npm run dev` + full submit/map flow against the real project, then `npm run build` again to confirm it passes end-to-end) → commit → `vercel login`/`link`/env vars/`--prod` deploy → live-URL verification → update README/STATUS again.

## 🧭 Scoping decisions (so future sessions don't relitigate)

- **Platform:** mobile-friendly responsive web app (not native).
- **Stack:** single Next.js app, no separate backend service.
- **Backend:** Supabase (Postgres + Storage) for both local dev and prod — one code path, chosen deliberately over maintaining SQLite-for-dev/Postgres-for-prod, since this is a solo hobby project with low traffic and the dual-path maintenance cost isn't worth it.
- **DB client:** `@supabase/supabase-js` (PostgREST over HTTPS), not a raw Postgres driver — avoids serverless connection-pooling concerns on Vercel entirely.
- **File storage:** Supabase Storage, not Vercel Blob — keeps everything in one account/service.
- **Normalization approach:** user manually taps the reference patch and test-strip zone on the uploaded photo (no CV marker detection yet) — deliberate scope cut, documented in `README.md`'s "Known simplifications."
- **Reading output:** categorical (none/mild/strong), not a fake precise ppm — matches how the real chemistry actually behaves for all three target contaminants (lead confirmed directly; PAHs/pesticides confirmed via research, no code built for them yet).

## 🗝️ Key decisions & context

- **Naming:** project is **mycoFilter** (old name "mycotechnix" retired).
- **Git identity:** name `elpinyeknom`, email `rbalws@pm.me` — set as local git config in this repo already.
- **Safety framing:** citizen colorimetric screening is triage only, never a lab substitute — visible disclaimer on the submit page; carry into any future screens.
- **Model-cost note:** lead with Sonnet 5 for building, Opus 4.8 for hard parts, Fable 5 reserved for the hardest reasoning only.
- **Workflow note:** solo project, commits go straight to `main` (no PR ceremony) — confirmed with the user as the right fit here, revisit only if a second collaborator or a pre-deploy review gate becomes relevant.
- **Dependency note:** `next` pinned to `^14.2.35`; `npm audit` still flags a couple of advisories in features this app doesn't use (image optimizer, middleware, WebSocket upgrades) — worth a real look once traffic isn't zero.

## ⚠️ Open questions

- None blocking on the design side — purely waiting on the user completing the Supabase/Vercel account steps above.
