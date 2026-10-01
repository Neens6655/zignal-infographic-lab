/**
 * Blind-reader test — the scoring function for a consulting slide.
 *
 * WHY THIS IS THE FIRST THING BUILT
 * Every gate before this measured hygiene: font floors, contrast, overlaps, whether a
 * figure had a source. A slide can pass all of them and explain nothing — which is
 * what shipped. The question a C-suite reader actually asks is simpler and harder:
 * "What is this telling me, and do I believe it?"
 *
 * So the test is: show the finished slide to a vision model WITH NO OTHER CONTEXT and
 * ask what it says. Then compare the answer to what the slide was supposed to say.
 * If a model with nothing but the pixels cannot state the claim and read the figures,
 * neither can an executive glancing at it in a boardroom.
 *
 * Two stages, deliberately separated so the reader is genuinely blind:
 *   1. EXTRACT — vision call, no spec provided. "What is the claim? What figures do
 *      you see? What source? Is there text inside the illustration?"
 *   2. GRADE   — text-only call that compares the blind extraction against the spec.
 *
 * Mandatory (any failure = FAIL regardless of score):
 *   - the extracted claim matches the action title's meaning
 *   - every key figure on the spec was read back
 *   - no text was found inside the illustration (the model drew words we did not set)
 */
import type { SlideSpec } from "./slide-spec";

const OPENROUTER = "https://openrouter.ai/api/v1/chat/completions";
/** Cheap, fast, and demonstrably sees what is on a slide. Pro is not needed here. */
export const READER_MODEL = "google/gemini-2.5-flash";

export type BlindExtraction = {
  claim: string;
  figures: string[];
  source: string;
  textInIllustration: boolean;
  fiveSecondClarity: number; // 1-5, the reader's own estimate
  raw: string;
};

export type BlindReaderReport = {
  passed: boolean;
  score: number; // 0-100
  mandatory: {
    claimMatches: boolean;
    figuresRead: { figure: string; read: boolean }[];
    noPlateText: boolean;
  };
  clarity: number;
  extraction: BlindExtraction;
  defects: string[];
  costUsd: number;
};

function key(): string {
  const k = process.env.OPENROUTER_API_KEY;
  if (!k) throw new Error("OPENROUTER_API_KEY is not configured");
  return k;
}

async function chat(
  messages: unknown[],
  maxTokens = 500,
): Promise<{ text: string; cost: number }> {
  const res = await fetch(OPENROUTER, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: READER_MODEL,
      max_tokens: maxTokens,
      messages,
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok)
    throw new Error(
      `blind-reader HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`,
    );
  const j = await res.json();
  return {
    text: j.choices?.[0]?.message?.content ?? "",
    cost: Number(j.usage?.cost ?? 0),
  };
}

function parseJson<T>(text: string): T | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]) as T;
  } catch {
    return null;
  }
}

// ── Stage 1: blind extraction ─────────────────────────────────────────

