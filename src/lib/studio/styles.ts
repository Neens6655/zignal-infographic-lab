/**
 * The FOUR fixed studio styles — inlined art-direction specs.
 *
 * These strings ARE the style guides. No runtime `fs` read, so they can never
 * silently resolve to '' when the serverless bundle fails to trace the .md files
 * (the v1 bug). Every brief renders all four, always.
 */
import type { StudioStyle, StudioStyleId } from "./types";
import { STUDIO_STYLE_IDS } from "./types";

// ── 1. Corporate Deck (McKinsey) ─────────────────────────────────
const MCKINSEY: StudioStyle = {
  id: "mckinsey",
  name: "Corporate Deck",
  tagline: "Boardroom research brief — McKinsey / JP Morgan clarity",
  background: "light",
  guidelines: `Clean, authoritative, LIGHT — a single-focus EXECUTIVE one-pager. McKinsey clarity: ONE dominant insight, a clear top-down reading path, and ruthless restraint. Built to be understood by a busy executive in 5 seconds. White space is the primary design element.

DESIGN PHILOSOPHY
The best page from a JP Morgan outlook or a McKinsey brief. It does NOT try to show everything — it establishes ONE headline insight and supports it. Every element answers "so what — for the decision?"

EXECUTIVE READING FLOW (the most important rule)
- ANSWER FIRST (Pyramid Principle): the TITLE states the single most important takeaway as a complete sentence (e.g. "Global EV market reaches $784B by 2025"), not a generic topic label.
- Establish a clear visual HIERARCHY, top to bottom: (1) the answer-first title, (2) the single biggest supporting number rendered LARGE with one clean chart, (3) three to four supporting points in a clean left-to-right / Z-pattern progression, (4) a clean close.
- Do NOT print structural or label words on the image ("Hero Insight", "KPI", "Section", "So What"). Show only the real headings, numbers, and captions. Every heading is a COMPLETE phrase — never ends in "...".
- Do NOT render every section as an equal box in a dense grid. Consolidate. One dominant element; supporting elements clearly subordinate. The eye should FLOW along a path, not scan a wall of identical tiles.
- Fewer, bigger, better: at most 4–5 content elements total. If the content is dense, SELECT the executive-relevant few and cut the rest. Whitespace between elements is generous and intentional.

COLOR PALETTE
- Background: clean WHITE (#FFFFFF). Light and airy. Never dark, never cream.
- Charcoal (#1A1A2E) headlines, dark slate (#334155) body.
- Navy (#0F2B5B): a SLIM title bar only. Institutional blue (#2563EB): the signature data color and the ONE hero number.
- Maximum 3 colors in the content area. A single thin gold hairline (#B8860B) under the title — nowhere else.

STRUCTURE
- Slim navy title bar (top ~10%): white title (title case) + one-line "so what" subtitle. Thin gold hairline beneath.
- Just below the title (~25%): the single biggest number sits top-left, rendered VERY LARGE in institutional blue or charcoal, beside ONE clean chart (one — not five) and one short line on why it matters. Show ONLY the number and its short caption — never a label like "Lead Exhibit", "Hero", "KPI", or "Exhibit".
- Supporting points (~50%): 3–4 points in a clean horizontal flow, each = a small chart or number + one line of insight. Generous gutters; clearly subordinate to the hero.
- Close: END CLEANLY with whitespace. NO footer bar. NO bottom stats strip. If sources are needed, one small line, bottom-left.

CHARTS & TYPE
- Minimal charts: thin gray axes, direct value labels, no 3D, no gradients. One dominant chart; small supporting ones.
- Clean sans-serif. Title large; hero number very large; supporting text small and quiet. Strong weight gradient — not everything bold.

WHAT IT IS NOT
NOT a dense grid of six equal numbered boxes. NOT a footer / bottom stats-bar report. NOT dark or cream. NOT more than ~5 content elements. NOT cluttered — restraint IS the point.`,
  enforcement:
    "STYLE ENFORCEMENT: Clean WHITE-background McKinsey executive one-pager with ONE dominant hero insight and a clear top-down reading FLOW — NOT a dense grid of equal boxes. Slim navy title bar + single gold hairline, institutional blue (#2563EB) data, generous whitespace. DO NOT render a footer bar or bottom stats strip — end cleanly. Max ~5 content elements. NOT dark, NOT cream, NOT cluttered.",
  judgeRubric: `PASS requires: a genuinely WHITE ground; a clear visual HIERARCHY with ONE dominant hero insight (not six equal boxes); a slim navy title bar; institutional-blue data; generous whitespace; and NO bottom footer/stats bar. FAIL if the background is dark or cream, if it reads as a dense uniform grid with no focal point, if it is cluttered, or if it has a footer stats strip.`,
};

