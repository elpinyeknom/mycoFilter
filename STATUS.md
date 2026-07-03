# STATUS — MycoFilter

> **Purpose:** This is the project's running handoff file. It records where the work stands so any new session (even a cold start days later) can resume without re-deriving context. **Claude updates this at every checkpoint.** To resume: open a session and say *"Read STATUS.md and continue."*

_Last updated: 2026-07-03_

---

## 🎯 Current goal

Publish the interactive blueprint via GitHub Pages. **Deciding by tonight** whether to proceed to building the MycoFilter software (leaning: build). Plan account: **Claude Pro** (rolling usage limits — build in small committed increments).

## ✅ Done

- Full blueprint written in two forms: `BLUEPRINT.md` (Markdown) and `index.html` (interactive, with toxicity-map demo + KPI dashboard).
- Local repo initialized, merged with the pre-existing GitHub repo (kept `LICENSE`, folded in the "gift to the world" tagline). Old name "mycotechnix" fully removed.
- Renamed `mycofilter-blueprint.html` → `index.html` and updated all links, ready for GitHub Pages.

## 🔜 Next step (do this first)

1. **Authenticate & push:** user runs `gh auth login` in the session, then Claude runs `git push -u origin main`.
2. **Enable GitHub Pages:** source = `main` branch, `/` root. Site will be at https://elpinyeknom.github.io/mycoFilter/
3. **Decision point:** build the software, or keep as a pitch doc? (User deciding tonight.)

## 🧭 If building — the first milestone

**Vertical slice:** upload a colorimetric-strip photo + reference card → normalized reading → stored in a database → shown on a live map. Stack + scope to be defined before writing code. This is the smallest thing that proves the core idea and gives a real usage/effort read on the Pro plan.

## 🗝️ Key decisions & context

- **Naming:** project is **mycoFilter** (old name "mycotechnix" retired).
- **Git identity:** name `elpinyeknom`, email `rbalws@pm.me`.
- **Safety framing:** citizen colorimetric screening is triage only, never a lab substitute — keep this disclaimer in any product UI.
- **Model-cost note:** for building, lead with Sonnet 5 (cheapest capable coder, intro pricing through Aug 2026), Opus 4.8 for hard parts; Fable 5 reserved for the hardest reasoning only.

## ⚠️ Open questions

- Build or pitch? (deciding tonight)
- If building: target platform (web app? mobile-friendly web? native?) and tech stack.
