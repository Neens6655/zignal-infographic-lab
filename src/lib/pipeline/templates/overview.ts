/**
 * OVERVIEW TEMPLATE — Numbered topic cards in a 2-column grid with accent bar.
 */
import { EXECUTIVE_DARK as P, TYPE, LAYOUT, type TemplateData } from './types';
import { col, row, text, truncate } from './helpers';

const W = LAYOUT.width;
const H = LAYOUT.height;
const PAD = LAYOUT.padding;

export function overviewTemplate(data: TemplateData) {
  const items = data.sections.slice(0, 6);
  const colWidth = Math.floor((W - PAD * 2 - LAYOUT.gap) / 2);
  const cardHeight = Math.floor((H - 300) / Math.ceil(items.length / 2));

  return col({ width: W, height: H, background: P.bgGradient, padding: PAD }, [
    // Header with accent bar
    col({ marginBottom: 24, paddingBottom: 18, borderBottom: `3px solid ${P.accent}` }, [
      text({ fontSize: TYPE.title.size, fontWeight: 700, color: P.title, fontFamily: 'IBM Plex Sans' }, truncate(data.title, 70)),
      text({ fontSize: TYPE.subtitle.size + 2, color: P.body, fontFamily: 'IBM Plex Sans', marginTop: 10, lineHeight: 1.4 }, truncate(data.subtitle, 150)),
    ]),

    // 2-column card grid
    row({ gap: LAYOUT.gap, flex: 1, flexWrap: 'wrap' },
      items.map((item, i) =>
        col({ width: colWidth, height: cardHeight - 12, background: P.cardBg, border: P.cardBorder, padding: LAYOUT.cardPadding, gap: 8 }, [
          // Number + heading
          row({ alignItems: 'center', gap: 12 }, [
            text({ fontSize: 20, fontWeight: 700, color: P.accent, fontFamily: 'IBM Plex Mono' }, `0${i + 1}`),
            text({ fontSize: TYPE.heading.size - 4, fontWeight: 700, color: P.heading, fontFamily: 'IBM Plex Sans' }, truncate(item.heading, 40)),
          ]),
          // Key concept
          ...(item.keyConcept ? [text({ fontSize: TYPE.body.size, color: P.body, fontFamily: 'IBM Plex Sans', lineHeight: 1.5 }, truncate(item.keyConcept, 100))] : []),
          // Labels as pills
          row({ gap: 10, flexWrap: 'wrap', marginTop: 4 },
            item.labels.slice(0, 3).map(label =>
              text({ fontSize: TYPE.label.size - 1, fontWeight: 700, color: P.accent, fontFamily: 'IBM Plex Mono', background: P.accentMuted, padding: '3px 10px' }, truncate(label, 28))
            )
          ),
          // Content
          ...item.content.slice(0, 2).map(c =>
            text({ fontSize: TYPE.body.size - 1, color: P.muted, fontFamily: 'IBM Plex Sans', lineHeight: 1.4 }, truncate(c, 85))
          ),
        ])
      )
    ),

    // Stats + source
    col({ marginTop: 14, borderTop: `1px solid ${P.divider}`, paddingTop: 12 }, [
      row({ gap: 0 },
        data.statsBar.slice(0, 6).map(stat =>
          col({ flex: 1, alignItems: 'center' }, [
            text({ fontSize: TYPE.dataNumber.size - 10, fontWeight: 700, color: P.heading, fontFamily: 'IBM Plex Mono' }, truncate(stat.value, 15)),
            text({ fontSize: TYPE.caption.size, color: P.muted, fontFamily: 'IBM Plex Mono', marginTop: 3 }, truncate(stat.label, 20)),
          ])
        )
      ),
      text({ fontSize: TYPE.caption.size, color: P.muted, fontFamily: 'IBM Plex Mono', marginTop: 6 }, truncate(data.sourceAttribution, 100)),
    ]),
  ]);
}
