/**
 * Radigan Carter Framework — 4-Phase geopolitical investor roadmap
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

const PROMPT = `Create an extraordinary, cinematic infographic visualizing Radigan Carter's "A Framework for What Comes Next" — a 4-phase geopolitical investor roadmap for navigating the Iran War's impact on markets from March 2026 through 2027.

COMPOSITION: A dramatic horizontal timeline panorama (16:9) flowing LEFT TO RIGHT across four distinct atmospheric zones — like watching a storm approach, hit, pass, and clear. Each phase is a distinct landscape that bleeds into the next. The mood shifts from tension to chaos to opportunity to rebuilding.

THE VISUAL JOURNEY:

PHASE 1 — "DENIAL" (far left, present day, March 2026):
A Wall Street trading floor bathed in amber warning light. Traders stare at screens showing volatile red/green charts. Above them, TV screens show missiles striking energy infrastructure — South Pars gas field burning, Qatar's Ras Laffan LNG facility in flames. But the traders are trying to look away, pretending everything is fine. A figure resembling Powell stands at a podium with fingers crossed behind his back.

Key data embedded in scene:
"Oil +40% from pre-war levels"
"20+ vessels hit in Strait of Hormuz"
"Day 20 of conflict"
"PPI: 0.7% vs 0.3% expected"

Mood: Uneasy amber glow, denial, forced calm over visible chaos.

PHASE 2 — "THE 6-WEEK TRIGGER" (center-left, April-May 2026):
The storm hits. A massive supply chain visualization — oil barrels flowing into freight trucks flowing into grocery shelves flowing into CPI data printouts — all repricing upward. A giant clock/hourglass at the center marks "WEEK 6 = POINT OF NO RETURN." Red warning lights everywhere.

A cascading waterfall shows the inflation timeline:
Weeks 1-2: "Oil reprices at pump"
Weeks 3-4: "Freight & logistics reprice"
Weeks 5-8: "Consumer goods reprice"
Week 6: "Even a ceasefire can't undo this"

Below: A cracked Fed building with text "No rate cuts. Rates hold. Tech multiples compress."

Mood: Red alarm, cascading dominoes, inescapable repricing.

PHASE 3 — "THE BUYING OPPORTUNITY" (center-right, July-August 2026):
The darkest before dawn. A beach scene where a lone investor sits reading earnings reports in the shade while everyone else panics. Corporate buildings have "EARNINGS MISS" and "LAYOFFS" signs. But in the shadows, AI robots are quietly replacing workers — glowing screens showing automation tools. A shopping list floats: "Quality names at meaningful discounts."

Key data:
"Corporate earnings miss"
"Unemployment rises"
"AI replaces workers to cut costs"
"Fed signals at Jackson Hole"
"September rate cut incoming"

A golden shopping cart icon glows — this is the moment to buy.

Mood: Dark blue exhaustion turning to a thin gold line of dawn on the horizon.

PHASE 4 — "LATE 2026 INTO 2027" (far right, recovery):
Sunrise. American energy infrastructure rising — oil rigs, nuclear plants, solar farms, LNG terminals all under construction. A bipartisan handshake over an "ENERGY INDEPENDENCE" banner. AI-powered factories humming. Stock charts turning sharply upward. The companies bought in Phase 3 are now printing money.

Key data:
"Fed cuts rates"
"Energy independence — bipartisan priority"
"AI adopters emerge strongest"
"Assets in safe jurisdictions carry premium"

Mood: Golden sunrise, construction cranes, optimism, new order emerging.

CONNECTING ELEMENTS:
A timeline ribbon runs along the bottom connecting all 4 phases:
MAR 2026 → APR-MAY 2026 → JUL-AUG 2026 → LATE 2026-2027

The Strait of Hormuz appears as a recurring visual motif — a narrow waterway threading through the entire infographic, sometimes blocked (Phases 1-2), sometimes reopening (Phase 4).

BOTTOM STATS BAR (dark charcoal, gold text):
Phase 1: Denial (Now) | 6-Week Trigger: Mid-April | Phase 3: Buy Jul-Aug | Fed Cut: September | Phase 4: Energy Independence 2027

TITLE (top, massive, white on dark): "A FRAMEWORK FOR WHAT COMES NEXT"
SUBTITLE: "Radigan Carter's 4-phase investor roadmap through the Iran War — from denial to opportunity"
Attribution: "Based on Radigan Carter · @radigancarter · March 20, 2026 · 1M views"

STYLE: Dramatic geopolitical intelligence aesthetic. Dark atmospheric backgrounds with pools of warm and cool light marking each phase. Think: Bridgewater Associates daily briefing meets The Economist war coverage meets Bloomberg terminal. Rich, cinematic illustration — burning infrastructure, trading floors, supply chains, construction — every element specific and meaningful. Color palette shifts across phases: amber (denial) → red (trigger) → dark blue (opportunity) → gold (recovery).

Do NOT render any structural labels, phase numbers as raw text, composition directions, or prompt instructions as visible text. Only render the actual content: title, subtitle, data callouts, timeline, phase names, and stats bar.`;

async function generate() {
  console.log('Generating: Radigan Carter Framework (Pro)...');
  const start = Date.now();

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: PROMPT }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'], temperature: 1.0 },
    }),
  });

  if (!res.ok) { console.error(`HTTP ${res.status}: ${await res.text()}`); return; }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      const buf = Buffer.from(part.inlineData.data, 'base64');
      const outPath = path.join(OUTPUT_DIR, 'pro-radigan-carter-framework.png');
      fs.writeFileSync(outPath, buf);
      const elapsed = ((Date.now() - start) / 1000).toFixed(0);
      console.log(`Saved: pro-radigan-carter-framework.png (${(buf.length/1024).toFixed(0)}KB, ${elapsed}s)`);
      exec(`start "" "${outPath}"`);
      return;
    }
  }
  console.error('No image in response');
}

generate().catch(console.error);
