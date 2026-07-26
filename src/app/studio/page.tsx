"use client";

/**
 * ZGNAL Studio — 4-up test surface (Phase 1 functional UI).
 * Type a brief -> all four styles render in parallel, each gated by the quality
 * loop, filling in progressively with their score + pass/flag badge.
 * (Cinematic hero + mobile choreography are Phase 2; this is the working harness.)
 */
import { useState, useCallback, useRef } from "react";

type StyleId = "mckinsey" | "academic" | "deconstruct" | "aerial";

const STYLES: { id: StyleId; name: string; tagline: string }[] = [
  {
    id: "mckinsey",
    name: "Corporate Deck",
    tagline: "McKinsey / JP Morgan brief",
  },
  {
    id: "academic",
    name: "Aged Academic",
    tagline: "Victorian scientific plate",
  },
  { id: "deconstruct", name: "Deconstruct", tagline: "NYT exploded view" },
  {
    id: "aerial",
    name: "Aerial Deconstruct",
    tagline: "Isometric exploded systems",
  },
];

const EXAMPLE =
  "Global electric vehicle market 2025: $784B market size, 24% CAGR, 17.1 million units sold, " +
  "China holds 58% of global sales, battery pack costs fell to $89/kWh, average range now 480 km, " +
  "public charging points reached 4.2 million worldwide.";

type Score = {
  overall: number;
  pass: boolean;
  styleConformance: number;
  visualQuality: number;
  textRender: number;
  defects: string[];
};

type Tile = {
  status: "idle" | "queued" | "rendering" | "scoring" | "done" | "error";
  message: string;
  attempt: number;
  imageUrl?: string;
  score?: Score;
  passed?: boolean;
  flagged?: boolean;
  attempts?: number;
};

const blankTiles = (): Record<StyleId, Tile> => ({
  mckinsey: { status: "idle", message: "", attempt: 0 },
  academic: { status: "idle", message: "", attempt: 0 },
  deconstruct: { status: "idle", message: "", attempt: 0 },
  aerial: { status: "idle", message: "", attempt: 0 },
});

const ASPECTS = ["16:9", "9:16", "1:1"] as const;

