/**
 * The slide loop: research → spec → four variants → blind-reader → repair → repeat,
 * until every variant passes or the ceiling is hit.
 *
 * Rule 16: a loop is an unpriced position until it has a ceiling. This one stops on
 * whichever comes first — iterations, dollars or wall-clock — and reports actual spend
 * against all three when it ends.
 *
 * What loops and what does not:
 *   - Research and the spec are produced ONCE. They are text, they are cheap, and the
 *     claim should not drift between iterations.
 *   - Each variant is rendered, read blind, and either passes or returns its defects.
 *   - The next iteration re-renders ONLY the failed variants, with the defects fed into
 *     the plate brief. "The reader could not read '1.9 GW'" and "the illustration
 *     contains the words 'system logic'" are both things the next brief can act on.
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { researchContent } from "../pipeline/research";
import type { ResearchResult } from "../pipeline/types";
import { renderImage, type RenderResult } from "../pipeline/image-model";
import { renderTextLayer } from "../pipeline/text-renderer";
import { compositeInfographic } from "../pipeline/compositor";
import {
  checkVisualCompliance,
  formatCompliance,
} from "../pipeline/visual-compliance";
import { buildSlideSpec, type SlideSpec } from "./slide-spec";
import {
  SLIDE_LAYOUTS,
  SLIDE_VARIANTS,
  type SlideVariant,
} from "./slide-layouts";
import { checkPlateForText } from "./plate-text-check";
import { blindReaderTest, type BlindReaderReport } from "./blind-reader";

export type Ceiling = {
  maxIterations: number;
  maxUsd: number;
  maxMinutes: number;
};

export type VariantResult = {
  variant: SlideVariant;
  iteration: number;
  file: string;
  passed: boolean;
  score: number;
  compliance: string;
  plateTextFound: string[];
  blind: BlindReaderReport;
  costUsd: number;
  seconds: number;
};

export type LoopResult = {
  topic: string;
  spec: SlideSpec;
  outDir: string;
  iterations: number;
  results: VariantResult[];
  passedVariants: SlideVariant[];
  stoppedBecause: "all_passed" | "max_iterations" | "max_usd" | "max_minutes";
  spend: { usd: number; minutes: number; iterations: number };
  ceiling: Ceiling;
};

// ── Research ──────────────────────────────────────────────────────────

export async function researchTopic(topic: string): Promise<ResearchResult> {
  const r = await researchContent([topic], topic, "overview", []);
  console.log(
    `[slide] research: ${r.citations.length} citations, ${r.findings.join(" ").length} chars`,
  );
  return r;
}

// ── One variant, one attempt ──────────────────────────────────────────

async function renderPlate(
  brief: string,
  priorDefects: string[],
): Promise<{ image: string | null; textFound: string[]; cost: number }> {
  let cost = 0;
  let prompt = brief;
  if (priorDefects.length) {
    prompt += `\n\nTHE PREVIOUS ATTEMPT FAILED REVIEW. Correct exactly these:\n${priorDefects.map((d) => `- ${d}`).join("\n")}`;
  }

  let textFound: string[] = [];
  for (let attempt = 1; attempt <= 2; attempt++) {
    let r: RenderResult;
    try {
      r = await renderImage(prompt, { aspectRatio: "16:9" });
    } catch (err) {
      console.error(
        "[slide] plate render failed:",
        err instanceof Error ? err.message : err,
      );
      return { image: null, textFound, cost };
    }
    cost += r.costUsd ?? 0;

    const check = await checkPlateForText(r.imageBase64);
    cost += check.costUsd;
    if (!check.hasText) return { image: r.imageBase64, textFound: [], cost };

    textFound = check.examples;
    prompt += `\n\nREJECTED: the previous image contained readable text (${check.examples.join(", ")}). Draw it again with NO text, letters or numbers anywhere — not on screens, signs, charts or labels. Shapes and icons only.`;
  }
  // Both attempts had text. Return the last one, flagged — the reader test will fail it.
  return { image: null, textFound, cost };
}

export async function renderVariant(
  spec: SlideSpec,
  variant: SlideVariant,
  iteration: number,
  outDir: string,
  priorDefects: string[],
): Promise<VariantResult> {
  const t0 = Date.now();
  let cost = 0;

  const plan = SLIDE_LAYOUTS[variant](spec);
  const compliance = checkVisualCompliance(plan);
  if (!compliance.passed) {
    console.warn(
      `[slide:${variant}] layout compliance FAIL — ${formatCompliance(compliance)}`,
    );
  }

  const [plate, textPng] = await Promise.all([
    renderPlate(plan.illustrationZones, priorDefects),
    renderTextLayer(plan),
  ]);
  cost += plate.cost;

  const composite = await compositeInfographic(
    plate.image,
    textPng,
    plan.width,
    plan.height,
    plan.backgroundColor,
  );

  const idx = SLIDE_VARIANTS.indexOf(variant) + 1;
  const file = join(
    outDir,
    `${String(idx).padStart(2, "0")}-slide-${variant}.png`,
  );
  writeFileSync(file, Buffer.from(composite, "base64"));

  const blind = await blindReaderTest(composite, spec);
  cost += blind.costUsd;

  const passed =
    blind.passed && compliance.passed && plate.textFound.length === 0;
  const seconds = Math.round((Date.now() - t0) / 1000);
  console.log(
    `[slide:${variant}] iter ${iteration} ${passed ? "PASS" : "FAIL"} ${blind.score}/100 in ${seconds}s ($${cost.toFixed(3)})`,
  );

  return {
    variant,
    iteration,
    file,
    passed,
    score: blind.score,
    compliance: formatCompliance(compliance),
    plateTextFound: plate.textFound,
    blind,
    costUsd: cost,
    seconds,
  };
}

// ── The loop ──────────────────────────────────────────────────────────

export async function runSlideLoop(
  topic: string,
  ceiling: Ceiling,
  outRoot = "renders/slides",
): Promise<LoopResult> {
  const started = Date.now();
  const runId = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outDir = join(outRoot, runId);
  mkdirSync(outDir, { recursive: true });

  let usd = 0;
  const minutes = () => (Date.now() - started) / 60000;

  // Once: research and spec.
  const research = await researchTopic(topic);
  const { spec, attempts } = await buildSlideSpec(topic, research);
  console.log(`[slide] spec accepted after ${attempts} attempt(s)`);
  writeFileSync(join(outDir, "spec.json"), JSON.stringify(spec, null, 2));

  const results: VariantResult[] = [];
  const passed = new Set<SlideVariant>();
  const lastDefects = new Map<SlideVariant, string[]>();
  let stoppedBecause: LoopResult["stoppedBecause"] = "all_passed";
  let iteration = 0;

  while (iteration < ceiling.maxIterations) {
    iteration++;
    const todo = SLIDE_VARIANTS.filter((v) => !passed.has(v));
    if (todo.length === 0) break;

    console.log(
      `\n[slide] ── iteration ${iteration}/${ceiling.maxIterations} · ${todo.join(", ")} · spent $${usd.toFixed(2)} / ${minutes().toFixed(0)}min ──`,
    );

    // Variants render in parallel — they are independent.
    const batch = await Promise.all(
      todo.map((v) =>
        renderVariant(spec, v, iteration, outDir, lastDefects.get(v) ?? []),
      ),
    );

    for (const r of batch) {
      results.push(r);
      usd += r.costUsd;
      if (r.passed) {
        passed.add(r.variant);
      } else {
        const defects = [...r.blind.defects];
        if (r.plateTextFound.length)
          defects.push(
            `illustration contained text: ${r.plateTextFound.join(", ")}`,
          );
        lastDefects.set(r.variant, defects);
      }
    }

    if (passed.size === SLIDE_VARIANTS.length) {
      stoppedBecause = "all_passed";
      break;
    }
    if (usd >= ceiling.maxUsd) {
      stoppedBecause = "max_usd";
      break;
    }
    if (minutes() >= ceiling.maxMinutes) {
      stoppedBecause = "max_minutes";
      break;
    }
    if (iteration >= ceiling.maxIterations) {
      stoppedBecause = "max_iterations";
      break;
    }
  }

  const out: LoopResult = {
    topic,
    spec,
    outDir,
    iterations: iteration,
    results,
    passedVariants: [...passed],
    stoppedBecause,
    spend: {
      usd: Number(usd.toFixed(3)),
      minutes: Number(minutes().toFixed(1)),
      iterations: iteration,
    },
    ceiling,
  };
  writeFileSync(join(outDir, "report.json"), JSON.stringify(out, null, 2));

  console.log(
    `\n[slide] STOPPED: ${stoppedBecause} · ${passed.size}/${SLIDE_VARIANTS.length} variants passed · spent $${out.spend.usd} of $${ceiling.maxUsd} · ${out.spend.minutes}min of ${ceiling.maxMinutes} · ${iteration} of ${ceiling.maxIterations} iterations`,
  );
  return out;
}
