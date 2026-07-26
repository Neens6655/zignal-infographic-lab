/**
 * QA GATE — Studio engine live smoke test.
 * Drives POST /api/studio/generate against a running dev server and RAISES
 * (exit 1) unless all four styles return a real image with a quality score.
 *
 * Usage: node scripts/qa/smoke-studio.mjs [port] [maxAttempts]
 */
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.argv[2] || process.env.PORT || '5788';
const MAX_ATTEMPTS = Number(process.argv[3] || 2);
const OUT = process.env.SMOKE_OUT || '.smoke-out';
const BASE = `http://localhost:${PORT}`;

const FIXTURE =
  'Global electric vehicle market 2025: $784B market size, 24% CAGR, 17.1 million units sold, ' +
  'China holds 58% of global sales, battery pack costs fell to $89/kWh, average range now 480 km, ' +
  'public charging points reached 4.2 million worldwide.';

const EXPECTED = ['mckinsey', 'academic', 'deconstruct', 'aerial'];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  console.log(`[smoke] POST ${BASE}/api/studio/generate  (max_attempts=${MAX_ATTEMPTS})`);
  const t0 = Date.now();

  const res = await fetch(`${BASE}/api/studio/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: FIXTURE,
      aspect_ratio: '16:9',
      max_attempts: MAX_ATTEMPTS,
    }),
  });

  if (!res.ok) {
    console.error(`[smoke] HTTP ${res.status}: ${await res.text()}`);
    process.exit(1);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent = '';
  const tiles = new Map();
  let errored = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        let data;
        try {
          data = JSON.parse(line.slice(6));
        } catch {
          continue;
        }
        if (currentEvent === 'prep') {
          process.stdout.write(`\r[prep] ${data.progress}% ${data.message || ''}`.padEnd(80));
        } else if (currentEvent === 'variant_attempt') {
          const s = data.score || {};
          console.log(
            `\n[attempt] ${data.style} #${data.attempt} -> overall=${s.overall} style=${s.styleConformance} legible=${s.legible} pass=${s.pass} defects=${(s.defects || []).length}`,
          );
        } else if (currentEvent === 'variant') {
          const b64 = (data.image_url || '').split(',')[1] || '';
          const buf = Buffer.from(b64, 'base64');
          fs.writeFileSync(path.join(OUT, `${data.style}.png`), buf);
          tiles.set(data.style, { bytes: buf.length, ...data });
          console.log(
            `\n[tile] ${data.style} DONE — ${(buf.length / 1024).toFixed(0)}KB, attempts=${data.attempts}, passed=${data.passed}, flagged=${data.flagged}, overall=${data.score?.overall}`,
          );
        } else if (currentEvent === 'error') {
          errored = data.error;
        }
      }
    }
  }

  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(`\n${'='.repeat(64)}\n[smoke] finished in ${secs}s`);

  if (errored) {
    console.error(`[smoke] FAIL — server error: ${errored}`);
    process.exit(1);
  }

  // ── GATE ASSERTIONS ──
  const problems = [];
  for (const style of EXPECTED) {
    const t = tiles.get(style);
    if (!t) problems.push(`missing tile: ${style}`);
    else if (t.bytes < 3000) problems.push(`${style} image too small (${t.bytes}B)`);
    else if (!t.score || typeof t.score.overall !== 'number')
      problems.push(`${style} has no quality score`);
  }

  console.log('\nSUMMARY');
  for (const style of EXPECTED) {
    const t = tiles.get(style);
    console.log(
      t
        ? `  ${style.padEnd(12)} ${(t.bytes / 1024).toFixed(0).padStart(4)}KB  overall=${t.score?.overall}  attempts=${t.attempts}  ${t.passed ? 'PASS' : t.flagged ? 'FLAGGED' : '?'}`
        : `  ${style.padEnd(12)} MISSING`,
    );
  }

  if (problems.length) {
    console.error(`\n[smoke] GATE FAILED:\n  - ${problems.join('\n  - ')}`);
    process.exit(1);
  }
  console.log(`\n[smoke] GATE PASSED — 4/4 styles rendered with scores. Images in ${OUT}/`);
}

main().catch((e) => {
  console.error('[smoke] crashed:', e);
  process.exit(1);
});
