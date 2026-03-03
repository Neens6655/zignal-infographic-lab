import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type SatoriFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 700;
  style: 'normal';
};

let fontCache: SatoriFont[] | null = null;

export async function loadFonts(): Promise<SatoriFont[]> {
  if (fontCache) return fontCache;

  const fontsDir = path.join(process.cwd(), 'public', 'fonts');

  const specs: { file: string; weight: 400 | 500 | 700 }[] = [
    { file: 'IBMPlexMono-Regular.woff', weight: 400 },
    { file: 'IBMPlexMono-Medium.woff', weight: 500 },
    { file: 'IBMPlexMono-Bold.woff', weight: 700 },
  ];

  const results = await Promise.all(
    specs.map(async ({ file, weight }) => {
      try {
        const data = await readFile(path.join(fontsDir, file));
        return {
          name: 'IBM Plex Mono',
          data: data.buffer as ArrayBuffer,
          weight,
          style: 'normal' as const,
        };
      } catch {
        return null;
      }
    }),
  );

  fontCache = results.filter(Boolean) as SatoriFont[];
  return fontCache;
}
