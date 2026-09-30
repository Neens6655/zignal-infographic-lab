/**
 * Top-tier image rendering via OpenRouter.
 *
 * WHY THIS FILE EXISTS
 * The app previously called generativelanguage.googleapis.com with
 * `gemini-3.1-flash-image-preview` — a model that this estate's own render policy
 * (`~/.claude/scripts/or_render.py`) lists under CHEAP_MODELS and refuses by default.
 * Standing instruction (2026-08-10): always the top-tier image model, never a cheap
 * tier, never a silent downgrade. That rule is enforced here, not remembered.
 *
 * The top tier is also the right tool on the merits: `google/gemini-3-pro-image`
 * (Nano Banana Pro) is the best available at coherent plate composition.
 *
 * TWO WIRE GOTCHAS, both learned the expensive way in or_render.py:
 *  1. OpenRouter's chat-completions API has NO aspect_ratio field. Left unsaid, the
 *     model defaults to ~16:9 and silently returns the wrong shape. The only lever is
 *     the prompt text, so we always append it.
 *  2. max_tokens defaults to the model ceiling (32768). OpenRouter refuses with HTTP
 *     402 if the balance cannot cover that ceiling — regardless of actual consumption.
 *     Capping it lets a low balance still render.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Models permitted for ZGNAL output. Ranked best-first for text-adjacent plates. */
export const TOP_TIER = [
  "google/gemini-3-pro-image", // Nano Banana Pro — default
  "google/gemini-3-pro-image-preview",
  "openai/gpt-5-image", // strongest when the brief is instruction-heavy
  "openai/gpt-5.4-image-2",
] as const;

/**
 * Explicitly refused. Cheapness is never a silent default.
 * `gemini-3.1-flash-image-preview` is here because it is what this app shipped with.
 */
export const CHEAP_MODELS = new Set([
  "google/gemini-2.5-flash-image",
  "google/gemini-3.1-flash-image",
  "google/gemini-3.1-flash-image-preview",
  "google/gemini-3.1-flash-lite-image",
  "openai/gpt-5-image-mini",
  "openrouter/auto",
  "openrouter/auto-beta",
]);

export const IMAGE_MODEL: string = TOP_TIER[0];

/** Cap below the 32768 ceiling so a low balance still renders (gotcha #2). */
const MAX_TOKENS = 8192;
const TIMEOUT_MS = 180_000;

// ── Error classification (Rule 5: classify, never swallow) ─────────────

export type ImageErrorKind =
  | "auth"
  | "quota"
  | "rate_limit"
  | "content_filter"
  | "transient"
  | "contract"
  | "bad_request";

export class ImageModelError extends Error {
  constructor(
    readonly kind: ImageErrorKind,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ImageModelError";
  }
}

function classify(status: number, body: string): ImageErrorKind {
  if (status === 401 || status === 403) return "auth";
  if (status === 402) return "quota";
  if (status === 429) return "rate_limit";
  if (status === 400 && /safety|content|policy|blocked/i.test(body)) {
    return "content_filter";
  }
  if (status >= 500) return "transient";
  return "bad_request";
}

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new ImageModelError(
      "auth",
      "OPENROUTER_API_KEY is not configured. Set it in Vercel and .env.local.",
    );
  }
  return key;
}

// ── Request/response types ─────────────────────────────────────────────

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type RenderResult = {
  /** Raw base64 PNG/JPEG payload, data-URI prefix already stripped. */
  imageBase64: string;
  requestedModel: string;
  servedModel: string;
  /** True when OpenRouter served something other than what we asked for. */
  substituted: boolean;
  costUsd?: number;
};

export type RenderOptions = {
  model?: string;
  aspectRatio?: string;
  /** Reference images as raw base64 + mime, sent alongside the prompt. */
  references?: { base64: string; mimeType: string; description?: string }[];
  /** Deliberate, explicit opt-out of the top-tier rule. Never set on Z's behalf. */
  allowCheap?: boolean;
  signal?: AbortSignal;
};

// ── Core call ──────────────────────────────────────────────────────────