// ── 2. Aged Academic ─────────────────────────────────────────────
const ACADEMIC: StudioStyle = {
  id: "academic",
  name: "Aged Academic",
  tagline: "Da Vinci notebook meets Victorian scientific plate",
  background: "parchment",
  guidelines: `Museum-quality historical illustration on AGED PARCHMENT. Da Vinci notebooks meet National Geographic maps meet Victorian scientific plates.

COLOR PALETTE
- Background: warm parchment (#F4E4BC → #E8D5A3) with subtle staining, foxing marks, and aged-paper texture. Gentle tonal variation — never flat.
- Primary ink: deep sepia brown (#704214), iron-gall ink black (#2C1810). Everything drawn as if with real ink on real paper.
- Earth tones: warm ochre (#C4943A), raw umber (#6B4423), burnt sienna (#8A4513), olive (#6B6B3E) for terrain.
- Water/sky: muted cerulean (#5B8BA0), faded blue-green (#6B9B8A).
- Accents: faded vermillion (#B84233) for annotations/emphasis; muted gold (#B8943A) for highlights.

ILLUSTRATION TECHNIQUE
- Every element looks HAND-DRAWN with ink — crosshatching for shadow, stippling for gradients, fine line work for detail. Slightly uneven line weight, as from a dip pen (thicker downstrokes). No digital gradients.
- Each section gets its own illustrated vignette — a detailed little scene telling that section's story. People in period dress; architecture and landscape in accurate perspective; instruments rendered with technical precision.
- Embedded data: hand-lettered formulas; hand-plotted charts with slightly imperfect grid lines; statistical callouts in bordered aged-paper panels.
- Key figures as pen-and-ink portrait sketches (never photos), crosshatched, in a subtle vignette frame with hand-lettered name + dates.

TYPOGRAPHY
- Section titles in bold serif capitals with a subtle flourish. Body in clean serif, justified blocks. Margin notes in smaller italic/cursive. Key terms in SMALL CAPS.
- All text must feel TYPESET INTO the parchment, not floating above it.

FRAME & AGING
- Sections separated by ruled lines or decorative borders; important callouts in double-line bordered panels. Subtle paper grain, edge yellowing, the occasional foxing mark. One continuous illustrated manuscript page.

WHAT IT IS NOT
Not a white or dark background — warm parchment ALWAYS. Not digital/sterile. Not cartoon.`,
  enforcement:
    "STYLE ENFORCEMENT: Aged PARCHMENT background (#F4E4BC), sepia/iron-gall ink, classical engraving + Victorian scientific-illustration aesthetic. Hand-drawn crosshatching, hand-lettered labels, foxing/aging texture. NOT white, NOT a dark dashboard, NOT digital-flat.",
  judgeRubric: `PASS requires: a warm parchment/aged-paper ground (not white, not dark); sepia/ink line work with visible crosshatching or stippling; typography that reads as classical serif typeset into the paper; an overall hand-drawn, aged, scholarly feel. FAIL if the background is clean white or dark, if illustrations look flat-digital or cartoonish, or if it reads as a modern corporate slide.`,
};

