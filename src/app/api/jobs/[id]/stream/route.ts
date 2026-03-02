const ENGINE_URL = process.env.ENGINE_API_URL || 'http://localhost:3000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const engineRes = await fetch(`${ENGINE_URL}/api/v1/jobs/${id}/stream`);

  if (!engineRes.ok || !engineRes.body) {
    return new Response('Stream unavailable', { status: 502 });
  }

  return new Response(engineRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
