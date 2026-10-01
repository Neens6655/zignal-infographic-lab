/**
 * Does the plate stay out of the text? The slide layouts declare `textGround`: the
 * plate is flat white everywhere except its illustration zones, which is what lets
 * unbacked text pass the contrast gate. A declaration is a wish until something
 * measures it — this samples the plate under every text box and reports any box
 * where the model drew.
 */
import sharp from "sharp";
import type { LayoutPlan } from "../pipeline/layout-planner";
import { elementBox, backingBand } from "../pipeline/visual-compliance";
import { avgCharWidth } from "../pipeline/layout-planner";

/**
 * The box the ink actually occupies. A single-line element declares the full width it
 * MAY use (the centered hero spans the slide) but its glyphs cover only the measured
 * run, placed by its alignment. Sampling the declared box would reject every plate
 * drawn beside a left-aligned figure. Wrapped text fills its width and keeps the box.
 */
function inkBox(el: LayoutPlan["elements"][number]) {
  const box = elementBox(el);
  const text = el.text ?? "";
  const measured = text.length * el.fontSize * avgCharWidth(text, el.fontFamily);
  if (measured >= el.width) return box; // wraps: the whole width is in play
  const x1 =
    el.align === "center"
      ? el.x + (el.width - measured) / 2
      : el.align === "right"
        ? el.x + el.width - measured
        : el.x;
  return { ...box, x1, x2: x1 + measured };
}

/** Mean 8-bit luminance a text box must keep. 255 is pure white; JPEG white ~250. */
export const MIN_GROUND_LUMINANCE = 235;

export type GroundReport = {
  ok: boolean;
  offenders: { text: string; mean: number }[];
};

export async function checkPlateGround(
  plateBase64: string,
  plan: LayoutPlan,
): Promise<GroundReport> {
  const { data, info } = await sharp(Buffer.from(plateBase64, "base64"))
    .resize(plan.width, plan.height, { fit: "cover" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const offenders: GroundReport["offenders"] = [];
  for (const el of plan.elements) {
    if (!el.text?.trim()) continue;
    // Text on an opaque band (a step badge, a card) does not rely on the ground.
    if (backingBand(el, plan.bands ?? [])) continue;
    const b = inkBox(el);
    const x1 = Math.max(0, Math.floor(b.x1));
    const y1 = Math.max(0, Math.floor(b.y1));
    const x2 = Math.min(W, Math.ceil(b.x2));
    const y2 = Math.min(H, Math.ceil(b.y2));
    if (x2 <= x1 || y2 <= y1) continue;
    let sum = 0;
    let n = 0;
    for (let y = y1; y < y2; y += 2) {
      const row = y * W;
      for (let x = x1; x < x2; x += 2) {
        sum += data[row + x];
        n++;
      }
    }
    const mean = n ? sum / n : 255;
    if (mean < MIN_GROUND_LUMINANCE)
      offenders.push({ text: el.text.slice(0, 40), mean: Math.round(mean) });
  }
  const ok = offenders.length === 0;
  console.log(
    ok
      ? "[plate-ground] clean — nothing drawn under text"
      : `[plate-ground] DRAWN UNDER TEXT: ${offenders.map((o) => `"${o.text}" (${o.mean})`).join(", ")}`,
  );
  return { ok, offenders };
}
