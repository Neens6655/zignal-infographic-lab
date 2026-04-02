const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FAL = '76080109-854e-4e8b-bf4d-5ea1e7fdaffe:057eb976100f5ae6b7ca26dda84209a0';
const GOOGLE = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  .match(/GOOGLE_API_KEY=(.+)/)?.[1]?.trim();
const DIR = path.join(__dirname, 'shootout');
fs.mkdirSync(DIR, { recursive: true });

const PROMPT = `Generate a visually rich, publication-quality INFOGRAPHIC IMAGE with charts, icons, flags, data visualizations. NOT a document or text — a fully designed infographic.

Title: TOP 5 LARGEST ECONOMIES BY GDP 2025

#1 UNITED STATES — $30.34 Trillion — Growth: 2.8%
#2 CHINA — $19.53 Trillion — Growth: 4.6%
#3 GERMANY — $4.92 Trillion — Growth: 0.3%
#4 JAPAN — $4.40 Trillion — Growth: 1.1%
#5 INDIA — $4.27 Trillion — Growth: 6.3%

Bottom stats: US: $30.34T | China: $19.53T | Germany: $4.92T | Japan: $4.40T | India: $4.27T
Sources: IMF 2025

Dark navy background, gold accents, sans-serif. Render every number EXACTLY as written.`;

async function downloadImage(url, filepath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  fs.writeFileSync(filepath, Buffer.from(await res.arrayBuffer()));
  return fs.statSync(filepath).size;
}

async function testFal(modelId, label) {
  const t0 = Date.now();
  process.stdout.write(`[${label}] fal-ai/${modelId} ... `);
  try {
    const res = await fetch(`https://fal.run/fal-ai/${modelId}`, {
      method: 'POST',
      headers: { 'Authorization': `Key ${FAL}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: PROMPT, image_size: 'landscape_16_9', num_images: 1 }),
      signal: AbortSignal.timeout(180000),
    });
    const d = await res.json();
    const url = d.images?.[0]?.url || d.image?.url;
    if (!url) { console.log(`FAIL: ${JSON.stringify(d).slice(0, 200)}`); return null; }
    const fp = path.join(DIR, `${label}.png`);
    const sz = await downloadImage(url, fp);
    console.log(`OK ${(sz/1024).toFixed(0)}KB ${((Date.now()-t0)/1000).toFixed(0)}s`);
    return fp;
  } catch (e) { console.log(`ERR: ${e.message}`); return null; }
}

async function testGemini(label) {
  const t0 = Date.now();
  process.stdout.write(`[${label}] Gemini Flash Image ... `);
  if (!GOOGLE) { console.log('NO KEY'); return null; }
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GOOGLE },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: PROMPT }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
        }),
        signal: AbortSignal.timeout(120000),
      }
    );
    const d = await res.json();
    const img = d.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.mimeType?.startsWith('image'));
    if (!img) { console.log(`FAIL: ${JSON.stringify(d.error || {}).slice(0, 200)}`); return null; }
    const fp = path.join(DIR, `${label}.png`);
    fs.writeFileSync(fp, Buffer.from(img.inlineData.data, 'base64'));
    const sz = fs.statSync(fp).size;
    console.log(`OK ${(sz/1024).toFixed(0)}KB ${((Date.now()-t0)/1000).toFixed(0)}s`);
    return fp;
  } catch (e) { console.log(`ERR: ${e.message}`); return null; }
}

async function main() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║  ZGNAL MODEL SHOOTOUT — Sequential   ║');
  console.log('╚══════════════════════════════════════╝\n');

  const all = [];

  // Run ONE AT A TIME to avoid fal.ai concurrent limit
  const r1 = await testFal('glm-image', '1-GLM-Image');
  if (r1) all.push(r1);

  const r2 = await testFal('recraft-v3', '2-Recraft-V3');
  if (r2) all.push(r2);

  const r3 = await testFal('flux-pro/v1.1', '3-FLUX-Pro');
  if (r3) all.push(r3);

  const r4 = await testGemini('4-Gemini-Current');
  if (r4) all.push(r4);

  console.log(`\n${all.length}/4 models produced images\n`);

  // Build comparison HTML
  const cards = all.map(p => {
    const n = path.basename(p, '.png');
    return `<div class="card"><div class="label">${n}</div><img src="${path.basename(p)}"></div>`;
  }).join('\n');

  fs.writeFileSync(path.join(DIR, 'comparison.html'), `<!DOCTYPE html><html><head>
<title>ZGNAL Shootout</title><style>
*{margin:0;box-sizing:border-box}
body{background:#0a0a0a;color:#eee;font-family:'IBM Plex Mono',system-ui;padding:20px}
h1{text-align:center;color:#D4A84B;font-size:18px;margin-bottom:20px}
.grid{display:flex;flex-direction:column;gap:20px;max-width:1400px;margin:0 auto}
.card{background:#111;border:1px solid #333;overflow:hidden}
.card img{width:100%;display:block}
.label{padding:10px 16px;font-size:13px;color:#D4A84B;border-bottom:1px solid #222;font-weight:bold}
</style></head><body>
<h1>ZGNAL MODEL SHOOTOUT — Top 5 GDP Economies</h1>
<div class="grid">${cards}</div></body></html>`);

  // Open all
  for (const p of all) execSync(`start "" "${p}"`);
  setTimeout(() => execSync(`start "" "${path.join(DIR, 'comparison.html')}"`), 1500);
}

main().catch(e => console.error('Fatal:', e));
