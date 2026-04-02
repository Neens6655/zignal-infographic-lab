/**
 * Radigan Carter Framework — Institutional/McKinsey style
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

const PROMPT = `Create a highly detailed, Goldman Sachs / Bridgewater-quality institutional strategy slide (16:9 landscape) mapping Radigan Carter's 4-phase geopolitical investment framework for the Iran War's impact on markets, March 2026 through 2027.

This must look like an internal strategy brief from a top-tier macro hedge fund. White background. Navy header. Helvetica. Clinical precision. Dense with data but perfectly organized. The kind of slide a CIO presents to the investment committee.

HEADER BAR (navy #0F172A, full width):
Title in white bold: "A FRAMEWORK FOR WHAT COMES NEXT: 4-PHASE INVESTOR ROADMAP"
Subtitle in light gray: "Mapping the Iran War's market impact — energy shock, stagflation trigger, buying window, and recovery thesis"
Right side: "Radigan Carter · @radigancarter · March 2026 · 1M views"

MAIN BODY — a detailed horizontal phased timeline with rich data beneath each phase:

The top half shows a HORIZONTAL PHASE DIAGRAM — four connected boxes flowing left to right with arrows between them. Each box is color-coded:

BOX 1 — PHASE 1: DENIAL (amber border, current)
Timeline: "March 2026 (NOW — Day 20)"
Status tag: "WE ARE HERE" with a pin marker
Key metrics stacked vertically:
• Oil: +40% from pre-war levels
• South Pars gas field struck (world's largest)
• Qatar Ras Laffan LNG offline — 20% of global LNG trade gone
• 20+ vessels hit in Strait of Hormuz
• IRGC: 50 waves of operations vs U.S. bases
• PPI: 0.7% vs 0.3% expected
• Powell: "Not concerned about stagflation"
Investor action: "Hold cash. Do not buy the dip."

BOX 2 — PHASE 2: THE 6-WEEK TRIGGER (red border)
Timeline: "Mid-April → May 2026"
Trigger condition: "6 weeks from war start = point of no return"
Supply chain inflation cascade (shown as a downward stepped diagram):
  Wk 1-2: Refined products reprice → oil +40%
  Wk 3-4: Freight & logistics reprice → PPI spikes
  Wk 5-8: Consumer goods reprice → CPI hits
  Wk 6: "Even a ceasefire cannot undo what's in the pipeline"
Key consequence: "Fed extinguishes last hope of rate cuts"
Impact: "Tech multiples compress. Market tantrum."
Quote box: "The Fed has PhDs and a money printer. It doesn't have petroleum engineers and an LNG train. It can't fix supply-driven inflation."
Investor action: "Stay patient. Pain is peaking."

BOX 3 — PHASE 3: THE BUYING OPPORTUNITY (blue border, highlighted)
Timeline: "July → August 2026"
This box should be slightly larger — it's the key actionable phase.
Catalysts:
• Corporate earnings miss as war damage shows in numbers
• Unemployment rises — AI displacement compounds cyclical downturn
• Politicians panic ahead of November midterms
• Fed signals at Jackson Hole in August
• September rate cut becomes inevitable
The AI paradox (small insight card):
"Companies replace workers with AI to survive $95 oil. Individual companies benefit. Aggregate demand destroyed. Employment deteriorates faster than any model predicts."
Investor action: "BUY quality names at meaningful discounts. Tech + AI adopters + copper miners + energy."

BOX 4 — PHASE 4: RECOVERY (green border)
Timeline: "Late 2026 → 2027"
Drivers:
• Fed capitulates, cuts rates — everything bought in Phase 3 works
• Energy independence becomes dominant bipartisan theme
• Both sides of Congress: expanded drilling, nuclear, clean energy, permitting reform
• AI adopters emerge strongest — productivity gains show in 2027 margins
• "The AI story isn't about companies that build AI — it's about companies that adopt it to survive"
• Assets in safe jurisdictions carry premium (U.S., Western Hemisphere)
Investor action: "Hold positions. Thesis plays out."

BOTTOM SECTION — two side-by-side panels:

LEFT PANEL — "ENERGY INFRASTRUCTURE DAMAGE" (small map or table):
A clean table showing strikes:
| Target | Status | Impact |
| South Pars (Iran) | Struck | World's largest gas field |
| Ras Laffan (Qatar) | Force majeure | 20% global LNG offline, years to rebuild |
| Bazan refinery (Israel) | Hit | 65% of Israel's diesel, 59% gasoline |
| Desalination plants | Multiple struck | 64M people at risk |
Desalination dependency row: Kuwait 90% · Oman 86% · Israel 80% · Saudi 70% · UAE 42%

RIGHT PANEL — "INVESTMENT TIMELINE" (Gantt-style):
A horizontal bar chart showing when to act:
Mar–Apr: Hold cash, observe ——— (gray bar)
Apr–Jun: Pain peaking, stay patient ——— (red bar)
Jul–Aug: Scale into quality positions ——— (blue bar, highlighted)
Sep: Fed cuts rates ——— (green marker)
Late 2026–2027: Positions work ——— (green bar)

BOTTOM STATS BAR (thin navy strip):
Phase 1: Denial (Now) | 6-Week Trigger: Mid-April | Buy Window: Jul-Aug 2026 | Fed Cut: September | Qatar LNG: Years Offline | Desalination Risk: 64M People | Key Thesis: AI Adopters Win

TYPOGRAPHY: Helvetica or Inter. Title 22pt. Phase headers 14pt bold. Metrics 10pt. Dense but perfectly organized — every data point from the report included. No illustrations, no decorations — only data, charts, timelines, tables, and strategic text. This is a working document for making real investment decisions.

Do NOT render any structural markers, composition directions, or prompt instructions as visible text. Render only the actual content that would appear in a real institutional strategy brief.`;

async function generate() {
  console.log('Generating: Radigan Carter — Institutional Style (Pro)...');
  const start = Date.now();

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: PROMPT }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'], temperature: 0.7 },
    }),
  });

  if (!res.ok) { console.error(`HTTP ${res.status}: ${await res.text()}`); return; }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      const buf = Buffer.from(part.inlineData.data, 'base64');
      const outPath = path.join(OUTPUT_DIR, 'pro-radigan-institutional.png');
      fs.writeFileSync(outPath, buf);
      const elapsed = ((Date.now() - start) / 1000).toFixed(0);
      console.log(`Saved: pro-radigan-institutional.png (${(buf.length/1024).toFixed(0)}KB, ${elapsed}s)`);
      exec(`start "" "${outPath}"`);
      return;
    }
  }
  console.error('No image in response');
}

generate().catch(console.error);