export default function StudioPage() {
  const [content, setContent] = useState("");
  const [aspect, setAspect] = useState<(typeof ASPECTS)[number]>("16:9");
  const [running, setRunning] = useState(false);
  const [prep, setPrep] = useState("");
  const [tiles, setTiles] = useState<Record<StyleId, Tile>>(blankTiles);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const patch = (style: StyleId, p: Partial<Tile>) =>
    setTiles((t) => ({ ...t, [style]: { ...t[style], ...p } }));

  const run = useCallback(async () => {
    if (content.trim().length < 20) {
      setError("Give it a bit more to work with — at least ~20 characters.");
      return;
    }
    setError("");
    setRunning(true);
    setPrep("Starting…");
    setTiles(() => {
      const t = blankTiles();
      (Object.keys(t) as StyleId[]).forEach((s) => (t[s].status = "queued"));
      return t;
    });

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          aspect_ratio: aspect,
          max_attempts: 2,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        setError(`Request failed (${res.status}).`);
        setRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let evName = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            evName = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            let data: Record<string, unknown>;
            try {
              data = JSON.parse(line.slice(6));
            } catch {
              continue;
            }
            if (evName === "prep") {
              setPrep(`${data.progress ?? ""}% — ${data.message ?? ""}`);
            } else if (evName === "variant_progress") {
              patch(data.style as StyleId, {
                status: "rendering",
                message: String(data.message ?? ""),
              });
            } else if (evName === "variant_attempt") {
              const s = data.score as Score | undefined;
              patch(data.style as StyleId, {
                status: "scoring",
                attempt: Number(data.attempt ?? 0),
                message: `attempt ${data.attempt} — scored ${s?.overall ?? "?"}/100`,
              });
            } else if (evName === "variant") {
              patch(data.style as StyleId, {
                status: "done",
                imageUrl: String(data.image_url ?? ""),
                score: data.score as Score,
                passed: Boolean(data.passed),
                flagged: Boolean(data.flagged),
                attempts: Number(data.attempts ?? 1),
                message: "",
              });
            } else if (evName === "error") {
              setError(String(data.error ?? "Generation failed"));
            }
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    } finally {
      setRunning(false);
      setPrep("");
    }
  }, [content, aspect]);

  const stop = () => {
    abortRef.current?.abort();
    setRunning(false);
  };

  return (
    <main className="studio">
      <header className="studio-head">
        <div className="brandline">
          <span className="dot" /> ZGNAL STUDIO
        </div>
        <h1>
          One brief. <span className="gold">Four finished styles.</span>
        </h1>
        <p className="sub">
          Every idea renders as all four styles at once — each auto-scored and
          re-rendered by the quality loop until it clears the bar.
        </p>
      </header>

      <section className="composer">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste a topic, some facts, a paragraph… e.g. market data, a process, a comparison."
          rows={5}
          disabled={running}
          aria-label="Infographic brief"
        />
        <div className="controls">
          <button
            type="button"
            className="ghost"
            onClick={() => setContent(EXAMPLE)}
            disabled={running}
          >
            Use example
          </button>
          <div className="aspects" role="group" aria-label="Aspect ratio">
            {ASPECTS.map((a) => (
              <button
                type="button"
                key={a}
                className={`pill ${aspect === a ? "on" : ""}`}
                onClick={() => setAspect(a)}
                disabled={running}
              >
                {a}
              </button>
            ))}
          </div>
          {running ? (
            <button type="button" className="primary stop" onClick={stop}>
              Stop
            </button>
          ) : (
            <button type="button" className="primary" onClick={run}>
              Generate 4 styles
            </button>
          )}
        </div>
        {prep && <p className="prep">{prep}</p>}
        {error && <p className="err">{error}</p>}
      </section>

      <section className="grid" aria-label="Results">
        {STYLES.map((s) => {
          const t = tiles[s.id];
          return (
            <article key={s.id} className={`tile ${t.status}`}>
              <div className="tile-head">
                <div>
                  <h2>{s.name}</h2>
                  <span className="tag">{s.tagline}</span>
                </div>
                {t.status === "done" && t.score && (
                  <span className={`badge ${t.passed ? "pass" : "flag"}`}>
                    {t.passed ? "PASS" : "FLAGGED"} · {t.score.overall}
                  </span>
                )}
              </div>

              <div className="canvas">
                {t.imageUrl ? (
                  <a
                    href={t.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={`${s.id}.png`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.imageUrl} alt={`${s.name} infographic`} />
                  </a>
                ) : (
                  <div className="placeholder">
                    <span className="spin" aria-hidden />
                    <span className="pmsg">
                      {t.status === "idle"
                        ? "Waiting for a brief"
                        : t.status === "queued"
                          ? "Queued…"
                          : t.message || "Rendering…"}
                    </span>
                  </div>
                )}
              </div>

              {t.status === "done" && t.score && (
                <div className="meta">
                  <span>style {t.score.styleConformance}</span>
                  <span>visual {t.score.visualQuality}</span>
                  <span>text {t.score.textRender}</span>
                  <span>
                    {t.attempts} attempt{t.attempts === 1 ? "" : "s"}
                  </span>
                </div>
              )}
              {t.status === "done" && t.flagged && t.score?.defects?.length ? (
                <p className="defects">
                  Review: {t.score.defects.slice(0, 2).join(" · ")}
                </p>
              ) : null}
            </article>
          );
        })}
      </section>

      <style jsx>{`
        .studio {
          min-height: 100vh;
          background: var(--z-bg, #0a0a0b);
          color: var(--z-cream, #e8e5e0);
          font-family: var(--font-ibm-sans, "IBM Plex Sans", sans-serif);
          padding: clamp(1.25rem, 4vw, 3rem);
          max-width: 1400px;
          margin: 0 auto;
        }
        .studio-head {
          border-bottom: 2px solid #26262b;
          padding-bottom: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .brandline {
          font-family: var(--font-ibm-mono, "IBM Plex Mono", monospace);
          font-size: 0.72rem;
          letter-spacing: 0.28em;
          color: var(--z-gold, #d4a84b);
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1rem;
        }
        .dot {
          width: 8px;
          height: 8px;
          background: var(--z-gold, #d4a84b);
          display: inline-block;
        }
        h1 {
          font-size: clamp(1.7rem, 4.5vw, 3rem);
          font-weight: 600;
          line-height: 1.05;
          margin: 0 0 0.6rem;
        }
        .gold {
          color: var(--z-gold, #d4a84b);
        }
        .sub {
          color: #9a9aa2;
          max-width: 42rem;
          font-size: 0.95rem;
          margin: 0;
        }
        .composer {
          margin-bottom: 2rem;
        }
        textarea {
          width: 100%;
          background: var(--z-surface, #141416);
          border: 2px solid #2a2a30;
          color: var(--z-cream, #e8e5e0);
          padding: 1rem;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          outline: none;
        }
        textarea:focus {
          border-color: var(--z-gold, #d4a84b);
        }
        .controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.85rem;
        }
        button {
          font-family: var(--font-ibm-mono, "IBM Plex Mono", monospace);
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          border: 2px solid #2a2a30;
          background: transparent;
          color: var(--z-cream, #e8e5e0);
          padding: 0.6rem 1rem;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .primary {
          background: var(--z-gold, #d4a84b);
          color: #0a0a0b;
          border-color: var(--z-gold, #d4a84b);
          font-weight: 600;
          margin-left: auto;
        }
        .primary.stop {
          background: var(--z-brick, #c04b3c);
          border-color: var(--z-brick, #c04b3c);
          color: #fff;
        }
        .ghost:hover:not(:disabled) {
          border-color: var(--z-gold, #d4a84b);
        }
        .aspects {
          display: flex;
          gap: 0.4rem;
        }
        .pill {
          padding: 0.55rem 0.8rem;
        }
        .pill.on {
          border-color: var(--z-gold, #d4a84b);
          color: var(--z-gold, #d4a84b);
        }
        .prep {
          font-family: var(--font-ibm-mono, "IBM Plex Mono", monospace);
          font-size: 0.8rem;
          color: var(--z-gold, #d4a84b);
          margin: 0.9rem 0 0;
        }
        .err {
          color: #ff8a7a;
          font-size: 0.85rem;
          margin: 0.9rem 0 0;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        @media (min-width: 760px) {
          .grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .tile {
          background: var(--z-surface, #141416);
          border: 2px solid #26262b;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .tile.done {
          border-color: #34343c;
        }
        .tile-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }
        h2 {
          font-size: 1.05rem;
          margin: 0;
          font-weight: 600;
        }
        .tag {
          font-family: var(--font-ibm-mono, "IBM Plex Mono", monospace);
          font-size: 0.68rem;
          color: #85858e;
          letter-spacing: 0.04em;
        }
        .badge {
          font-family: var(--font-ibm-mono, "IBM Plex Mono", monospace);
          font-size: 0.7rem;
          padding: 0.3rem 0.55rem;
          white-space: nowrap;
          font-weight: 600;
        }
        .badge.pass {
          background: rgba(139, 195, 74, 0.16);
          color: #a6d96a;
          border: 1px solid #557a2e;
        }
        .badge.flag {
          background: rgba(212, 168, 75, 0.14);
          color: var(--z-gold, #d4a84b);
          border: 1px solid #7a5f28;
        }
        .canvas {
          aspect-ratio: 16 / 9;
          background: #0d0d0f;
          border: 1px solid #232329;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .canvas img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: #6b6b73;
          font-size: 0.8rem;
          text-align: center;
          padding: 1rem;
        }
        .pmsg {
          font-family: var(--font-ibm-mono, "IBM Plex Mono", monospace);
          letter-spacing: 0.03em;
        }
        .spin {
          width: 22px;
          height: 22px;
          border: 2px solid #2f2f36;
          border-top-color: var(--z-gold, #d4a84b);
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }
        .tile.idle .spin {
          animation: none;
          border-top-color: #2f2f36;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .spin {
            animation: none;
          }
        }
        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          font-family: var(--font-ibm-mono, "IBM Plex Mono", monospace);
          font-size: 0.7rem;
          color: #85858e;
        }
        .defects {
          font-size: 0.75rem;
          color: var(--z-gold, #d4a84b);
          margin: 0;
        }
      `}</style>
    </main>
  );
}
