/**
 * Multi-Model Shootout — Tests the SAME infographic prompt across different image models.
 * Saves all results side-by-side for visual comparison.
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const FAL_KEY = '76080109-854e-4e8b-bf4d-5ea1e7fdaffe:057eb976100f5ae6b7ca26dda84209a0';
const GOOGLE_KEY = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  .match(/GOOGLE_API_KEY=(.+)/)?.[1]?.trim();

const OUT_DIR = path.join(__dirname, 'shootout');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// The test prompt — a real infographic prompt with numbers, stats, rankings
const INFOGRAPHIC_PROMPT = `Create a professional infographic titled "TOP 5 LARGEST ECONOMIES BY GDP 2025".

Layout: Clean data-driven grid with 5 sections, one per country.

Content:
#1 UNITED STATES — GDP: $30.34 Trillion — Growth: 2.8%
#2 CHINA — GDP: $19.53 Trillion — Growth: 4.6%
#3 GERMANY — GDP: $4.92 Trillion — Growth: 0.3%
#4 JAPAN — GDP: $4.40 Trillion — Growth: 1.1%
#5 INDIA — GDP: $4.27 Trillion — Growth: 6.3%

Stats bar at bottom: US: $30.34T | China: $19.53T | Germany: $4.92T | Japan: $4.40T | India: $4.27T

Style: Executive institutional, clean sans-serif typography, dark navy and gold accent palette.
Every number must be rendered EXACTLY as written. Do not round or modify any figures.
Sources: IMF World Economic Outlook 2025 · World Bank · Statista`;

// ─── Model Definitions ───────────────────────────────────────

async function falGenerate(model, prompt, label) {
  console.log(`  [${label}] Submitting to fal.ai/${model}...`);
  const start = Date.now();

  // Submit to queue
  const submitRes = await fetch(`https://queue.fal.run/fal-ai/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: 'landscape_16_9',
      num_images: 1,
      ...(model === 'recraft/v4/text-to-image' ? { style: 'realistic_image' } : {}),
    }),
  });

  const submitData = await submitRes.json();
  if (!submitData.request_id && !submitData.images) {
    console.log(`  [${label}] Submit error:`, JSON.stringify(submitData).slice(0, 200));
    return null;
  }

  // If synchronous response (some models return immediately)
  if (submitData.images) {
    const imgUrl = submitData.images[0]?.url;
    if (imgUrl) {
      const imgRes = await fetch(imgUrl);
      const imgBuf = Buffer.from(await imgRes.arrayBuffer());
      const outPath = path.join(OUT_DIR, `${label}.png`);
      fs.writeFileSync(outPath, imgBuf);
      console.log(`  [${label}] Done in ${((Date.now() - start) / 1000).toFixed(1)}s (${(imgBuf.length/1024).toFixed(0)}KB)`);
      return outPath;
    }
  }

  // Poll for result
  const requestId = submitData.request_id;
  const resultUrl = `https://queue.fal.run/fal-ai/${model}/requests/${requestId}`;

  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 3000));

    const statusRes = await fetch(`${resultUrl}/status`, {
      headers: { 'Authorization': `Key ${FAL_KEY}` },
    });
    const status = await statusRes.json();

    if (status.status === 'COMPLETED') {
      const resultRes = await fetch(resultUrl, {
        headers: { 'Authorization': `Key ${FAL_KEY}` },
      });
      const result = await resultRes.json();
      const imgUrl = result.images?.[0]?.url || result.image?.url;

      if (imgUrl) {
        const imgRes = await fetch(imgUrl);
        const imgBuf = Buffer.from(await imgRes.arrayBuffer());
        const outPath = path.join(OUT_DIR, `${label}.png`);
        fs.writeFileSync(outPath, imgBuf);
        console.log(`  [${label}] Done in ${((Date.now() - start) / 1000).toFixed(1)}s (${(imgBuf.length/1024).toFixed(0)}KB)`);
        return outPath;
      }
      break;
    }

    if (status.status === 'FAILED') {
      console.log(`  [${label}] FAILED:`, JSON.stringify(status).slice(0, 200));
      return null;
    }

    if (i % 5 === 0) console.log(`  [${label}] Waiting... (${status.status}, pos: ${status.queue_position || '?'})`);
  }

  console.log(`  [${label}] Timed out`);
  return null;
}

async function geminiGenerate(prompt, label) {
  console.log(`  [${label}] Submitting to Gemini...`);
  if (!GOOGLE_KEY) { console.log(`  [${label}] No GOOGLE_API_KEY`); return null; }
  const start = Date.now();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GOOGLE_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
          responseMimeType: 'image/png',
        },
      }),
    }
  );

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith('image'));

  if (imgPart) {
    const imgBuf = Buffer.from(imgPart.inlineData.data, 'base64');
    const outPath = path.join(OUT_DIR, `${label}.png`);
    fs.writeFileSync(outPath, imgBuf);
    console.log(`  [${label}] Done in ${((Date.now() - start) / 1000).toFixed(1)}s (${(imgBuf.length/1024).toFixed(0)}KB)`);
    return outPath;
  }

  console.log(`  [${label}] No image in response`);
  return null;
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  console.log('=== MULTI-MODEL INFOGRAPHIC SHOOTOUT ===');
  console.log(`Prompt: "Top 5 Largest Economies by GDP 2025"\n`);
  console.log('Testing 5 models in parallel...\n');

  const results = await Promise.allSettled([
    falGenerate('glm-image', INFOGRAPHIC_PROMPT, '1-GLM-Image'),
    falGenerate('ideogram-v3/text-to-image', INFOGRAPHIC_PROMPT, '2-Ideogram-V3'),
    falGenerate('recraft/v4/text-to-image', INFOGRAPHIC_PROMPT, '3-Recraft-V4'),
    falGenerate('flux-2-pro', INFOGRAPHIC_PROMPT, '4-FLUX2-Pro'),
    geminiGenerate(INFOGRAPHIC_PROMPT, '5-Gemini-Flash'),
  ]);

  console.log('\n=== RESULTS ===');
  const paths = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) {
      paths.push(r.value);
      console.log(`  OK: ${path.basename(r.value)}`);
    } else {
      console.log(`  FAIL: ${r.reason || 'no image'}`);
    }
  }

  // Open all images
  console.log(`\nOpening ${paths.length} images...`);
  for (const p of paths) {
    exec(`start "" "${p}"`);
  }

  // Generate comparison HTML
  const html = `<!DOCTYPE html>
<html><head><title>Model Shootout</title>
<style>
body { background: #111; color: #eee; font-family: system-ui; padding: 20px; }
h1 { text-align: center; color: #D4A84B; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(600px, 1fr)); gap: 16px; }
.card { background: #1a1a1a; border-radius: 8px; overflow: hidden; }
.card img { width: 100%; display: block; }
.card h3 { padding: 12px 16px; margin: 0; font-size: 14px; color: #D4A84B; }
.prompt { max-width: 800px; margin: 0 auto 24px; padding: 16px; background: #1a1a1a; border-radius: 8px; font-size: 12px; white-space: pre-wrap; }
</style></head><body>
<h1>ZGNAL Model Shootout — Top 5 GDP Economies</h1>
<div class="prompt">${INFOGRAPHIC_PROMPT.replace(/</g, '&lt;')}</div>
<div class="grid">
${paths.map(p => `<div class="card"><h3>${path.basename(p, '.png')}</h3><img src="${path.basename(p)}"></div>`).join('\n')}
</div>
</body></html>`;

  fs.writeFileSync(path.join(OUT_DIR, 'comparison.html'), html);
  exec(`start "" "${path.join(OUT_DIR, 'comparison.html')}"`);
  console.log('\nComparison page opened: test-outputs/shootout/comparison.html');
}

main().catch(console.error);
