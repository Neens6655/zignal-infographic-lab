/**
 * Gemini API helpers — text generation and image generation.
 */
import type { ReferenceImage } from './types';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function getApiKey(): string {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY is not configured');
  return key;
}

export const TEXT_MODEL = 'gemini-2.5-flash';
export const IMAGE_MODEL = 'gemini-3.1-flash-image-preview';

export async function geminiGenerate(model: string, prompt: string, responseModalities?: string[]): Promise<string> {
  const url = `${GEMINI_BASE}/models/${model}:generateContent`;
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: responseModalities
      ? { responseModalities }
      : { maxOutputTokens: 8192 },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': getApiKey(),
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
  const textPart = parts.find((p: any) => p.text && !p.thought) || parts.find((p: any) => p.text);
  return textPart?.text || '';
}

// Style enforcement map — key visual rules repeated at the end of prompt
// (models pay most attention to the beginning and end of prompts)
const STYLE_ENFORCEMENT: Record<string, string> = {
  'executive-institutional': 'STYLE ENFORCEMENT: This MUST be a clean, white-background, McKinsey/JP Morgan-style research brief. Background is WHITE (#FFFFFF). Navy header/footer bars. Clean sans-serif typography. NO colorful illustrations, NO cartoon characters, NO playful elements. Think: printed boardroom handout.',
  'corporate-memphis': 'STYLE ENFORCEMENT: Use flat geometric characters with bold solid colors. Corporate Memphis / tech illustration style. NO photorealistic elements.',
  'bold-graphic': 'STYLE ENFORCEMENT: Swiss poster aesthetic. Bold typography, maximum impact, limited color palette. Strong geometric shapes.',
  'technical-schematic': 'STYLE ENFORCEMENT: Blueprint grid aesthetic. Technical diagram style with process flows and connection lines. Dark background with light lines.',
  'aerial-explainer': 'STYLE ENFORCEMENT: Isometric 3D drone-view perspective. Cutaway architectural style showing systems from above.',
  'ui-wireframe': 'STYLE ENFORCEMENT: Clean data dashboard wireframe. Dark background, neon accent colors, chart-heavy. No illustrations.',
  'knolling': 'STYLE ENFORCEMENT: Top-down flat-lay photography style. Objects arranged at perfect right angles on neutral background.',
  'subway-map': 'STYLE ENFORCEMENT: Transit map style with colored lines connecting nodes. Clean geometric paths like a metro map.',
  'chalkboard': 'STYLE ENFORCEMENT: White chalk sketches on dark green chalkboard background. Hand-drawn sketch-note style.',
  'aged-academia': 'STYLE ENFORCEMENT: Sepia tones, classical engraving style. Aged paper texture, Victorian-era scientific illustration aesthetic.',
  'ikea-manual': 'STYLE ENFORCEMENT: Minimal black line drawings on white. Numbered step-by-step instructions like an IKEA assembly manual.',
  'deconstruct': 'STYLE ENFORCEMENT: Exploded view with callout lines and labels. NYT-style editorial infographic with annotated cross-sections.',
};

export async function geminiGenerateImage(
  prompt: string,
  aspectRatio: string,
  referenceImages?: ReferenceImage[],
  styleId?: string,
): Promise<string> {
  const url = `${GEMINI_BASE}/models/${IMAGE_MODEL}:generateContent`;

  const styleEnforcement = styleId && STYLE_ENFORCEMENT[styleId] ? `\n\n${STYLE_ENFORCEMENT[styleId]}` : '';

  // Append mandatory text-quality enforcement as the final instruction
  const textEnforcement = `

FINAL INSTRUCTION — TEXT QUALITY IS THE #1 PRIORITY:
- Every character must be PERFECTLY LEGIBLE — no garbled, distorted, or made-up text
- Use ONLY clean sans-serif fonts (Helvetica, Inter, Roboto, Arial)
- Copy all text EXACTLY as provided above — do not invent or hallucinate any text
- If text doesn't fit readably, REMOVE content rather than shrink font size
- Minimum font size: 14pt equivalent
- All text must have high contrast against its background
- Every word must be a real, correctly-spelled English word`;

  const fullPrompt = `${prompt}\n${textEnforcement}${styleEnforcement}\n\nAspect ratio: ${aspectRatio}.`;

  // Build multimodal parts array — reference images + text prompt
  const parts: any[] = [];

  if (referenceImages && referenceImages.length > 0) {
    parts.push({ text: 'REFERENCE IMAGES — Use these for visual context about what the topic looks like. Do NOT copy these images. Use them only as visual reference for accuracy of real-world objects, landmarks, and subjects:' });
    for (const img of referenceImages) {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64,
        },
      });
      if (img.description) {
        parts.push({ text: `(Reference: ${img.description})` });
      }
    }
    parts.push({ text: '---\nNow generate the infographic based on the following prompt:\n' });
  }

  parts.push({ text: fullPrompt });

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': getApiKey(),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini image generation error (${res.status}): ${err}`);
  }

  const data = await res.json();
  for (const candidate of data.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }
  }
  throw new Error('No image data in Gemini response');
}
