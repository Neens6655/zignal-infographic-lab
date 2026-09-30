/**
 * Gemini API helpers — text generation.
 *
 * IMAGE generation no longer lives here. It moved to `image-model.ts`, which calls
 * OpenRouter with `google/gemini-3-pro-image` and asserts the served model. The old
 * path hardcoded `gemini-3.1-flash-image-preview` — a budget tier that this estate's
 * render policy explicitly refuses. The image functions below are thin back-compat
 * wrappers so callers did not have to change.
 */
import type { ReferenceImage } from "./types";
import {
  renderImage,
  editImage,
  IMAGE_MODEL as TOP_TIER_IMAGE_MODEL,
} from "./image-model";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

function getApiKey(): string {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("GOOGLE_API_KEY is not configured");
  return key;
}

export const TEXT_MODEL = "gemini-2.5-flash";
export const PRO_MODEL = "gemini-2.5-pro";
export const IMAGE_MODEL = TOP_TIER_IMAGE_MODEL;

export async function geminiGenerate(
  model: string,
  prompt: string,
  responseModalities?: string[],
): Promise<string> {
  const url = `${GEMINI_BASE}/models/${model}:generateContent`;
  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: responseModalities
      ? { responseModalities }
      : { maxOutputTokens: 8192 },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": getApiKey(),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  // Skip thinking/thought parts — gemini-2.5-flash returns thought parts before the actual output
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textPart =
    parts.find((p: any) => p.text && !p.thought) ||
    parts.find((p: any) => p.text);
  return textPart?.text || "";
}

// Style enforcement map — key visual rules repeated at the end of prompt
// (models pay most attention to the beginning and end of prompts)
const STYLE_ENFORCEMENT: Record<string, string> = {
  "executive-institutional":
    "STYLE ENFORCEMENT: This MUST be a clean, white-background, McKinsey/JP Morgan-style research brief. Background is WHITE (#FFFFFF). Navy header/footer bars. Clean sans-serif typography. NO colorful illustrations, NO cartoon characters, NO playful elements. Think: printed boardroom handout.",
  "corporate-memphis":
    "STYLE ENFORCEMENT: Use flat geometric characters with bold solid colors. Corporate Memphis / tech illustration style. NO photorealistic elements.",
  "bold-graphic":
    "STYLE ENFORCEMENT: Swiss poster aesthetic. Bold typography, maximum impact, limited color palette. Strong geometric shapes.",
  "technical-schematic":
    "STYLE ENFORCEMENT: Blueprint grid aesthetic. Technical diagram style with process flows and connection lines. Dark background with light lines.",
  "aerial-explainer":
    "STYLE ENFORCEMENT: Isometric 3D drone-view perspective. Cutaway architectural style showing systems from above.",
  "ui-wireframe":
    "STYLE ENFORCEMENT: Clean data dashboard wireframe. Dark background, neon accent colors, chart-heavy. No illustrations.",
  knolling:
    "STYLE ENFORCEMENT: Top-down flat-lay photography style. Objects arranged at perfect right angles on neutral background.",
  "subway-map":
    "STYLE ENFORCEMENT: Transit map style with colored lines connecting nodes. Clean geometric paths like a metro map.",
  chalkboard:
    "STYLE ENFORCEMENT: White chalk sketches on dark green chalkboard background. Hand-drawn sketch-note style.",
  "aged-academia":
    "STYLE ENFORCEMENT: Sepia tones, classical engraving style. Aged paper texture, Victorian-era scientific illustration aesthetic.",
  "ikea-manual":
    "STYLE ENFORCEMENT: Minimal black line drawings on white. Numbered step-by-step instructions like an IKEA assembly manual.",
  deconstruct:
    "STYLE ENFORCEMENT: Exploded view with callout lines and labels. NYT-style editorial infographic with annotated cross-sections.",
};

/**
 * Generate an image. Delegates to the top-tier OpenRouter client.
 *
 * `textFree` MUST be true for the hybrid renderer's background plate. Without it we
 * used to append a "copy all text EXACTLY / minimum 14pt / spell every word correctly"
 * block to a prompt that says "ABSOLUTELY NO TEXT" seven times — the wrapper argued
 * with the prompt and pushed text into a plate that is supposed to have none.
 */
export async function geminiGenerateImage(
  prompt: string,
  aspectRatio: string,
  referenceImages?: ReferenceImage[],
  styleId?: string,
  enforcementOverride?: string,
  textFree = false,
): Promise<string> {
  const enforcementText =
    enforcementOverride ??
    (styleId && STYLE_ENFORCEMENT[styleId] ? STYLE_ENFORCEMENT[styleId] : "");
  const styleEnforcement = enforcementText ? `\n\n${enforcementText}` : "";

  // Only meaningful when the model is the one drawing the glyphs. On the hybrid
  // path Satori owns every character, so this block is actively harmful.
  const textEnforcement = textFree
    ? `

FINAL INSTRUCTION — THIS IS A BACKGROUND PLATE:
- Render NO text, NO letters, NO numbers, NO glyphs of any kind.
- A separate typesetting system composites all text on top of this image.`
    : `

FINAL INSTRUCTION — TEXT QUALITY IS THE #1 PRIORITY:
- Every character must be PERFECTLY LEGIBLE — no garbled, distorted, or made-up text
- Use ONLY clean sans-serif fonts (Helvetica, Inter, Roboto, Arial)
- Copy all text EXACTLY as provided above — do not invent or hallucinate any text
- If text doesn't fit readably, REMOVE content rather than shrink font size
- Minimum font size: 14pt equivalent
- All text must have high contrast against its background
- Every word must be a real, correctly-spelled English word`;

  const fullPrompt = `${prompt}\n${textEnforcement}${styleEnforcement}`;

  const result = await renderImage(fullPrompt, {
    aspectRatio,
    references: referenceImages?.map((img) => ({
      base64: img.base64,
      mimeType: img.mimeType,
      description: img.description,
    })),
  });

  return result.imageBase64;
}

/**
 * Image-to-image edit of the plate.
 *
 * SCOPE: on the hybrid path this must not be used to correct text. Text lives in the
 * Satori layer — fix the data and re-composite, which is exact and free. Round-tripping
 * text through an image model is what produces the misspellings in the first place.
 */
export async function geminiEditImage(
  imageBase64: string,
  instruction: string,
  aspectRatio: string,
  styleEnforcement?: string,
): Promise<string> {
  const scoped = styleEnforcement
    ? `${instruction}\n\n${styleEnforcement}`
    : instruction;
  const result = await editImage(imageBase64, scoped, { aspectRatio });
  return result.imageBase64;
}
