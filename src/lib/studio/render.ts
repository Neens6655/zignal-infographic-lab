/**
 * renderStyleGated — THE ENGINE CORE.
 *
 * Renders one style through a self-correcting quality loop:
 *   render -> score -> (pass? ship) : (inject the specific defects -> re-render/fix) -> repeat
 * until it clears the bar or exhausts MAX_ATTEMPTS, in which case the best attempt
 * ships FLAGGED (never silently). Attempt 1 generates; later attempts edit the
 * previous image (image-to-image) so fixes are surgical, not a fresh roll.
 */
import { assemblePrompt } from "../pipeline/prompt";
import { geminiGenerateImage, geminiEditImage } from "../pipeline/gemini";
import { scoreRender } from "./judge";
import type { ContentAnalysis } from "../pipeline/types";
import type {
  StructuredBrief,
  StudioStyle,
  VariantResult,
  RenderAttempt,
  RenderScore,
} from "./types";
import { QUALITY } from "./types";

/** Studio ids -> the legacy style id that trips the right style-family logic in
 *  assemblePrompt/structureContent. 'museum' is new, so it stays itself. */
const LEGACY_STYLE_MAP: Record<string, string> = {
  mckinsey: "executive-institutional",
  academic: "aged-academia",
  deconstruct: "deconstruct",
  aerial: "aerial-explainer",
};

function analysisForStyle(
  brief: StructuredBrief,
  style: StudioStyle,
): ContentAnalysis {
  return { ...brief.analysis, style: LEGACY_STYLE_MAP[style.id] ?? style.id };
}

export interface RenderStyleOptions {
  onProgress?: (progress: number, message: string) => void;
  onAttempt?: (attempt: number, score: RenderScore) => void;
  maxAttempts?: number;
}

export async function renderStyleGated(
  brief: StructuredBrief,
  style: StudioStyle,
  opts: RenderStyleOptions = {},
): Promise<VariantResult> {
  const maxAttempts = opts.maxAttempts ?? QUALITY.MAX_ATTEMPTS;
  const emit = opts.onProgress ?? (() => {});
  const analysis = analysisForStyle(brief, style);
  const history: RenderAttempt[] = [];

  let best: { image: string; score: RenderScore } | null = null;
  let prevImage: string | null = null;
  let correction = "";

  const basePrompt =
    (await assemblePrompt(
      brief.structured,
      analysis,
      brief.aspectRatio,
      brief.language,
      brief.research,
      brief.numberAudit,
      style.guidelines, // inlined — no fs read
    )) +
    `\n\n## NO DUPLICATION (critical)\nRender every section, chart, number, and text block EXACTLY ONCE. Do NOT repeat, mirror, restate, or stack a second copy of any panel, statistic, or heading anywhere in the image. Each of the ${brief.structured.sections.length} sections appears in exactly one place.`;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    emit(
      20 + (attempt - 1) * 5,
      `${style.name}: rendering (attempt ${attempt}/${maxAttempts})...`,
    );

    let image: string;
    if (attempt === 1 || !prevImage) {
      const prompt = correction
        ? `${basePrompt}\n\n## CORRECTIONS — the previous attempt failed QA. Fix EXACTLY these:\n${correction}`
        : basePrompt;
      image = await geminiGenerateImage(
        prompt,
        brief.aspectRatio,
        undefined,
        undefined,
        style.enforcement,
      );
    } else {
      // Surgical self-correction on the previous render.
      image = await geminiEditImage(
        prevImage,
        correction,
        brief.aspectRatio,
        style.enforcement,
      );
    }
    prevImage = image;

    emit(60, `${style.name}: scoring quality (attempt ${attempt})...`);
    const score = await scoreRender(image, brief, style);
    history.push({ attempt, score });
    opts.onAttempt?.(attempt, score);

    if (!best || score.overall > best.score.overall) best = { image, score };

    if (score.pass) {
      emit(100, `${style.name}: passed (${score.overall}/100)`);
      return {
        style: style.id,
        imageBase64: image,
        score,
        attempts: attempt,
        passed: true,
        flagged: false,
        history,
      };
    }

    correction = score.defects.map((d, i) => `${i + 1}. ${d}`).join("\n");
    emit(
      70,
      `${style.name}: ${score.overall}/100 — retrying with ${score.defects.length} fixes`,
    );
  }

  // Cap reached — ship the best attempt, FLAGGED. No silent failure.
  const b = best as { image: string; score: RenderScore };
  console.warn(
    `[studio] ${style.id} did not pass in ${maxAttempts} attempts (best ${b.score.overall}/100)`,
  );
  emit(
    100,
    `${style.name}: best of ${maxAttempts} (${b.score.overall}/100, flagged)`,
  );
  return {
    style: style.id,
    imageBase64: b.image,
    score: b.score,
    attempts: maxAttempts,
    passed: false,
    flagged: true,
    history,
  };
}

/**
 * editVariantImage — the "fix the same image on the fly" primitive for /api/edit.
 * Edits the current version in place; optionally re-scores against the brief so a
 * regression can be rejected by the caller.
 */
export async function editVariantImage(
  currentImage: string,
  instruction: string,
  style: StudioStyle,
  aspectRatio: string,
  brief?: StructuredBrief,
): Promise<{ imageBase64: string; score?: RenderScore }> {
  const edited = await geminiEditImage(
    currentImage,
    instruction,
    aspectRatio,
    style.enforcement,
  );
  const score = brief ? await scoreRender(edited, brief, style) : undefined;
  return { imageBase64: edited, score };
}
