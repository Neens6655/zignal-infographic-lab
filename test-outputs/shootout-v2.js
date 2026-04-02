/**
 * Model Shootout V2 — Sequential tests, correct model IDs, sync endpoints
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const FAL_KEY = '76080109-854e-4e8b-bf4d-5ea1e7fdaffe:057eb976100f5ae6b7ca26dda84209a0';
const GOOGLE_KEY = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  .match(/GOOGLE_API_KEY=(.+)/)?.[1]?.trim();

const OUT_DIR = path.join(__dirname, 'shootout');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const PROMPT = `Create a professional infographic image. Title: "TOP 5 LARGEST ECONOMIES BY GDP 2025"

5 sections in a clean horizontal grid layout:

#1 UNITED STATES - GDP: $30.34 Trillion - Growth: 2.8%
#2 CHINA - GDP: $19.53 Trillion - Growth: 4.6%
#3 GERMANY - GDP: $4.92 Trillion - Growth: 0.3%
#4 JAPAN - GDP: $4.40 Trillion - Growth: 1.1%
#5 INDIA - GDP: $4.27 Trillion - Growth: 6.3%

Bottom stats bar: US: $30.34T | China: $19.53T | Germany: $4.92T | Japan: $4.40T | India: $4.27T
Sources: IMF World Economic Outlook 2025

Style: Executive, dark navy background, gold accents, clean sans-serif typography.
CRITICAL: Render every number EXACTLY as written. $30.34T must appear as $30.34T, not $3034T.`;

async function falSync(model, label) {
  console.log(`\n[${label}] → fal.ai/${model}`);
  const start = Date.now();
  try {
    const res = await fetch(`https://fal.run/fal-ai/${model}`, {
      method: 'POST',
      headers: { 'Authorization': `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: PROMPT,
        image_size: 'landscape_16_9',
        num_images: 1,
      }),
      signal: AbortSignal.timeout(120000),
    });
    const data = await res.json();
    const imgUrl = data.images?.[0]?.url || data.image?.url;
    if (!imgUrl) {
      console.log(`  FAIL: ${JSON.stringify(data).slice(0, 300)}`);
      return null;
    }
    const imgRes = await fetch(imgUrl);
    const imgBuf = Buffer.from(await imgRes.arrayBuffer());
    const outPath = path.join(OUT_DIR, `${label}.png`);
    fs.writeFileSync(outPath, imgBuf);
    const secs = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  OK: ${(imgBuf.length/1024).toFixed(0)}KB in ${secs}s`);
    return { path: outPath, time: secs, size: imgBuf.length };
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
    return null;
  }
}

async function geminiSync(label) {
  console.log(`\n[${label}] → Gemini 2.5 Flash (current model)`);
  if (!GOOGLE_KEY) { console.log('  No GOOGLE_API_KEY'); return null; }
  const start = Date.now();
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GOOGLE_KEY },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: PROMPT }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
        }),
        signal: AbortSignal.timeout(120000),
      }
    );
    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith('image'));
    if (!imgPart) {
      console.log(`  FAIL: No image part. Error: ${JSON.stringify(data.error || data).slice(0, 200)}`);
      return null;
    }
    const imgBuf = Buffer.from(imgPart.inlineData.data, 'base64');
    const outPath = path.join(OUT_DIR, `${label}.png`);
    fs.writeFileSync(outPath, imgBuf);
    const secs = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  OK: ${(imgBuf.length/1024).toFixed(0)}KB in ${secs}s`);
    return { path: outPath, time: secs, size: imgBuf.length };
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('========================================');
  console.log('  ZGNAL MODEL SHOOTOUT — GDP Infographic');
  console.log('========================================');

  const results = {};

  // Run sequentially to avoid concurrent limit
  results['GLM-Image'] = await falSync('glm-image', '1-GLM-Image');
  results['Recraft-V3'] = await falSync('recraft-v3', '2-Recraft-V3');
  results['FLUX2-Pro'] = await falSync('flux-2-pro', '3-FLUX2-Pro');
  results['Gemini-Flash'] = await geminiSync('4-Gemini-Flash');

  console.log('\n========================================');
  console.log('  RESULTS SUMMARY');
  console.log('========================================');

  const paths = [];
  for (const [name, r] of Object.entries(results)) {
    if (r) {
      console.log(`  ${name}: ${r.time}s, ${(r.size/1024).toFixed(0)}KB`);
      paths.push(r.path);
    } else {
      console.log(`  ${name}: FAILED`);
    }
  }

  // Generate comparison HTML
  const cards = paths.map(p => {
    const name = path.basename(p, '.png');
    return `<div class="card"><h3>${name}</h3><img src="${path.basename(p)}" loading="lazy"></div>`;
  }).join('\n');

  const html = `<!DOCTYPE html><html><head><title>ZGNAL Model Shootout</title>
<style>
* { margin:0; box-sizing:border-box; }
body { background:#0a0a0a; color:#eee; font-family:'IBM Plex Mono',monospace; padding:24px; }
h1 { text-align:center; color:#D4A84B; font-size:20px; margin-bottom:8px; }
.subtitle { text-align:center; color:#888; font-size:12px; margin-bottom:24px; }
.grid { display:flex; flex-direction:column; gap:24px; max-width:1200px; margin:0 auto; }
.card { background:#141414; border:1px solid #222; border-radius:4px; overflow:hidden; }
.card img { width:100%; display:block; }
.card h3 { padding:12px 16px; font-size:13px; color:#D4A84B; border-bottom:1px solid #222; }
.prompt { max-width:1200px; margin:0 auto 24px; padding:16px; background:#141414; border:1px solid #222; border-radius:4px; font-size:11px; white-space:pre-wrap; color:#999; }
</style></head><body>
<h1>ZGNAL MODEL SHOOTOUT</h1>
<div class="subtitle">Same prompt → different models → which renders text best?</div>
<div class="prompt">${PROMPT.replace(/</g, '&lt;').replace(/\n/g, '\n')}</div>
<div class="grid">${cards}</div>
</body></html>`;

  fs.writeFileSync(path.join(OUT_DIR, 'comparison.html'), html);

  // Open everything
  for (const p of paths) exec(`start "" "${p}"`);
  setTimeout(() => exec(`start "" "${path.join(OUT_DIR, 'comparison.html')}"`), 2000);

  console.log(`\n${paths.length} images saved to test-outputs/shootout/`);
  console.log('Comparison page: test-outputs/shootout/comparison.html');
}

main().catch(console.error);
