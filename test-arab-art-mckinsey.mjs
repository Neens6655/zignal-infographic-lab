/**
 * Arab Art Auction — McKinsey institutional style
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

const PROMPT = `Create a McKinsey Global Institute-quality strategy slide (16:9 landscape) analyzing the Middle Eastern art market through its highest-value auction sales.

VISUAL CONCEPT: A clean, authoritative research slide — the kind a senior partner presents to a sovereign wealth fund. White background, navy (#0F172A) header bar, institutional blue (#1E3A5F) accents. Zero decoration. Every pixel carries information.

THE LAYOUT — a horizontal narrative flow across the slide:

HEADER BAR (navy, full width):
Title in white: "MIDDLE EASTERN ART MARKET: RECORD AUCTION ANALYSIS"
Subtitle in light blue: "Six landmark sales that define the region's position in the global art economy"
Date stamp right-aligned: "March 2026 | Market Intelligence"

MAIN BODY — Three visual columns flowing left to right:

COLUMN 1 — "THE MARKET LANDSCAPE"
A clean horizontal bar chart showing the 6 highest sales, ranked by price:
1. Parviz Tanavoli — "The Wall" — $2.84M (longest bar, institutional blue)
2. Mahmoud Said — "Whirling Dervishes" — $2.5M
3. Ibrahim El-Salahi — "Reborn Sounds" — $1.6M
4. Farhad Moshiri — "Eshgh (Love)" — $1.05M
5. Abdulnasser Gharem — "Message/Messenger" — $842K
6. Ahmed Moustafa — "Divine Perfection" — Notable sale
Bar chart should be clean, minimal, with values right-aligned. No 3D effects. Thin axis lines.

COLUMN 2 — "GEOGRAPHIC DISTRIBUTION"
A minimal map of the Middle East with dots sized by auction value:
• Iran (Tanavoli, Moshiri) — largest dots — $3.89M combined
• Egypt (Said, Moustafa) — medium dots — $2.5M+
• Sudan (El-Salahi) — $1.6M
• Saudi Arabia (Gharem) — $842K
• Lebanon — emerging market
Clean gray map, blue dots, thin labels. Below: a small pie chart showing "Iran 40% | Egypt 26% | Sudan 17% | Saudi 9% | Other 8%"

COLUMN 3 — "KEY INSIGHTS"
Three insight cards with thin blue left-border:

Card 1: "Classical masters command premium"
Mahmoud Said's 1929 work sold for 3x the contemporary average. Heritage = value multiplier.

Card 2: "Contemporary Saudi market is nascent"
Gharem's $842K record suggests significant upside. Kingdom's Vision 2030 arts investment = catalyst.

Card 3: "Iranian artists dominate by value"
$3.89M combined from 2 artists. Deep artistic tradition + diaspora collector base.

BOTTOM STATS BAR (thin navy strip):
Total Record Sales: $10.4M+ | Countries Represented: 5 | Auction Houses: Christie's, Sotheby's, Bonhams | Highest Single Sale: $2.84M (Tanavoli) | Market Trend: Accelerating

TYPOGRAPHY: Helvetica or similar clean sans-serif. Title 28pt white on navy. Chart labels 12pt charcoal. Insight cards 11pt. Numbers always bold and blue. Zero ornament.

Do NOT render any composition directions, column labels, or structural markers as visible text. Only render the actual content: title, chart data, map labels, insight text, and stats bar. This should look like it was produced by McKinsey's research division — clinical precision, authoritative data, zero fluff.`;

async function generate() {
  console.log('Generating: Arab Art Auction — McKinsey Style (Pro)...');
  const start = Date.now();

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: PROMPT }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'], temperature: 0.8 },
    }),
  });

  if (!res.ok) { console.error(`HTTP ${res.status}: ${await res.text()}`); return; }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      const buf = Buffer.from(part.inlineData.data, 'base64');
      const outPath = path.join(OUTPUT_DIR, 'pro-arab-art-mckinsey.png');
      fs.writeFileSync(outPath, buf);
      const elapsed = ((Date.now() - start) / 1000).toFixed(0);
      console.log(`Saved: pro-arab-art-mckinsey.png (${(buf.length/1024).toFixed(0)}KB, ${elapsed}s)`);
      exec(`start "" "${outPath}"`);
      return;
    }
  }
  console.error('No image in response');
}

generate().catch(console.error);
