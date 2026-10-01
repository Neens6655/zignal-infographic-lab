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
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { researchContent } from "../pipeline/research";
import type { ResearchResult } from "../pipeline/types";
import { renderImage, type RenderResult } from "../pipeline/image-model";
import { renderTextLayer } from "../pipeline/text-renderer";
import { compositeInfographic, placePlates, nearestAspect } from "../pipeline/compositor";
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
import { checkPlate } from "../pipeline/plate-check";
import { checkPlateGround } from "./plate-ground-check";
import type { LayoutPlan } from "../pipeline/layout-planner";
import { blindReaderTest, type BlindReaderReport } from "./blind-reader";

/** The text layer hid the illustration. Code bug; classified, never swallowed. */
export class PlateHiddenError extends Error {
  readonly kind = "layout_defect" as const;
  constructor(variant: string) {
    super(
      `[slide:${variant}] the illustration is not visible in the composite — an opaque band in the text layer covers the canvas`,
    );
  }
}

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
  stoppedBecause:
    | "all_passed"
    | "max_iterations"
    | "max_usd"
    | "max_minutes"
    | "stop_file"
    | "error:quota"
    | "error:auth"
    | "error:rate_limit"
    | "error:transient";
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

async function renderOnePlate(
  brief: string,
  rect: { x: number; y: number; w: number; h: number },
  priorDefects: string[],
  label: string,
): Promise<{ image: string | null; textFound: string[]; cost: number }> {
  let cost = 0;
  let prompt = brief;
  if (priorDefects.length) {
    prompt += `\n\nTHE PREVIOUS ATTEMPT FAILED REVIEW. Correct exactly these:\n${priorDefects.map((d) => `- ${d}`).join("\n")}`;
  }
  const aspect = nearestAspect(rect.w, rect.h);
  let textFound: string[] = [];
  for (let attempt = 1; attempt <= 3; attempt++) {
    let r: RenderResult;
    try {
      r = await renderImage(prompt, { aspectRatio: aspect });
    } catch (err) {
      console.error(`[slide:${label}] plate render failed:`, err instanceof Error ? err.message : err);
      return { image: null, textFound, cost };
    }
    cost += r.costUsd ?? 0;

    // Blank first. The whole image is the drawing now, so ink is measured on it directly.
    const ink = await checkPlate(r.imageBase64);
    if (!ink.ok) {
      prompt += `\n\nREJECTED: the previous image was almost blank (${ink.reason}). Fill the canvas edge to edge with clear shapes, icons and connectors.`;
      continue;
    }
    const check = await checkPlateForText(r.imageBase64);
    cost += check.costUsd;
    if (!check.hasText) return { image: r.imageBase64, textFound: [], cost };
    textFound = check.examples;
    prompt += `\n\nREJECTED: the previous image contained readable text (${check.examples.join(", ")}). Draw it again with NO text, letters or numbers anywhere — not on screens, signs, charts or labels. Shapes and icons only.`;
  }
  return { image: null, textFound, cost };
}

/**
 * One plate per illustration rectangle, each rendered at the rectangle's own aspect
 * ratio and fitted INSIDE it. The model's canvas is the slide's box: nothing it draws
 * can be cut, and nothing it draws can reach the text. Every rect must carry a
 * drawing — a flow with one empty lane is a failed render.
 */
