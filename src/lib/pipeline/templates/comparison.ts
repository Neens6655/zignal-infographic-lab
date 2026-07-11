/**
 * COMPARISON TEMPLATE — Side-by-side columns with accent headers.
 */
import { EXECUTIVE_DARK as P, TYPE, LAYOUT, type TemplateData } from './types';
import { col, row, text, truncate } from './helpers';

const W = LAYOUT.width;
const H = LAYOUT.height;
const PAD = LAYOUT.padding;

export function comparisonTemplate(data: TemplateData) {
  const items = data.sections.slice(0, 4);
  const colCount = items.length;
  const colWidth = Math.floor((W - PAD * 2 - (colCount - 1) * LAYOUT.gap) / colCount);

  return col({ width: W, height: H, background: P.bgGradient, padding: PAD }, [
    // Header
    col({ marginBottom: 28 }, [
      text({ fontSize: TYPE.title.size - 4, fontWeight: 700, color: P.title, fontFamily: 'IBM Plex Sans' }, truncate(data.title, 75)),
      text({ fontSize: TYPE.subtitle.size, color: P.muted, fontFamily: 'IBM Plex Sans', marginTop: 8 }, truncate(data.subtitle, 120)),
    ]),

    // Comparison columns
    row({ gap: LAYOUT.gap, flex: 1 },
      items.map(item =>
        col({ width: colWidth, background: P.cardBg, border: P.cardBorder, padding: LAYOUT.cardPadding + 8, gap: 10 }, [
          // Column header with gold underline
          col({ paddingBottom: 14, borderBottom: `2px solid ${P.accent}`, gap: 6 }, [
            text({ fontSize: TYPE.heading.size, fontWeight: 700, color: P.heading, fontFamily: 'IBM Plex Sans' }, truncate(item.heading, 35)),
            ...(item.keyConcept ? [text({ fontSize: TYPE.body.size, color: P.body, fontFamily: 'IBM Plex Sans', lineHeight: 1.4 }, truncate(item.keyConcept, 80))] : []),
          ]),
          // Labels with bullet
          ...item.labels.slice(0, 5).map(label =>
            row({ gap: 8, alignItems: 'flex-start' }, [
              text({ fontSize: 11, color: P.accent, marginTop: 2 }, '\u25A0'),
              text({ fontSize: TYPE.label.size, fontWeight: 700, color: P.accent, fontFamily: 'IBM Plex Mono' }, truncate(label, 35)),
            ])
          ),
          // Content
          ...item.content.slice(0, 3).map(c =>
            text({ fontSize: TYPE.body.size, color: P.body, fontFamily: 'IBM Plex Sans', lineHeight: 1.5 }, truncate(c, 90))
          ),
        ])
      )
    ),

    // Stats + source
    col({ marginTop: 20, borderTop: `1px solid ${P.divider}`, paddingTop: 14 }, [
      row({ gap: 0 },
        data.statsBar.slice(0, 6).map(stat =>
          col({ flex: 1, alignItems: 'center' }, [
            text({ fontSize: TYPE.dataNumber.size - 10, fontWeight: 700, color: P.heading, fontFamily: 'IBM Plex Mono' }, truncate(stat.value, 15)),
            text({ fontSize: TYPE.caption.size, color: P.muted, fontFamily: 'IBM Plex Mono', marginTop: 4 }, truncate(stat.label, 20)),
          ])
        )
      ),
      text({ fontSize: TYPE.caption.size, color: P.muted, fontFamily: 'IBM Plex Mono', marginTop: 6 }, truncate(data.sourceAttribution, 100)),
    ]),
  ]);
}
