/**
 * WOW Test — handcrafted scene-based prompts to find the quality ceiling.
 * Bypasses structuring pipeline, goes straight to Gemini with art-director-quality prompts.
 */
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const OUTPUT_DIR = 'C:/Users/ziadm/OneDrive/Desktop/infographic-test-outputs';
const API_KEY = process.env.GOOGLE_API_KEY;
const MODEL = 'gemini-3-pro-image-preview';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

if (!process.env.GOOGLE_API_KEY) {
  const envFile = fs.readFileSync('.env.local', 'utf-8');
  for (const line of envFile.split('\n')) {
    const [key, ...val] = line.split('=');
    if (key?.trim() === 'GOOGLE_API_KEY') {
      process.env.GOOGLE_API_KEY = val.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const PROMPTS = [
  {
    id: 'pro-01-water',
    prompt: `Create a breathtaking, publication-quality illustrated infographic about the Global Water Crisis.

COMPOSITION: A sweeping panoramic landscape (16:9) showing water's journey from crisis to solution. The illustration flows LEFT TO RIGHT like a cinematic story:

LEFT THIRD — THE CRISIS:
A crumbling urban waterscape. Aging pipes burst underground, leaking water into the earth. Above ground, silhouettes of 2.2 billion people stand in a dusty, arid landscape. A massive "2.2 BILLION" dominates this section in bold white type. Below: "Without Safe Water". Cracked earth texture. Muted browns and grays.

CENTER — THE WASTE:
Lush green agricultural fields consume a huge river — but 60% of the water evaporates uselessly from flood irrigation channels. A cow stands beside a water meter reading "15,400L PER KG BEEF". Factories with cooling towers pump water, labeled "19% Industrial Use". The number "70%" appears large: "Of All Freshwater → Agriculture". The river visibly shrinks as it flows right.

RIGHT THIRD — THE SOLUTIONS:
The landscape transforms. Israel's modern recycling facility gleams (labeled "87% RECYCLED"). Singapore's NEWater plant stands tall ("40% SUPPLY"). Drip irrigation lines replace flood channels. Smart meters on modern buildings. The color palette shifts to blues and greens — hope.

BOTTOM STATS BAR (dark navy strip):
People Without Safe Water: 2.2 Billion | Freshwater Lost: 30% | Agriculture's Share: 70% | Annual Economic Loss: $260B | Israel Recycle Rate: 87% | Renewable Target: 50% by 2050

TITLE (top, large, bold serif): "WATER WASTE: THE GLOBAL CRISIS"
SUBTITLE: "How 2.2 billion people lack safe water while the world squanders a third of its freshwater supply"

STYLE: Rich editorial illustration. Think National Geographic meets The Economist. Detailed, informational illustrations — every visual element carries data. Warm-to-cool color transition left to right. Professional typography. Source line at bottom: "Sources: WHO, FAO, World Bank, UNICEF"

CRITICAL TEXT RULES: Every word must be perfectly legible. Use clean sans-serif for all text. Numbers must be EXTRA LARGE (40pt+). Do not invent any data — use ONLY the numbers listed above. No garbled text.`,
  },
  {
    id: 'pro-02-ai-market',
    prompt: `Create a stunning, award-winning illustrated infographic about the Global AI Market in 2024.

COMPOSITION: A bold, cinematic HORIZONTAL FLOW (16:9) — imagine a cross-section of the AI economy, like an architectural blueprint meets a financial research poster.

THE VISUAL NARRATIVE (flows left to right):

OPENING — THE SCALE:
A towering "$184B" rendered in massive 3D metallic typography, casting a shadow over a cityscape of tech company headquarters. Below it: "Global AI Market 2024". Growth arrow soaring upward at 37.3% angle. The number "37.3% CAGR" pulses with energy lines.

MIDDLE — THE SEGMENTS:
Four distinct illustrated zones, each with its own visual identity:
• GENERATIVE AI ($67B) — a brain made of neural network lines, generating images, text, code
• ENTERPRISE ADOPTION (72%) — a corporate building with AI flowing through every floor
• US DOMINANCE (60%) — a map silhouette with concentration of light
• GROWTH ENGINE — rocket trajectory from 2020 to 2030, exponential curve

RIGHT — THE LEADERS:
Silhouettes of chess pieces on a board — representing strategic positioning. Company names as elegant labels. The mood is: competitive, high-stakes, strategic.

BOTTOM STATS BAR (black strip, gold text):
Market Size: $184B | CAGR: 37.3% | GenAI Segment: $67B | Enterprise Adoption: 72% | US Market Share: 60%

TITLE (top, impact): "THE AI ECONOMY: $184 BILLION AND ACCELERATING"
SUBTITLE: "Inside the market reshaping every industry on Earth"

STYLE: Dark background (#0F172A), dramatic lighting, institutional blue (#2563EB) and gold (#D4A84B) accents. Think Bloomberg Terminal meets McKinsey Global Institute. Data-rich but beautiful. Each number is a design element, not just text.

CRITICAL TEXT RULES: Perfectly legible sans-serif text only. Numbers rendered HUGE (40pt+). Use ONLY these exact figures: $184B, 37.3%, $67B, 72%, 60%. Do not invent data.`,
  },
  {
    id: 'pro-03-uae',
    prompt: `Create a magnificent, richly illustrated infographic about the UAE's Economic Diversification Journey.

COMPOSITION: A vintage illustrated MAP-STYLE journey (16:9) — like an antique explorer's chart showing a nation's transformation. The story flows as a WINDING PATH from past to future.

THE VISUAL JOURNEY:

STARTING POINT (left) — OIL ERA (1970s):
Desert landscape with oil derricks and tankers. Sepia-toned, vintage feel. A compass rose anchors the corner. Sandy dunes, traditional architecture. Label: "1970s: Oil Dependency". The path begins here, marked with dotted lines.

FIRST MILESTONE — VISION & PLANNING:
The path winds through a blueprint/architectural drawing zone. Futuristic city plans emerge from desert sand. "Non-Oil GDP Target: 80%" appears on an official-looking scroll. Government buildings with UAE flag.

SECOND MILESTONE — TOURISM BOOM:
The Burj Khalifa rises majestically. Hotels, beaches, museums (Louvre Abu Dhabi). "$50B Tourism Revenue (2024)" on a golden banner. The illustration transitions from desert to gleaming metropolis.

THIRD MILESTONE — TECH & INNOVATION:
Silicon-Valley-meets-Dubai zone. Server farms, AI labs, startup offices. "Tech Sector: +15% YoY" with upward arrows. Masdar City's sustainable architecture. Fintech symbols.

DESTINATION (right) — RENEWABLE FUTURE (2050):
Solar farms stretching across desert. Wind turbines. Green buildings. "50% Renewable Energy by 2050". The palette shifts to vibrant greens and blues. A sunrise on the horizon = the future.

BOTTOM STATS BAR (aged parchment texture):
Non-Oil GDP Target: 80% | Tourism Revenue: $50B | Tech Growth: 15% YoY | Renewable Target: 50% by 2050

TITLE (ornate, top center): "THE UAE'S ECONOMIC DIVERSIFICATION"
SUBTITLE: "From oil dependency to knowledge economy — a nation's extraordinary transformation"

STYLE: Aged academia / vintage cartography. Parchment texture background. Hand-drawn illustration feel with rich detail. Sepia, gold, navy, and emerald accents. Decorative borders. Think: antique atlas meets modern data storytelling. Every illustration is DETAILED and SPECIFIC to the UAE.

CRITICAL TEXT RULES: Every word perfectly legible. Clean typography despite vintage style. Numbers LARGE (36pt+). Use ONLY these figures: 80%, $50B, 15%, 50% by 2050. Source: "Sources: UAE Government, World Bank"`,
  },
];

async function generate(test) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`Generating: ${test.id}`);
  const start = Date.now();

  const key = process.env.GOOGLE_API_KEY;
  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: test.prompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
        temperature: 1.0,
      },
    }),
  });

  if (!res.ok) {
    console.error(`HTTP ${res.status}: ${await res.text()}`);
    return;
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  let saved = false;

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      const buf = Buffer.from(part.inlineData.data, 'base64');
      const outPath = path.join(OUTPUT_DIR, `${test.id}.png`);
      fs.writeFileSync(outPath, buf);
      const elapsed = ((Date.now() - start) / 1000).toFixed(0);
      console.log(`Saved: ${test.id}.png (${(buf.length/1024).toFixed(0)}KB, ${elapsed}s)`);
      exec(`start "" "${outPath}"`);
      saved = true;
      break;
    }
  }

  if (!saved) {
    console.error('No image in response');
    const textParts = parts.filter(p => p.text);
    if (textParts.length) console.log('Text response:', textParts[0].text.slice(0, 200));
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  WOW TEST — Handcrafted Scene-Based Prompts            ║');
  console.log('║  Finding the quality ceiling                           ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  for (const test of PROMPTS) {
    await generate(test);
  }
  console.log('\nDone. Check the outputs.');
}

main().catch(console.error);
