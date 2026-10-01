/**
 * Drive the slide loop from the command line.
 *
 *   npx tsx scripts/deck/run-slide-loop.ts "<topic>" --iters 8 --usd 6 --minutes 90
 *
 * Loads .env.local itself so it runs identically under tsx and bun. Runs from the
 * project root regardless of invocation directory, because the text renderer resolves
 * fonts and WASM from process.cwd().
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
process.chdir(ROOT);

// .env.local — only keys not already in the environment.
const envPath = join(ROOT, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, k, raw] = m;
    if (process.env[k]) continue;
    process.env[k] = raw.replace(/^["']|["']$/g, "");
  }
}

// tsx emits CJS here (no "type": "module"), which forbids top-level await.
async function main() {
  const argv = process.argv.slice(2);
  const flag = (name: string, dflt: number) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 && argv[i + 1] ? Number(argv[i + 1]) : dflt;
  };
  const topic =
    argv.find((a) => !a.startsWith("--") && !/^\d+(\.\d+)?$/.test(a)) ||
    "GCC data-centre capacity growth to 2030: UAE and Saudi Arabia live capacity, announced investment, and the largest operators";

  const ceiling = {
    maxIterations: flag("iters", 8),
    maxUsd: flag("usd", 6),
    maxMinutes: flag("minutes", 90),
  };

  console.log(`topic:   ${topic}`);
  console.log(
    `ceiling: ${ceiling.maxIterations} iterations · $${ceiling.maxUsd} · ${ceiling.maxMinutes} min\n`,
  );

  const { runSlideLoop } = await import("../../src/lib/slide/run-slide");
  const { SLIDE_VARIANTS } = await import("../../src/lib/slide/slide-layouts");

  const out = await runSlideLoop(topic, ceiling);

  console.log("\n══════════════════════════════════════════════════");
  console.log(`ACTION TITLE: ${out.spec.actionTitle}`);
  console.log(
    `KEY FIGURES:  ${out.spec.keyFigures.map((f) => `${f.value} (${f.label})`).join(" · ")}`,
  );
  console.log(`SOURCES:      ${out.spec.sourceLine}`);
  console.log("──────────────────────────────────────────────────");
  for (const v of SLIDE_VARIANTS) {
    const runs = out.results.filter((r) => r.variant === v);
    const last = runs[runs.length - 1];
    const trail = runs
      .map((r) => `${r.score}${r.passed ? "✓" : "✗"}`)
      .join(" → ");
    console.log(
      `  ${v.padEnd(9)} ${last?.passed ? "PASS" : "FAIL"}  [${trail}]  ${last?.file ?? ""}`,
    );
    if (last && !last.passed)
      for (const d of last.blind.defects.slice(0, 3))
        console.log(`             - ${d.slice(0, 140)}`);
  }
  console.log("──────────────────────────────────────────────────");
  console.log(`STOPPED: ${out.stoppedBecause}`);
  console.log(
    `SPEND:   $${out.spend.usd} of $${ceiling.maxUsd} · ${out.spend.minutes} min of ${ceiling.maxMinutes} · ${out.spend.iterations} of ${ceiling.maxIterations} iterations`,
  );
  console.log(`OUTPUT:  ${out.outDir}`);
  process.exit(out.passedVariants.length === SLIDE_VARIANTS.length ? 0 : 1);

}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
