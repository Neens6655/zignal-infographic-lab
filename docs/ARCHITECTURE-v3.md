# ZGNAL Studio — v3 Architecture

Branch: `revamp/v3-studio` (off `revamp/v2`). Status: **BUILD**.

Same mission: **turn any content into an institutional-grade infographic.** The v3 pivot makes the
product *AI-native*: every brief produces **four fixed styles at once**, each render is **quality-gated
in a self-correcting loop**, and any output can be **edited in place on the fly (image-to-image, same image)**.

---

## 0. Why v3 (what was broken)

Evidence-backed diagnosis (see git log for the mapping session):

| # | Defect | Evidence |
|---|--------|----------|
| 1 | Image never persisted — only a base64 data URL in React state | `telemetry.ts`, `001_generations.sql` store metadata only |
| 2 | "Edit" re-renders from scratch (throws original away) | `api/regenerate/route.ts` |
| 3 | Whole 7-stage pipeline welded into one 300s function | `api/generate/route.ts` + `pipeline/run.ts` |
| 4 | Dead job infra — `/api/jobs/[id]` returns `complete` unconditionally | `api/jobs/[id]/route.ts` |
| 5 | Style `.md` read from disk at runtime; missing → silent `''`; NOT traced into bundle | `pipeline/prompt.ts` + `next.config.ts` |
| 6 | 20×20 sprawl across 6 sources of truth | `chat-types.ts`, `gemini.ts`, `analyze.ts`, 2 preset maps, marketing surfaces |
| 7 | "Copy Link" shares homepage, not the image | `result-viewer.tsx` |
| 8 | "Regenerate" button silently resets to blank form | `result-viewer.tsx` |
| 9 | Full-page takeover on generate — refresh mid-run loses everything | `page.tsx` (no route) |

## 1. The four styles (the ONLY four)

| id | Product name | Aesthetic | Source |
|----|--------------|-----------|--------|
| `mckinsey` | Corporate Deck | White boardroom research brief; navy/gold rules; strict grid | from `executive-institutional` |
| `academic` | Aged Academic | Aged parchment, sepia, Victorian scientific plate | from `aged-academia` |
| `deconstruct` | Deconstruct | Exploded NYT-editorial cross-section; pigment color-coding | from `deconstruct` |
| `museum` | Museum | **NEW** — exhibition plaque / gallery wall; engraved placard; artifact under spotlight | authored in v3 |

Style specs are **inlined as TypeScript constants** (`lib/studio/styles.ts`) — no runtime `fs`, no bundle
tracing, no silent-empty failure. Kills defect #5 by construction.

## 2. Engine architecture — prep once, render ×4, gate each

```
POST /api/generate  (SSE, maxDuration 300)
  │
  ├─ prepBrief(content, opts)                  ── ONCE (style-agnostic) ──────────────
  │     analyze → research (cached) → structure → density → number-guard
  │     → StructuredBrief   (cache by contentHash+opts in Upstash KV, already wired)
  │
  └─ Promise.all( STYLES.map( style =>          ── FAN OUT ×4 (parallel) ────────────
        renderStyleGated(brief, style)          each streams its own progress + result
     ))
        │
        └─ renderStyleGated  ── THE QUALITY LOOP (engine core) ──────────────────────
             for attempt in 1..MAX_ATTEMPTS (default 4):
               prompt   = assembleStylePrompt(brief, style, correction?)
               image    = attempt===1 ? generate(prompt)
                                      : editImage(prevImage, correction)   // image-to-image fix
               score    = await scoreRender(image, brief, style)
               emit('variant_attempt', {style, attempt, score})
               if score.pass: return {image, score, attempts: attempt, passed:true}
               correction = buildCorrection(score)                          // specific defects
             return bestAttempt (passed:false, FLAGGED — never silently shipped)
        │
        └─ persist: upload PNG → Supabase Storage; insert variant + version rows
           emit('variant_complete', {style, url, score, attempts, passed})
```

**Key properties**
- Shared prep runs **once** → 4-up costs ~1× prep + 4× render, not 4× everything.
- Each style **streams independently** → tiles fill in progressively (cinematic for free).
- Each render **loops until it passes** its quality bar, self-correcting with the *specific* defect.
- A tile that can't pass in `MAX_ATTEMPTS` is returned **flagged**, with attempt count surfaced.
  No silent caps (house rule).

## 3. The quality loop — `scoreRender` (the bar every tile must clear)

Two instruments, combined. A render **passes** iff `mandatory all-pass` AND `overall ≥ THRESHOLD (default 80)`.

**A. Deterministic (fast, no LLM) — reuse `ocr.ts` + `gate.ts` + `quality-score.ts`:**
- `legibility` — OCR finds no garbled tokens; every word real.  *(mandatory)*
- `numbers` — every number in the brief's stats appears in the OCR text.  *(mandatory)*
- `headings` — title + section headings present and legible.

**B. Vision judge (Gemini 2.5 Flash vision) — `lib/studio/judge.ts`:**
Reads the actual PNG (Rule: no score without a vision read) and rubric-scores 0–100:
- `style_conformance` — does it match the style spec? (white bg for mckinsey; sepia for academic; …) *(mandatory ≥70)*
- `visual_quality` — composition, hierarchy, whitespace, "client-ready?"
- `text_render` — is text crisp and correctly placed (vision cross-check of OCR)?
- returns `{scores, defects[]}` where `defects` are concrete strings fed back into the next attempt.

