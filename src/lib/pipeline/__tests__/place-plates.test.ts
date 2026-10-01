import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { placePlates, nearestAspect } from "../compositor";

async function px(b64: string, x: number, y: number) {
  const buf = await sharp(Buffer.from(b64, "base64")).extract({ left: x, top: y, width: 1, height: 1 }).raw().toBuffer();
  return [buf[0], buf[1], buf[2]];
}

describe("placePlates — contain-fit, nothing cut", () => {
  it("fits a 16:9 image inside a square rect, centred, ground elsewhere", async () => {
    const red = (await sharp({ create: { width: 160, height: 90, channels: 3, background: { r: 200, g: 0, b: 0 } } }).png().toBuffer()).toString("base64");
    const out = await placePlates([{ image: red, rect: { x: 100, y: 100, w: 200, h: 200 } }], 400, 400, "#FFFFFF");
    // 160x90 scaled to fit 200x200 -> 200x112, centred: y from 144 to 256
    expect(await px(out, 200, 200)).toEqual([200, 0, 0]);
    expect(await px(out, 200, 110)).toEqual([255, 255, 255]);
    expect(await px(out, 10, 10)).toEqual([255, 255, 255]);
  });
});

describe("nearestAspect", () => {
  it("picks the nearest supported ratio", () => {
    expect(nearestAspect(1000, 1000)).toBe("1:1");
    expect(nearestAspect(1088, 396)).toBe("21:9");
    expect(nearestAspect(400, 330)).toBe("4:3");
    expect(nearestAspect(320, 480)).toBe("2:3");
    expect(nearestAspect(300, 500)).toBe("9:16");
  });
});
