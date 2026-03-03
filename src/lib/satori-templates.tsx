/**
 * Satori JSX templates for text overlays.
 *
 * Layout strategy: OPAQUE text zones + TRANSPARENT illustration zone.
 * - Title banner: opaque (masks any AI text)
 * - Illustration zone: transparent (AI background shows through)
 * - Section cards: opaque (masks any AI text)
 * - Stats bar: opaque (masks any AI text)
 */
import type { ReactNode } from 'react';

type StructuredContent = {
  title: string;
  subtitle: string;
  sections: {
    heading: string;
    keyConcept: string;
    content: string[];
    visualElement: string;
    labels: string[];
  }[];
  statsBar: { label: string; value: string }[];
  designNotes: string;
};

// ── Style palettes ──────────────────────────────────────────

type Palette = {
  title: string;
  heading: string;
  body: string;
  accent: string;
  muted: string;
  statLabel: string;
  statValue: string;
  bgPanel: string;      // Opaque panel background
  bgCard: string;       // Section card background
  bgFooter: string;     // Stats bar background
  borderColor: string;
};

const PALETTES: Record<string, Palette> = {
  'corporate-memphis': {
    title: '#FFFFFF',
    heading: '#FFFFFF',
    body: 'rgba(255,255,255,0.92)',
    accent: '#5B8DEF',
    muted: 'rgba(255,255,255,0.6)',
    statLabel: 'rgba(255,255,255,0.65)',
    statValue: '#FFFFFF',
    bgPanel: '#1A1F36',
    bgCard: '#232842',
    bgFooter: '#141729',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  'executive-institutional': {
    title: '#1A1A1A',
    heading: '#1A1A1A',
    body: '#3A3A3A',
    accent: '#2563EB',
    muted: '#717171',
    statLabel: '#717171',
    statValue: '#1A1A1A',
    bgPanel: '#F8F6F1',
    bgCard: '#FFFFFF',
    bgFooter: '#E8E5DF',
    borderColor: 'rgba(0,0,0,0.08)',
  },
  'deconstruct': {
    title: '#F5F0E8',
    heading: '#F5F0E8',
    body: 'rgba(245,240,232,0.88)',
    accent: '#D4A84B',
    muted: 'rgba(245,240,232,0.55)',
    statLabel: 'rgba(245,240,232,0.6)',
    statValue: '#D4A84B',
    bgPanel: '#1A1814',
    bgCard: '#231F1A',
    bgFooter: '#14110E',
    borderColor: 'rgba(212,168,75,0.15)',
  },
  'aerial-explainer': {
    title: '#FFFFFF',
    heading: '#FFFFFF',
    body: 'rgba(255,255,255,0.9)',
    accent: '#8BC34A',
    muted: 'rgba(255,255,255,0.55)',
    statLabel: 'rgba(255,255,255,0.6)',
    statValue: '#FFFFFF',
    bgPanel: '#1B2430',
    bgCard: '#222E3A',
    bgFooter: '#141D27',
    borderColor: 'rgba(139,195,74,0.12)',
  },
  default: {
    title: '#FFFFFF',
    heading: '#FFFFFF',
    body: 'rgba(255,255,255,0.9)',
    accent: '#D4A84B',
    muted: 'rgba(255,255,255,0.55)',
    statLabel: 'rgba(255,255,255,0.65)',
    statValue: '#FFFFFF',
    bgPanel: '#141414',
    bgCard: '#1E1E1E',
    bgFooter: '#0E0E0E',
    borderColor: 'rgba(255,255,255,0.06)',
  },
};

function getPalette(style: string): Palette {
  return PALETTES[style] || PALETTES.default;
}

// ── Stats footer bar ────────────────────────────────────────

function StatsBar({ stats, p, pad }: { stats: { label: string; value: string }[]; p: Palette; pad: string }) {
  if (!stats.length) return null;
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      padding: pad,
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: p.bgFooter,
      borderTop: `1px solid ${p.borderColor}`,
    }}>
      {stats.slice(0, 6).map((s, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
          <span style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: '24px',
            fontWeight: 700,
            color: p.statValue,
          }}>{s.value}</span>
          <span style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: '10px',
            fontWeight: 400,
            color: p.statLabel,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Landscape (16:9) template ────────────────────────────────
// Layout: Title banner | Illustration gap | 2-col section cards | Stats bar

function LandscapeTemplate({
  data, width, height, style,
}: {
  data: StructuredContent; width: number; height: number; style: string;
}) {
  const p = getPalette(style);
  const titleSize = Math.floor(width * 0.032);
  const subtitleSize = Math.floor(width * 0.015);
  const headingSize = Math.floor(width * 0.017);
  const bodySize = Math.floor(width * 0.013);
  const sections = data.sections.slice(0, 4);

  // Zone heights
  const titleH = Math.floor(height * 0.14);
  const illustrationH = Math.floor(height * 0.3);
  const statsH = Math.floor(height * 0.1);
  const cardsH = height - titleH - illustrationH - statsH;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: `${width}px`,
      height: `${height}px`,
      // Root is TRANSPARENT — AI background shows in illustration zone
    }}>
      {/* ZONE 1: Title banner — OPAQUE */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: `${titleH}px`,
        padding: '0 48px',
        backgroundColor: p.bgPanel,
        borderBottom: `2px solid ${p.accent}`,
      }}>
        <span style={{
          fontFamily: 'IBM Plex Mono',
          fontSize: `${titleSize}px`,
          fontWeight: 700,
          color: p.title,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          lineHeight: 1.15,
        }}>{data.title}</span>
        {data.subtitle && (
          <span style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: `${subtitleSize}px`,
            fontWeight: 400,
            color: p.muted,
            marginTop: '4px',
            lineHeight: 1.3,
          }}>{data.subtitle}</span>
        )}
      </div>

      {/* ZONE 2: Illustration gap — TRANSPARENT (AI art visible here) */}
      <div style={{
        display: 'flex',
        height: `${illustrationH}px`,
        // Intentionally no background — AI art shows through
      }} />

      {/* ZONE 3: Section cards — OPAQUE */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        height: `${cardsH}px`,
        padding: '8px 48px',
        gap: '8px',
        backgroundColor: p.bgPanel,
        borderTop: `1px solid ${p.borderColor}`,
      }}>
        {sections.map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            width: '48%',
            padding: '10px 14px',
            backgroundColor: p.bgCard,
            borderLeft: `3px solid ${p.accent}`,
            gap: '3px',
          }}>
            <span style={{
              fontFamily: 'IBM Plex Mono',
              fontSize: `${headingSize}px`,
              fontWeight: 700,
              color: p.heading,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>{s.heading}</span>
            {s.content.slice(0, 2).map((c, j) => (
              <span key={j} style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: `${bodySize}px`,
                fontWeight: 400,
                color: p.body,
                lineHeight: 1.35,
              }}>{c}</span>
            ))}
          </div>
        ))}
      </div>

      {/* ZONE 4: Stats bar — OPAQUE */}
      <StatsBar stats={data.statsBar} p={p} pad="14px 48px" />
    </div>
  );
}

