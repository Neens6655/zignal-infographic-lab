/**
 * PROCESS TEMPLATE — Horizontal timeline with connected stages.
 */
import { EXECUTIVE_DARK as P, TYPE, LAYOUT, type TemplateData } from './types';
import { col, row, text, truncate } from './helpers';

const W = LAYOUT.width;
const H = LAYOUT.height;
const PAD = LAYOUT.padding;

export function processTemplate(data: TemplateData) {
  const steps = data.sections.slice(0, 8);
  const stepsPerRow = steps.length <= 4 ? steps.length : Math.ceil(steps.length / 2);
  const rows = Math.ceil(steps.length / stepsPerRow);
  const stepWidth = Math.floor((W - PAD * 2) / stepsPerRow);

  return col({ width: W, height: H, background: P.bgGradient, padding: PAD }, [
    // Header
    col({ marginBottom: 24 }, [
      text({ fontSize: TYPE.title.size, fontWeight: 700, color: P.title, fontFamily: 'IBM Plex Sans' }, truncate(data.title, 70)),
      text({ fontSize: TYPE.subtitle.size, color: P.muted, fontFamily: 'IBM Plex Sans', marginTop: 6 }, truncate(data.subtitle, 120)),
    ]),

    // Timeline rows
    ...Array.from({ length: rows }, (_, rowIdx) => {
      const rowSteps = steps.slice(rowIdx * stepsPerRow, (rowIdx + 1) * stepsPerRow);
      return row({ marginBottom: 12, flex: 1 },
        rowSteps.map((step, i) => {
          const stepNum = rowIdx * stepsPerRow + i + 1;
          return col({ width: stepWidth, paddingRight: 12 }, [
            // Step number with connector
            row({ alignItems: 'center', marginBottom: 10 }, [
              row({ width: 34, height: 34, background: P.accent, alignItems: 'center', justifyContent: 'center' }, [
                text({ fontSize: 15, fontWeight: 700, color: P.bg, fontFamily: 'IBM Plex Mono' }, `${stepNum}`),
              ]),
              col({ flex: 1, height: 2, background: P.accentMuted, marginLeft: 8 }, []),
            ]),
            // Step card
            col({ background: P.cardBg, border: P.cardBorder, padding: LAYOUT.cardPadding, flex: 1, gap: 6 }, [
              text({ fontSize: TYPE.heading.size - 6, fontWeight: 700, color: P.heading, fontFamily: 'IBM Plex Sans' }, truncate(step.heading, 45)),
              ...step.labels.slice(0, 3).map(label =>
                text({ fontSize: TYPE.label.size, fontWeight: 700, color: P.accent, fontFamily: 'IBM Plex Mono' }, truncate(label, 40))
              ),
              ...step.content.slice(0, 2).map(item =>
                text({ fontSize: TYPE.body.size - 1, color: P.body, fontFamily: 'IBM Plex Sans', lineHeight: 1.4 }, truncate(item, 75))
              ),
            ]),
          ]);
        })
      );
    }),

    // Stats + source
    col({ marginTop: 'auto', borderTop: `1px solid ${P.divider}`, paddingTop: 14 }, [
      row({ gap: 0 },
        data.statsBar.slice(0, 6).map(stat =>
          col({ flex: 1, alignItems: 'center' }, [
            text({ fontSize: TYPE.dataNumber.size - 10, fontWeight: 700, color: P.heading, fontFamily: 'IBM Plex Mono' }, truncate(stat.value, 15)),
            text({ fontSize: TYPE.caption.size, color: P.muted, fontFamily: 'IBM Plex Mono', marginTop: 4 }, truncate(stat.label, 20)),
          ])
        )
      ),
      text({ fontSize: TYPE.caption.size, color: P.muted, fontFamily: 'IBM Plex Mono', marginTop: 8 }, truncate(data.sourceAttribution, 100)),
    ]),
  ]);
}
