import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { layoutCentered } from "../slide-layouts";
import { checkPlateGround } from "../plate-ground-check";
import type { SlideSpec } from "../slide-spec";

const SPEC: SlideSpec = {
  tracker: "TEST",
  actionTitle: "Saudi capacity will triple to 1.5 GW by 2030, overtaking the UAE on live supply.",
  subtitle: "A subtitle",
  keyFigures: [{ value: "1.5 GW", label: "target" }, { value: "467 MW", label: "live" }],
  evidence: [{ heading: "One", body: "Body one." }, { heading: "Two", body: "Body two." }],
  steps: [],
  visualBriefs: ["a rack", "a map", "a chart"],
  sourceLine: "Source: test",
  sources: [],
};

async function solid(r: number, g: number, b: number) {
  const buf = await sharp({
    create: { width: 1920, height: 1080, channels: 3, background: { r, g, b } },
  })
    .png()
    .toBuffer();
  return buf.toString("base64");
}

describe("checkPlateGround — the textGround promise, measured", () => {
  it("REJECTS a plate that is drawn everywhere (red control)", async () => {
    const r = await checkPlateGround(await solid(200, 30, 30), layoutCentered(SPEC));
    expect(r.ok).toBe(false);
    expect(r.offenders.length).toBeGreaterThan(3);
  });
  it("ACCEPTS a pure white plate (null control)", async () => {
    const r = await checkPlateGround(await solid(255, 255, 255), layoutCentered(SPEC));
    expect(r.ok, JSON.stringify(r.offenders)).toBe(true);
  });
  it("ACCEPTS a plate drawn in the lower right, away from the text", async () => {
    const plan = layoutCentered(SPEC);
    const block = await sharp({
      create: { width: 500, height: 220, channels: 3, background: { r: 27, g: 58, b: 107 } },
    })
      .png()
      .toBuffer();
    const png = await sharp({
      create: { width: 1920, height: 1080, channels: 3, background: { r: 255, g: 255, b: 255 } },
    })
      .composite([{ input: block, left: 1300, top: 740 }])
      .png()
      .toBuffer();
    const r = await checkPlateGround(png.toString("base64"), plan);
    expect(r.ok, JSON.stringify(r.offenders)).toBe(true);
  });
});
