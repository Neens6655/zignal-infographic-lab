/**
 * Slide spec — what a consulting slide IS, before any pixel exists.
 *
 * A McKinsey slide is not a topic with bullets. It is one conclusion, stated as a
 * sentence in the title, proven by one piece of evidence beneath it, with its source
 * named. The reader should get the point from the title alone and use the body only
 * to decide whether to believe it.
 *
 * So the structurer is asked for exactly that shape, and three things are enforced
 * deterministically afterwards:
 *   - the action title is a declarative SENTENCE carrying a number or a direction,
 *     not a label ("Data Centre Capacity: An Overview" fails; "Saudi data-centre
 *     capacity will quadruple to 1.9 GW by 2030, overtaking the UAE" passes)
 *   - every key figure traces to the research ledger — the model may select figures,
 *     never invent them
 *   - the source line names real domains from the citations used
 */
import { geminiGenerate, PRO_MODEL, TEXT_MODEL } from "../pipeline/gemini";
import {
  buildLedger,
  isGrounded,
  citedSources,
  type ClaimLedger,
} from "../research/ledger";
import type { ResearchResult } from "../pipeline/types";
import { extractNumericalClaims } from "../research/verify";

export type KeyFigure = { value: string; label: string };
export type Evidence = { heading: string; body: string };

export type SlideSpec = {
  /** Small-caps tracker, top-left: "GCC DATA CENTRES" */
  tracker: string;
  /** The conclusion, as a full sentence. The whole slide exists to prove it. */
  actionTitle: string;
  /** One line of scope beneath the title. */
  subtitle: string;
  /** 1-4 numbers that carry the claim. Each must be grounded in research. */
  keyFigures: KeyFigure[];
  /** 2-4 supporting points, each a complete sentence. */
  evidence: Evidence[];
  /** 3-5 steps for the flow variant. Empty when the claim is not a process. */
  steps: string[];
  /**
   * What to DRAW, as noun phrases a vector illustrator could act on — never slide
   * text. The model copies any sentence it is given into the image; the first run
   * rendered the lane headings verbatim. "a small server rack beside a much larger
   * one, a dashed arrow from small to large" is a brief; "Saudi pipeline signals
   * convergence" is a caption.
   */
  visualBriefs: string[];
  /** "Source: vision2030.ai; PwC; HUMAIN (2025–26)" */
  sourceLine: string;
  sources: { url: string; title: string }[];
};

export class SpecError extends Error {
  constructor(
    readonly kind:
      "research_empty" | "title_not_actionable" | "figure_ungrounded" | "parse",
    message: string,
  ) {
    super(message);
    this.name = "SpecError";
  }
}

// ── Action-title gate (deterministic) ─────────────────────────────────

const DIRECTION =
  /\b(will|grow|grows|growing|rise|rises|rising|fall|falls|falling|double|doubles|triple|quadruple|overtake|overtakes|outpace|outpaces|exceed|exceeds|reach|reaches|surpass|surpasses|decline|declines|cut|cuts|lead|leads|leading|accelerat\w*|expand\w*|concentrat\w*|dominat\w*|shift\w*|drive\w*|require\w*|lag\w*|trail\w*)\b/i;

export function checkActionTitle(title: string): string[] {
  const t = title.trim();
  const problems: string[] = [];
  if (t.length < 45)
    problems.push(`too short to be a conclusion (${t.length} chars)`);
  if (t.length > 140)
    problems.push(`too long for a two-line title (${t.length} chars)`);
  if (!/[.]$/.test(t))
    problems.push("must end with a full stop — it is a sentence, not a label");
  if (/^[^:]{3,40}:\s/.test(t))
    problems.push(
      'reads as "Label: description" — state the conclusion instead',
    );
  if (!/\d/.test(t) && !DIRECTION.test(t)) {
    problems.push(
      "carries neither a number nor a direction — what is the reader meant to conclude?",
    );
  }
  const words = t.split(/\s+/);
  if (words.length < 8)
    problems.push(
      `only ${words.length} words — a conclusion needs a subject, a verb and a consequence`,
    );
  return problems;
}


/**
 * Is a figure, as the model wrote it, present in the ledger?
 *
 * The ledger stores values AFTER `extractNumericalClaims` — "$30 billion" becomes
 * 30000000000. Matching the raw digit core "30" against that is a guaranteed miss, and
 * it rejected a correctly sourced ">$30 billion" on the first live run. Run the figure
 * through the SAME extractor the ledger used, then compare like with like. A bare
 * number with no unit still gets a direct check.
 */
export async function figureIsGrounded(ledger: ClaimLedger, raw: string): Promise<boolean> {
  const claims = await extractNumericalClaims(String(raw));
  if (claims.some((c: { value: string }) => isGrounded(ledger, c.value))) return true;
  const core = String(raw).match(/\d[\d,.]*/)?.[0];
  return !!core && isGrounded(ledger, core);
}

