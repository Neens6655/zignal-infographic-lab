/**
 * Radigan Carter Framework — Deconstruct + Aged Museum styles (parallel)
 */
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const OUTPUT_DIR = 'C:/Users/ziadm/OneDrive/Desktop/infographic-test-outputs';
const MODEL = 'gemini-3-pro-image-preview';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const envFile = fs.readFileSync('.env.local', 'utf-8');
for (const line of envFile.split('\n')) {
  const [key, ...val] = line.split('=');
  if (key?.trim() === 'GOOGLE_API_KEY') {
    process.env.GOOGLE_API_KEY = val.join('=').trim().replace(/^["']|["']$/g, '');
  }
}

const DECONSTRUCT_PROMPT = `Create a New York Times-style "deconstruct" infographic breaking down Radigan Carter's 4-phase geopolitical investment framework for the Iran War (March 2026 — 2027). Think NYT's best visual journalism — exploded views, annotated cross-sections, callout lines, and clean editorial illustration.

COMPOSITION: A single large central object — an EXPLODED VIEW of a ticking bomb or hourglass — deconstructed into its component layers, with each layer representing one of the four phases. Callout lines extend from each component to detailed annotation panels around the edges. White background, maximum clarity.

THE CENTRAL OBJECT — AN EXPLODED HOURGLASS:
The hourglass represents TIME — the 6-week trigger at its neck. The sand flowing through represents oil/energy. The hourglass is pulled apart vertically into 4 layers with space between them, each component annotated.

TOP LAYER — PHASE 1: DENIAL (March 2026)
The top glass bulb, full of dark sand (oil). Callout annotations around it:
→ "Oil +40% from pre-war" with a small price chart
→ "South Pars struck — world's largest gas field"
→ "Qatar Ras Laffan offline — 20% global LNG, years to rebuild"
→ "20+ vessels hit in Hormuz"
→ "Powell: 'Not concerned about stagflation'"
→ "Bazan refinery hit — 65% Israel diesel"
Label: "WE ARE HERE — Day 20"

THE NECK — THE 6-WEEK TRIGGER (April 2026)
The narrow passage where sand must flow through. This is the point of no return. Annotated with the inflation cascade:
→ "Wk 1-2: Oil reprices at pump"
→ "Wk 3-4: Freight & logistics reprice"
→ "Wk 5-8: Consumer goods hit shelves"
→ "Week 6 = POINT OF NO RETURN"
A red line marks the neck: "After this, even a ceasefire can't undo the damage"
Key quote in elegant italic: "The Fed has PhDs and a money printer. It doesn't have petroleum engineers and an LNG train."

LOWER BULB — PHASE 3: THE BUYING OPPORTUNITY (Jul-Aug 2026)
The bottom glass collecting the fallen sand. But mixed in with the dark sand are golden nuggets — the opportunities hidden in the pain. Callouts:
→ "Corporate earnings miss — damage shows in numbers"
→ "AI replaces workers to survive $95 oil — accelerates in downturn"
→ "Fed signals at Jackson Hole, cuts September"
→ "Quality names at meaningful discounts"
→ "The cruel paradox: AI saves companies but destroys aggregate demand"
Label: "THE BUY WINDOW"

BASE/STAND — PHASE 4: RECOVERY (Late 2026-2027)
The wooden base the hourglass sits on — the foundation for what comes next. Engraved/annotated:
→ "Energy independence — bipartisan, like GWOT spending but for energy"
→ "Drilling, nuclear, clean energy, permitting reform"
→ "AI adopters emerge strongest — productivity gains in 2027 margins"
→ "Assets in safe jurisdictions carry premium"
Label: "THE NEW ORDER"

SIDE PANEL (right edge) — DESALINATION CRISIS:
A small exploded cross-section of a desalination plant with callout:
"56 plants at risk · 64M people affected"
Kuwait 90% · Oman 86% · Israel 80% · Saudi 70% · UAE 42%

BOTTOM:
Timeline ribbon: MAR 2026 → MID-APR TRIGGER → JUL-AUG BUY → SEP FED CUT → 2027 RECOVERY
Source: "Radigan Carter · @radigancarter · March 20, 2026 · 1M views"

TITLE (top): "A FRAMEWORK FOR WHAT COMES NEXT"
SUBTITLE: "Deconstructing the 4-phase investor roadmap through the Iran War"

STYLE: Pure NYT visual journalism deconstruct. White background, thin precise callout lines (red and black), clean sans-serif annotations, one dominant central illustration (the exploded hourglass) with everything radiating from it. Minimal color — charcoal, white, red accents for danger, gold accents for opportunity. Every annotation line is precise and architectural. Zero clutter. Maximum information density with maximum clarity.

Do NOT render any prompt instructions, structural markers, or composition directions as visible text.`;

const AGED_MUSEUM_PROMPT = `Create a magnificent aged-academia museum-piece infographic depicting Radigan Carter's 4-phase geopolitical framework for the Iran War's impact on markets (March 2026 — 2027). This should look like it belongs in a war museum next to maps of historical campaigns — an antique strategic intelligence document.

COMPOSITION: A grand aged parchment war map (16:9) — the kind you'd see in a general's war room or a historian's study. The 4 phases are depicted as a WINDING CAMPAIGN ROUTE across a stylized map of the Middle East, Persian Gulf, and global markets. Vintage cartography meets financial intelligence.

THE MAP:

The background is aged yellowed parchment with burnt edges, coffee stains, and fold marks. A compass rose sits in one corner. Ornate cartographic borders frame the piece.

THE CAMPAIGN ROUTE winds across the map through 4 illustrated territories:

TERRITORY 1 — "DENIAL" (The Persian Gulf):
A detailed vintage map of the Strait of Hormuz, Iran, Qatar, and the Gulf states. Small illustrated flames mark South Pars gas field and Ras Laffan LNG terminal. Tiny illustrated warships dot the strait. Handwritten annotations in elegant script:
"Day 20 — Oil +40%"
"South Pars struck"
"Qatar LNG offline — 20% of global trade"
"20+ vessels hit"
"Hormuz under Iranian fire control"
A small illustrated portrait of an hourglass with "6 WEEKS" written beneath.
Desalination plants marked with warning symbols: "64M at risk"
Dependency numbers written as map legend: Kuwait 90%, Oman 86%, Israel 80%, Saudi 70%, UAE 42%

TERRITORY 2 — "THE TRIGGER" (The Supply Routes):
The campaign route crosses into illustrated global shipping lanes. Cargo ships, freight lines, and supply chain arteries are drawn in vintage style. Along the route, milestone markers show the inflation cascade:
"Week 1-2: Oil reprices"
"Week 3-4: Freight reprices"
"Week 5-8: Consumer goods hit"
A red wax seal marks "WEEK 6 — POINT OF NO RETURN"
The Fed building illustrated as a classical government edifice with "NO RATE CUTS" banner.
Elegant italic quote on a scroll: "The Fed has PhDs and a money printer. It doesn't have petroleum engineers."

TERRITORY 3 — "THE OPPORTUNITY" (Wall Street):
The route arrives at an illustrated New York financial district in vintage style. Stock tickers showing decline. But golden coins scattered on the ground — opportunities. An illustrated figure of a patient investor with a shopping list.
"Earnings miss · Unemployment rises"
"AI replaces workers — the survival tool"
"Fed signals Jackson Hole — September cut"
"QUALITY NAMES AT DISCOUNT"
A golden banner: "THE BUY WINDOW: JULY-AUGUST 2026"

TERRITORY 4 — "THE NEW ORDER" (American Energy):
The route ends at an illustrated American landscape — oil derricks, nuclear cooling towers, solar farms, wind turbines — all being built. Bipartisan handshake illustration. Rising stock chart drawn as a mountain range.
"Energy independence — bipartisan priority"
"AI adopters emerge strongest"
"Safe jurisdiction premium"
"2027: The thesis plays out"

BOTTOM (parchment footer):
Campaign timeline: "MAR 2026 → APR TRIGGER → JUL-AUG BUY → SEP CUT → 2027 RECOVERY"
"Source: Radigan Carter · @radigancarter · 1M views · March 20, 2026"

TITLE (top center, ornate serif, as if hand-lettered on the map):
"A FRAMEWORK FOR WHAT COMES NEXT"
SUBTITLE: "A Strategic Campaign Map for Navigating the Iran War — From Denial to Opportunity"

STYLE: Aged academia meets military cartography. Parchment textures, hand-drawn illustrations, vintage typography, wax seals, compass roses, ornate borders. Sepia, burnt umber, gold leaf, navy ink accents. Red for danger zones, gold for opportunity zones. Every element should feel like it was drawn by a master cartographer in a war room. This is a museum-quality intelligence document.

Do NOT render any prompt instructions, structural markers, or composition directions as visible text.`;

async function generate(prompt, filename) {
  console.log(`\nGenerating: ${filename}...`);
  const start = Date.now();

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'], temperature: 1.0 },
    }),
  });

  if (!res.ok) { console.error(`HTTP ${res.status}: ${await res.text()}`); return; }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      const buf = Buffer.from(part.inlineData.data, 'base64');
      const outPath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(outPath, buf);
      const elapsed = ((Date.now() - start) / 1000).toFixed(0);
      console.log(`Saved: ${filename} (${(buf.length/1024).toFixed(0)}KB, ${elapsed}s)`);
      exec(`start "" "${outPath}"`);
      return;
    }
  }
  console.error('No image in response');
}

async function main() {
  await generate(DECONSTRUCT_PROMPT, 'pro-radigan-deconstruct.png');
  await generate(AGED_MUSEUM_PROMPT, 'pro-radigan-aged-museum.png');
  console.log('\nDone.');
}

main().catch(console.error);
