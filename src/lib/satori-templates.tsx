/**
 * Satori JSX templates for text overlays.
 * These render text only (transparent background) — composited onto AI-generated backgrounds.
 * Satori supports flexbox, inline styles, and a subset of CSS.
 */
import type { ReactNode } from 'react';

// Re-export the StructuredContent shape for type safety
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
  shadow: string;
};

const PALETTES: Record<string, Palette> = {
  'corporate-memphis': {
    title: '#FFFFFF',
    heading: '#FFFFFF',
    body: 'rgba(255,255,255,0.88)',
    accent: '#5B8DEF',
    muted: 'rgba(255,255,255,0.5)',
    statLabel: 'rgba(255,255,255,0.6)',
    statValue: '#FFFFFF',
    shadow: 'rgba(0,0,0,0.7)',
  },
  'executive-institutional': {
    title: '#1A1A1A',
    heading: '#1A1A1A',
    body: '#333333',
    accent: '#2563EB',
    muted: '#666666',
    statLabel: '#666666',
    statValue: '#1A1A1A',
    shadow: 'rgba(255,255,255,0.6)',
  },
  'deconstruct': {
    title: '#FFFFFF',
    heading: '#F5F0E8',
    body: 'rgba(245,240,232,0.85)',
    accent: '#D4A84B',
    muted: 'rgba(245,240,232,0.5)',
    statLabel: 'rgba(245,240,232,0.55)',
    statValue: '#D4A84B',
    shadow: 'rgba(0,0,0,0.8)',
  },
  'aerial-explainer': {
    title: '#FFFFFF',
    heading: '#FFFFFF',
    body: 'rgba(255,255,255,0.9)',
    accent: '#8BC34A',
    muted: 'rgba(255,255,255,0.5)',
    statLabel: 'rgba(255,255,255,0.55)',
    statValue: '#FFFFFF',
    shadow: 'rgba(0,0,0,0.7)',
  },
  default: {
    title: '#FFFFFF',
    heading: '#FFFFFF',
    body: 'rgba(255,255,255,0.88)',
    accent: '#D4A84B',
    muted: 'rgba(255,255,255,0.5)',
    statLabel: 'rgba(255,255,255,0.6)',
    statValue: '#FFFFFF',
    shadow: 'rgba(0,0,0,0.7)',
  },
};

function getPalette(style: string): Palette {
  return PALETTES[style] || PALETTES.default;
}

// ── Shared text-shadow style for readability ────────────────

function textShadow(color: string): string {
  return `0 1px 3px ${color}, 0 2px 8px ${color}`;
}

// ── Stats footer bar ────────────────────────────────────────

function StatsBar({ stats, p }: { stats: { label: string; value: string }[]; p: Palette }) {
  if (!stats.length) return null;
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      padding: '16px 32px',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.35)',
      borderTop: `1px solid rgba(255,255,255,0.1)`,
    }}>
      {stats.slice(0, 6).map((s, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: '22px',
            fontWeight: 700,
            color: p.statValue,
            textShadow: textShadow(p.shadow),
          }}>{s.value}</span>
          <span style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: '10px',
            fontWeight: 400,
            color: p.statLabel,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Default (single-column) template ────────────────────────

function DefaultTemplate({
  data,
  width,
  height,
  style,
}: {
  data: StructuredContent;
  width: number;
  height: number;
  style: string;
}) {
  const p = getPalette(style);
  const isPortrait = height > width;
  const titleSize = isPortrait ? Math.floor(width * 0.055) : Math.floor(width * 0.038);
  const headingSize = isPortrait ? Math.floor(width * 0.035) : Math.floor(width * 0.022);
  const bodySize = isPortrait ? Math.floor(width * 0.028) : Math.floor(width * 0.015);
  const subtitleSize = isPortrait ? Math.floor(width * 0.032) : Math.floor(width * 0.018);

  const maxSections = isPortrait ? 6 : 5;
  const sections = data.sections.slice(0, maxSections);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: `${width}px`,
      height: `${height}px`,
      padding: isPortrait ? '48px 32px 0' : '40px 48px 0',
    }}>
      {/* Title block */}
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: isPortrait ? '24px' : '20px' }}>
        <span style={{
          fontFamily: 'IBM Plex Mono',
          fontSize: `${titleSize}px`,
          fontWeight: 700,
          color: p.title,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          lineHeight: 1.15,
          textShadow: textShadow(p.shadow),
        }}>{data.title}</span>
        {data.subtitle && (
          <span style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: `${subtitleSize}px`,
            fontWeight: 400,
            color: p.muted,
            marginTop: '8px',
            lineHeight: 1.3,
            textShadow: textShadow(p.shadow),
          }}>{data.subtitle}</span>
        )}
      </div>

      {/* Sections */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        gap: isPortrait ? '18px' : '14px',
      }}>
        {sections.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: `${headingSize * 0.8}px`,
                fontWeight: 700,
                color: p.accent,
                textShadow: textShadow(p.shadow),
              }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: `${headingSize}px`,
                fontWeight: 700,
                color: p.heading,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                textShadow: textShadow(p.shadow),
              }}>{s.heading}</span>
            </div>
            {s.content.slice(0, 2).map((c, j) => (
              <span key={j} style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: `${bodySize}px`,
                fontWeight: 400,
                color: p.body,
                lineHeight: 1.4,
                paddingLeft: '32px',
                textShadow: textShadow(p.shadow),
              }}>{c}</span>
            ))}
          </div>
        ))}
      </div>

      {/* Stats footer */}
      <StatsBar stats={data.statsBar} p={p} />
    </div>
  );
}

