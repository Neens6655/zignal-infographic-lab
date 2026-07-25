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
  guidelines: `Clean, authoritative, LIGHT. McKinsey clarity meets scientific precision. A one-page research brief that communicates depth through simplicity. White space is a feature, not waste.

DESIGN PHILOSOPHY
Feels like the best page from a JP Morgan annual outlook or a McKinsey Global Institute report, printed on quality paper. Light, airy, precise. Every section answers: "So what — what does this mean for the decision?"

COLOR PALETTE
- Background: clean WHITE (#FFFFFF) or the softest warm gray (#F8F9FA). The canvas is LIGHT — never a dark dashboard. White space dominates.
- Primary text: charcoal (#1A1A2E) for headlines, dark slate (#334155) for body. Strong contrast on white.
- Navy accent (#0F2B5B): header bar, footer bar, divider rules, chart axis labels. Structural accent — not the background.
- Data blue (#2563EB): the signature primary data color in charts and callouts.
- Supporting data: muted teal (#0891B2), warm gray (#6B7280), soft coral (#E8735A) for negative/risk. Max 3 data colors per chart.
- Gold-bronze (#B8860B): a single hairline rule under the header and over the footer. Nowhere else.

STRUCTURE
- Navy header bar (~8%): white title (title case, not shouting) + one-sentence "so what" subtitle + date/classification. Thin gold hairline under it.
- Hero insight panel (~15%): one sentence + one large number + one clean visualization.
- Content grid (~60%): strict 3–4 column grid, generous gutters. Each panel = one chart/diagram + one insight + one "so what".
- Key metrics row (~10%): 4–6 large numbers in a clean horizontal strip.
- Navy footer bar (~7%): sources + summary metrics, thin gold hairline over it.

ILLUSTRATIONS & CHARTS
- Clean single-color line illustrations (navy/charcoal/institutional blue) — scientific-diagram quality, thin precise linework. Every drawing carries information; no decoration.
- Charts: minimal, thin gray axes, direct value labels, no 3D, no gradients. Horizontal bars, line+area, thin donut rings, slope charts.
- KPI callouts: large blue/charcoal numbers over a small gray label + subtle trend arrow, in a clean row.

WHAT IT IS NOT
Not dark or moody (background is WHITE). Not cluttered (whitespace is generous). Not textured or ornamental. Not more than 4 colors in the content area. Not cartoon, hand-drawn, or playful.`,
  enforcement:
    "STYLE ENFORCEMENT: Clean, WHITE-background (#FFFFFF) McKinsey/JP Morgan research brief. Navy (#0F2B5B) header/footer bars, single gold hairline rules, institutional blue (#2563EB) data. Clean sans-serif. NO colorful illustrations, NO cartoon characters, NO playful elements, NO dark background. Think: a printed boardroom handout.",
  judgeRubric: `PASS requires: background is genuinely WHITE or near-white (not cream, not dark); a navy header bar and footer bar are present; typography is clean sans-serif; charts/illustrations are restrained single/low-color line work; overall reads as a premium consulting slide. FAIL if the background is dark, parchment, or busy; if there are cartoon characters; or if more than ~4 colors dominate the content area.`,
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

// ── 4. Museum (NEW in v3) ────────────────────────────────────────
const MUSEUM: StudioStyle = {
  id: "museum",
  name: "Museum",
  tagline: "Exhibition plaque under gallery light",
  background: "gallery",
  guidelines: `The infographic presented as a MUSEUM EXHIBIT on a gallery wall, lit by a soft directional spotlight, with an engraved brass placard. Hushed, reverent, curatorial. Distinct from "Aged Academic" (that is aged PAPER; this is a GALLERY WALL) and from "Corporate Deck" (that is a white boardroom page; this is a lit exhibition).

THE GALLERY WALL — the defining cue
- Background: a soft museum wall — warm limestone / gallery off-white (#EDEAE3 → #E4DFD5) with a faint plaster/matte texture. NOT parchment, NOT pure white, NOT dark.
- LIGHTING is essential: a gentle top-down spotlight — brighter at the center, softly falling to a subtle vignette at the edges. Exhibits cast soft, realistic drop shadows on the wall. This directional gallery light is the single strongest "museum" signal.

THE HERO EXHIBIT
- The main subject/visual sits like a curated ARTIFACT under the spotlight — mounted, framed with a thin museum mat/frame, or raised on a simple plinth/pedestal casting a soft shadow. It commands quiet attention at the center (45–60% of the canvas).
- Rendering: dignified and precise — a clean specimen study or a single restrained illustration. Not busy; reverent.

THE BRASS PLACARD (the title)
- The title lives on a museum WALL LABEL: a rectangular brushed-brass / matte-bronze plaque with ENGRAVED (debossed) classical serif lettering (Trajan/Didot feel). A hairline rule; a small "cataloguing" line in small caps (e.g. a subtitle or one-line provenance). The placard reads like something screwed to a gallery wall beside the exhibit.

SECTIONS AS SPECIMENS
- Each content section is a small curated exhibit: a quiet visual + a museum didactic label. Each gets a small brass ACCESSION TAG / number (e.g. a little bronze numeral or "No. 03"). Labels are gallery wall text — left-aligned, generous margins, calm.

COLOR & TYPOGRAPHY
- Restrained, archival: brushed brass/bronze (#8C6D3F), charcoal ink (#2B2A28), gallery off-white, plus ONE sparing accent — deep oxblood (#6E2B2B) or museum teal (#2E5D5A) — used like a single exhibit accent, never everywhere.
- Title: engraved classical serif on brass. Didactic text: quiet exhibition-label sans-serif (gallery wall text), never shouting. Everything calm, spaced, curatorial.

MOOD
Walking up to an exhibit and reading its plaque — timeless, reverent, expensive-quiet.

WHAT IT IS NOT
Not parchment/aged-paper (that is Aged Academic). Not a white boardroom slide (that is Corporate Deck). Not an exploded pigment plate (that is Deconstruct). Not dark. Not busy. The differentiators are the LIT gallery wall, the engraved brass placard, the soft artifact shadows, and the accession tags.`,
  enforcement:
    "STYLE ENFORCEMENT: A MUSEUM EXHIBIT on a lit gallery wall (warm limestone off-white #EDEAE3) with a soft top-down SPOTLIGHT + vignette, the subject as a curated artifact casting a soft shadow, and the title ENGRAVED on a brushed-BRASS wall placard. Restrained brass/charcoal palette, brass accession tags. NOT parchment, NOT a white slide, NOT dark, NOT busy.",
  judgeRubric: `PASS requires: a warm gallery-wall ground (limestone off-white, not parchment, not pure white, not dark); visible soft directional spotlight / vignette lighting with the exhibit casting a gentle shadow; an engraved brass/bronze placard carrying the title; a restrained archival palette. FAIL if it looks like aged parchment, a plain white corporate slide, a dark scene, or a busy multi-color plate — or if there is no gallery lighting / no brass placard.`,
};

export const STUDIO_STYLES: Record<StudioStyleId, StudioStyle> = {
  mckinsey: MCKINSEY,
  academic: ACADEMIC,
  deconstruct: DECONSTRUCT,
  museum: MUSEUM,
};

/** The four styles, in fixed display order. */
export const STUDIO_STYLE_LIST: StudioStyle[] = STUDIO_STYLE_IDS.map(
  (id) => STUDIO_STYLES[id],
);

export function getStudioStyle(id: string): StudioStyle | undefined {
  return (STUDIO_STYLES as Record<string, StudioStyle>)[id];
}
