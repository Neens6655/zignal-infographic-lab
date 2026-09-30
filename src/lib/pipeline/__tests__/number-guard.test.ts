/**
 * Proof that the number guard actually changes the rendered text.
 *
 * WHY THIS FILE EXISTS
 * The previous NumberGuard computed a correction list and dropped it, while provenance
 * still reported the corrections as applied. It passed every existing check, because no
 * check ever asked "did the number in the output actually change?".
 *
 * The governing question here, per the briefcast gate discipline:
 *   WHAT INPUT MAKES THIS PRINT FAIL?
 * If a bug reintroduces the dropped-variable behaviour, `applied` goes to 0 and the
 * "applies the correction" tests go red. That is the whole point.
 */
import { describe, it, expect } from "vitest";
import { applyNumberCorrections } from "../number-guard";
import type { StructuredContent } from "../types";
import type { NumberAudit, NumericalClaim } from "../../types";

function claim(over: Partial<NumericalClaim> = {}): NumericalClaim {
  return {
    value: "47",
    entity: "Revenue",
    metric: "growth",
    unit: "%",
    raw: "47%",
    ...over,
  };
}

function audit(
  contentValue: string,
  researchValue: string | null,
): NumberAudit {
  return {
    totalClaims: 1,
    exact: [],
    close: [],
    conflicting: [
      {
        contentClaim: claim({ value: contentValue }),
        researchClaim: researchValue ? claim({ value: researchValue }) : null,
        classification: "conflicting",
        divergencePct: 12,
      },
    ],
    unverified: [],
    confidenceLevel: "partially_verified",
  };
}

function content(over: Partial<StructuredContent> = {}): StructuredContent {
  return {
    title: "Market Outlook",
    subtitle: "Regional revenue growth",
    sections: [
      {
        heading: "Growth",
        keyConcept: "Revenue expanded",
        content: ["Revenue grew 47% year on year."],
        visualElement: "bar chart",
        labels: ["47% YoY"],
      },
    ],
    statsBar: [{ label: "Growth", value: "47%" }],
    designNotes: "",
    sourceAttribution: "Sources: IMF",
    ...over,
  };
}

describe("applyNumberCorrections", () => {
  it("rewrites the figure in statsBar, section content and labels", () => {
    const result = applyNumberCorrections(content(), audit("47", "52"));

    expect(result.applied).toHaveLength(1);
    expect(result.unapplied).toHaveLength(0);
    expect(result.content.statsBar[0].value).toBe("52%");
    expect(result.content.sections[0].content[0]).toBe(
      "Revenue grew 52% year on year.",
    );
    expect(result.content.sections[0].labels[0]).toBe("52% YoY");
  });

  it("does not mutate the caller's object", () => {
    const original = content();
    applyNumberCorrections(original, audit("47", "52"));

    expect(original.statsBar[0].value).toBe("47%");
    expect(original.sections[0].content[0]).toBe(
      "Revenue grew 47% year on year.",
    );
  });

  it("reports a correction as UNAPPLIED when the figure is not in the text", () => {
    const result = applyNumberCorrections(content(), audit("999", "52"));

    expect(result.applied).toHaveLength(0);
    expect(result.unapplied).toHaveLength(1);
    expect(result.unapplied[0].field).toBe("no match in rendered text");
  });

  it("will not corrupt a longer number that merely contains the target", () => {
    const c = content({
      statsBar: [{ label: "Base", value: "4700" }],
      sections: [
        {
          heading: "Scale",
          keyConcept: "Base",
          content: ["A total of 4,700 units and 147 sites."],
          visualElement: "",
          labels: [],
        },
      ],
    });
    const result = applyNumberCorrections(c, audit("47", "52"));

    // 4700, 4,700 and 147 all contain "47" and must survive untouched.
    expect(result.content.statsBar[0].value).toBe("4700");
    expect(result.content.sections[0].content[0]).toBe(
      "A total of 4,700 units and 147 sites.",
    );
    expect(result.applied).toHaveLength(0);
  });

  it("skips a conflict that has no research value to substitute", () => {
    const result = applyNumberCorrections(content(), audit("47", null));

    expect(result.applied).toHaveLength(0);
    expect(result.content.statsBar[0].value).toBe("47%");
  });

  it("is a no-op when there is no audit", () => {
    const c = content();
    const result = applyNumberCorrections(c, undefined);

    expect(result.content).toBe(c);
    expect(result.applied).toHaveLength(0);
  });
});