// ── Bento grid template ──────────────────────────────────────

function BentoGridTemplate({
  data,
  width,
  height,
  style,
}: {
  data: StructuredContent;
  width: number;
  height: number;
  style: string;
}) {
  const p = getPalette(style);
  const isPortrait = height > width;
  const titleSize = isPortrait ? Math.floor(width * 0.05) : Math.floor(width * 0.035);
  const headingSize = isPortrait ? Math.floor(width * 0.032) : Math.floor(width * 0.02);
  const bodySize = isPortrait ? Math.floor(width * 0.025) : Math.floor(width * 0.014);

  const sections = data.sections.slice(0, isPortrait ? 6 : 4);
  const cols = isPortrait ? 1 : 2;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: `${width}px`,
      height: `${height}px`,
      padding: isPortrait ? '40px 28px 0' : '36px 44px 0',
    }}>
      {/* Title */}
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
        <span style={{
          fontFamily: 'IBM Plex Mono',
          fontSize: `${titleSize}px`,
          fontWeight: 700,
          color: p.title,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textShadow: textShadow(p.shadow),
        }}>{data.title}</span>
        {data.subtitle && (
          <span style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: `${Math.floor(titleSize * 0.55)}px`,
            fontWeight: 400,
            color: p.muted,
            marginTop: '6px',
            textShadow: textShadow(p.shadow),
          }}>{data.subtitle}</span>
        )}
      </div>

      {/* Grid of sections */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        flex: 1,
        gap: '12px',
      }}>
        {sections.map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            width: cols === 1 ? '100%' : `${Math.floor(100 / cols) - 2}%`,
            padding: '14px 16px',
            backgroundColor: 'rgba(0,0,0,0.25)',
            borderLeft: `3px solid ${p.accent}`,
            gap: '4px',
          }}>
            <span style={{
              fontFamily: 'IBM Plex Mono',
              fontSize: `${headingSize}px`,
              fontWeight: 700,
              color: p.heading,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textShadow: textShadow(p.shadow),
            }}>{s.heading}</span>
            {s.content.slice(0, 2).map((c, j) => (
              <span key={j} style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: `${bodySize}px`,
                fontWeight: 400,
                color: p.body,
                lineHeight: 1.35,
                textShadow: textShadow(p.shadow),
              }}>{c}</span>
            ))}
          </div>
        ))}
      </div>

      <StatsBar stats={data.statsBar} p={p} />
    </div>
  );
}

// ── Dashboard template ──────────────────────────────────────

