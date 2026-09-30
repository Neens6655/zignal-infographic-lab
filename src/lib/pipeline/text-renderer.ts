/**
 * Text Renderer — Satori + resvg: renders text as a transparent PNG overlay.
 * All text is pixel-perfect. No AI model involved.
 */
import satori from "satori";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { readFileSync } from "fs";
import { join } from "path";
import type { LayoutPlan, TextElement, Band } from "./layout-planner";

// ── WASM initialization (once per cold start) ────────────────
let wasmInitialized = false;
async function ensureWasm() {
  if (wasmInitialized) return;
  try {
    const wasmPath = join(
      process.cwd(),
      "node_modules",
      "@resvg",
      "resvg-wasm",
      "index_bg.wasm",
    );
    const wasmData = readFileSync(wasmPath);
    await initWasm(wasmData);
    wasmInitialized = true;
    console.log("[text-renderer] resvg WASM initialized");
  } catch (err) {
    // May already be initialized from a previous invocation
    if (err instanceof Error && err.message.includes("Already initialized")) {
      wasmInitialized = true;
    } else {
      throw err;
    }
  }
}

// ── Font loading (cached) ────────────────────────────────────
type SatoriFont = {
  name: string;
  data: ArrayBuffer;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style: "normal" | "italic";
};
let fontsLoaded: SatoriFont[] | null = null;

function loadFonts() {
  if (fontsLoaded) return fontsLoaded;

  const fontsDir = join(process.cwd(), "src", "lib", "fonts");

  fontsLoaded = [
    // Arimo is metrically identical to Arial and Apache-2.0 licensed, so the output
    // has Arial's presentation look while remaining legal to bundle and deploy.
    // Shipping arial.ttf itself would be a Monotype licence violation.
    { name: 'Arial', data: readFileSync(join(fontsDir, 'Arimo-Regular.woff')).buffer as ArrayBuffer, weight: 400 as const, style: 'normal' as const },
    { name: 'Arial', data: readFileSync(join(fontsDir, 'Arimo-Bold.woff')).buffer as ArrayBuffer, weight: 700 as const, style: 'normal' as const },
    { name: 'Arial Narrow', data: readFileSync(join(fontsDir, 'Arimo-Regular.woff')).buffer as ArrayBuffer, weight: 400 as const, style: 'normal' as const },
    { name: 'Arial Narrow', data: readFileSync(join(fontsDir, 'Arimo-Bold.woff')).buffer as ArrayBuffer, weight: 700 as const, style: 'normal' as const },
  ];

  console.log(`[text-renderer] Loaded ${fontsLoaded.length} font variants`);
  return fontsLoaded;
}

// ── Text element to Satori JSX ───────────────────────────────

const LINE_HEIGHT = 1.35;

/**
 * An opaque rectangle painted beneath the text. This is what guarantees the header
 * and footer stay legible: the image model has no idea where our type lands, and on
 * the first institutional render it painted a navy band straight under a near-black
 * title. We paint our own backing rather than hope.
 */
function bandToJSX(b: Band) {
  return {
    type: "div",
    props: {
      style: {
        position: "absolute",
        left: b.x,
        top: b.y,
        width: b.width,
        height: b.height,
        backgroundColor: b.color,
        ...(b.borderColor
          ? { border: `${b.borderWidth ?? 2}px solid ${b.borderColor}` }
          : {}),
        ...(b.borderRadius ? { borderRadius: b.borderRadius } : {}),
        ...(b.rotate ? { transform: `rotate(${b.rotate}deg)` } : {}),
        display: "flex",
      },
      children: [],
    },
  };
}

function elementToJSX(el: TextElement) {
  const lines = el.maxLines ?? 1;
  return {
    type: "div",
    props: {
      style: {
        position: "absolute",
        left: el.x,
        top: el.y,
        width: el.width,
        // An explicit height plus overflow:hidden makes clipping PREDICTABLE, so a
        // fitting miscalculation costs a trimmed line rather than a sentence sliced
        // through a word. The planner is now responsible for never handing us text
        // that needs clipping at all.
        maxHeight: Math.ceil(el.fontSize * LINE_HEIGHT * lines),
        fontSize: el.fontSize,
        fontWeight: el.fontWeight,
        fontFamily: el.fontFamily,
        lineHeight: LINE_HEIGHT,
        color: el.color,
        textAlign: el.align,
        overflow: "hidden",
        // Always allow wrapping. `nowrap` on single-line elements is what produced
        // mid-word amputation with no ellipsis, because Satori has no
        // text-overflow: ellipsis to fall back on.
        whiteSpace: "normal",
        display: "flex",
        flexWrap: "wrap",
      },
      children: [el.text || ""],
    },
  };
}

// ── Main render function ─────────────────────────────────────

export async function renderTextLayer(layout: LayoutPlan): Promise<Buffer> {
  await ensureWasm();
  const fonts = loadFonts();
  const start = Date.now();

  // Build the JSX tree — a transparent container with absolutely positioned text
  // Filter out elements with empty text to prevent Satori errors
  const validElements = layout.elements.filter(
    (el) => el.text && el.text.trim().length > 0,
  );

  const tree = {
    type: "div",
    props: {
      style: {
        width: layout.width,
        height: layout.height,
        position: "relative",
        display: "flex",
      },
      // Bands FIRST so every text element composites on top of a known colour.
      children: [
        ...(layout.bands ?? []).map(bandToJSX),
        ...validElements.map(elementToJSX),
      ],
    },
  } as any;

  // Satori: JSX → SVG
  const svg = await satori(tree, {
    width: layout.width,
    height: layout.height,
    fonts,
  });

  // resvg: SVG → PNG with transparency
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: layout.width },
    background: "rgba(0, 0, 0, 0)", // Transparent
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  console.log(
    `[text-renderer] Rendered ${layout.elements.length} text elements → ${pngBuffer.length} bytes PNG (${Date.now() - start}ms)`,
  );

  return Buffer.from(pngBuffer);
}
