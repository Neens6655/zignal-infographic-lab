import { runStudio } from "@/lib/studio";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-utils";

export const maxDuration = 300;

/**
 * Studio 4-up generation. Streams per-style progress + attempt scores, then a
 * final `complete` event with all four gated variants. (Storage layers in next;
 * for now images are returned as data URLs so the engine can be verified live.)
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  let userId: string | undefined;

  const rateCheck = await checkRateLimit(ip, !!userId);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
      {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "3600" },
      },
    );
  }

  const body = await request.json().catch(() => ({}));
  if (
    !body.content ||
    typeof body.content !== "string" ||
    body.content.trim().length === 0
  ) {
    return new Response(JSON.stringify({ error: "Content is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: Record<string, unknown>) {
        try {
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          );
        } catch {
          /* stream closed */
        }
      }

      const heartbeat = setInterval(
        () => send("heartbeat", { ts: Date.now() }),
        5_000,
      );

      try {
        const { variants } = await runStudio(body.content, {
          aspectRatio: body.aspect_ratio || "16:9",
          language: body.language || "en",
          maxAttempts:
            typeof body.max_attempts === "number"
              ? body.max_attempts
              : undefined,
          onEvent: (ev) => {
            if (ev.type === "variant_complete") {
              // Stream the finished tile immediately (progressive reveal).
              send("variant", {
                style: ev.style,
                image_url: `data:image/png;base64,${ev.result.imageBase64}`,
                score: ev.result.score,
                attempts: ev.result.attempts,
                passed: ev.result.passed,
                flagged: ev.result.flagged,
              });
            } else {
              send(ev.type, ev as unknown as Record<string, unknown>);
            }
          },
        });

        send("complete", {
          variants: variants.map((v) => ({
            style: v.style,
            image_url: `data:image/png;base64,${v.imageBase64}`,
            score: v.score,
            attempts: v.attempts,
            passed: v.passed,
            flagged: v.flagged,
          })),
        });
      } catch (err: unknown) {
        console.error("[studio/generate]", err);
        send("error", {
          error: err instanceof Error ? err.message : "Generation failed",
        });
      } finally {
        clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
