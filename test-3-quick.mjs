/**
 * Quick 3-output test — verify fixes before full 10-output run.
 * Tests: 1 institutional, 1 bold graphic, 1 aged academia
 */
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4567';
const OUTPUT_DIR = 'C:/Users/ziadm/OneDrive/Desktop/infographic-test-outputs';

const TESTS = [
  { id: 'v2-01', topic: 'Water waste global crisis: 2.2 billion people without safe water, 70% freshwater used by agriculture, $260B annual economic loss, 30% freshwater lost before delivery, Israel recycles 87% wastewater', style: 'executive-institutional' },
  { id: 'v2-02', topic: 'Global AI market 2024: $184B market size, 37.3% CAGR growth, generative AI segment $67B, enterprise adoption at 72%, US leads with 60% market share', style: 'bold-graphic' },
  { id: 'v2-03', topic: 'UAE economic diversification: from oil dependency in 1970s to knowledge economy by 2031, non-oil GDP target 80%, tourism $50B in 2024, tech sector growing 15% YoY, renewable energy target 50% by 2050', style: 'aged-academia' },
];

async function generateOne(test) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`[${test.id}] ${test.style}`);
  const startTime = Date.now();

  const response = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: test.topic, style: test.style, aspect_ratio: '16:9', simplify: true }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let imageUrl = '', buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.status) process.stdout.write(`\r  ${data.progress}% ${data.message || ''}`.padEnd(80));
        if (data.image_url) imageUrl = data.image_url;
      } catch {}
    }
  }
  console.log();

  if (!imageUrl) { console.error('  FAILED — no image'); return; }

  const base64 = imageUrl.split(',')[1];
  const buf = Buffer.from(base64, 'base64');
  const filename = `${test.id}-${test.style}.png`;
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), buf);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`  Saved: ${filename} (${(buf.length/1024).toFixed(0)}KB, ${elapsed}s)`);

  // Open it
  const { exec } = await import('child_process');
  exec(`start "" "${path.join(OUTPUT_DIR, filename)}"`);
}

async function main() {
  console.log('ZGNAL v2 — Quick 3-Output Test (post-fix)');
  try { await fetch(BASE_URL); } catch { console.error('Server not running'); process.exit(1); }
  for (const test of TESTS) await generateOne(test);
  console.log('\n' + '═'.repeat(60));
  console.log('Done — check the 3 images.');
}

main().catch(console.error);
