/**
 * Arab Art Auction Records — scene-based prompt, Pro model
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

const PROMPT = `Create a magnificent, auction-house-quality illustrated infographic showcasing the most expensive Arab artworks ever sold at auction.

COMPOSITION: A grand Christie's/Sotheby's auction hall panorama (16:9). Dark, luxurious atmosphere — mahogany walls, spotlit paintings, golden nameplates beneath each work. The infographic feels like you're standing in the world's most exclusive art auction viewing room.

THE VISUAL SCENE:

The scene shows a dramatic auction gallery with 6 masterworks displayed on dark walls under museum spotlights. Each painting is shown in a golden ornate frame with a brass auction plaque beneath it showing the artist, title, year, and hammer price. A subtle red velvet rope runs along the bottom.

PAINTING 1 (largest, center-dominant spotlight):
Abdulnasser Gharem — "Message/Messenger" (2011)
Sold: $842,500 at Christie's Dubai
Visual: A conceptual mixed-media work with rubber stamps forming a dome shape. Bold, graphic, contemporary.
Plaque reads: ABDULNASSER GHAREM | "Message/Messenger" | $842,500

PAINTING 2:
Mahmoud Said — "The Whirling Dervishes" (1929)
Sold: $2.5 Million at Christie's London 2010
Visual: Luminous oil painting of spinning Sufi dancers in white robes, warm Egyptian golden light.
Plaque reads: MAHMOUD SAID | "Whirling Dervishes" | $2.5M

PAINTING 3:
Farhad Moshiri — "Eshgh (Love)" (2007)
Sold: $1.05 Million at Bonhams
Visual: A glittering crystal-studded canvas spelling the Farsi word for love in ornate calligraphy on red background.
Plaque reads: FARHAD MOSHIRI | "Eshgh (Love)" | $1.05M

PAINTING 4:
Ibrahim El-Salahi — "Reborn Sounds of Childhood Dreams" (1961-65)
Sold: $1.6 Million at Bonhams 2020
Visual: Monumental Sudanese modernist work — abstract organic forms in black ink and earth tones, merging Arabic calligraphy with African symbolism.
Plaque reads: IBRAHIM EL-SALAHI | "Reborn Sounds..." | $1.6M

PAINTING 5:
Parviz Tanavoli — "The Wall (Oh, Persepolis)" (1975)
Sold: $2.84 Million at Christie's Dubai 2008
Visual: Monumental bronze sculpture-painting — geometric Heech form against ancient Persian architectural motifs.
Plaque reads: PARVIZ TANAVOLI | "The Wall" | $2.84M

PAINTING 6:
Ahmed Moustafa — "The Attributes of Divine Perfection" (1987)
Sold at record prices. Visual: Mathematical Islamic calligraphy — golden geometric patterns based on the 99 Names of God, precision and spirituality merged.
Plaque reads: AHMED MOUSTAFA | "Divine Perfection"

The gallery floor is polished dark marble reflecting the spotlights. A discreet auction paddle and catalog sit on a velvet stand in the foreground.

BOTTOM STATS BAR (deep burgundy, gold typography):
Record Sale: $2.84M (Tanavoli) | Egyptian Master: $2.5M (Said) | Sudanese Modernist: $1.6M (El-Salahi) | Contemporary: $1.05M (Moshiri) | Saudi Record: $842K (Gharem)

TITLE (top, elegant gold serif on dark): "THE MOST VALUABLE ARAB ARTWORKS EVER SOLD"
SUBTITLE: "Record-breaking auction sales that put Middle Eastern art on the global stage"

Source line at bottom: "Sources: Christie's, Sotheby's, Bonhams auction records"

STYLE: Ultra-premium auction house atmosphere. Dark mahogany (#3B2314) walls, warm spotlights creating dramatic pools of light on each painting, gold (#C5A55A) frame accents and typography, deep burgundy (#6B1D2A) velvet accents. Every painting should be illustrated in a style that HINTS at the actual artwork's aesthetic — Mahmoud Said's warmth, Moshiri's glitter, El-Salahi's ink forms. This infographic should feel like it belongs on the wall of a collector's private study.

Do NOT render any structural labels like "PAINTING 1", "PAINTING 2", section numbers, or composition directions as visible text. Only render the artist names, artwork titles, prices, and the title/subtitle/stats bar.`;

async function generate() {
  console.log('Generating: Most Expensive Arab Art (Pro model)...');
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
      const outPath = path.join(OUTPUT_DIR, 'pro-arab-art-auction.png');
      fs.writeFileSync(outPath, buf);
      const elapsed = ((Date.now() - start) / 1000).toFixed(0);
      console.log(`Saved: pro-arab-art-auction.png (${(buf.length/1024).toFixed(0)}KB, ${elapsed}s)`);
      exec(`start "" "${outPath}"`);
      return;
    }
  }
  console.error('No image in response');
}

generate().catch(console.error);