/**
 * Render an image and assert the model that actually ran.
 * Throws ImageModelError with a classified `kind` — never returns a silent fallback.
 */
export async function renderImage(
  prompt: string,
  opts: RenderOptions = {},
): Promise<RenderResult> {
  const model = opts.model ?? IMAGE_MODEL;

  if (CHEAP_MODELS.has(model) && !opts.allowCheap) {
    throw new ImageModelError(
      "bad_request",
      `${model} is a budget model and the standing instruction is top-tier only. ` +
        `Use one of: ${TOP_TIER.join(", ")}.`,
    );
  }

  // Gotcha #1 — aspect ratio only exists as prompt text on this API.
  const fullPrompt = opts.aspectRatio
    ? `${prompt}\n\nOutput image aspect ratio: ${opts.aspectRatio}. Compose for that exact shape.`
    : prompt;

  const content: ContentPart[] = [{ type: "text", text: fullPrompt }];
  for (const ref of opts.references ?? []) {
    content.push({
      type: "image_url",
      image_url: { url: `data:${ref.mimeType};base64,${ref.base64}` },
    });
    if (ref.description) {
      content.push({ type: "text", text: `(Reference: ${ref.description})` });
    }
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
      "HTTP-Referer": "https://zgnal.ai",
      "X-Title": "ZGNAL Infographic Lab",
    },
    body: JSON.stringify({
      model,
      modalities: ["image", "text"],
      messages: [{ role: "user", content }],
      max_tokens: MAX_TOKENS,
    }),
    signal: opts.signal ?? AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new ImageModelError(
      classify(res.status, body),
      `OpenRouter image error (${res.status}): ${body.slice(0, 300)}`,
      res.status,
    );
  }

  const data = await res.json();

  if (data.error) {
    throw new ImageModelError(
      "bad_request",
      `OpenRouter returned an error: ${JSON.stringify(data.error).slice(0, 300)}`,
    );
  }

  const choice = data.choices?.[0];
  if (!choice) {
    throw new ImageModelError("contract", "No choices in OpenRouter response.");
  }

  // THE ASSERTION Higgsfield taught us to make: verify what actually ran.
  const servedModel: string = data.model ?? "";
  const substituted =
    !!servedModel && servedModel.split(":")[0] !== model.split(":")[0];
  if (substituted) {
    console.error(
      `[image-model] MODEL SUBSTITUTED: asked ${model} -> served ${servedModel}`,
    );
  }

  const images = choice.message?.images ?? [];
  if (images.length === 0) {
    const text = (choice.message?.content ?? "").slice(0, 300);
    throw new ImageModelError(
      "contract",
      `Model returned no image. Text was: ${JSON.stringify(text)}`,
    );
  }

  const uri: string = images[0]?.image_url?.url ?? "";
  if (!uri.startsWith("data:")) {
    throw new ImageModelError(
      "contract",
      `Expected a data URI, got: ${uri.slice(0, 60)}`,
    );
  }

  return {
    imageBase64: uri.split(",", 2)[1] ?? "",
    requestedModel: model,
    servedModel,
    substituted,
    costUsd: data.usage?.cost,
  };
}

/**
 * Image-to-image edit. The current render goes in as a reference image and the
 * instruction asks for a surgical change.
 *
 * NOTE ON SCOPE: with the hybrid renderer, text lives in a separate Satori layer.
 * A text correction should re-render that layer and re-composite — never round-trip
 * through here, which risks the model corrupting the rest of the plate. Use this
 * only for changes to the illustration itself.
 */
export async function editImage(
  imageBase64: string,
  instruction: string,
  opts: RenderOptions = {},
): Promise<RenderResult> {
  const clean = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

  const prompt = `Edit the reference image. Apply ONLY this change and keep everything else pixel-identical:

"${instruction.trim().slice(0, 800)}"

RULES:
- Preserve the existing layout, composition, palette, and every other element exactly as-is.
- Change ONLY what the instruction asks for.
- Do not add, remove, or alter any text.`;

  return renderImage(prompt, {
    ...opts,
    references: [
      { base64: clean, mimeType: "image/png", description: "current render" },
      ...(opts.references ?? []),
    ],
  });
}
