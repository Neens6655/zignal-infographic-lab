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

function hexToRgba(hex: string): { r: number; g: number; b: number; alpha: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    alpha: 1,
  };
}
