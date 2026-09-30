/**
 * Proof that the truth gates can go RED.
 *
 * WHY THIS FILE IS THE IMPORTANT ONE
 * This estate has three incidents on record where a suite went green on broken output:
 * a full gate suite passing a BLANK page, an interaction harness printing "27/27 PASS"
 * while 26 clicks timed out, and six automations wired to files that did not exist.
 * The pattern each time was a check with no input that could make it fail.
 *
 * So the governing question, asked of both gates here:
 *   WHAT INPUT MAKES THIS PRINT FAIL?
 *
 * Build one clean payload that passes, then poison it once per gate and assert that
 * exactly that gate turns red. Plus a structural lock: every name in
 * MANDATORY_TRUTH_GATES must actually be returned by some gate — the "PARITY" vs
 * "BACKTEST_AGENT_PARITY" typo once made three checks silently non-mandatory.
 */
import { describe, it, expect } from "vitest";
import {
  runTruthGates,
  checkClaimGrounding,
  checkInputFidelity,
  MANDATORY_TRUTH_GATES,
} from "../truth-gate";
import { buildLedger, EMPTY_LEDGER } from "../../research/ledger";
import type { StructuredContent } from "../types";
import type { SourceCitation, GateName } from "../../types";

const CITATION: SourceCitation = {
  url: "https://www.imf.org/en/Publications/WEO",
  title: "IMF World Economic Outlook",
  snippet:
    "Regional revenue grew 47% year on year, while operating margin reached 23% across the surveyed firms.",
  provider: "imf.org",
  tier: 1,
};

/** Content whose every figure is present in the citation snippet above. */
function cleanContent(
  over: Partial<StructuredContent> = {},
): StructuredContent {
  return {
    title: "Regional Market Outlook",
    subtitle: "Revenue and margin, year on year",
    sections: [
      {
        heading: "Revenue",
        keyConcept: "Top-line expansion",
        content: ["Revenue grew 47% year on year."],
        visualElement: "bar chart",
        labels: ["47% YoY"],
      },
      {
        heading: "Margin",
        keyConcept: "Operating leverage",
        content: ["Operating margin reached 23%."],
        visualElement: "line",
        labels: ["23% margin"],
      },
    ],
    statsBar: [{ label: "Growth", value: "47%" }],
    designNotes: "",
    sourceAttribution: "Sources: IMF World Economic Outlook",
    ...over,
  };
}

describe("truth gates — clean payload", () => {
  it("passes both gates when every figure is cited and no user data was supplied", async () => {
    const ledger = await buildLedger({
      userContent: "",
      citations: [CITATION],
    });
    const report = await runTruthGates(cleanContent(), ledger);

    expect(report.passed).toBe(true);
    expect(report.blocking).toHaveLength(0);
  });

  it("passes when the user supplied the figures and they survive", async () => {
    const userContent = "Our revenue grew 47% and margin reached 23%.";
    const ledger = await buildLedger({ userContent, citations: [] });
    const report = await runTruthGates(cleanContent(), ledger);

    expect(report.passed).toBe(true);
  });
});

describe("POISON 1 — an invented figure", () => {
  it("turns claim-grounding RED", async () => {
    const ledger = await buildLedger({
      userContent: "",
      citations: [CITATION],
    });
    const poisoned = cleanContent({
      statsBar: [{ label: "Growth", value: "89%" }], // 89 appears in no source
    });

    const gate = await checkClaimGrounding(poisoned, ledger);

    expect(gate.passed).toBe(false);
    expect(gate.failures.join(" ")).toMatch(/89/);
    expect(gate.failures.join(" ")).toMatch(/Ungrounded/);
  });

  it("blocks the whole run, not just the one gate", async () => {
    const ledger = await buildLedger({
      userContent: "",
      citations: [CITATION],
    });
    const poisoned = cleanContent({
      statsBar: [{ label: "Growth", value: "89%" }],
    });

    const report = await runTruthGates(poisoned, ledger);

    expect(report.passed).toBe(false);
    expect(report.blocking).toContain("claim-grounding");
  });
});

describe("POISON 2 — the user's own figure overwritten by research", () => {
  it("turns input-fidelity RED", async () => {
    // The user said 47%. Research said 52%. The output printed 52%.
    const userContent = "Our revenue grew 47% this year.";
    const researchCitation: SourceCitation = {
      ...CITATION,
      snippet: "Sector revenue grew 52% year on year.",
    };
    const ledger = await buildLedger({
      userContent,
      citations: [researchCitation],
    });

    const overwritten = cleanContent({
      sections: [
        {
          heading: "Revenue",
          keyConcept: "Top-line expansion",
          content: ["Revenue grew 52% year on year."],
          visualElement: "bar chart",
          labels: ["52% YoY"],
        },
      ],
      statsBar: [{ label: "Growth", value: "52%" }],
    });

    const gate = await checkInputFidelity(overwritten, ledger);

    expect(gate.passed).toBe(false);
    expect(gate.failures.join(" ")).toMatch(/47/);
  });
});

describe("structural locks", () => {
  it("every MANDATORY_TRUTH_GATES name is actually returned by a gate", async () => {
    const ledger = await buildLedger({
      userContent: "",
      citations: [CITATION],
    });
    const report = await runTruthGates(cleanContent(), ledger);
    const returned = new Set<GateName>(report.gates.map((g) => g.gate));

    for (const name of MANDATORY_TRUTH_GATES) {
      expect(returned.has(name)).toBe(true);
    }
  });

  it("an empty ledger fails closed on content that has figures", async () => {
    // A research stage that returned nothing must not wave the content through.
    const gate = await checkClaimGrounding(cleanContent(), EMPTY_LEDGER);

    expect(gate.passed).toBe(false);
    expect(gate.failures.length).toBeGreaterThan(0);
  });

  it("does not flag years or single digits as ungrounded claims", async () => {
    const ledger = await buildLedger({
      userContent: "",
      citations: [CITATION],
    });
    const withYear = cleanContent({
      subtitle: "Fiscal year 2026, across 3 regions",
      statsBar: [{ label: "Growth", value: "47%" }],
      sections: [
        {
          heading: "Revenue",
          keyConcept: "Expansion",
          content: ["Revenue grew 47% year on year."],
          visualElement: "",
          labels: [],
        },
      ],
    });

    const gate = await checkClaimGrounding(withYear, ledger);

    expect(gate.passed).toBe(true);
  });
});

describe("ledger construction", () => {
  it("refuses to create a research row without a source URL", async () => {
    const noUrl: SourceCitation = { ...CITATION, url: "" };
    const ledger = await buildLedger({ userContent: "", citations: [noUrl] });

    // The citation is skipped entirely rather than admitted unsourced.
    expect(ledger.entries).toHaveLength(0);
  });

  it("marks user figures as authoritative and researched ones as traceable", async () => {
    const ledger = await buildLedger({
      userContent: "Our margin is 23%.",
      citations: [CITATION],
    });

    const userRows = ledger.entries.filter((e) => e.origin === "user");
    const researchRows = ledger.entries.filter((e) => e.origin === "research");

    expect(userRows.length).toBeGreaterThan(0);
    expect(researchRows.length).toBeGreaterThan(0);
    // Every research row carries a URL — that is the point of the ledger.
    expect(researchRows.every((r) => !!r.sourceUrl)).toBe(true);
  });
});
