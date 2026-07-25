/**
 * Quality judge — the bar every render must clear.
 *
 * Two instruments, combined:
 *   A. Deterministic (OCR + gates): legibility + brief-number presence.  [mandatory]
 *   B. Vision judge (Gemini Flash reads the actual PNG): style conformance,
 *      visual quality, text rendering.  (Rule: no score without a vision read.)
 *
 * A render PASSES iff every mandatory check passes AND overall >= THRESHOLD.
 * Defects are returned as imperative strings and fed verbatim into the next attempt.
 */
import { ocrInfographic } from "../pipeline/ocr";
import { runGates } from "../pipeline/gate";
import type { RenderScore, StructuredBrief, StudioStyle } from "./types";
import { QUALITY } from "./types";

const VISION_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

interface VisionVerdict {
  styleConformance: number;
  visualQuality: number;
  textRender: number;
  defects: string[];
}

async function visionJudge(
  imageBase64: string,
  style: StudioStyle,
): Promise<VisionVerdict> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("[judge] GOOGLE_API_KEY not set");

  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

  const prompt = `You are a demanding art director reviewing a generated infographic for the "${style.name}" style.

STYLE PASS CRITERIA:
${style.judgeRubric}

Score the ACTUAL image on three axes (0-100) and list concrete, imperative defects an illustrator could fix.

Return ONLY valid JSON (no markdown fences):
{
  "styleConformance": <0-100: how well it matches the style pass criteria above>,
  "visualQuality": <0-100: composition, hierarchy, whitespace, is it client-ready>,
  "textRender": <0-100: is all text crisp, correctly placed, and legible>,
  "defects": ["imperative fixes, e.g. 'Background is cream; make it pure white #FFFFFF', 'The word revenoo is misspelled; render revenue'"]
}
Be strict. If the image does not clearly satisfy the style criteria, styleConformance must be below 70.`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/png", data: base64Data } },
        ],
      },
    ],
    generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
  };

  const res = await fetch(`${VISION_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`[judge] vision API error ${res.status}`);
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  try {
    const jsonStr = raw
      .replace(/^```json?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    const parsed = JSON.parse(jsonStr.match(/\{[\s\S]*\}/)?.[0] ?? jsonStr);
    const clamp = (n: unknown) =>
      Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
    return {
      styleConformance: clamp(parsed.styleConformance),
      visualQuality: clamp(parsed.visualQuality),
      textRender: clamp(parsed.textRender),
      defects: Array.isArray(parsed.defects)
        ? parsed.defects
            .filter((d: unknown) => typeof d === "string")
            .slice(0, 8)
        : [],
    };
  } catch {
    // Judge parse failure must NOT silently pass a render — treat as a soft fail.
    console.warn(
      "[judge] vision JSON parse failed; returning conservative verdict",
    );
    return {
      styleConformance: 60,
      visualQuality: 60,
      textRender: 60,
      defects: [
        "Quality judge could not parse the render; re-render for a cleaner result.",
      ],
    };
  }
}

export async function scoreRender(
  imageBase64: string,
  brief: StructuredBrief,
  style: StudioStyle,
): Promise<RenderScore> {
  // A + B in parallel — OCR/gates and the vision read are independent.
  const [ocr, vision] = await Promise.all([
    ocrInfographic(imageBase64),
    visionJudge(imageBase64, style),
  ]);

  const gateRun = await runGates(
    brief.structured,
    undefined,
    ocr.fullText,
    ocr.numbers,
  );
  const readability = gateRun.gates.find((g) => g.gate === "readability");
  const dataIntegrity = gateRun.gates.find((g) => g.gate === "data-integrity");

  // ── deterministic component scores ──
  const garbledPenalty = Math.min(60, ocr.garbledText.length * 15);
  const legScore = Math.max(0, ocr.confidence - garbledPenalty);
  const numScore = readability?.score ?? 100;

  const defects: string[] = [...vision.defects];
  if (ocr.garbledText.length > 0) {
    defects.push(
      `Fix garbled/misspelled text — render these correctly: ${ocr.garbledText
        .slice(0, 6)
        .join(", ")}.`,
    );
  }
  for (const f of readability?.failures ?? []) defects.push(`Legibility: ${f}`);
  for (const f of dataIntegrity?.failures ?? []) defects.push(`Data: ${f}`);
  if (vision.styleConformance < QUALITY.MIN_STYLE_CONFORMANCE) {
    defects.push(
      `Style mismatch for "${style.name}". ${style.enforcement.replace(
        /^STYLE ENFORCEMENT:\s*/,
        "",
      )}`,
    );
  }

  const overall = Math.round(
    0.28 * vision.styleConformance +
      0.24 * vision.visualQuality +
      0.2 * vision.textRender +
      0.16 * legScore +
      0.12 * numScore,
  );

  const legible =
    ocr.garbledText.length === 0 && legScore >= 70 && vision.textRender >= 60;
  const numbersOk = numScore >= 70;
  const styleOk = vision.styleConformance >= QUALITY.MIN_STYLE_CONFORMANCE;
  const pass = legible && numbersOk && styleOk && overall >= QUALITY.THRESHOLD;

  return {
    overall,
    pass,
    legible,
    numbersOk,
    styleConformance: vision.styleConformance,
    visualQuality: vision.visualQuality,
    textRender: vision.textRender,
    ocrConfidence: ocr.confidence,
    // Dedup while preserving order.
    defects: [...new Set(defects)].slice(0, 10),
  };
}
