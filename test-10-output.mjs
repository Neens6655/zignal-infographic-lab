/**
 * 10-Output Test — Go/No-Go Gate for ZGNAL Infographic Lab v2
 * Generates 10 infographics across 3 topics x 3 styles + 1 wildcard.
 * Saves to desktop, opens each one.
 */

import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4567';
const OUTPUT_DIR = 'C:/Users/ziadm/OneDrive/Desktop/infographic-test-outputs';

const TESTS = [
  { id: '01', topic: 'Water waste global crisis: 2.2 billion people without safe water, 70% freshwater used by agriculture, $260B annual economic loss, 30% freshwater lost before delivery', style: 'executive-institutional', layout: 'bento-grid' },
  { id: '02', topic: 'Water waste global crisis: urban infrastructure loses 30-50%, agriculture wastes 60% in flood irrigation, climate change depleting glaciers feeding 2 billion people', style: 'executive-institutional', layout: 'dashboard' },
  { id: '03', topic: 'Water waste global crisis: from scale of the problem to solutions and innovation, Israel recycles 87% wastewater, Singapore NEWater provides 40% supply', style: 'aged-academia', layout: 'winding-roadmap' },
  { id: '04', topic: 'Global AI market 2024: $184B market size, 37.3% CAGR growth, top companies OpenAI Google Anthropic Microsoft, enterprise adoption at 72%', style: 'executive-institutional', layout: 'bento-grid' },
  { id: '05', topic: 'Global AI market: generative AI $67B, computer vision $25B, NLP $35B, robotics $18B, autonomous vehicles $12B', style: 'bold-graphic', layout: 'comparison-matrix' },
  { id: '06', topic: 'Global AI market: investment trends, $100B+ VC funding in 2024, US leads with 60% share, China 15%, UK 7%, compute costs dropping 50% annually', style: 'executive-institutional', layout: 'dashboard' },
  { id: '07', topic: 'UAE economic diversification: Vision 2031 targets non-oil GDP at 80%, tourism contributed $50B in 2024, tech sector growing 15% YoY, Abu Dhabi sovereign wealth $1.5T', style: 'executive-institutional', layout: 'bento-grid' },
  { id: '08', topic: 'UAE economic diversification: renewable energy target 50% by 2050, Masdar City, ADNOC downstream expansion, fintech hub Dubai with 700+ companies', style: 'bold-graphic', layout: 'hub-spoke' },
  { id: '09', topic: 'UAE economic diversification: from oil dependency 1970s to knowledge economy 2030, free zones, golden visa, AI strategy, space program', style: 'aged-academia', layout: 'winding-roadmap' },
  { id: '10', topic: 'Global semiconductor industry: $580B market 2024, TSMC 60% foundry share, CHIPS Act $52B US investment, AI chip demand growing 40% YoY, 3nm node transition', style: 'executive-institutional', layout: 'bento-grid' },
];

async function generateOne(test) {
  const label = `[${test.id}] ${test.style}`;
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`${label} — Starting...`);
  console.log(`Topic: ${test.topic.slice(0, 80)}...`);

  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: test.topic,
        style: test.style,
        layout: test.layout,
        aspect_ratio: '16:9',
        simplify: true,
      }),
    });

    if (!response.ok) {
      console.error(`${label} — HTTP ${response.status}: ${await response.text()}`);
      return { id: test.id, success: false, error: `HTTP ${response.status}` };
    }

    // Parse SSE stream — read chunks
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let imageUrl = '';
    let metadata = {};
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.status) {
            process.stdout.write(`\r  ${data.progress}% ${data.message || ''}`.padEnd(80));
          }
          if (data.image_url) imageUrl = data.image_url;
          if (data.metadata) metadata = data.metadata;
        } catch {}
      }
    }
    console.log(); // newline after progress

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (!imageUrl) {
      console.error(`${label} — No image URL in response (${elapsed}s)`);
      return { id: test.id, success: false, error: 'No image URL', elapsed };
    }

    // Download the image
    console.log(`${label} — Got image, downloading... (${elapsed}s)`);

    // The image_url might be a data URI or a URL
    let imageBuffer;
    if (imageUrl.startsWith('data:image/')) {
      const base64 = imageUrl.split(',')[1];
      imageBuffer = Buffer.from(base64, 'base64');
    } else {
      const imgRes = await fetch(imageUrl);
      imageBuffer = Buffer.from(await imgRes.arrayBuffer());
    }

    const filename = `test-${test.id}-${test.style}-${test.layout}.png`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, imageBuffer);

    const sizeKB = (imageBuffer.length / 1024).toFixed(0);
    console.log(`${label} — Saved: ${filename} (${sizeKB}KB, ${elapsed}s)`);

    // Extract quality info from metadata
    const quality = metadata?.provenance?.qualityScore;
    const retries = metadata?.provenance?.pipeline?.filter(p => p.stage?.includes('R'))?.length || 0;

    if (quality) {
      console.log(`${label} — Quality: ${quality.overall}/100 | Badge: ${quality.badge?.level} | Accuracy: ${quality.accuracy} | Readability: ${quality.readability} | Retries: ${retries}`);
    }

    return { id: test.id, success: true, filename, elapsed, sizeKB, quality, retries };
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`${label} — Error (${elapsed}s):`, err.message);
    return { id: test.id, success: false, error: err.message, elapsed };
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  ZGNAL INFOGRAPHIC LAB v2 — 10-OUTPUT TEST             ║');
  console.log('║  Go/No-Go Gate for revamp/v2 branch                    ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\nOutput: ${OUTPUT_DIR}`);
  console.log(`Server: ${BASE_URL}`);
  console.log(`Tests: ${TESTS.length}`);

  // Verify server is up
  try {
    await fetch(`${BASE_URL}`);
  } catch {
    console.error('\nERROR: Dev server not running. Start with: PORT=4567 npm run dev');
    process.exit(1);
  }

  // Run tests sequentially (to avoid overloading Gemini API)
  const results = [];
  for (const test of TESTS) {
    const result = await generateOne(test);
    results.push(result);
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('RESULTS SUMMARY');
  console.log('═'.repeat(60));

  const passed = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\nGenerated: ${passed.length}/${TESTS.length}`);
  console.log(`Failed: ${failed.length}/${TESTS.length}`);

  if (passed.length > 0) {
    const avgQuality = passed
      .filter(r => r.quality?.overall)
      .reduce((sum, r) => sum + r.quality.overall, 0) / passed.filter(r => r.quality?.overall).length || 0;
    const totalRetries = passed.reduce((sum, r) => sum + (r.retries || 0), 0);
    console.log(`Avg Quality Score: ${avgQuality.toFixed(0)}/100`);
    console.log(`Total Retries: ${totalRetries}`);

    console.log('\nPer-output:');
    for (const r of passed) {
      const q = r.quality;
      console.log(`  ${r.id}: ${q?.badge?.level || '?'} ${q?.overall || '?'}/100 | ${r.elapsed}s | ${r.filename}`);
    }
  }

  if (failed.length > 0) {
    console.log('\nFailed:');
    for (const r of failed) {
      console.log(`  ${r.id}: ${r.error}`);
    }
  }

  // Verdict
  console.log('\n' + '═'.repeat(60));
  if (passed.length >= 7) {
    console.log('VERDICT: PASS — Architecture works. Ready to ship.');
  } else if (passed.length >= 5) {
    console.log('VERDICT: PARTIAL — Fix failing styles, then retest.');
  } else {
    console.log('VERDICT: FAIL — Architecture needs rethinking.');
  }
  console.log('═'.repeat(60));
}

main().catch(console.error);
