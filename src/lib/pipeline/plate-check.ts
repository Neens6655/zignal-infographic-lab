/**
 * Plate check — does the generated illustration actually contain a picture?
 *
 * WHY THIS EXISTS
 * The layout gate measures the PLAN. It passed an annotated-diagram render with flying
 * colours — font floors clear, contrast 5.32:1, zero overlaps — while the delivered
 * image had NO ILLUSTRATION AT ALL. The model had taken "leave plain pale background"
 * literally and returned a near-empty plate, and nothing in the pipeline was looking at
 * pixels, so the page shipped as a PASS.
 *
 * That is the blank-artifact failure this estate keeps repeating, one layer further in:
 * a gate that measures an input and reports on an output.
 *
 * Two deterministic measurements on the actual bytes, no model involved:
 *
 *   INK      standard deviation across channels. A flat fill has ~0. A drawing has
 *            structure, and structure has variance.
 *   COVERAGE the share of the plate that differs from its own background colour, so a
 *            tiny mark in one corner cannot pass for a diagram.
 *
 * A plate failing either is not usable, and the caller re-rolls it rather than
 * compositing text over an empty field.
 */
import sharp from "sharp";

/** Below this mean channel stdev the plate is a flat fill, not a drawing. */
export const MIN_INK_STDEV = 8;
/** Below this share of non-background pixels there is no diagram worth the name. */
export const MIN_COVERAGE = 0.04;

export type PlateReport = {
  ok: boolean;
  inkStdev: number;
  coverage: number;
  reason?: string;
};

export async function checkPlate(imageBase64: string): Promise<PlateReport> {
  try {
    const buf = Buffer.from(imageBase64, "base64");
    const img = sharp(buf);

    const stats = await img.stats();
    const channels = stats.channels.slice(0, 3);
    const inkStdev =
      channels.reduce((sum, c) => sum + c.stdev, 0) /
      Math.max(1, channels.length);

    // Coverage: downsample hard, then count pixels far from the modal background.
    const W = 96;
    const { data, info } = await sharp(buf)
      .resize(W, W, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const ch = info.channels;
    const total = info.width * info.height;

    // Modal colour, coarsely bucketed, as the background estimate.
    const buckets = new Map<string, number>();
    for (let i = 0; i < total; i++) {
      const o = i * ch;
      const key = `${data[o] >> 4}|${data[o + 1] >> 4}|${data[o + 2] >> 4}`;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    let modal = "";
    let modalCount = 0;
    for (const [k, v] of buckets) {
      if (v > modalCount) {
        modalCount = v;
        modal = k;
      }
    }
    const [mr, mg, mb] = modal
      .split("|")
      .map((v) => (parseInt(v, 10) << 4) + 8);

    let different = 0;
    for (let i = 0; i < total; i++) {
      const o = i * ch;
      const d =
        Math.abs(data[o] - mr) +
        Math.abs(data[o + 1] - mg) +
        Math.abs(data[o + 2] - mb);
      if (d > 48) different++;
    }
    const coverage = different / total;

    const okInk = inkStdev >= MIN_INK_STDEV;
    const okCov = coverage >= MIN_COVERAGE;

    const report: PlateReport = {
      ok: okInk && okCov,
      inkStdev: Number(inkStdev.toFixed(2)),
      coverage: Number(coverage.toFixed(4)),
    };
    if (!okInk) {
      report.reason = `plate is a flat fill (ink stdev ${report.inkStdev} < ${MIN_INK_STDEV})`;
    } else if (!okCov) {
      report.reason = `plate is ${Math.round(coverage * 100)}% drawn, below the ${Math.round(MIN_COVERAGE * 100)}% minimum`;
    }

    console.log(
      `[plate] ink=${report.inkStdev} coverage=${Math.round(coverage * 100)}% — ${report.ok ? "OK" : "EMPTY: " + report.reason}`,
    );
    return report;
  } catch (err) {
    // A measurement that cannot run is INCONCLUSIVE, not a pass. Say so, and let the
    // caller proceed rather than lose a paid render to a broken instrument.
    console.warn(
      "[plate] check failed, treating as inconclusive:",
      err instanceof Error ? err.message : err,
    );
    return {
      ok: true,
      inkStdev: -1,
      coverage: -1,
      reason: "plate check inconclusive",
    };
  }
}
