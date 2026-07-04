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

**Stage: Vertical slice (local dev).** The blueprint is published, and a first working slice of the software now runs locally: upload a strip+reference-card photo, tap the two color zones, get a normalized reading stored in a database and plotted on a live map. See "Running locally" below. Hosted deployment, real computer-vision card detection, and lab-validated calibration are still ahead — see the roadmap.

---

## 🖥️ Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` to submit a reading, or `http://localhost:3000/map` to view the live map. Data is stored in a local SQLite file (`data/mycofilter.db`) and uploaded photos in `public/uploads/` — both gitignored, nothing leaves your machine.

**Known simplifications in this slice** (see `app/api/readings/route.ts` and `lib/colorimetry.ts`):
- Reference-card and test-strip regions are located by the user tapping the photo, not by automatic marker detection.
- The lead ppm calibration curve is a **placeholder**, not derived from lab data — it exists to exercise the pipeline end-to-end, not to produce a scientifically valid reading.

---

## 🗺️ Roadmap

- [x] Concept & full blueprint (technology, operations, economics, policy)
- [x] Interactive HTML prospectus with toxicity-map mockup
- [x] **Vertical slice (local)** — upload a colorimetric-strip photo + reference card → normalized reading → stored in a database → shown on a live map
- [ ] Hosted deploy (Supabase + Vercel) of the vertical slice
- [ ] Citizen data-validation pipeline (automatic reference-card detection, outlier/geo checks)
- [ ] Real, lab-derived calibration curve(s)
- [ ] Predictive Bio-Mapping engine (contamination signature → prescriptive blueprint)
- [ ] Pilot Zone deployment (single high-contamination block)

---

## ⚠️ Safety Note

Citizen colorimetric screening is designed for **triage and prioritization**, not as a substitute for accredited laboratory analysis. Every remediation should be opened and closed against lab-verified thresholds before any land-use or health decision.

---

*Blueprint prepared with grounding in published mycoremediation and phytoremediation research — see the sources section of [`BLUEPRINT.md`](./BLUEPRINT.md).*