// ── 3. Deconstruct ───────────────────────────────────────────────
const DECONSTRUCT: StudioStyle = {
  id: "deconstruct",
  name: "Deconstruct",
  tagline: "NYT-style exploded view — color IS the information",
  background: "parchment",
  guidelines: `Museum-quality editorial deconstruction. A central subject is exploded/deconstructed on an aged-parchment canvas, each component in its OWN RICH PIGMENT COLOR — like hand-painted plates from a Victorian scientific atlas (Haeckel, Da Vinci) with modern information design. The gravitas of a natural-history museum exhibit; the precision of a New York Times visual explainer.

COLOR = INFORMATION (most important rule)
Every major component gets ONE unique pigment color, reused across: (1) the component in the central illustration, (2) that component's section header text, (3) its callout line + dot, (4) its highlighted numbers.
Choose 4–8 RICH, deep, distinguishable pigments — oil-paint / mineral / natural-dye feel, never neon, pastel, or flat-digital. E.g. vermillion (#C0392B), Prussian blue (#1A5276), raw sienna (#B7720E), viridian (#1E8449), Tyrian purple (#6C3483), burnt umber (#6E4B3A).

BACKGROUND — AGED PARCHMENT
Warm parchment (#F0E0C4 → #E6D5B0), subtle grain, slight warm toning to the edges, faint foxing. Makes the colored components POP. Never white, gray, or dark.

THE CENTRAL ILLUSTRATION (40–60% of canvas)
Precise scientific-illustration style — fine ink line work, crosshatching/stippling, isometric or 3/4 view. Each component in its ASSIGNED pigment with shading WITHIN each color for depth (not flat fills). Exploded view (parts pulled along axes, dashed reconnect lines) OR cutaway cross-section — whichever explains best. The effect: 4–8 distinct pigment zones on warm parchment, ancient in craft, modern in clarity.

TEXT — WEIGHT GRADIENT, NOT ALL BOLD
Per component: 1 BOLD colored header (all caps) → 1 medium-weight hook line (≤15 words) → 1–2 light sans-serif body lines (≤20 words each, warm brown #6D5847) → 1 BOLD hero number in the component color → 2–3 light callout labels. UNDER 80 words per component. NO paragraphs. White space is sacred — if it doesn't fit with breathing room, CUT it. The illustration does the heavy lifting.
Title: very large bold SERIF (Garamond/Caslon/Didot feel), deep sepia (#3E2723), with a thin ornamental rule — like a scientific-atlas title cartouche. A small museum-label color legend near top or bottom.

WHAT IT IS NOT
Not monochrome/gray. Not white or dark background — warm parchment ALWAYS. Not cartoon/clip-art. Not corporate. Not text-heavy.`,
  enforcement:
    "STYLE ENFORCEMENT: Exploded/cutaway view on warm PARCHMENT, each component in its own RICH PIGMENT color (vermillion, Prussian blue, viridian…) reused in the callout line AND that section header. NYT-editorial scientific-atlas plate. Color-coded, museum-quality. NOT white, NOT dark, NOT flat.",
  judgeRubric: `PASS requires: a warm parchment ground; a central exploded/cutaway illustration with 4–8 clearly distinct rich pigment colors; those SAME colors reused on callout lines and matching section headers (the color-coding link is visible); scholarly serif title. FAIL if it is monochrome, if the background is white or dark, if colors are neon/pastel/flat, or if there is no visible color-to-label coding.`,
};

