import {
  assemblePrompt,
  geminiGenerateImage,
  validateContent,
  applyStructureEdit,
} from '@/lib/pipeline';
import type { StructuredContent, RenderContext, ContentAnalysis } from '@/lib/pipeline';
import { checkRateLimit, RATE_LIMIT_TIER } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request-utils';

export const maxDuration = 60;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  // Edits are lighter — allow 40/hr (vs 10 for full generate)
  const rateCheck = await checkRateLimit(ip, false, RATE_LIMIT_TIER.edit);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '3600' } },
    );
  }

  // Reject oversized payloads (2MB limit — regenerate sends cached structured content)
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 2 * 1024 * 1024) {
    return new Response(
      JSON.stringify({ error: 'Request body too large' }),
      { status: 413, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const body = await request.json();

  if (!body.structured_content || !body.render_context) {
    return new Response(
      JSON.stringify({ error: 'structured_content and render_context are required' }),
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
        let structured: StructuredContent = body.structured_content;
        const renderCtx: RenderContext = { ...body.render_context };

        // Apply overrides
        if (body.style) renderCtx.style = body.style;
        if (body.layout) renderCtx.layout = body.layout;
        if (body.aspect_ratio) renderCtx.aspectRatio = body.aspect_ratio;

        // Content edit path — stages 2 + 2.5
        if (body.edit_instruction) {
          sendEvent('progress', { status: 'editing', progress: 15, message: 'Applying edits...' });
          structured = await applyStructureEdit(structured, body.edit_instruction);

          sendEvent('progress', { status: 'validating', progress: 35, message: 'Validating text...' });
          const { cleaned } = await validateContent(structured);
          structured = cleaned;
        }

        // Stage 3 — assemble prompt
        sendEvent('progress', { status: 'assembling', progress: 50, message: 'Assembling prompt...' });
        // Build a partial ContentAnalysis that satisfies assemblePrompt's needs
        const analysis = {
          contentType: 'overview',
          intent: renderCtx.intent,
          layout: renderCtx.layout,
          style: renderCtx.style,
          tone: renderCtx.tone,
          sectionCount: structured.sections.length,
          topics: [],
          entities: [],
          metrics: [],
          contentSources: [],
        } as ContentAnalysis;

        const prompt = await assemblePrompt(structured, analysis, renderCtx.aspectRatio, renderCtx.language);

        // Stage 4 — generate image
        sendEvent('progress', { status: 'generating', progress: 60, message: 'Rendering your infographic...' });
        const imageBase64 = await geminiGenerateImage(prompt, renderCtx.aspectRatio, [], renderCtx.style);

        const dataUrl = `data:image/png;base64,${imageBase64}`;
        sendEvent('complete', {
          image_url: dataUrl,
          download_url: dataUrl,
          metadata: {
            layout: renderCtx.layout,
            style: renderCtx.style,
            preset: 'auto',
            aspect_ratio: renderCtx.aspectRatio,
            intent: renderCtx.intent,
          },
          structured_content: structured,
          render_context: renderCtx,
        });
      } catch (err: unknown) {
        console.error('[regenerate]', err);
        sendEvent('error', { error: 'Edit failed. Please try again.' });
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
