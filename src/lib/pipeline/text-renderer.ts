/**
 * Text Renderer — Satori + resvg: renders text as a transparent PNG overlay.
 * All text is pixel-perfect. No AI model involved.
 */
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { LayoutPlan, TextElement } from './layout-planner';

// ── WASM initialization (once per cold start) ────────────────
let wasmInitialized = false;
async function ensureWasm() {
  if (wasmInitialized) return;
  try {
    const wasmPath = join(process.cwd(), 'node_modules', '@resvg', 'resvg-wasm', 'index_bg.wasm');
    const wasmData = readFileSync(wasmPath);
    await initWasm(wasmData);
    wasmInitialized = true;
    console.log('[text-renderer] resvg WASM initialized');
  } catch (err) {
    // May already be initialized from a previous invocation
    if (err instanceof Error && err.message.includes('Already initialized')) {
      wasmInitialized = true;
    } else {
      throw err;
    }
  }
}

// ── Font loading (cached) ────────────────────────────────────
type SatoriFont = { name: string; data: ArrayBuffer; weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900; style: 'normal' | 'italic' };
let fontsLoaded: SatoriFont[] | null = null;

function loadFonts() {
  if (fontsLoaded) return fontsLoaded;

  const fontsDir = join(process.cwd(), 'src', 'lib', 'fonts');

  fontsLoaded = [
    { name: 'IBM Plex Mono', data: readFileSync(join(fontsDir, 'IBMPlexMono-Regular.woff')).buffer as ArrayBuffer, weight: 400 as const, style: 'normal' as const },
    { name: 'IBM Plex Mono', data: readFileSync(join(fontsDir, 'IBMPlexMono-Bold.woff')).buffer as ArrayBuffer, weight: 700 as const, style: 'normal' as const },
    { name: 'IBM Plex Sans', data: readFileSync(join(fontsDir, 'IBMPlexSans-Regular.woff')).buffer as ArrayBuffer, weight: 400 as const, style: 'normal' as const },
    { name: 'IBM Plex Sans', data: readFileSync(join(fontsDir, 'IBMPlexSans-Bold.woff')).buffer as ArrayBuffer, weight: 700 as const, style: 'normal' as const },
  ];

  console.log(`[text-renderer] Loaded ${fontsLoaded.length} font variants`);
  return fontsLoaded;
}

// ── Text element to Satori JSX ───────────────────────────────

function elementToJSX(el: TextElement) {
  return {
    type: 'div',
    props: {
      style: {
        position: 'absolute',
        left: el.x,
        top: el.y,
        width: el.width,
        fontSize: el.fontSize,
        fontWeight: el.fontWeight,
        fontFamily: el.fontFamily,
        color: el.color,
        overflow: 'hidden',
        whiteSpace: el.maxLines === 1 ? 'nowrap' : 'pre-wrap',
        display: 'flex',
      },
      children: [el.text || ''],
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
  const validElements = layout.elements.filter(el => el.text && el.text.trim().length > 0);

  const tree = {
    type: 'div',
    props: {
      style: {
        width: layout.width,
        height: layout.height,
        position: 'relative',
        display: 'flex',
      },
      children: validElements.map(elementToJSX),
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
    fitTo: { mode: 'width', value: layout.width },
    background: 'rgba(0, 0, 0, 0)', // Transparent
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  console.log(`[text-renderer] Rendered ${layout.elements.length} text elements → ${pngBuffer.length} bytes PNG (${Date.now() - start}ms)`);

  return Buffer.from(pngBuffer);
}
