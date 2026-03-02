import { NextResponse } from 'next/server';

const ENGINE_URL = process.env.ENGINE_API_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  const body = await request.json();

  const engineRes = await fetch(`${ENGINE_URL}/api/v1/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await engineRes.json();
  return NextResponse.json(data, { status: engineRes.status });
}