async function renderPlate(
  plan: LayoutPlan,
  priorDefects: string[],
  label: string,
): Promise<{ image: string | null; textFound: string[]; cost: number }> {
  const rects = plan.illustrationRects ?? [];
  const briefs = plan.illustrationBriefs ?? [];
  if (rects.length === 0 || briefs.length !== rects.length) {
    throw new Error(`[slide:${label}] layout has ${rects.length} rects and ${briefs.length} briefs`);
  }
  const parts = await Promise.all(
    rects.map((rect, i) => renderOnePlate(briefs[i], rect, priorDefects, `${label}#${i + 1}`)),
  );
  const cost = parts.reduce((a, p) => a + p.cost, 0);
  const textFound = parts.flatMap((p) => p.textFound);
  const missing = parts.map((p, i) => (p.image ? -1 : i + 1)).filter((i) => i > 0);
  if (missing.length) {
    console.warn(`[slide:${label}] plate missing for rect(s) ${missing.join(", ")}`);
    return { image: null, textFound, cost };
  }
  const image = await placePlates(
    parts.map((p, i) => ({ image: p.image as string, rect: rects[i] })),
    plan.width,
    plan.height,
    plan.textGround ?? plan.backgroundColor,
  );
  // By construction the rects are clear of the text (tested). Measure it anyway; a
  // failure here is a layout bug and must never be retried into the ceiling.
  if (plan.textGround) {
    const ground = await checkPlateGround(image, plan);
    if (!ground.ok) throw new PlateHiddenError(`${label}: plate overlaps text — ${ground.offenders.map((o) => o.text).join(", ")}`);
  }
  return { image, textFound: [], cost };
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
    renderPlate(plan, priorDefects, variant),
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

  // Prove the plate reached the output. If the composite with the plate is
  // byte-identical to the composite without it, the text layer is covering the whole
  // canvas and nothing downstream can see the illustration. That is a layout bug, not
  // something another render fixes — so it aborts instead of becoming a defect string.
  if (plate.image) {
    const withoutPlate = await compositeInfographic(
      null,
      textPng,
      plan.width,
      plan.height,
      plan.backgroundColor,
    );
    if (withoutPlate === composite) {
      throw new PlateHiddenError(variant);
    }
  }

  const idx = SLIDE_VARIANTS.indexOf(variant) + 1;
  const file = join(
    outDir,
    `${String(idx).padStart(2, "0")}-slide-${variant}.png`,
  );
  writeFileSync(file, Buffer.from(composite, "base64"));

  const blind = await blindReaderTest(composite, spec);
  cost += blind.costUsd;

  // A slide with no illustration must never pass. The blind reader scores comprehension,
  // and a blank plate does not hurt comprehension — two slides passed at 96/100 with
  // pure white where the diagram belonged. The visual is part of the deliverable.
  const plateMissing = plate.image === null;
  if (plateMissing) blind.defects.push("illustration is missing — the plate was blank or rejected");
  const passed =
    blind.passed && compliance.passed && plate.textFound.length === 0 && !plateMissing;
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
  // Persist BEFORE the spec gate. When the gate rejects a figure, the question is
  // always "was it in the research?" — and until now the research was gone by then.
  writeFileSync(join(outDir, 'research.json'), JSON.stringify(research, null, 2));
  const { spec, attempts } = await buildSlideSpec(topic, research);
  console.log(`[slide] spec accepted after ${attempts} attempt(s)`);
  writeFileSync(join(outDir, "spec.json"), JSON.stringify(spec, null, 2));

  const results: VariantResult[] = [];
  const passed = new Set<SlideVariant>();
  const lastDefects = new Map<SlideVariant, string[]>();
  let stoppedBecause: LoopResult["stoppedBecause"] = "all_passed";
  let iteration = 0;

  // Every external error is classified and the partial record is written before the
  // error propagates. Run 7 died on an OpenRouter 403 (the key's spend cap) with no
  // report.json — five iterations of evidence lost to an unhandled throw.
  try {
  while (iteration < ceiling.maxIterations) {
    iteration++;
    const todo = SLIDE_VARIANTS.filter((v) => !passed.has(v));
    if (todo.length === 0) break;

    // Kill switch. `taskkill` and `Stop-Process` are denied on this machine, so a
    // runaway loop could only be stopped by its own ceiling. Touch this file to stop
    // at the next iteration boundary.
    if (existsSync(join(outRoot, "STOP"))) {
      stoppedBecause = "stop_file";
      console.warn("[slide] STOP file present — halting before this iteration");
      iteration--;
      break;
    }

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
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const kind: "quota" | "auth" | "rate_limit" | "transient" =
      /403|limit exceeded|insufficient|quota/i.test(msg)
        ? "quota"
        : /401|unauthori[sz]ed|invalid.*key/i.test(msg)
          ? "auth"
          : /429|rate.?limit/i.test(msg)
            ? "rate_limit"
            : "transient";
    stoppedBecause = `error:${kind}`;
    console.error(`[slide] STOPPED on external error (${kind}): ${msg.slice(0, 200)}`);
    const partial: LoopResult = {
      topic, spec, outDir, iterations: iteration, results,
      passedVariants: [...passed], stoppedBecause,
      spend: { usd: Number(usd.toFixed(3)), minutes: Number(minutes().toFixed(1)), iterations: iteration },
      ceiling,
    };
    writeFileSync(join(outDir, "report.json"), JSON.stringify(partial, null, 2));
    throw err;
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