// ── Structurer ────────────────────────────────────────────────────────

function parseJson<T>(text: string): T | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]) as T;
  } catch {
    return null;
  }
}

const PROMPT = (
  topic: string,
  research: ResearchResult,
) => `You are a McKinsey engagement manager writing ONE slide for a C-suite audience.

TOPIC: ${topic}

RESEARCH — the ONLY permitted source of figures. Every number you use must appear below, verbatim or trivially rounded. Do not add figures from memory. If the research does not support a claim, do not make it.
${research.findings.map((f) => f.slice(0, 5000)).join("\n\n")}

CITATIONS (index -> url):
${research.citations.map((c, i) => `[${i + 1}] ${c.url}`).join("\n")}

RULES OF THE HOUSE
1. The ACTION TITLE is the conclusion, written as one declarative sentence of 8-22 words that a CEO could repeat in a meeting. It MUST contain the decisive number or a clear direction (grows, overtakes, quadruples, lags). It is NOT a topic label. It ends with a full stop.
   BAD:  "GCC Data Centre Capacity: Market Overview"
   GOOD: "Saudi Arabia will quadruple data-centre capacity to 1.9 GW by 2030, overtaking the UAE."
2. KEY FIGURES: 2-4 numbers that prove the title. Each with a 2-5 word label. Values exactly as they appear in the research, with units.
3. EVIDENCE: 3-4 supporting points. Each heading is 3-6 words; each body is ONE complete sentence of 12-25 words. Executive register: specific, no adjectives doing the work of data.
4. STEPS: if the claim is a process or sequence, 3-5 steps of 3-8 words each. Otherwise an empty array.
5. VISUAL BRIEFS: 3-5 short noun-phrase descriptions of what an illustrator should DRAW to support the slide — objects, relative sizes, arrows, groupings. NO words, labels, numbers or captions in them. Describe pictures, not sentences.
   BAD:  "Saudi pipeline signals convergence"
   GOOD: "two server racks side by side, the right one taller, a rising dashed arrow from the left rack toward the right"
6. COHERENCE: the FIRST key figure and the FIRST evidence point must directly support the action title's direction. If the title says one market will overtake another, lead with the evidence for the overtaking, not with the incumbent's lead. A reader who sees only the first figure and first heading must reach the title's conclusion.
7. SOURCE LINE: "Source: " followed by the 2-4 publisher domains you actually drew from, semicolon-separated, then the year range in brackets.
8. TRACKER: 2-4 words, uppercase, naming the theme.

Return ONLY this JSON:
{
  "tracker": "...",
  "actionTitle": "...",
  "subtitle": "one line of scope, 8-16 words",
  "keyFigures": [{"value": "467 MW", "label": "Saudi live capacity, Q1 2026"}],
  "evidence": [{"heading": "...", "body": "..."}],
  "steps": [],
  "visualBriefs": ["..."],
  "sourceLine": "Source: ...",
  "citationIdx": [1, 11, 12]
}`;


/** The shape the structurer returns, before it is accepted as a SlideSpec. */
export type DraftSpec = Omit<SlideSpec, "sources" | "visualBriefs"> & {
  visualBriefs?: string[];
  citationIdx?: number[];
};

/**
 * The review gate, as a pure function so it can be tested on the real path.
 *
 * The first version of this logic lived inline in buildSlideSpec and was "fixed" by a
 * script that announced success without checking — the old code stayed, two live runs
 * died on phantoms (">$30 billion", "2030,"), and the test I wrote passed because it
 * exercised a helper nothing called. This function IS the gate; test this.
 */
