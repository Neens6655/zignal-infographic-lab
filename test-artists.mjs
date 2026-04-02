/**
 * Fresh topic test — Top Arab Artists & Painters with their most famous works.
 * Tests scene-based prompting on a cultural/art topic.
 */
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const OUTPUT_DIR = 'C:/Users/ziadm/OneDrive/Desktop/infographic-test-outputs';
const MODEL = 'gemini-3-pro-image-preview';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Load API key
const envFile = fs.readFileSync('.env.local', 'utf-8');
for (const line of envFile.split('\n')) {
  const [key, ...val] = line.split('=');
  if (key?.trim() === 'GOOGLE_API_KEY') {
    process.env.GOOGLE_API_KEY = val.join('=').trim().replace(/^["']|["']$/g, '');
  }
}

const PROMPT = `Create a breathtaking, museum-quality illustrated infographic celebrating the greatest Arab artists and painters in history.

COMPOSITION: A grand gallery-style panorama (16:9) — imagine walking through a prestigious art museum dedicated to Arab masters. The infographic flows LEFT TO RIGHT through time, with each artist's section framed like a gallery alcove.

THE VISUAL JOURNEY:

OPENING — CLASSICAL MASTERS (Left):
A gallery wall with ornate golden frames. First alcove features:
• MAHMOUD SAID (Egypt, 1897-1964) — His masterpiece "The Whirling Dervishes" (1929) shown in an ornate frame. Rich, warm Egyptian light. Known as father of modern Egyptian art. Style: luminous realism with Egyptian soul.
• KAHLIL GIBRAN (Lebanon, 1883-1931) — His mystical painting "The Prophet" series displayed. Ethereal, spiritual compositions. Also celebrated as poet-philosopher. Dreamlike figures in soft light.

CENTER — MID-CENTURY PIONEERS:
The gallery transitions to a more modern wing with cleaner walls:
• JEWAD SELIM (Iraq, 1919-1961) — His monumental "Liberty Monument" (1961) in Baghdad depicted as a sculptural relief. Bold modernist forms merging Mesopotamian heritage with contemporary art.
• FATEH MOUDARRES (Syria, 1922-1999) — Powerful expressionist canvases showing Syrian landscapes and ancient faces. Raw, emotional brushwork. Earth tones meeting vibrant reds.
• ETEL ADNAN (Lebanon, 1925-2021) — Her iconic small landscape paintings — bold blocks of color depicting Mount Tamalpais. Minimalist yet profoundly moving. Bright yellows, deep blues, vivid greens.

RIGHT — CONTEMPORARY VOICES:
A contemporary gallery space with dramatic lighting:
• SHIRIN NESHAT (Iran, 1957-) — Her powerful black-and-white photographs with Farsi calligraphy overlaid on faces and hands. Explores gender, identity, revolution.
• ABDULNASSER GHAREM (Saudi Arabia, 1973-) — Mixed media and conceptual art. His rubber-stamp paintings addressing social commentary. "Message/Messenger" — most expensive work by a living Gulf artist.

BOTTOM STATS BAR (deep burgundy strip, gold text):
Artists Spanning: 140+ Years | Countries: Egypt, Lebanon, Iraq, Syria, Iran, Saudi Arabia | Most Iconic: "The Whirling Dervishes" (1929) | Highest Auction: Abdulnasser Gharem | Legacy: Bridging East & West

TITLE (top, elegant serif, gold on dark): "MASTERS OF ARAB ART"
SUBTITLE: "Seven visionaries who shaped the Middle East's artistic identity — from classical realism to contemporary revolution"

STYLE: Rich, warm museum atmosphere. Dark walls (charcoal #2D2D2D) with golden frame accents. Each artist's section should SHOW their artistic style in the illustration — Mahmoud Said's section feels luminous and Egyptian, Etel Adnan's section has bold color blocks, Shirin Neshat's section is stark black-and-white. The infographic itself becomes a work of art about art.

Decorative elements: subtle arabesque patterns in borders, calligraphic flourishes, a timeline ribbon connecting the artists.

CRITICAL TEXT RULES: Every word perfectly legible. Elegant serif font for titles, clean sans-serif for data. Artist names LARGE (28pt+). Use ONLY the names, dates, and works listed above. Source line: "Sources: Christie's, Sotheby's, Barjeel Art Foundation"`;

async function generate() {
  console.log('Generating: Arab Art Masters (Pro model)...');
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
      const outPath = path.join(OUTPUT_DIR, 'pro-arab-artists.png');
      fs.writeFileSync(outPath, buf);
      const elapsed = ((Date.now() - start) / 1000).toFixed(0);
      console.log(`Saved: pro-arab-artists.png (${(buf.length/1024).toFixed(0)}KB, ${elapsed}s)`);
      exec(`start "" "${outPath}"`);
      return;
    }
  }
  console.error('No image in response');
}

generate().catch(console.error);
