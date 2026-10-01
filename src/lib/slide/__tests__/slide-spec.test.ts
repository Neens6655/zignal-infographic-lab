/**
 * The two strings that killed the first live run, as permanent falsifiers.
 *
 * Both were correct output rejected by my gate: ">$30 billion" because the ledger
 * stores it multiplier-expanded and I compared the bare "30"; "2030," because the
 * year-skip saw the trailing comma. A gate that rejects correct output burns the
 * attempt budget and produces nothing — worse than no gate.
 */
import { describe, it, expect } from "vitest";
import { buildLedger } from "../../research/ledger";
import { figureIsGrounded, checkActionTitle } from "../slide-spec";

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

describe("figureIsGrounded — the run-1 phantoms", () => {
  it('accepts ">$30 billion" when the research says "$30 billion"', async () => {
    const ledger = await buildLedger({ userContent: "", citations: [CITATION], findings: FINDINGS });
    expect(await figureIsGrounded(ledger, ">$30 billion")).toBe(true);
  });

  it('accepts "467 MW" and "1.9 GW" as written', async () => {
    const ledger = await buildLedger({ userContent: "", citations: [CITATION], findings: FINDINGS });
    expect(await figureIsGrounded(ledger, "467 MW")).toBe(true);
    expect(await figureIsGrounded(ledger, "1.9 GW")).toBe(true);
  });

  it("STILL rejects a figure the research never mentioned", async () => {
    const ledger = await buildLedger({ userContent: "", citations: [CITATION], findings: FINDINGS });
    expect(await figureIsGrounded(ledger, "$7.2 billion")).toBe(false);
    expect(await figureIsGrounded(ledger, "812 MW")).toBe(false);
  });
});

describe("checkActionTitle", () => {
  it("accepts a conclusion with a year and a direction", () => {
    expect(
      checkActionTitle("Saudi Arabia will quadruple data-centre capacity to 1.9 GW by 2030, overtaking the UAE."),
    ).toHaveLength(0);
  });

  it("rejects a topic label", () => {
    const p = checkActionTitle("GCC Data Centre Capacity: Market Overview");
    expect(p.length).toBeGreaterThan(0);
  });

  it("rejects a sentence with no number and no direction", () => {
    const p = checkActionTitle("Data centres are an important part of the regional technology landscape today.");
    expect(p.some((x) => x.includes("neither a number nor a direction"))).toBe(true);
  });
});
