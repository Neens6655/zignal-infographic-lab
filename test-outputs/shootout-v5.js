/**
 * Model Shootout V5 — 5 models, queue-based fal.ai, correct Gemini model
 * Models: GLM-Image, Recraft-V3, FLUX-Pro 1.1, Nano Banana Pro (Gemini 3 Pro Image), Gemini 2.0 Flash
 */
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

async function falQueue(modelId, label, extraParams = {}) {
  const t0 = Date.now();
  const elapsed = () => `${((Date.now()-t0)/1000).toFixed(0)}s`;
  process.stdout.write(`[${label}] fal-ai/${modelId} → `);
  try {
    const body = { prompt: PROMPT, image_size: 'landscape_16_9', num_images: 1, ...extraParams };
    const submitRes = await fetch(`https://queue.fal.run/fal-ai/${modelId}`, {
      method: 'POST',
      headers: { 'Authorization': `Key ${FAL}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const submitData = await submitRes.json();

    // Immediate result
    if (submitData.images?.[0]?.url) {
      const fp = path.join(DIR, `${label}.png`);
      const sz = await downloadImage(submitData.images[0].url, fp);
      console.log(`OK ${(sz/1024).toFixed(0)}KB ${elapsed()}`);
      return fp;
    }

    const reqId = submitData.request_id;
    if (!reqId) {
      console.log(`FAIL: ${JSON.stringify(submitData).slice(0, 300)}`);
      return null;
    }
    process.stdout.write(`queued... `);

    // Poll
    for (let i = 0; i < 120; i++) {
      await new Promise(r => setTimeout(r, 3000));

      try {
        const statusRes = await fetch(
          `https://queue.fal.run/fal-ai/${modelId}/requests/${reqId}/status`,
          { headers: { 'Authorization': `Key ${FAL}` } }
        );
        const status = await statusRes.json();

        if (status.status === 'COMPLETED') {
          const resultRes = await fetch(
            `https://queue.fal.run/fal-ai/${modelId}/requests/${reqId}`,
            { headers: { 'Authorization': `Key ${FAL}` } }
          );
          const resultText = await resultRes.text();
          let result;
          try { result = JSON.parse(resultText); } catch {
            console.log(`PARSE ERR: ${resultText.slice(0, 200)}`);
            return null;
          }
          const url = result.images?.[0]?.url || result.image?.url;
          if (!url) { console.log(`NO IMAGE: ${JSON.stringify(result).slice(0, 200)}`); return null; }
          const fp = path.join(DIR, `${label}.png`);
          const sz = await downloadImage(url, fp);
          console.log(`OK ${(sz/1024).toFixed(0)}KB ${elapsed()}`);
          return fp;
        }

        if (status.status === 'FAILED') {
          console.log(`FAILED: ${JSON.stringify(status).slice(0, 200)}`);
          return null;
        }

        if (i % 10 === 9) process.stdout.write(`${elapsed()}... `);
      } catch (pollErr) {
        // Ignore transient poll errors
        if (i % 10 === 9) process.stdout.write(`(poll err)... `);
      }
    }
    console.log(`TIMEOUT after ${elapsed()}`);
    return null;
  } catch (e) { console.log(`ERR: ${e.message}`); return null; }
}

async function testGemini(label) {
  const t0 = Date.now();
  process.stdout.write(`[${label}] Gemini → `);
  if (!GOOGLE) { console.log('NO KEY'); return null; }

  const models = [
    'gemini-2.0-flash-exp-image-generation',
    'gemini-2.0-flash-preview-image-generation',
  ];

  for (const model of models) {
    try {
      process.stdout.write(`${model.replace('gemini-2.0-flash-','').replace('-image-generation','')}... `);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GOOGLE },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: PROMPT }] }],
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
          }),
          signal: AbortSignal.timeout(120000),
        }
      );
      const d = await res.json();
      if (d.error) { process.stdout.write(`(${d.error.code})... `); continue; }

      const img = d.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.mimeType?.startsWith('image'));
      if (img) {
        const fp = path.join(DIR, `${label}.png`);
        fs.writeFileSync(fp, Buffer.from(img.inlineData.data, 'base64'));
        const sz = fs.statSync(fp).size;
        console.log(`OK ${(sz/1024).toFixed(0)}KB ${((Date.now()-t0)/1000).toFixed(0)}s (${model})`);
        return fp;
      }
    } catch (e) { process.stdout.write(`(err)... `); }
  }
  console.log('ALL FAILED');
  return null;
}

