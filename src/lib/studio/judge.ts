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

  const prompt = `You are an expert art director scoring a generated infographic for the "${style.name}" style. Score HONESTLY and use the full 0-100 range — do not default to the middle.

STYLE PASS CRITERIA (the DEFINING cues of this style):
${style.judgeRubric}

CALIBRATION (score styleConformance against the DEFINING cues, not tiny blemishes):
- 90-100: clearly and fully embodies the style; client-ready.
- 70-89: unmistakably the right style, with only minor imperfections.
- 40-69: partially right but misses a key defining cue.
- 0-39: wrong style entirely.
A single misspelled word or one small layout slip does NOT lower styleConformance — that belongs in defects and textRender. Reserve visualQuality and textRender for real problems too; a clean, correct infographic should score 85+.

Return ONLY valid JSON (no markdown fences):
{
  "styleConformance": <0-100 per calibration above>,
  "visualQuality": <0-100: composition, hierarchy, whitespace, client-ready>,
  "textRender": <0-100: is text crisp, correctly spelled, and well placed>,
  "defects": ["ONLY genuine, fixable issues — imperative, e.g. 'The label reads Sluis; it should read Source'. Empty array [] if the image is clean."]
}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/png", data: base64Data } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
      // Scoring needs no chain-of-thought; disabling it avoids empty "thought"
      // parts and makes the judge faster + cheaper.
      thinkingConfig: { thinkingBudget: 0 },
    },
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
  // gemini-2.5-flash emits "thought" parts before the answer — skip them and
  // concatenate the real text parts (parts[0] is often an empty thought).
  const parts: { text?: string; thought?: boolean }[] =
    data?.candidates?.[0]?.content?.parts ?? [];
  const raw =
    parts
      .filter((p) => p.text && !p.thought)
      .map((p) => p.text)
      .join("") ||
    parts.find((p) => p.text)?.text ||
    "";
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
  // The OCR vowel-heuristic false-positives on acronyms/units (CAGR, kWh, GDP, EV),
  // so it is NOT used to gate legibility. Real legibility comes from the two PIXEL
  // reads: the OCR model's own clarity score + the vision judge's textRender.
  const legScore = ocr.confidence;
  const numScore = readability?.score ?? 100;
  // Keep only garbled tokens that aren't plausible acronyms/units, for defect hints.
  const realGarbled = ocr.garbledText.filter((t) => {
    const w = t.replace(/[^a-zA-Z0-9]/g, "");
    return (
      !/^[A-Z0-9]{2,6}$/.test(w) &&
      !/^(kwh|km|mph|gdp|cagr|usd|eur|co2|ai|ev|rd|ceo|api|kw|mw|gw)$/i.test(w)
    );
  });

  const defects: string[] = [...vision.defects];
  if (realGarbled.length > 0) {
    defects.push(
      `Fix garbled/misspelled text — render these correctly: ${realGarbled
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

  // Legibility from the two pixel reads, not the noisy vowel heuristic. Floors are
  // tuned to visual ground truth: parchment/engraved styles are inherently lower
  // contrast than black-on-white, so a genuinely readable decorative render still passes.
  const legible =
    vision.textRender >= 68 && ocr.confidence >= 60 && realGarbled.length <= 2;
  const numbersOk = numScore >= 60;
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