// ── Portrait (9:16) template ─────────────────────────────────
// Layout: Title banner | Illustration gap | Stacked section cards | Stats bar

function PortraitTemplate({
  data, width, height, style,
}: {
  data: StructuredContent; width: number; height: number; style: string;
}) {
  const p = getPalette(style);
  const titleSize = Math.floor(width * 0.05);
  const subtitleSize = Math.floor(width * 0.028);
  const headingSize = Math.floor(width * 0.032);
  const bodySize = Math.floor(width * 0.025);
  const sections = data.sections.slice(0, 5);

  const titleH = Math.floor(height * 0.1);
  const illustrationH = Math.floor(height * 0.28);
  const statsH = Math.floor(height * 0.07);
  const cardsH = height - titleH - illustrationH - statsH;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: `${width}px`,
      height: `${height}px`,
    }}>
      {/* ZONE 1: Title — OPAQUE */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: `${titleH}px`,
        padding: '0 28px',
        backgroundColor: p.bgPanel,
        borderBottom: `2px solid ${p.accent}`,
      }}>
        <span style={{
          fontFamily: 'IBM Plex Mono',
          fontSize: `${titleSize}px`,
          fontWeight: 700,
          color: p.title,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          lineHeight: 1.15,
        }}>{data.title}</span>
      </div>

      {/* ZONE 2: Illustration — TRANSPARENT */}
      <div style={{
        display: 'flex',
        height: `${illustrationH}px`,
      }} />

      {/* ZONE 3: Section cards — OPAQUE */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: `${cardsH}px`,
        padding: '8px 28px',
        gap: '6px',
        backgroundColor: p.bgPanel,
        borderTop: `1px solid ${p.borderColor}`,
      }}>
        {data.subtitle && (
          <span style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: `${subtitleSize}px`,
            fontWeight: 400,
            color: p.muted,
            marginBottom: '4px',
          }}>{data.subtitle}</span>
        )}
        {sections.map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 12px',
            backgroundColor: p.bgCard,
            borderLeft: `3px solid ${p.accent}`,
            gap: '2px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: `${headingSize * 0.75}px`,
                fontWeight: 700,
                color: p.accent,
              }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: `${headingSize}px`,
                fontWeight: 700,
                color: p.heading,
                textTransform: 'uppercase',
              }}>{s.heading}</span>
            </div>
            {s.content.slice(0, 1).map((c, j) => (
              <span key={j} style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: `${bodySize}px`,
                fontWeight: 400,
                color: p.body,
                lineHeight: 1.3,
                paddingLeft: '32px',
              }}>{c}</span>
            ))}
          </div>
        ))}
      </div>

      {/* ZONE 4: Stats — OPAQUE */}
      <StatsBar stats={data.statsBar} p={p} pad="12px 28px" />
    </div>
  );
}

