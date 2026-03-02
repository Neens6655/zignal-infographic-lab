import { NextResponse } from 'next/server';

const ENGINE_URL = process.env.ENGINE_API_URL || 'http://localhost:3000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const engineRes = await fetch(`${ENGINE_URL}/api/v1/jobs/${id}`);
  const data = await engineRes.json();
  return NextResponse.json(data, { status: engineRes.status });
}
