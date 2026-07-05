# 🍄 MycoFilter

**The Hyper-Local Decentralized Bio-Remediation Network**

> *Mushrooms × plants save the world. This one is a gift to the world.*

An AI-driven system that empowers communities to self-direct bio-mimetic cleanup of contaminated soil and water — using targeted mycelial networks (fungi) and native flora prescribed precisely to each site's unique chemical signature.

Targets **PAHs · Lead · Pesticide residue**, scaling from a single block to a region.

---

## 📄 The Blueprint

The full concept — technology architecture, operations model, and economic/policy strategy — lives in two forms:

- **[`BLUEPRINT.md`](./BLUEPRINT.md)** — the complete written blueprint & investment prospectus (Markdown).
- **[`index.html`](./index.html)** — an interactive, styled version with a filterable toxicity-map demo and KPI dashboard. Once GitHub Pages is enabled, it's live at **https://elpinyeknom.github.io/mycoFilter/**, or open the file directly in a browser.

---

## 🚦 Project Status

**Stage: hosted deploy in progress.** The blueprint is published, and the vertical slice — upload a strip+reference-card photo, tap the two color zones, get a normalized reading stored in a database and plotted on a live map — now runs against a hosted Supabase backend (Postgres + Storage), on its way to a public Vercel URL. See "Running locally" below. Real computer-vision card detection and lab-validated calibration are still ahead — see the roadmap.

---

## 🖥️ Running locally

This app stores readings and photos in [Supabase](https://supabase.com) (hosted Postgres + file storage) rather than local files, so you need a (free) Supabase project first:

1. Create a Supabase project, then in its SQL Editor run the `CREATE TABLE readings (...)` snippet from `STATUS.md` (or the project setup notes) once.
2. Create a public Storage bucket named `reading-images`.
3. Copy the project's **URL** and **`service_role` secret key** (Settings → API) into a `.env.local` file in the repo root:
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

Then:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to submit a reading, or `http://localhost:3000/map` to view the live map.

**Known simplifications in this slice** (see `app/api/readings/route.ts` and `lib/colorimetry.ts`):
- Reference-card and test-strip regions are located by the user tapping the photo, not by automatic marker detection.
- Readings are reported as a **category** — no reaction / mild / strong — not a precise ppm number. This isn't a placeholder waiting to be swapped for "real" numbers: rhodizonate-style lead test strips are a threshold indicator in reality too (the reagent changes color once lead is present above its detection limit), not a continuous colorimeter, and there's no published general-purpose color→ppm chart for this chemistry (per EPA/NIST test-kit evaluations). The category is a heuristic based on how far the corrected test-strip color has shifted from the reference card, pending real strip/camera calibration. The app shows EPA's actual residential soil screening levels (200 ppm general, 100 ppm with other lead sources nearby, 400+ ppm hazardous in play areas) as static reference context — a reaction here doesn't tell you which of those ranges you're in; only an accredited lab can.

---

## 🗺️ Roadmap

- [x] Concept & full blueprint (technology, operations, economics, policy)
- [x] Interactive HTML prospectus with toxicity-map mockup
- [x] **Vertical slice (local)** — upload a colorimetric-strip photo + reference card → normalized reading → stored in a database → shown on a live map
- [ ] Hosted deploy (Supabase + Vercel) of the vertical slice
- [ ] Citizen data-validation pipeline (automatic reference-card detection, outlier/geo checks)
- [ ] Real, lab-derived quantitative calibration (if/where the underlying test chemistry supports it — see "Known simplifications")
- [ ] Predictive Bio-Mapping engine (contamination signature → prescriptive blueprint)
- [ ] Pilot Zone deployment (single high-contamination block)

---

## ⚠️ Safety Note

Citizen colorimetric screening is designed for **triage and prioritization**, not as a substitute for accredited laboratory analysis. Every remediation should be opened and closed against lab-verified thresholds before any land-use or health decision.

---

*Blueprint prepared with grounding in published mycoremediation and phytoremediation research — see the sources section of [`BLUEPRINT.md`](./BLUEPRINT.md).*
