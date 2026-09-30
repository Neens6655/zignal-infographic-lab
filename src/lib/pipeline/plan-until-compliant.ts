/**
 * The compliance loop: plan, measure, degrade, re-measure — until the page clears
 * the bar or we run out of honest moves.
 *
 * This is the "run a quality gate before producing any output and loop until the
 * target is hit" requirement, made executable. It runs BEFORE the image call, so a
 * sub-par page costs nothing to reject — and crucially it CANNOT be outvoted by a
 * score, because there is no score here, only assertions.
 *
 * The degradation ladder is ordered by what a boardroom page can most afford to lose:
 *
 *   1. fewer body bullets per panel   (least harmful — detail, not structure)
 *   2. fewer panels                   (loses a section, keeps type legible)
 *   3. both, at the floor             (last resort)
 *
 * If even the smallest plan fails, we do NOT render. A page that cannot be laid out
 * legibly is not a page, and shipping it flagged would still put an unreadable
 * document in front of a client.
 */
import {
  planLayout,
  type LayoutPlan,
  type PaletteName,
} from "./layout-planner";
import {
  checkVisualCompliance,
  formatCompliance,
  type ComplianceReport,
} from "./visual-compliance";
import type { StructuredContent } from "./types";

export type CompliantPlan = {
  plan: LayoutPlan;
  report: ComplianceReport;
  /** Each attempt, in order, for the pipeline trace. */
  attempts: { maxPanels: number; maxItems: number; verdict: string }[];
  degraded: boolean;
};

/** Ordered from richest to sparsest. Every rung is a page we would still be happy to ship. */
const LADDER: { maxPanels: number; maxItems: number }[] = [
  { maxPanels: 4, maxItems: 2 },
  { maxPanels: 4, maxItems: 1 },
  { maxPanels: 3, maxItems: 2 },
  { maxPanels: 3, maxItems: 1 },
  { maxPanels: 2, maxItems: 2 },
  { maxPanels: 2, maxItems: 1 },
];

export class LayoutNotCompliantError extends Error {
  constructor(
    message: string,
    readonly report: ComplianceReport,
  ) {
    super(message);
    this.name = "LayoutNotCompliantError";
  }
}

export function planUntilCompliant(
  content: StructuredContent,
  aspectRatio: string,
  palette: PaletteName,
): CompliantPlan {
  const attempts: CompliantPlan["attempts"] = [];
  let last: { plan: LayoutPlan; report: ComplianceReport } | null = null;

  for (let i = 0; i < LADDER.length; i++) {
    const rung = LADDER[i];
    const plan = planLayout(content, aspectRatio, palette, {
      maxPanels: rung.maxPanels,
      maxItemsPerPanel: rung.maxItems,
    });
    const report = checkVisualCompliance(plan);
    attempts.push({
      maxPanels: rung.maxPanels,
      maxItems: rung.maxItems,
      verdict: formatCompliance(report),
    });
    last = { plan, report };

    console.log(
      `[compliance] attempt ${i + 1}/${LADDER.length} (${rung.maxPanels} panels, ${rung.maxItems} items): ${formatCompliance(report)}`,
    );

    if (report.passed) {
      return { plan, report, attempts, degraded: i > 0 };
    }

    // Only keep degrading if the issues are ones degradation can actually fix.
    // A palette fault or a structurally empty page will not improve by shrinking.
    const fixable = report.issues.some(
      (issue) =>
        issue.severity === "blocker" &&
        (issue.repair === "fewer_sections" || issue.repair === "fewer_lines"),
    );
    if (!fixable) break;
  }

  const report = last!.report;
  const blockers = report.issues.filter((i) => i.severity === "blocker");
  throw new LayoutNotCompliantError(
    `Layout failed visual compliance after ${attempts.length} attempt(s): ` +
      blockers
        .slice(0, 4)
        .map((b) => `${b.check} — ${b.detail}`)
        .join("; "),
    report,
  );
}