export async function extractBlind(
  imageBase64: string,
): Promise<BlindExtraction & { cost: number }> {
  const { text, cost } = await chat(
    [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are an executive looking at one slide from a consulting deck. You have NO other context.

Answer strictly from what you can read on the slide, as JSON:
{
  "claim": "the slide's main takeaway, in one sentence, in your own words",
  "figures": ["every number with its unit that you can read, e.g. '467 MW', '1.9 GW', '$7bn'"],
  "source": "the source line if any, else ''",
  "text_in_illustration": true or false — are there words, labels or numbers drawn INSIDE the picture/diagram itself, as opposed to the typeset text around it? Look carefully at the illustration area.,
  "five_second_clarity": 1-5 — could a busy executive get the point in five seconds? 5 = instantly, 1 = no idea
}`,
          },
          {
            type: "image_url",
            image_url: { url: `data:image/png;base64,${imageBase64}` },
          },
        ],
      },
    ],
    600,
  );

  const j = parseJson<{
    claim?: string;
    figures?: string[];
    source?: string;
    text_in_illustration?: boolean;
    five_second_clarity?: number;
  }>(text);

  return {
    claim: j?.claim ?? "",
    figures: Array.isArray(j?.figures) ? j!.figures.map(String) : [],
    source: j?.source ?? "",
    textInIllustration: j?.text_in_illustration === true,
    fiveSecondClarity: Math.max(
      1,
      Math.min(5, Number(j?.five_second_clarity ?? 1)),
    ),
    raw: text,
    cost,
  };
}

// ── Stage 2: grade against the spec ───────────────────────────────────

function normNum(s: string): string {
  return s
    .toLowerCase()
    .replace(/[,\s]/g, "")
    .replace(/^\$/, "")
    .replace(/percent/, "%");
}

function figureWasRead(figure: string, read: string[]): boolean {
  const target = normNum(figure);
  // Match on the numeric core so "467 MW" matches "467MW" and "~467 MW".
  const core = target.match(/\d[\d.]*/)?.[0];
  if (!core) return read.some((r) => normNum(r).includes(target));
  return read.some((r) => normNum(r).includes(core));
}

export async function gradeAgainstSpec(
  extraction: BlindExtraction,
  spec: SlideSpec,
): Promise<{ claimMatches: boolean; reasoning: string; cost: number }> {
  const { text, cost } = await chat(
    [
      {
        role: "user",
        content: `A slide was designed to make this claim:
  INTENDED: "${spec.actionTitle}"

A reader who saw only the slide (no other context) summarised it as:
  READ: "${extraction.claim}"

Does the READ summary convey the INTENDED conclusion — same subject, same direction, and the same magnitude if one is stated?

MATCH if the reader got the conclusion, even if they ALSO mention supporting detail from the rest of the slide (drivers, other markets, operators, evidence). A slide carries evidence; a reader who absorbs it is reading well, not wrongly. Extra information is never a reason to fail.

NO MATCH only if the conclusion itself is missing, reversed, or vague: a different subject, the opposite direction, a materially different magnitude, or a topic-only summary ("this is about data centres") with no conclusion.

Answer as JSON: {"matches": true/false, "reasoning": "one sentence"}`,
      },
    ],
    200,
  );
  const j = parseJson<{ matches?: boolean; reasoning?: string }>(text);
  return {
    claimMatches: j?.matches === true,
    reasoning: j?.reasoning ?? text.slice(0, 200),
    cost,
  };
}

// ── The test ──────────────────────────────────────────────────────────

export const PASS_SCORE = 80;

export async function blindReaderTest(
  imageBase64: string,
  spec: SlideSpec,
): Promise<BlindReaderReport> {
  const extraction = await extractBlind(imageBase64);
  const grade = await gradeAgainstSpec(extraction, spec);

  const figuresRead = spec.keyFigures.map((f) => ({
    figure: f.value,
    read: figureWasRead(f.value, extraction.figures),
  }));
  const allFiguresRead = figuresRead.every((f) => f.read);
  const noPlateText = !extraction.textInIllustration;

  const defects: string[] = [];
  if (!grade.claimMatches) {
    defects.push(
      `Claim not conveyed. Reader understood: "${extraction.claim}" — ${grade.reasoning}`,
    );
  }
  for (const f of figuresRead) {
    if (!f.read)
      defects.push(`Key figure "${f.figure}" was not legible to the reader`);
  }
  if (!noPlateText) {
    defects.push(
      "The illustration contains text the model drew itself — unverified words on a verified slide",
    );
  }
  if (extraction.fiveSecondClarity <= 2) {
    defects.push(
      `Reader rated five-second clarity ${extraction.fiveSecondClarity}/5`,
    );
  }

  // Score: mandatory items dominate; clarity is the tie-breaker.
  const figureShare = figuresRead.length
    ? figuresRead.filter((f) => f.read).length / figuresRead.length
    : 1;
  const score = Math.round(
    (grade.claimMatches ? 45 : 0) +
      figureShare * 30 +
      (noPlateText ? 10 : 0) +
      ((extraction.fiveSecondClarity - 1) / 4) * 15,
  );

  const passed =
    grade.claimMatches && allFiguresRead && noPlateText && score >= PASS_SCORE;

  console.log(
    `[blind-reader] ${passed ? "PASS" : "FAIL"} ${score}/100 | claim=${grade.claimMatches ? "OK" : "MISS"} figures=${figuresRead.filter((f) => f.read).length}/${figuresRead.length} plateText=${noPlateText ? "none" : "FOUND"} clarity=${extraction.fiveSecondClarity}/5` +
      (grade.claimMatches ? "" : `
[blind-reader]   read: "${extraction.claim}"
[blind-reader]   why: ${grade.reasoning}`),
  );

  return {
    passed,
    score,
    mandatory: { claimMatches: grade.claimMatches, figuresRead, noPlateText },
    clarity: extraction.fiveSecondClarity,
    extraction,
    defects,
    costUsd: extraction.cost + grade.cost,
  };
}