`buildCorrection(score)` turns defects into an imperative fix list, e.g.:
`"FIX: 'reventue' is misspelled → 'revenue'. Background must be pure white #FFFFFF, not cream. The 47% figure is missing — add it to the metrics row."`

## 4. Editing — image-to-image, same image (`POST /api/edit`)

```
POST /api/edit  { variantId, instruction }  (SSE, maxDuration 60)
  load current version PNG from Storage
  → editImage(png, instruction)         // Nano Banana Pro, png as inlineData + instruction
  → scoreRender(newPng, brief, style)   // same bar; if it regresses, keep prior version
  → store as new variant_version (version = prev+1); return url + score
```
- True image-to-image on a **single-layer** raster (why we chose pure generation over the hybrid).
- **Version history** per variant → undo/redo, non-destructive.
- Edit classifier (`edit-classifier.ts`) still routes obvious style/aspect swaps to a re-render;
  everything else is an in-place image edit.

## 5. Data model — migration `003_studio.sql`

```
projects           id, user_id, content, content_hash, opts(jsonb), created_at
generations        id, project_id, aspect_ratio, brief(jsonb), status, created_at   -- one 4-up run
variants           id, generation_id, style, current_version_id, score(jsonb), attempts, passed, flagged
variant_versions   id, variant_id, version, storage_path, edit_instruction, score(jsonb), created_at
```
- Supabase Storage bucket `renders` (public read via signed/again-public URL) — real shareable links.
- RLS: anon insert, owner read (mirror existing `002_tighten_rls.sql`).
- `generations` (v1 telemetry table) is retained for analytics; new tables are additive.

## 6. API surface (v3)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/generate` | POST (SSE) | prep once → 4-up gated render → persist → stream per-style |
| `/api/edit` | POST (SSE) | image-to-image edit of one variant version |
| `/api/projects/[id]` | GET | a run + 4 variants + version history (rehydrate on refresh) |
| `/api/projects` | GET | user library (auth) |
| `/api/extract-*`, `/api/improve-prompt` | POST | unchanged |
| `/api/jobs/**`, `/api/regenerate` | — | **removed** (dead / superseded) |

## 7. Frontend

**Phase 1 (engine-first, functional + clean, THIS delivery):**
- Route-based result: `/studio/[generationId]` — refresh-safe, shareable.
- **4-up grid**: 2×2 tiles; each tile has skeleton → live attempt score → final. Mobile: vertical/swipe.
- **Edit-on-the-fly**: select tile → instruction box → image updates in place; version chips (undo).
- Fix defects #7/#8: real share URLs; "New" vs "Edit" vs "Regenerate style" clearly separated.
- Dark theme retained (live app — house rule allows dark for app dashboards). ZGNAL tokens, IBM Plex.

**Phase 2 (cinematic, next delivery):** hero redesign, mobile-first choreography, progressive-reveal
motion (reduced-motion gated — ZERO exceptions), AI-native prompt-forward landing.

## 8. Phase gate protocol (executable QA before EVERY phase closes)

Each phase has a script under `scripts/qa/` that **RAISES** on failure (Rule 0d). A phase is not "done"
until its gate exits 0.

| Phase | Gate (`scripts/qa/phaseN.mjs`) — must all pass |
|-------|-----|
| 1 Data model | migration applies to a scratch DB; tables + RLS present; storage bucket reachable |
| 2 Pipeline split | `prepBrief` returns a valid `StructuredBrief` for a fixture; unit tests green |
| 3 Styles | 4 styles resolve to inlined specs; no runtime `fs` read remains (grep asserts) |
| 4 Quality loop | fixture render loops + scores; a deliberately-bad render is caught + retried; cap logs honestly |
| 5 APIs | `tsc --noEmit` clean; live smoke: POST /generate returns 4 stored URLs; POST /edit returns a new version |
| 6 Frontend | build passes; Playwright 1440+375; 4 tiles render; one live edit round-trips; 0 axe violations; mobile nav |
| 7 E2E | full path: brief → 4 gated tiles → edit one → refresh (persists) → share link opens image |

**Global gate (runs each phase):** `npm run build` exit 0 · `npx tsc --noEmit` clean · no ERROR lines in dev log.

## 9. Success metrics (declare done only when ALL pass)

1. One brief → **4 persisted, addressable PNGs** (one per fixed style) in ≤ ~90s p50.
2. **Every shipped tile passed** its quality bar, OR is explicitly flagged with attempt count (no silent fails).
3. **Edit round-trip**: an instruction visibly changes the *same* image and stores a new version; undo works.
4. **Refresh-safe + shareable**: `/studio/[id]` rehydrates; copied link opens the actual image, not the homepage.
5. **Design gate**: 1440 + 375 screenshots, 0 WCAG AA violations, working mobile nav, reduced-motion honored.

---

### Non-goals for Phase 1
Cinematic hero, landing redesign, and mobile choreography are **Phase 2**. Phase 1 ships a working,
verified engine behind a clean functional UI — the provable checkpoint before polish.
