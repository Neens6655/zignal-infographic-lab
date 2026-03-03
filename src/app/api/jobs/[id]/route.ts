import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Generation now uses inline streaming — job polling is not needed
  return NextResponse.json({ job_id: id, status: 'complete', progress: 100 });
}
