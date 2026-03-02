import { NextResponse } from 'next/server';

const ENGINE_URL = process.env.ENGINE_API_URL || 'http://localhost:3000';

export async function GET() {
  try {
    const [presetsRes, layoutsRes, stylesRes] = await Promise.all([
      fetch(`${ENGINE_URL}/api/v1/presets`),
      fetch(`${ENGINE_URL}/api/v1/layouts`),
      fetch(`${ENGINE_URL}/api/v1/styles`),
    ]);

    const catalog = {
      presets: (await presetsRes.json()).presets,
      layouts: (await layoutsRes.json()).layouts,
      styles: (await stylesRes.json()).styles,
    };

    return NextResponse.json(catalog, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch {
    return NextResponse.json({ error: 'Engine unavailable' }, { status: 502 });
  }
}
