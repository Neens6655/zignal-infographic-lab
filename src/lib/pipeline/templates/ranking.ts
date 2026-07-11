/**
 * RANKING TEMPLATE v2 — Magazine editorial style.
 * #1 gets hero treatment. Cards have progressive visual weight.
 * Gold gradient accents, layered shadows, oversized rank numbers.
 */
import { EXECUTIVE_DARK as P, TYPE, LAYOUT, type TemplateData } from './types';
import { col, row, text, truncate } from './helpers';

const W = LAYOUT.width;
const H = LAYOUT.height;

// Refined shadows
const SHADOW = {
  card: '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
  hero: '0 8px 32px rgba(0,0,0,0.5), 0 0 48px rgba(212,168,75,0.06)',
};

// Rank color intensity fades
function rankColor(i: number): string {
  if (i === 0) return '#D4A84B';
  if (i <= 2) return 'rgba(212,168,75,0.75)';
  if (i <= 4) return 'rgba(212,168,75,0.55)';
  return 'rgba(212,168,75,0.4)';
}

export function rankingTemplate(data: TemplateData) {
  const items = data.sections.slice(0, 10);
  const hero = items[0];
  const rest = items.slice(1);
  // Top 2-3 get medium cards, rest get compact rows
  const topTier = rest.slice(0, 2);
  const lowerTier = rest.slice(2);

  return col({
    width: W, height: H,
    background: 'linear-gradient(145deg, #0D1B2A 0%, #13232f 40%, #0a1520 100%)',
    padding: 56,
    position: 'relative',
  }, [
    // Decorative: large watermark number
    text({
      position: 'absolute', top: 60, right: 80,
      fontSize: 280, fontWeight: 700, fontFamily: 'IBM Plex Mono',
      color: 'rgba(212,168,75,0.04)',
    }, 'TOP'),

    // Decorative: gold spotlight
    col({
      position: 'absolute', top: 0, left: 0,
      width: 600, height: 400,
      background: 'radial-gradient(ellipse at 20% 15%, rgba(212,168,75,0.08) 0%, transparent 50%)',
    }, []),

    // ── HEADER
    col({ marginBottom: 28, gap: 6 }, [
      text({ fontSize: 48, fontWeight: 700, color: '#F0E6D3', fontFamily: 'IBM Plex Sans', letterSpacing: -1 }, truncate(data.title, 60)),
      row({ gap: 0, alignItems: 'center' }, [
        col({ width: 48, height: 3, background: '#D4A84B' }, []),
        text({ fontSize: 15, color: 'rgba(255,255,255,0.5)', fontFamily: 'IBM Plex Sans', marginLeft: 16 }, truncate(data.subtitle, 100)),
      ]),
    ]),

    // ── HERO CARD (#1)
    row({
      background: 'linear-gradient(135deg, rgba(212,168,75,0.1) 0%, rgba(212,168,75,0.02) 100%)',
      borderLeft: '4px solid #D4A84B',
      padding: '24px 32px',
      gap: 28,
      alignItems: 'center',
      marginBottom: 20,
      boxShadow: SHADOW.hero,
    }, [
      // Giant rank number
      text({ fontSize: 72, fontWeight: 700, color: '#D4A84B', fontFamily: 'IBM Plex Mono', minWidth: 80, textAlign: 'center' }, '1'),
      // Hero content
      col({ flex: 1, gap: 6 }, [
        text({ fontSize: 28, fontWeight: 700, color: '#FFFFFF', fontFamily: 'IBM Plex Sans' }, truncate(hero?.heading || '', 50)),
        text({ fontSize: 15, color: 'rgba(255,255,255,0.7)', fontFamily: 'IBM Plex Sans', lineHeight: 1.4 }, truncate(hero?.keyConcept || '', 100)),
        row({ gap: 20, marginTop: 4, flexWrap: 'wrap' },
          (hero?.labels || []).slice(0, 4).map(label =>
            text({ fontSize: 13, fontWeight: 700, color: '#D4A84B', fontFamily: 'IBM Plex Mono' }, truncate(label, 30))
          )
        ),
        ...(hero?.content?.length ? [text({ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'IBM Plex Sans' }, truncate(hero.content[0], 100))] : []),
      ]),
    ]),

    // ── TOP TIER (#2-3) — medium cards side by side
    row({ gap: 16, marginBottom: 16 },
      topTier.map((item, i) =>
        row({
          flex: 1,
          background: 'rgba(255,255,255,0.03)',
          borderLeft: `3px solid ${rankColor(i + 1)}`,
          padding: '16px 24px',
          gap: 20,
          alignItems: 'flex-start',
          boxShadow: SHADOW.card,
        }, [
          text({ fontSize: 44, fontWeight: 700, color: rankColor(i + 1), fontFamily: 'IBM Plex Mono', minWidth: 56, textAlign: 'right' }, `${i + 2}`),
          col({ flex: 1, gap: 4 }, [
            text({ fontSize: 20, fontWeight: 700, color: '#FFFFFF', fontFamily: 'IBM Plex Sans' }, truncate(item.heading, 40)),
            row({ gap: 14, flexWrap: 'wrap' },
              item.labels.slice(0, 3).map(label =>
                text({ fontSize: 12, fontWeight: 700, color: rankColor(i + 1), fontFamily: 'IBM Plex Mono' }, truncate(label, 28))
              )
            ),
            ...(item.content.length > 0 ? [text({ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'IBM Plex Sans' }, truncate(item.content[0], 80))] : []),
          ]),
        ])
      )
    ),

    // ── LOWER TIER (#4+) — compact rows, 2 columns
    row({ gap: 12, flex: 1, flexWrap: 'wrap' },
      lowerTier.map((item, i) => {
        const rank = i + topTier.length + 2;
        return row({
          width: (W - 56 * 2 - 12) / 2,
          background: rank % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
          padding: '10px 16px',
          gap: 14,
          alignItems: 'center',
        }, [
          text({ fontSize: 28, fontWeight: 700, color: rankColor(rank - 1), fontFamily: 'IBM Plex Mono', minWidth: 40, textAlign: 'right' }, `${rank}`),
          col({ flex: 1, gap: 2 }, [
            text({ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'IBM Plex Sans' }, truncate(item.heading, 35)),
            row({ gap: 12 },
              item.labels.slice(0, 3).map(label =>
                text({ fontSize: 11, fontWeight: 700, color: rankColor(rank - 1), fontFamily: 'IBM Plex Mono' }, truncate(label, 25))
              )
            ),
          ]),
        ]);
      })
    ),

    // ── FOOTER — gradient divider + stats
    col({ marginTop: 16 }, [
      // Gradient divider
      col({ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,168,75,0.3), transparent)', marginBottom: 14 }, []),
      row({ gap: 0 },
        data.statsBar.slice(0, 5).map(stat =>
          col({ flex: 1, alignItems: 'center' }, [
            text({ fontSize: 24, fontWeight: 700, color: '#FFFFFF', fontFamily: 'IBM Plex Mono' }, truncate(stat.value, 12)),
            text({ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'IBM Plex Mono', marginTop: 4 }, truncate(stat.label, 18)),
          ])
        )
      ),
      text({ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'IBM Plex Mono', marginTop: 10 }, truncate(data.sourceAttribution, 100)),
    ]),
  ]);
}
