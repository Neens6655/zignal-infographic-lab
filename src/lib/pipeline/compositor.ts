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
 * Cut a plate to its permitted rectangles. Everything outside them becomes the
 * ground colour. This is what makes "the illustration never touches the text" a
 * property of the pipeline rather than a request to the model — which, in run 7,
 * drew under the key figures on every single attempt regardless of the brief.
 */
export async function maskPlate(
  plateBase64: string,
  rects: { x: number; y: number; w: number; h: number }[],
  width: number,
  height: number,
  ground: string,
): Promise<string> {
  const plate = sharp(Buffer.from(plateBase64, 'base64')).resize(width, height, { fit: 'cover' });
  const plateBuf = await plate.png().toBuffer();
  const pieces: sharp.OverlayOptions[] = [];
  for (const r of rects) {
    const left = Math.max(0, Math.min(width - 1, Math.round(r.x)));
    const top = Math.max(0, Math.min(height - 1, Math.round(r.y)));
    const w = Math.max(1, Math.min(width - left, Math.round(r.w)));
    const h = Math.max(1, Math.min(height - top, Math.round(r.h)));
    const piece = await sharp(plateBuf).extract({ left, top, width: w, height: h }).png().toBuffer();
    pieces.push({ input: piece, left, top });
  }
  const out = await sharp({
    create: { width, height, channels: 4, background: hexToRgba(ground) },
  })
    .composite(pieces)
    .png()
    .toBuffer();
  return out.toString('base64');
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
