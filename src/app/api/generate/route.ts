import { runPipeline } from '@/lib/pipeline';
import { checkRateLimit } from '@/lib/rate-limit';
import { saveGeneration } from '@/lib/telemetry';
import { createClient } from '@/lib/supabase/server';
import { getClientIp, hashIp } from '@/lib/request-utils';

export const maxDuration = 120;

export async function POST(request: Request) {
  // Rate limiting
  const ip = getClientIp(request);

  let userId: string | undefined;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  } catch {
    // No auth session — treat as anonymous
  }

  const rateCheck = checkRateLimit(ip, !!userId);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '3600',
          'X-RateLimit-Limit': String(rateCheck.limit),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  // Reject oversized payloads (1MB limit)
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 1024 * 1024) {
    return new Response(
      JSON.stringify({ error: 'Request body too large' }),
      { status: 413, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const body = await request.json();

  if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'Content is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const encoder = new TextEncoder();
  const startTime = Date.now();

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

        // Fire-and-forget telemetry — never blocks the response
        const durationMs = Date.now() - startTime;
        saveGeneration({
          seed: result.provenance?.seed || 'unknown',
          contentHash: result.provenance?.contentHash || 'unknown',
          preset: result.metadata?.preset,
          style: result.metadata?.style,
          layout: result.metadata?.layout,
          aspectRatio: result.metadata?.aspect_ratio || body.aspect_ratio || '16:9',
          complianceScore: result.provenance?.compliance?.score,
          researchQueries: result.provenance?.research?.queriesRun,
          researchFindings: result.provenance?.research?.findingsCount,
          sourceUrls: result.provenance?.research?.sourceUrls,
          topics: result.provenance?.topics,
          pipelineTrace: result.provenance?.pipeline,
          durationMs,
          ipHash: hashIp(ip),
          userId,
        }).catch(() => {});
      } catch (err: unknown) {
        console.error('[generate]', err);
        sendEvent('error', { error: 'Generation failed. Please try again.' });
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
      'X-RateLimit-Limit': String(rateCheck.limit),
      'X-RateLimit-Remaining': String(rateCheck.remaining),
    },
  });
}