async function main() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║  ZGNAL MODEL SHOOTOUT V5 — 5 Models           ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  const results = [];
  const meta = [];

  // 1. GLM-Image (ZHIPU, best text accuracy benchmark)
  const t1 = Date.now();
  const r1 = await falQueue('glm-image', '1-GLM-Image');
  if (r1) { results.push(r1); meta.push({ name: 'GLM-Image', time: Date.now()-t1 }); }

  // 2. Recraft V3 (design-focused, SVG capable)
  const t2 = Date.now();
  const r2 = await falQueue('recraft-v3', '2-Recraft-V3');
  if (r2) { results.push(r2); meta.push({ name: 'Recraft-V3', time: Date.now()-t2 }); }

  // 3. FLUX Pro 1.1 (Black Forest Labs, high-res)
  const t3 = Date.now();
  const r3 = await falQueue('flux-pro/v1.1', '3-FLUX-Pro');
  if (r3) { results.push(r3); meta.push({ name: 'FLUX-Pro-1.1', time: Date.now()-t3 }); }

  // 4. Nano Banana Pro (Google Gemini 3 Pro Image via fal.ai)
  const t4 = Date.now();
  const r4 = await falQueue('nano-banana-pro', '4-NanaBanana-Pro');
  if (r4) { results.push(r4); meta.push({ name: 'Nano-Banana-Pro', time: Date.now()-t4 }); }

  // 5. Gemini 2.0 Flash (direct API — current pipeline)
  const t5 = Date.now();
  const r5 = await testGemini('5-Gemini-Flash');
  if (r5) { results.push(r5); meta.push({ name: 'Gemini-2.0-Flash', time: Date.now()-t5 }); }

  console.log(`\n${'═'.repeat(55)}`);
  console.log(`  RESULTS: ${results.length}/5 models produced images`);
  for (const m of meta) console.log(`    ${m.name}: ${(m.time/1000).toFixed(1)}s`);
  console.log(`${'═'.repeat(55)}\n`);

  if (results.length === 0) {
    console.log('No images generated. Check API keys and credits.');
    return;
  }

  // Build comparison HTML
  const cards = results.map(p => {
    const n = path.basename(p, '.png');
    return `<div class="card"><div class="label">${n}</div><img src="${path.basename(p)}"></div>`;
  }).join('\n');

  fs.writeFileSync(path.join(DIR, 'comparison.html'), `<!DOCTYPE html><html><head>
<title>ZGNAL Shootout V5</title><style>
*{margin:0;box-sizing:border-box}
body{background:#0a0a0a;color:#eee;font-family:'IBM Plex Mono',system-ui;padding:20px}
h1{text-align:center;color:#D4A84B;font-size:20px;margin-bottom:8px}
.sub{text-align:center;color:#666;font-size:12px;margin-bottom:24px}
.grid{display:flex;flex-direction:column;gap:24px;max-width:1400px;margin:0 auto}
.card{background:#111;border:1px solid #333;overflow:hidden}
.card img{width:100%;display:block}
.label{padding:12px 16px;font-size:14px;color:#D4A84B;border-bottom:1px solid #222;font-weight:bold;letter-spacing:0.5px}
</style></head><body>
<h1>ZGNAL MODEL SHOOTOUT V5 — Top 5 GDP Economies</h1>
<div class="sub">Same infographic prompt → 5 different models → which renders text + data best?</div>
<div class="grid">${cards}</div></body></html>`);

  console.log(`Images saved to: test-outputs/shootout/`);
  console.log(`Comparison: test-outputs/shootout/comparison.html`);

  // Open all images + comparison
  for (const p of results) {
    try { execSync(`start "" "${p}"`); } catch {}
  }
  setTimeout(() => {
    try { execSync(`start "" "${path.join(DIR, 'comparison.html')}"`); } catch {}
  }, 2000);
}

main().catch(e => console.error('Fatal:', e));
