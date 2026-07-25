/**
 * runStudio — prep once, then render all four styles in parallel, each gated.
 * Every style streams its own progress + completes independently (progressive reveal).
 */
import { prepBrief } from "./prep";
import { renderStyleGated } from "./render";
import { STUDIO_STYLE_LIST } from "./styles";
import type {
  StudioProgressCallback,
  VariantResult,
  StructuredBrief,
} from "./types";

export interface StudioRunOptions {
  aspectRatio?: string;
  language?: string;
  /** Override the per-style quality-loop attempt cap (smoke tests use a low value). */
  maxAttempts?: number;
  onEvent?: StudioProgressCallback;
}

export interface StudioRunResult {
  brief: StructuredBrief;
  variants: VariantResult[];
}

export async function runStudio(
  content: string,
  opts: StudioRunOptions = {},
): Promise<StudioRunResult> {
  const onEvent = opts.onEvent ?? (() => {});

  // Shared prep — ONCE.
  const brief = await prepBrief(content, {
    aspectRatio: opts.aspectRatio,
    language: opts.language,
    onProgress: (progress, message) =>
      onEvent({ type: "prep", progress, message }),
  });

  // Fan out ×4 — each style loops to quality independently and streams as it lands.
  const variants: VariantResult[] = await Promise.all(
    STUDIO_STYLE_LIST.map((style) =>
      renderStyleGated(brief, style, {
        maxAttempts: opts.maxAttempts,
        onProgress: (progress, message) =>
          onEvent({
            type: "variant_progress",
            style: style.id,
            progress,
            message,
          }),
        onAttempt: (attempt, score) =>
          onEvent({ type: "variant_attempt", style: style.id, attempt, score }),
      }).then((result) => {
        onEvent({ type: "variant_complete", style: style.id, result });
        return result;
      }),
    ),
  );

  return { brief, variants };
}
