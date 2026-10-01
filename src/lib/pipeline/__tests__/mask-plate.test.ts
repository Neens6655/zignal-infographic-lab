import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { maskPlate } from "../compositor";

async function px(b64: string, x: number, y: number) {
  const buf = await sharp(Buffer.from(b64, "base64")).extract({ left: x, top: y, width: 1, height: 1 }).raw().toBuffer();
  return [buf[0], buf[1], buf[2]];
}

describe("maskPlate", () => {
  it("keeps the plate inside the rectangles and paints the ground everywhere else", async () => {
    const red = (await sharp({ create: { width: 400, height: 200, channels: 3, background: { r: 200, g: 0, b: 0 } } }).png().toBuffer()).toString("base64");
    const out = await maskPlate(red, [{ x: 100, y: 50, w: 100, h: 100 }], 400, 200, "#FFFFFF");
    expect(await px(out, 150, 100)).toEqual([200, 0, 0]); // inside
    expect(await px(out, 10, 10)).toEqual([255, 255, 255]); // outside
    expect(await px(out, 300, 150)).toEqual([255, 255, 255]); // outside
  });
});
