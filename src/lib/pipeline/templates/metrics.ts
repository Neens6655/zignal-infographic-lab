/**
 * METRICS TEMPLATE — Dashboard with hero numbers and KPI cards.
 */
import { EXECUTIVE_DARK as P, TYPE, LAYOUT, type TemplateData } from './types';
import { col, row, text, truncate } from './helpers';

const W = LAYOUT.width;
const H = LAYOUT.height;
const PAD = LAYOUT.padding;

export function metricsTemplate(data: TemplateData) {
  const items = data.sections.slice(0, 6);
  const cols = items.length <= 3 ? items.length : 3;
  const cardWidth = Math.floor((W - PAD * 2 - (cols - 1) * LAYOUT.gap) / cols);

  return col({ width: W, height: H, background: P.bgGradient, padding: PAD }, [
    // Header
    col({ marginBottom: 20 }, [
      text({ fontSize: TYPE.title.size, fontWeight: 700, color: P.title, fontFamily: 'IBM Plex Sans' }, truncate(data.title, 70)),
      text({ fontSize: TYPE.subtitle.size, color: P.muted, fontFamily: 'IBM Plex Sans', marginTop: 8 }, truncate(data.subtitle, 120)),
    ]),

    // Hero stats bar (large numbers)
    row({ gap: LAYOUT.gap, marginBottom: 24 },
      data.statsBar.slice(0, 5).map(stat =>
        col({ flex: 1, background: P.cardBg, border: P.cardBorder, padding: '16px 24px', alignItems: 'center' }, [
          text({ fontSize: TYPE.dataNumber.size, fontWeight: 700, color: P.accent, fontFamily: 'IBM Plex Mono' }, truncate(stat.value, 12)),
          text({ fontSize: TYPE.caption.size + 1, color: P.muted, fontFamily: 'IBM Plex Mono', marginTop: 6 }, truncate(stat.label, 20)),
        ])
      )
    ),

    // Metric cards grid
    row({ gap: LAYOUT.gap, flex: 1, flexWrap: 'wrap' },
      items.map(item =>
        col({ width: cardWidth, background: P.cardBg, border: P.cardBorder, padding: LAYOUT.cardPadding, gap: 8 }, [
          text({ fontSize: TYPE.heading.size - 4, fontWeight: 700, color: P.heading, fontFamily: 'IBM Plex Sans' }, truncate(item.heading, 35)),
          // Primary metric large
          ...(item.labels.length > 0 ? [
            text({ fontSize: TYPE.dataNumber.size - 6, fontWeight: 700, color: P.accent, fontFamily: 'IBM Plex Mono', marginTop: 4 }, truncate(item.labels[0], 20))
          ] : []),
          // Secondary labels
          ...item.labels.slice(1, 4).map(label =>
            text({ fontSize: TYPE.label.size, fontWeight: 700, color: 'rgba(212,168,75,0.7)', fontFamily: 'IBM Plex Mono' }, truncate(label, 30))
          ),
          // Context
          ...item.content.slice(0, 2).map(c =>
            text({ fontSize: TYPE.body.size - 1, color: P.body, fontFamily: 'IBM Plex Sans', lineHeight: 1.4 }, truncate(c, 75))
          ),
        ])
      )
    ),

    // Source
    text({ fontSize: TYPE.caption.size, color: P.muted, fontFamily: 'IBM Plex Mono', marginTop: 12, borderTop: `1px solid ${P.divider}`, paddingTop: 10 }, truncate(data.sourceAttribution, 100)),
  ]);
}
