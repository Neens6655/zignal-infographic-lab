import { runPipeline } from '@/lib/pipeline';

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'Content is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(event: string, data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      }

      try {
        const result = await runPipeline(
          {
            content: body.content,
            preset: body.preset,
            style: body.style,
            layout: body.layout,
            aspect_ratio: body.aspect_ratio || '16:9',
            quality: body.quality || 'normal',
            language: body.language || 'en',
            simplify: body.simplify,
          },
          (progress) => {
            sendEvent('progress', progress);
          },
        );

        const dataUrl = `data:image/png;base64,${result.imageBase64}`;
        sendEvent('complete', {
          image_url: dataUrl,
          download_url: dataUrl,
          metadata: result.metadata,
          provenance: result.provenance,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Generation failed';
        sendEvent('error', { error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