export async function reviewSpec(j: DraftSpec, ledger: ClaimLedger): Promise<string[]> {
  const problems: string[] = [];

  // Gate 1: the title must be a conclusion.
  for (const p of checkActionTitle(j.actionTitle)) problems.push(`actionTitle: ${p}`);

  // Gate 2: every key figure must be grounded in the research ledger — compared
  // through the SAME extractor the ledger used, never a bare digit regex.
  const figures = Array.isArray(j.keyFigures) ? j.keyFigures : [];
  if (figures.length < 2) problems.push(`keyFigures: need 2-4, got ${figures.length}`);
  for (const f of figures) {
    if (!(await figureIsGrounded(ledger, f.value))) {
      problems.push(
        `keyFigures: "${f.value}" is not in the research — remove it or replace it with a figure that is`,
      );
    }
  }

  // Gate 3: a title that cites a number must cite a grounded one. Years are not
  // claims. The extractor returns clean values, so "2030," and "2028." no longer
  // masquerade as figures.
  const titleClaims = await extractNumericalClaims(j.actionTitle);
  for (const c of titleClaims) {
    if (/^(19|20)\d{2}$/.test(c.value)) continue;
    if (!isGrounded(ledger, c.value)) {
      problems.push(`actionTitle: the figure "${c.raw}" is not in the research`);
    }
  }
  // Years written as bare tokens may not reach the extractor at all; nothing to do.

  const evidence = Array.isArray(j.evidence) ? j.evidence : [];
  if (evidence.length < 2) problems.push(`evidence: need 3-4 points, got ${evidence.length}`);

  // Gate 4: visual briefs exist and describe pictures, not slide text.
  const briefs = Array.isArray(j.visualBriefs) ? j.visualBriefs : [];
  if (briefs.length < 2) problems.push(`visualBriefs: need 3-5 drawing descriptions, got ${briefs.length}`);
  for (const b of briefs) {
    if (/\d/.test(String(b))) problems.push(`visualBriefs: "${b}" contains a number — describe the picture, not the data`);
    const lower = String(b).toLowerCase();
    if ([j.actionTitle, ...evidence.map((e) => e.heading)].some((t) => t && lower.includes(String(t).toLowerCase().slice(0, 24)))) {
      problems.push(`visualBriefs: "${b}" repeats slide text — the model will draw those words`);
    }
  }

  return problems;
}

export async function buildSlideSpec(
  topic: string,
  research: ResearchResult,
): Promise<{ spec: SlideSpec; ledger: ClaimLedger; attempts: number }> {
  if (research.citations.length === 0) {
    // Fail closed. A consulting slide with no sources is not a draft, it is a liability.
    throw new SpecError(
      "research_empty",
      "Research returned no citations. A slide cannot be built without sources — refusing rather than inventing.",
    );
  }

  const ledger = await buildLedger({
    userContent: "",
    citations: research.citations,
    findings: research.findings,
  });

  let lastProblems: string[] = [];
  let feedback = "";

  for (let attempt = 1; attempt <= 3; attempt++) {
    const prompt =
      PROMPT(topic, research) +
      (feedback
        ? `\n\nTHE PREVIOUS ATTEMPT FAILED REVIEW:\n${feedback}\nFix exactly these and return the full JSON again.`
        : "");

    let text: string;
    try {
      text = await geminiGenerate(PRO_MODEL, prompt);
    } catch {
      text = await geminiGenerate(TEXT_MODEL, prompt);
    }

    const j = parseJson<DraftSpec>(text);
    if (!j || !j.actionTitle) {
      lastProblems = ["structurer returned no parseable JSON"];
      feedback = lastProblems.join("\n");
      continue;
    }

    const problems = await reviewSpec(j, ledger);
    const figures = Array.isArray(j.keyFigures) ? j.keyFigures : [];
    const evidence = Array.isArray(j.evidence) ? j.evidence : [];

    if (problems.length === 0) {
      const idx = (j.citationIdx ?? []).filter(
        (n) => n >= 1 && n <= research.citations.length,
      );
      const used = idx.length
        ? idx.map((n) => research.citations[n - 1])
        : citedSources(
            ledger,
            figures.map((f) => f.value),
          ).map((s) => ({ url: s.url, title: s.title }));

      const spec: SlideSpec = {
        tracker: String(j.tracker || topic)
          .toUpperCase()
          .slice(0, 40),
        actionTitle: j.actionTitle.trim(),
        subtitle: String(j.subtitle || "").trim(),
        keyFigures: figures
          .slice(0, 4)
          .map((f) => ({ value: String(f.value), label: String(f.label) })),
        evidence: evidence
          .slice(0, 4)
          .map((e) => ({ heading: String(e.heading), body: String(e.body) })),
        steps: Array.isArray(j.steps) ? j.steps.slice(0, 5).map(String) : [],
        visualBriefs: Array.isArray(j.visualBriefs) ? j.visualBriefs.slice(0, 5).map(String) : [],
        sourceLine: String(j.sourceLine || "").trim(),
        sources: used.map((c) => ({ url: c.url, title: c.title || c.url })),
      };
      console.log(
        `[slide-spec] accepted on attempt ${attempt}: "${spec.actionTitle}"`,
      );
      return { spec, ledger, attempts: attempt };
    }

    lastProblems = problems;
    feedback = problems.map((p) => `- ${p}`).join("\n");
    console.warn(`[slide-spec] attempt ${attempt} rejected:\n${feedback}`);
  }

  throw new SpecError(
    lastProblems.some((p) => p.startsWith("actionTitle"))
      ? "title_not_actionable"
      : "figure_ungrounded",
    `Slide spec failed review after 3 attempts: ${lastProblems.join("; ")}`,
  );
}
