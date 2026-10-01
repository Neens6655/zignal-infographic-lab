/**
 * Render the text layer of every slide variant on a flat white ground — no model,
 * no spend — so the typography and geometry can be checked by eye before a run.
 *
 *   npx tsx scripts/deck/preview-text-layer.ts [spec.json] [outDir]
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
process.chdir(ROOT);

async function main() {
  const [specPath, outDirArg] = process.argv.slice(2);
  const { SLIDE_LAYOUTS, SLIDE_VARIANTS } =
    await import("../../src/lib/slide/slide-layouts");
  const { renderTextLayer } =
    await import("../../src/lib/pipeline/text-renderer");
  const { compositeInfographic } =
    await import("../../src/lib/pipeline/compositor");
  const { checkVisualCompliance, formatCompliance } =
    await import("../../src/lib/pipeline/visual-compliance");

  const spec =
    specPath && existsSync(specPath)
      ? JSON.parse(readFileSync(specPath, "utf-8"))
      : {
          tracker: "GCC DATA CENTRES",
          actionTitle:
            "Saudi Arabia's data-centre capacity will more than triple to 1.5 GW by 2030, driven by over $18 billion in targeted investment.",
          subtitle:
            "Comparing live capacity, national targets, and major operators in the region's two leading markets.",
          keyFigures: [
            { value: "1.5 GW", label: "Saudi 2030 target" },
            { value: "467 MW", label: "Saudi live capacity, Q1 2026" },
            { value: ">$18 billion", label: "KSA targeted investment" },
            { value: "3.3 GW", label: "Projected GCC capacity" },
          ],
          evidence: [
            {
              heading: "Capacity triples by 2030",
              body: "The national target implies more than three times today's live base within four years.",
            },
            {
              heading: "Investment is committed",
              body: "Over eighteen billion dollars of targeted programmes back the build-out.",
            },
            {
              heading: "Region follows",
              body: "Total GCC capacity is projected to exceed three gigawatts in the same window.",
            },
          ],
          steps: [
            "Secure land and power",
            "Build and commission",
            "Fill with sovereign and cloud demand",
          ],
          visualBriefs: ["racks", "map", "chart"],
          sourceLine:
            "Source: vision2030.ai; aranca.com; pwc.com; agbi.com [2024–2026]",
          sources: [],
        };

  const outDir = outDirArg || join("renders", "slides", "_text-preview");
  mkdirSync(outDir, { recursive: true });
  for (const v of SLIDE_VARIANTS) {
    const plan = SLIDE_LAYOUTS[v](spec);
    const c = checkVisualCompliance(plan);
    const png = await renderTextLayer(plan);
    const out = await compositeInfographic(
      null,
      png,
      plan.width,
      plan.height,
      plan.backgroundColor,
    );
    const file = join(outDir, `${v}.png`);
    writeFileSync(file, Buffer.from(out, "base64"));
    console.log(
      `${v.padEnd(9)} ${c.passed ? "PASS" : "FAIL"} ${formatCompliance(c)} → ${file}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
