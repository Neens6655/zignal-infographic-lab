/**
 * Proof that the plate check can go RED.
 *
 * It exists because a render passed every layout assertion — font floors, 5.32:1
 * contrast, zero overlaps — and shipped with NO ILLUSTRATION AT ALL. The gate measured
 * the plan and reported on the image. WHAT INPUT MAKES THIS PRINT FAIL: a flat fill.
 */
import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { checkPlate, MIN_INK_STDEV } from "../plate-check";

async function solid(hex: { r: number; g: number; b: number }) {
  const buf = await sharp({
    create: { width: 320, height: 180, channels: 3, background: hex },
  })
    .png()
    .toBuffer();
  return buf.toString("base64");
}

async function drawn() {
  // A pale ground with substantial dark structure on it.
  const base = sharp({
    create: { width: 320, height: 180, channels: 3, background: { r: 242, g: 232, b: 213 } },
  });
  const bars = Buffer.from(
    `<svg width="320" height="180">
       <rect x="10" y="20" width="120" height="120" fill="#14202E"/>
       <rect x="150" y="40" width="140" height="90" fill="#1B5FA8"/>
       <circle cx="250" cy="150" r="22" fill="#805C1C"/>
     </svg>`,
  );
  const buf = await base
    .composite([{ input: bars, top: 0, left: 0 }])
    .png()
    .toBuffer();
  return buf.toString("base64");
}

describe("checkPlate", () => {
  it("FAILS a flat cream fill — the blank artifact that shipped as a PASS", async () => {
    const r = await checkPlate(await solid({ r: 242, g: 232, b: 213 }));
    expect(r.ok).toBe(false);
    expect(r.inkStdev).toBeLessThan(MIN_INK_STDEV);
    expect(r.reason).toMatch(/flat fill/);
  });

  it("FAILS a flat white fill", async () => {
    const r = await checkPlate(await solid({ r: 255, g: 255, b: 255 }));
    expect(r.ok).toBe(false);
  });

  it("PASSES a plate with real structure on it", async () => {
    const r = await checkPlate(await drawn());
    expect(r.ok, JSON.stringify(r)).toBe(true);
    expect(r.coverage).toBeGreaterThan(0.04);
  });

  it("is INCONCLUSIVE, not a failure, when the bytes are unreadable", async () => {
    const r = await checkPlate("not-an-image");
    expect(r.ok).toBe(true);
    expect(r.reason).toMatch(/inconclusive/);
  });
});
