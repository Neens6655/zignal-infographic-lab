/**
 * Mushroom Supplements — evidence-based, Pro model
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

const PROMPT = `Create a stunning, richly illustrated botanical-scientific infographic about the top evidence-based medicinal mushroom supplements — only the ones with real clinical proof, no wellness hype.

COMPOSITION: A dramatic dark forest floor panorama (16:9). The viewer is looking at a cross-section of a forest — the mushrooms grow from the earth in the foreground, each one beautifully illustrated at large scale with botanical precision. Above each mushroom, a clean data card floats showing its proven benefits with clinical evidence ratings. The mood is: ancient wisdom meets modern science.

THE VISUAL SCENE:

Background: A moody, atmospheric forest floor. Dark rich earth, fallen logs, moss, dappled light filtering through trees above. The mushrooms grow naturally from this landscape, each one spotlit.

MUSHROOM 1 (leftmost, large):
LION'S MANE (Hericium erinaceus)
Illustrated as a beautiful cascading white waterfall of spines growing from a log.
Floating data card above:
"LION'S MANE"
★★★★ Strong Evidence
• Nerve Growth Factor stimulation — proven in vitro and animal studies
• Cognitive improvement in mild cognitive impairment (Mori et al., 2009 — double-blind RCT)
• 500-3000mg daily
Best for: Brain health, focus, nerve repair

MUSHROOM 2:
REISHI (Ganoderma lucidum)
Illustrated as a glossy reddish-brown shelf fungus with concentric rings, growing from a tree trunk.
Floating data card:
"REISHI"
★★★½ Good Evidence
• Immune modulation — increases NK cell activity (Wachtel-Galor et al.)
• Sleep quality improvement — 8-week study showed significant improvement
• Anti-inflammatory beta-glucans (1,3/1,6)
• 1.5-9g dried mushroom or 1-1.5g extract daily
Best for: Immunity, sleep, stress adaptation

MUSHROOM 3 (center, slightly larger — the star):
TURKEY TAIL (Trametes versicolor)
Illustrated as beautiful fan-shaped layers of brown, tan, and blue concentric bands growing from a mossy log.
Floating data card:
"TURKEY TAIL"
★★★★★ Strongest Evidence
• PSK (Krestin) — APPROVED as cancer adjuvant therapy in Japan since 1977
• Gut microbiome enhancement — prebiotic polysaccharides
• Significant immune boost in breast cancer patients (Torkelson et al., 2012)
• 1-3g PSK extract daily
Best for: Cancer support, gut health, immunity

MUSHROOM 4:
CORDYCEPS (Cordyceps militaris)
Illustrated as bright orange finger-like fruiting bodies rising from the forest floor.
Floating data card:
"CORDYCEPS"
★★★ Moderate Evidence
• VO2 max improvement in elderly adults (Yi et al., 2004)
• ATP production enhancement — cordycepin mechanism
• Anti-fatigue effects in multiple studies
• 1-3g daily
Best for: Energy, athletic endurance, oxygen utilization

MUSHROOM 5 (rightmost):
CHAGA (Inonotus obliquus)
Illustrated as a dark, charcoal-black crusty growth on a birch tree trunk, cracked to reveal orange interior.
Floating data card:
"CHAGA"
★★½ Emerging Evidence
• Highest ORAC antioxidant score of any food tested
• Anti-inflammatory betulinic acid (from birch host tree)
• Blood sugar regulation — animal studies promising, human data limited
• 1-2g extract daily
Best for: Antioxidant, inflammation (needs more human trials)

At the bottom of the forest floor, running horizontally:

A "EVIDENCE QUALITY SCALE" showing:
★★★★★ = Approved/Phase III trials | ★★★★ = Multiple RCTs | ★★★ = Small RCTs + strong mechanistic | ★★½ = Mostly preclinical | ★★ = Traditional use only

BOTTOM STATS BAR (dark earth brown, cream text):
Strongest Evidence: Turkey Tail (PSK — approved in Japan) | Best for Brain: Lion's Mane | Best for Sleep: Reishi | Best for Energy: Cordyceps | Dosage Range: 1-3g daily | Key Compound: Beta-glucans

TITLE (top, bold, cream/gold on dark forest green): "MEDICINAL MUSHROOMS: WHAT THE SCIENCE ACTUALLY SAYS"
SUBTITLE: "Five fungi with real clinical evidence — rated by research quality, not marketing hype"

Source line: "Sources: PubMed, Cochrane Reviews, Memorial Sloan Kettering integrative medicine database"

STYLE: Botanical illustration meets data science. Each mushroom should be rendered with the precision and beauty of a 19th-century mycological plate — detailed textures, accurate morphology, natural lighting. But the data cards are clean, modern, clinical — Helvetica, sharp edges, evidence ratings. The contrast between ancient natural beauty and modern scientific rigor IS the visual story.

Do NOT render any structural labels, composition directions, mushroom numbers, or prompt instructions as visible text. Only render the actual content: mushroom names, evidence ratings, benefits, dosages, title, and stats bar.`;

async function generate() {
  console.log('Generating: Medicinal Mushrooms — Evidence-Based (Pro)...');
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
      const outPath = path.join(OUTPUT_DIR, 'pro-mushroom-supplements.png');
      fs.writeFileSync(outPath, buf);
      const elapsed = ((Date.now() - start) / 1000).toFixed(0);
      console.log(`Saved: pro-mushroom-supplements.png (${(buf.length/1024).toFixed(0)}KB, ${elapsed}s)`);
      exec(`start "" "${outPath}"`);
      return;
    }
  }
  console.error('No image in response');
}

generate().catch(console.error);