// ── Square (1:1) template ────────────────────────────────────
// Layout: Title banner | Side-by-side: illustration (left) + cards (right) | Stats bar

function SquareTemplate({
  data, width, height, style,
}: {
  data: StructuredContent; width: number; height: number; style: string;
}) {
  const p = getPalette(style);
  const titleSize = Math.floor(width * 0.038);
  const subtitleSize = Math.floor(width * 0.018);
  const headingSize = Math.floor(width * 0.02);
  const bodySize = Math.floor(width * 0.015);
  const sections = data.sections.slice(0, 4);

  const titleH = Math.floor(height * 0.14);
  const statsH = Math.floor(height * 0.1);
  const middleH = height - titleH - statsH;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: `${width}px`,
      height: `${height}px`,
    }}>
      {/* ZONE 1: Title — OPAQUE */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: `${titleH}px`,
        padding: '0 36px',
        backgroundColor: p.bgPanel,
        borderBottom: `2px solid ${p.accent}`,
      }}>
        <span style={{
          fontFamily: 'IBM Plex Mono',
          fontSize: `${titleSize}px`,
          fontWeight: 700,
          color: p.title,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          lineHeight: 1.15,
        }}>{data.title}</span>
        {data.subtitle && (
          <span style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: `${subtitleSize}px`,
            fontWeight: 400,
            color: p.muted,
            marginTop: '4px',
          }}>{data.subtitle}</span>
        )}
      </div>

      {/* ZONE 2: Middle — Left transparent (AI art) + Right opaque (cards) */}
      <div style={{
        display: 'flex',
        height: `${middleH}px`,
      }}>
        {/* Left: Illustration — TRANSPARENT */}
        <div style={{
          display: 'flex',
          width: '42%',
          // No background — AI art shows here
        }} />

        {/* Right: Section cards — OPAQUE */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '58%',
          padding: '10px 36px 10px 14px',
          gap: '6px',
          backgroundColor: p.bgPanel,
          borderLeft: `1px solid ${p.borderColor}`,
        }}>
          {sections.map((s, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '8px 12px',
              backgroundColor: p.bgCard,
              borderLeft: `3px solid ${p.accent}`,
              gap: '2px',
            }}>
              <span style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: `${headingSize}px`,
                fontWeight: 700,
                color: p.heading,
                textTransform: 'uppercase',
              }}>{s.heading}</span>
              {s.content.slice(0, 1).map((c, j) => (
                <span key={j} style={{
                  fontFamily: 'IBM Plex Mono',
                  fontSize: `${bodySize}px`,
                  fontWeight: 400,
                  color: p.body,
                  lineHeight: 1.3,
                }}>{c}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ZONE 3: Stats — OPAQUE */}
      <StatsBar stats={data.statsBar} p={p} pad="14px 36px" />
    </div>
  );
}

// ── Template dispatcher ──────────────────────────────────────

export function getTextOverlayTemplate(
  layout: string,
  data: StructuredContent,
  style: string,
  width: number,
  height: number,
): ReactNode {
  const isPortrait = height > width;
  const isSquare = Math.abs(height - width) < 100;

  if (isSquare) {
    return <SquareTemplate data={data} width={width} height={height} style={style} />;
  }
  if (isPortrait) {
    return <PortraitTemplate data={data} width={width} height={height} style={style} />;
  }
  return <LandscapeTemplate data={data} width={width} height={height} style={style} />;
}
