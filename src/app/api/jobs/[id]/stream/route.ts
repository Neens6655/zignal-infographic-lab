export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Generation now uses inline streaming from POST /api/generate
  // This endpoint is kept for backwards compatibility
  return new Response('event: error\ndata: {"error":"Use POST /api/generate for streaming"}\n\n', {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
