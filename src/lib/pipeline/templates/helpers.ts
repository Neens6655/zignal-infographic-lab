/**
 * Satori JSX helpers — every element with children MUST have display: flex.
 */

type Style = Record<string, any>;

/** Create a flex-column div (Satori requires explicit flex on every parent) */
export function col(style: Style, children: any[]): any {
  return { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', ...style }, children } };
}

/** Create a flex-row div */
export function row(style: Style, children: any[]): any {
  return { type: 'div', props: { style: { display: 'flex', flexDirection: 'row', ...style }, children } };
}

/** Create a text element (single child, no flex needed) */
export function text(style: Style, content: string): any {
  return { type: 'div', props: { style: { display: 'flex', ...style }, children: [content] } };
}

/** Truncate text at word boundary */
export function truncate(str: string, max: number): string {
  if (!str || str.length <= max) return str || '';
  const cut = str.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut).trimEnd() + '\u2026';
}
