/**
 * Plate text check — does the illustration contain words the model drew itself?
 *
 * The hybrid renderer's whole promise is that every character on the slide was set by
 * us from verified data. The image model is told, repeatedly, to draw no text. It
 * complies most of the time. When it does not, the result is a verified slide with
 * unverified words on it — "system logic", "trigger event", a "1 2 3 4" nobody asked
 * for — spelled correctly by luck.
 *
 * The ink/coverage plate check cannot see this: a word is just more ink. A vision
 * call can, at ~$0.001 and ~3s. Run it on the PLATE before compositing, so a plate
 * that fails is re-rolled rather than shipped under our labels.
 */
const OPENROUTER = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

export type PlateTextReport = {
  hasText: boolean;
  examples: string[];
  costUsd: number;
  /** True when the check could not run; caller treats as INCONCLUSIVE, not a pass. */
  inconclusive: boolean;
};

export async function checkPlateForText(
  imageBase64: string,
): Promise<PlateTextReport> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key)
    return { hasText: false, examples: [], costUsd: 0, inconclusive: true };

  try {
    const res = await fetch(OPENROUTER, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Does this image contain ANY readable text — words, labels, captions, numbers, letters, abbreviations — anywhere, including small print inside diagrams, on signs, screens or buttons? Decorative squiggles that only resemble text do not count; anything a person could read does.

Answer as JSON only: {"has_text": true/false, "examples": ["up to 5 things you can read"]}`,
              },
              {
                type: "image_url",
                image_url: { url: `data:image/png;base64,${imageBase64}` },
              },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok)
      return { hasText: false, examples: [], costUsd: 0, inconclusive: true };

    const j = await res.json();
    const text: string = j.choices?.[0]?.message?.content ?? "";
    const m = text.match(/\{[\s\S]*\}/);
    const parsed = m
      ? (JSON.parse(m[0]) as { has_text?: boolean; examples?: string[] })
      : null;

    const report: PlateTextReport = {
      hasText: parsed?.has_text === true,
      examples: Array.isArray(parsed?.examples)
        ? parsed!.examples.map(String).slice(0, 5)
        : [],
      costUsd: Number(j.usage?.cost ?? 0),
      inconclusive: parsed === null,
    };
    console.log(
      `[plate-text] ${report.inconclusive ? "INCONCLUSIVE" : report.hasText ? "TEXT FOUND: " + report.examples.join(" | ") : "clean"}`,
    );
    return report;
  } catch (err) {
    console.warn(
      "[plate-text] check failed, inconclusive:",
      err instanceof Error ? err.message : err,
    );
    return { hasText: false, examples: [], costUsd: 0, inconclusive: true };
  }
}
