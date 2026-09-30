/**
 * Truth gates — the two checks that make "verified infographic" a claim we can defend.
 *
 * The existing gates in `gate.ts` do not do this, despite their names:
 *   - `checkHallucination` only verifies that fields are non-empty.
 *   - `checkTraceability` only verifies that an attribution STRING exists — not that
 *     any source behind it is real, nor that any figure maps to one.
 *
 * These two are different in kind. They compare the rendered text against the claim
 * ledger and fail closed.
 *
 *   GROUNDING      every figure that will be printed resolves to a ledger row.
 *                  A figure with no row was invented. HARD FAIL.
 *
 *   INPUT FIDELITY every figure the user supplied survives unaltered, and nothing was
 *                  silently substituted for it. HARD FAIL.
 *
 * Both run PRE-RENDER, on the structured content, because that is the last moment a
 * fault is free to fix. The post-render OCR gates in `gate.ts` remain as the check that
 * the image matches the structure; these check that the structure deserves rendering.
 */
import { extractNumericalClaims } from "../research/verify";
import {
  isGrounded,
  isTrivialFigure,
  lookupValue,
  normalizeValue,
  type ClaimLedger,
} from "../research/ledger";
import type { StructuredContent } from "./types";
import type { GateResult, GateName } from "../types";

/** Every text fragment that will be typeset into the image. */
export function renderedStrings(content: StructuredContent): string[] {
  const out: string[] = [content.title, content.subtitle];
  for (const s of content.sections) {
    out.push(s.heading, s.keyConcept, ...s.content, ...s.labels);
  }
  for (const s of content.statsBar) {
    out.push(`${s.label}: ${s.value}`);
  }
  return out.filter((s) => typeof s === "string" && s.trim().length > 0);
}

/** Every non-trivial figure that will appear in the image. */
export async function renderedFigures(
  content: StructuredContent,
): Promise<{ value: string; raw: string; entity: string; metric: string }[]> {
  const claims = await extractNumericalClaims(
    renderedStrings(content).join(". "),
  );
  return claims.filter((c) => !isTrivialFigure(c.value));
}

// ── Gate: claim grounding ─────────────────────────────────────────────

/**
 * Every printed figure must trace to the ledger.
 *
 * WHAT MAKES THIS FAIL: a number in the structured content that appears in neither the
 * user's input nor any retrieved source snippet. That is the signature of an invented
 * statistic, which is the single failure this product cannot ship.
 */
export async function checkClaimGrounding(
  content: StructuredContent,
  ledger: ClaimLedger,
): Promise<GateResult> {
  const figures = await renderedFigures(content);
  const failures: string[] = [];
  let grounded = 0;

  for (const fig of figures) {
    if (isGrounded(ledger, fig.value)) {
      grounded++;
    } else {
      failures.push(
        `Ungrounded figure "${fig.raw}" (${fig.entity} ${fig.metric}) — present in neither input nor any cited source`,
      );
    }
  }

  const total = figures.length;
  const score = total > 0 ? (grounded / total) * 100 : 100;
  const passed = failures.length === 0;

  console.log(
    `[gate:grounding] ${grounded}/${total} figures traced to the ledger — ${passed ? "PASS" : "FAIL"}`,
  );

  return {
    gate: "claim-grounding",
    passed,
    score,
    details:
      total === 0
        ? "No figures to ground"
        : `${grounded}/${total} printed figures resolve to a ledger row`,
    failures,
  };
}

// ── Gate: input fidelity ──────────────────────────────────────────────

/**
 * The user's own data is authoritative and must reach the image unaltered.
 *
 * WHAT MAKES THIS FAIL: the user supplied "47%" and the output prints "52%" because
 * research disagreed. Research may annotate; it may not overwrite. When someone hands
 * this tool their own board numbers, silently correcting them is the worst thing it
 * could do.
 */
export async function checkInputFidelity(
  content: StructuredContent,
  ledger: ClaimLedger,
): Promise<GateResult> {
  const failures: string[] = [];

  if (ledger.userValues.size === 0) {
    return {
      gate: "input-fidelity",
      passed: true,
      score: 100,
      details: "No user-supplied figures — nothing to preserve",
      failures,
    };
  }

  const printed = new Set(
    (await renderedFigures(content)).map((f) => normalizeValue(f.value)),
  );

  let preserved = 0;
  for (const userValue of ledger.userValues) {
    if (printed.has(userValue)) {
      preserved++;
      continue;
    }
    const entry = lookupValue(ledger, userValue).find(
      (e) => e.origin === "user",
    );
    failures.push(
      `User-supplied figure "${entry?.raw ?? userValue}" (${entry?.entity ?? "unknown"}) is absent from the output — it may have been dropped or overwritten`,
    );
  }

  const total = ledger.userValues.size;
  const score = (preserved / total) * 100;
  const passed = failures.length === 0;

  console.log(
    `[gate:input-fidelity] ${preserved}/${total} user figures preserved — ${passed ? "PASS" : "FAIL"}`,
  );

  return {
    gate: "input-fidelity",
    passed,
    score,
    details: `${preserved}/${total} user-supplied figures reached the output unaltered`,
    failures,
  };
}

// ── Runner ────────────────────────────────────────────────────────────

/** Gate names that a percentage score cannot outvote. */
export const MANDATORY_TRUTH_GATES = new Set<GateName>([
  "claim-grounding",
  "input-fidelity",
]);

export type TruthGateReport = {
  passed: boolean;
  gates: GateResult[];
  /** Mandatory gates that failed, by name. */
  blocking: string[];
};

/**
 * Run both truth gates. A mandatory failure blocks regardless of the aggregate score —
 * the pattern taken from briefcast's `enforce_gate`, where a high percentage was
 * repeatedly able to outvote a check that mattered.
 */
export async function runTruthGates(
  content: StructuredContent,
  ledger: ClaimLedger,
): Promise<TruthGateReport> {
  const gates = [
    await checkClaimGrounding(content, ledger),
    await checkInputFidelity(content, ledger),
  ];

  const blocking = gates
    .filter((g) => !g.passed && MANDATORY_TRUTH_GATES.has(g.gate))
    .map((g) => g.gate);

  return { passed: blocking.length === 0, gates, blocking };
}