// ── 4. Aerial Deconstruct (NEW in v3) ────────────────────────────
const AERIAL: StudioStyle = {
  id: "aerial",
  name: "Aerial Deconstruct",
  tagline: "Isometric drone-view exploded systems",
  background: "light",
  guidelines: `A modern ISOMETRIC EXPLODED-SYSTEMS view — the subject deconstructed into its components, floating APART in 3D isometric space, seen from a drone's-eye angle. This LAYERS two ideas: AERIAL (bird's-eye isometric) + DECONSTRUCT (exploded, color-coded parts). Clean, dimensional, premium-technical — a high-end "how it works" isometric explainer / exploded axonometric. Distinct from "Deconstruct" (that is a FLAT frontal scientific plate on parchment) and "Corporate Deck" (flat white charts).

THE HERO — ISOMETRIC EXPLODED VIEW (55–65% of canvas)
- Perspective: isometric / axonometric at a ~30–45° drone angle, looking DOWN and across the subject. Real depth, cast shadows, stacked planes.
- DECONSTRUCTED: the subject's components / segments / layers are pulled APART along vertical or diagonal axes, floating in 3D space, with thin dashed connector lines showing how they reassemble — an exploded axonometric.
- Components sit on subtle isometric platforms or float as layered slabs. Each has volume and soft ambient shadow.
- Rendering: clean, precise 3D illustration — crisp geometry, accurate proportions. Modern editorial-technical (premium isometric explainer). NOT cartoon, NOT sketch, NOT aged/parchment, NOT flat.

COLOR = COMPONENT CODING (semantic — color IS information)
- Ground: clean, cool light neutral — off-white / soft blue-gray (#F4F6F8 → #E9EDF1). The system FLOATS on it. NOT a white boardroom page, NOT parchment, NOT dark.
- Each exploded component gets ONE semantic color, reused on its 3D part, its numbered marker, and its label: structural blue (#2D6CDF), teal (#0E9AA3), amber (#E8913A), coral (#E05B5B), violet (#7A5AF0), slate-green (#3F9B6E). Rich but MODERN — not neon, not flat pastel — with tonal shading WITHIN each color to model the 3D form. Base platforms in cool steel-grays.

NUMBERED ANNOTATION SYSTEM
- Small numbered markers (1..N) in each component's color placed ON its exploded part; matching numbered text blocks in clean margin columns. Connection by NUMBER (subtle thin leader lines only when far apart).
- Each point: NUMBER (component color) + BOLD header (3–5 words) + 1–2 short lines + one hero number. Under ~30 words each. Anti-squeeze — whitespace is sacred; the illustration carries the load.

DATA EMBEDDED IN 3D
- Render key metrics as dimensional elements where natural: an isometric bar rising off a platform, a segmented ring, a stacked layer whose height encodes a value — each labelled with the exact figure.

TYPOGRAPHY & LAYOUT
- Title: large, bold, modern sans-serif (Inter/Helvetica feel), dark charcoal (#1A2233) — editorial and confident, top zone. Subtitle: one line, medium, cool gray.
- Weight gradient: bold title → bold numbered headers → light descriptions. Generous whitespace around all text.
- Zones: header (~10%) · isometric exploded hero (center 55–65%) with markers ON the parts · ONE set of numbered descriptions in a single margin band (top OR bottom — NOT both). Never repeat a point's text or place the same annotation twice.

WHAT IT IS NOT
NOT a flat frontal scientific plate on parchment (that is Deconstruct). NOT flat white charts (Corporate Deck). NOT hand-drawn / aged (Aged Academic). NOT a dark scene, NOT cartoon clip-art. If the subject is abstract (a market, a strategy), deconstruct the CONCEPT into isometric layered components — do not force a literal building.`,
  enforcement:
    "STYLE ENFORCEMENT: ISOMETRIC / axonometric ~30–45° drone-view EXPLODED diagram — the subject's components pulled APART in 3D space with dashed reassembly lines, each part in its own semantic color + numbered marker, on a clean cool off-white ground (#F4F6F8). Modern premium-technical 3D illustration with soft shadows and real depth. NOT parchment, NOT flat charts, NOT a dark scene, NOT cartoon.",
  judgeRubric: `PASS requires: a clearly ISOMETRIC / axonometric 3D view with real depth and cast shadows (not flat, not a frontal plate); the content shown as SEPARATED, color-coded 3D components — floating slabs, isometric platforms, stacked layers, OR exploded parts (any of these count; it need not be one literal object blown apart); a clean cool light-neutral ground (not parchment, not a pure-white slide, not dark). Color-coded numbered markers are a plus. FAIL only if it is genuinely FLAT (no isometric depth), a frontal parchment plate, a dark scene, a literal photo, or a plain 2D chart deck.`,
};

export const STUDIO_STYLES: Record<StudioStyleId, StudioStyle> = {
  mckinsey: MCKINSEY,
  academic: ACADEMIC,
  deconstruct: DECONSTRUCT,
  aerial: AERIAL,
};

/** The four styles, in fixed display order. */
export const STUDIO_STYLE_LIST: StudioStyle[] = STUDIO_STYLE_IDS.map(
  (id) => STUDIO_STYLES[id],
);

export function getStudioStyle(id: string): StudioStyle | undefined {
  return (STUDIO_STYLES as Record<string, StudioStyle>)[id];
}
