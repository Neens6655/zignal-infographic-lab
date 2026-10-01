/**
 * The gate, tested on its REAL path.
 *
 * Two live runs died on phantoms — ">$30 billion" and "2030," / "2028." / "2030." —
 * every one a correct figure rejected by my own normalisation. The first test I wrote
 * for the fix passed while the bug stayed live, because it exercised a helper that
 * nothing called. These tests call `reviewSpec`, which IS the gate buildSlideSpec runs.
 */
import { describe, it, expect } from "vitest";
import { buildLedger } from "../../research/ledger";
import { reviewSpec, checkActionTitle, type DraftSpec } from "../slide-spec";

const CITATION = {
  url: "https://www.pwc.com/m1/en/data-centres-2025.html",
  title: "PwC Middle East data centres 2025",
  snippet: "",
  provider: "pwc.com",
  tier: 1 as const,
};
const FINDINGS = [
  "Saudi Arabia had 467 MW of operational capacity in Q1 2026.[1] Announced investment exceeds $30 billion through 2030.[1] HUMAIN targets 1.9 GW by 2030.[1]",
];

function draft(over: Partial<DraftSpec> = {}): DraftSpec {
  return {
    tracker: "GCC DATA CENTRES",
    actionTitle:
      "Saudi Arabia will quadruple data-centre capacity to 1.9 GW by 2030, overtaking the UAE.",
    subtitle: "Live capacity, investment and operators across the Gulf",
    keyFigures: [
      { value: "467 MW", label: "Saudi live capacity, Q1 2026" },
      { value: ">$30 billion", label: "Announced investment to 2030" },
      { value: "1.9 GW", label: "HUMAIN 2030 target" },
    ],
    evidence: [
      {
        heading: "Capacity is concentrated",
        body: "Two markets hold most of the region's live capacity today.",
      },
      {
        heading: "Investment is committed",
        body: "Announced programmes exceed thirty billion dollars through the decade.",
      },
      {
        heading: "One operator leads",
        body: "HUMAIN's stated target would make it the largest regional operator.",
      },
    ],
    steps: [],
    visualBriefs: [
      "two server racks side by side, the right one taller, a rising dashed arrow between them",
      "a map outline with two highlighted regions and a cluster of small building icons in each",
      "a horizontal timeline of three growing bars",
    ],
    sourceLine: "Source: pwc.com (2025–26)",
    ...over,
  };
}

async function ledger() {
  return buildLedger({
    userContent: "",
    citations: [CITATION],
    findings: FINDINGS,
  });
}

describe("reviewSpec — the run-1 and run-2 phantoms, on the real gate", () => {
  it("ACCEPTS a correct draft: '>$30 billion', '1.9 GW', a title ending 'by 2030.'", async () => {
    const problems = await reviewSpec(draft(), await ledger());
    expect(problems, problems.join("\n")).toHaveLength(0);
  });

  it("does not treat a year followed by punctuation as an ungrounded figure", async () => {
    for (const title of [
      "Saudi capacity will reach 1.9 GW by 2030, overtaking the UAE in regional data-centre scale.",
      "Saudi capacity will reach 1.9 GW by 2028. Investment commitments already exceed the UAE's.",
    ]) {
      const problems = await reviewSpec(
        draft({ actionTitle: title }),
        await ledger(),
      );
      expect(
        problems.filter((p) => /20(28|30)/.test(p)),
        title,
      ).toHaveLength(0);
    }
  });

  it("STILL rejects an invented key figure", async () => {
    const problems = await reviewSpec(
      draft({
        keyFigures: [
          { value: "467 MW", label: "x" },
          { value: "$7.2 billion", label: "invented" },
        ],
      }),
      await ledger(),
    );
    expect(problems.some((p) => p.includes("$7.2 billion"))).toBe(true);
  });

  it("STILL rejects an invented figure in the title", async () => {
    const problems = await reviewSpec(
      draft({
        actionTitle:
          "Saudi Arabia will add 812 MW of data-centre capacity by 2030, overtaking the UAE.",
      }),
      await ledger(),
    );
    expect(problems.some((p) => p.includes("812 MW"))).toBe(true);
  });

  it("rejects a topic label as the title", async () => {
    const problems = await reviewSpec(
      draft({ actionTitle: "GCC Data Centre Capacity: Market Overview" }),
      await ledger(),
    );
    expect(problems.some((p) => p.startsWith("actionTitle"))).toBe(true);
  });
});

describe("checkActionTitle", () => {
  it("rejects a sentence with no number and no direction", () => {
    const p = checkActionTitle(
      "Data centres are an important part of the regional technology landscape today.",
    );
    expect(p.some((x) => x.includes("neither a number nor a direction"))).toBe(
      true,
    );
  });
});