function DashboardTemplate({
  data,
  width,
  height,
  style,
}: {
  data: StructuredContent;
  width: number;
  height: number;
  style: string;
}) {
  const p = getPalette(style);
  const isPortrait = height > width;
  const titleSize = isPortrait ? Math.floor(width * 0.048) : Math.floor(width * 0.032);
  const headingSize = isPortrait ? Math.floor(width * 0.03) : Math.floor(width * 0.018);
  const bodySize = isPortrait ? Math.floor(width * 0.024) : Math.floor(width * 0.013);
  const metricSize = isPortrait ? Math.floor(width * 0.06) : Math.floor(width * 0.04);

  const sections = data.sections.slice(0, isPortrait ? 5 : 4);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: `${width}px`,
      height: `${height}px`,
      padding: isPortrait ? '36px 24px 0' : '32px 40px 0',
    }}>
      {/* Title */}
      <span style={{
        fontFamily: 'IBM Plex Mono',
        fontSize: `${titleSize}px`,
        fontWeight: 700,
        color: p.title,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        marginBottom: '8px',
        textShadow: textShadow(p.shadow),
      }}>{data.title}</span>

      {/* Top metrics row */}
      {data.statsBar.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '16px',
          padding: '12px 0',
          borderBottom: `1px solid rgba(255,255,255,0.1)`,
        }}>
          {data.statsBar.slice(0, 4).map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '2px' }}>
              <span style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: `${metricSize}px`,
                fontWeight: 700,
                color: p.accent,
                textShadow: textShadow(p.shadow),
              }}>{s.value}</span>
              <span style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: `${bodySize * 0.85}px`,
                fontWeight: 400,
                color: p.statLabel,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Section panels */}
      <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, gap: '10px' }}>
        {sections.map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            width: isPortrait ? '100%' : '48%',
            padding: '12px 14px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.06)',
            gap: '4px',
          }}>
            <span style={{
              fontFamily: 'IBM Plex Mono',
              fontSize: `${headingSize}px`,
              fontWeight: 700,
              color: p.heading,
              textTransform: 'uppercase',
              textShadow: textShadow(p.shadow),
            }}>{s.heading}</span>
            {s.content.slice(0, 2).map((c, j) => (
              <span key={j} style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: `${bodySize}px`,
                fontWeight: 400,
                color: p.body,
                lineHeight: 1.35,
                textShadow: textShadow(p.shadow),
              }}>{c}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hub-spoke template ──────────────────────────────────────

function HubSpokeTemplate({
  data,
  width,
  height,
  style,
}: {
  data: StructuredContent;
  width: number;
  height: number;
  style: string;
}) {
  const p = getPalette(style);
  const isPortrait = height > width;
  const titleSize = isPortrait ? Math.floor(width * 0.048) : Math.floor(width * 0.034);
  const headingSize = isPortrait ? Math.floor(width * 0.03) : Math.floor(width * 0.018);
  const bodySize = isPortrait ? Math.floor(width * 0.024) : Math.floor(width * 0.013);

  const sections = data.sections.slice(0, isPortrait ? 6 : 5);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: `${width}px`,
      height: `${height}px`,
      padding: isPortrait ? '40px 28px 0' : '36px 44px 0',
      alignItems: 'center',
    }}>
      {/* Central title */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '16px 24px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        border: `2px solid ${p.accent}`,
      }}>
        <span style={{
          fontFamily: 'IBM Plex Mono',
          fontSize: `${titleSize}px`,
          fontWeight: 700,
          color: p.title,
          textTransform: 'uppercase',
          textAlign: 'center',
          textShadow: textShadow(p.shadow),
        }}>{data.title}</span>
        {data.subtitle && (
          <span style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: `${Math.floor(titleSize * 0.5)}px`,
            fontWeight: 400,
            color: p.muted,
            textAlign: 'center',
            marginTop: '4px',
            textShadow: textShadow(p.shadow),
          }}>{data.subtitle}</span>
        )}
      </div>

      {/* Spoke sections */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        flex: 1,
        gap: '10px',
        justifyContent: 'center',
      }}>
        {sections.map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            width: isPortrait ? '90%' : '30%',
            padding: '10px 14px',
            borderLeft: `2px solid ${p.accent}`,
            gap: '3px',
          }}>
            <span style={{
              fontFamily: 'IBM Plex Mono',
              fontSize: `${headingSize}px`,
              fontWeight: 700,
              color: p.heading,
              textTransform: 'uppercase',
              textShadow: textShadow(p.shadow),
            }}>{s.heading}</span>
            {s.content.slice(0, 1).map((c, j) => (
              <span key={j} style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: `${bodySize}px`,
                fontWeight: 400,
                color: p.body,
                lineHeight: 1.3,
                textShadow: textShadow(p.shadow),
              }}>{c}</span>
            ))}
          </div>
        ))}
      </div>

      <StatsBar stats={data.statsBar} p={p} />
    </div>
  );
}

// ── Template dispatcher ──────────────────────────────────────

const LAYOUT_TEMPLATE_MAP: Record<string, string> = {
  'bento-grid': 'bento',
  'dashboard': 'dashboard',
  'hub-spoke': 'hub',
  'comparison-matrix': 'bento',
  'binary-comparison': 'bento',
  'periodic-table': 'dashboard',
};

export function getTextOverlayTemplate(
  layout: string,
  data: StructuredContent,
  style: string,
  width: number,
  height: number,
): ReactNode {
  const templateType = LAYOUT_TEMPLATE_MAP[layout] || 'default';

  switch (templateType) {
    case 'bento':
      return <BentoGridTemplate data={data} width={width} height={height} style={style} />;
    case 'dashboard':
      return <DashboardTemplate data={data} width={width} height={height} style={style} />;
    case 'hub':
      return <HubSpokeTemplate data={data} width={width} height={height} style={style} />;
    default:
      return <DefaultTemplate data={data} width={width} height={height} style={style} />;
  }
}
