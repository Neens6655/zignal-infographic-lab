/**
 * Compositor — merges Gemini illustration layer + Satori text layer using sharp.
 * Also handles fallback: if no illustration, renders text on solid background.
 */
import sharp from 'sharp';

/**
 * Composite illustration + text overlay into final PNG.
 * @param illustrationBase64 - Gemini-generated illustration (base64, may be JPEG or PNG)
 * @param textLayerPng - Transparent PNG from Satori text renderer
 * @param width - Output width
 * @param height - Output height
 * @param backgroundColor - Fallback background color if illustration is missing
 * @returns Base64-encoded final PNG
 */
export async function compositeInfographic(
  illustrationBase64: string | null,
  textLayerPng: Buffer,
  width: number,
  height: number,
  backgroundColor: string = '#0D1B2A',
): Promise<string> {
  const start = Date.now();

  let base: sharp.Sharp;

  if (illustrationBase64) {
    // Decode base64 illustration and resize to exact dimensions
    const illustrationBuffer = Buffer.from(illustrationBase64, 'base64');
    base = sharp(illustrationBuffer).resize(width, height, { fit: 'cover' });
  } else {
    // Fallback: solid dark background
    console.warn('[compositor] No illustration — using solid background');
    base = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: hexToRgba(backgroundColor),
      },
    });
  }

  // Composite text layer on top
  const result = await base
    .composite([{
      input: textLayerPng,
      top: 0,
      left: 0,
      blend: 'over',
    }])
    .png({ quality: 90 })
    .toBuffer();

  const base64 = result.toString('base64');
  console.log(`[compositor] ${illustrationBase64 ? 'Illustration' : 'Solid bg'} + text layer → ${result.length} bytes (${Date.now() - start}ms)`);

  return base64;
}

/**
 * Place plates INSIDE their rectangles. Each image is scaled to fit entirely within
 * its rect (contain) and centred; everything else is the ground colour. The model's
 * whole canvas becomes the slide's box, so nothing it draws can be cut — run 8 passed
 * 4/4 with every illustration amputated at the top by the old crop.
 */
export async function placePlates(
  plates: { image: string; rect: { x: number; y: number; w: number; h: number } }[],
  width: number,
  height: number,
  ground: string,
): Promise<string> {
  const pieces: sharp.OverlayOptions[] = [];
  for (const { image, rect } of plates) {
    const w = Math.max(1, Math.round(rect.w));
    const h = Math.max(1, Math.round(rect.h));
    const fitted = await sharp(Buffer.from(image, 'base64'))
      .resize(w, h, { fit: 'inside', withoutEnlargement: false })
      .png()
      .toBuffer();
    const meta = await sharp(fitted).metadata();
    const pw = meta.width ?? w;
    const ph = meta.height ?? h;
    pieces.push({
      input: fitted,
      left: Math.round(rect.x + (w - pw) / 2),
      top: Math.round(rect.y + (h - ph) / 2),
    });
  }
  const out = await sharp({
    create: { width, height, channels: 4, background: hexToRgba(ground) },
  })
    .composite(pieces)
    .png()
    .toBuffer();
  return out.toString('base64');
}

/** The aspect ratio the model should compose for, nearest to the rect's own. */
export function nearestAspect(w: number, h: number): string {
  const r = w / Math.max(1, h);
  const table: [string, number][] = [
    ['21:9', 21 / 9], ['16:9', 16 / 9], ['3:2', 1.5], ['4:3', 4 / 3],
    ['1:1', 1], ['3:4', 0.75], ['2:3', 2 / 3], ['9:16', 9 / 16],
  ];
  let best = table[0];
  for (const t of table) if (Math.abs(Math.log(r / t[1])) < Math.abs(Math.log(r / best[1]))) best = t;
  return best[0];
}

function hexToRgba(hex: string): { r: number; g: number; b: number; alpha: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    alpha: 1,
  };
}
