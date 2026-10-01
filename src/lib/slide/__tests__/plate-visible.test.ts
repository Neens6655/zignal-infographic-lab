/**
 * The plate must reach the final PNG. This runs the real text renderer and the real
 * compositor on a synthetic solid-red plate: if red survives, the illustration is
 * visible; if the output equals the no-plate composite, the text layer is covering it.
 * Six runs scored slides whose illustration never appeared. This is the test that
 * would have failed on run 1.
 */
import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { layoutCentered } from "../slide-layouts";
import { renderTextLayer } from "../../pipeline/text-renderer";
import { compositeInfographic } from "../../pipeline/compositor";
import type { SlideSpec } from "../slide-spec";

const SPEC: SlideSpec = {
  tracker: "TEST",
  actionTitle: "Saudi capacity will triple to 1.5 GW by 2030, overtaking the UAE on live supply.",
  subtitle: "A subtitle",
  keyFigures: [
    { value: "1.5 GW", label: "target" },
    { value: "467 MW", label: "live" },
  ],
  evidence: [
    { heading: "One", body: "Body one." },
    { heading: "Two", body: "Body two." },
  ],
  steps: [],
  visualBriefs: ["a rack", "a map", "a chart"],
  sourceLine: "Source: test",
  sources: [],
};

describe("plate visibility through the live composite path", () => {
  it("a solid red plate is visible in the final slide", async () => {
    const plan = layoutCentered(SPEC);
    const textPng = await renderTextLayer(plan);
    const red = await sharp({
      create: { width: plan.width, height: plan.height, channels: 3, background: { r: 220, g: 0, b: 0 } },
    })
      .png()
      .toBuffer();
    const withPlate = await compositeInfographic(red.toString("base64"), textPng, plan.width, plan.height, plan.backgroundColor);
    const withoutPlate = await compositeInfographic(null, textPng, plan.width, plan.height, plan.backgroundColor);
    expect(withPlate).not.toBe(withoutPlate);

    // Sample the illustration zone (right half, mid-height): it must be red.
    const px = await sharp(Buffer.from(withPlate, "base64"))
      .extract({ left: Math.round(plan.width * 0.75), top: Math.round(plan.height * 0.5), width: 1, height: 1 })
      .raw()
      .toBuffer();
    expect(px[0], "red channel").toBeGreaterThan(180);
    expect(px[1], "green channel").toBeLessThan(60);
  }, 30000);
});
