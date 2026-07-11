/**
 * Template types — shared across all infographic templates.
 */

export type TemplateData = {
  title: string;
  subtitle: string;
  sections: {
    heading: string;
    keyConcept: string;
    content: string[];
    labels: string[];
  }[];
  statsBar: { label: string; value: string }[];
  sourceAttribution: string;
};

export type Palette = {
  bg: string;
  bgGradient: string;
  cardBg: string;
  cardBorder: string;
  title: string;
  heading: string;
  body: string;
  muted: string;
  accent: string;
  accentMuted: string;
  divider: string;
};

// ZGNAL Executive Dark palette
export const EXECUTIVE_DARK: Palette = {
  bg: '#0D1B2A',
  bgGradient: 'linear-gradient(145deg, #0D1B2A 0%, #1B2838 50%, #0D1B2A 100%)',
  cardBg: 'rgba(255,255,255,0.04)',
  cardBorder: '2px solid rgba(255,255,255,0.08)',
  title: '#F0E6D3',
  heading: '#FFFFFF',
  body: '#B8C4D0',
  muted: 'rgba(255,255,255,0.45)',
  accent: '#D4A84B',
  accentMuted: 'rgba(212,168,75,0.3)',
  divider: 'rgba(255,255,255,0.08)',
};

// Typography scale for 1920x1080
export const TYPE = {
  title: { size: 52, weight: 700 as const, family: 'IBM Plex Sans', lineHeight: 1.1 },
  subtitle: { size: 18, weight: 400 as const, family: 'IBM Plex Sans', lineHeight: 1.3 },
  heading: { size: 24, weight: 700 as const, family: 'IBM Plex Sans', lineHeight: 1.2 },
  subheading: { size: 16, weight: 600 as const, family: 'IBM Plex Sans', lineHeight: 1.3 },
  body: { size: 14, weight: 400 as const, family: 'IBM Plex Sans', lineHeight: 1.5 },
  label: { size: 13, weight: 700 as const, family: 'IBM Plex Mono', lineHeight: 1.3 },
  dataNumber: { size: 36, weight: 700 as const, family: 'IBM Plex Mono', lineHeight: 1.0 },
  caption: { size: 11, weight: 400 as const, family: 'IBM Plex Mono', lineHeight: 1.4 },
};

// Layout constants
export const LAYOUT = {
  width: 1920,
  height: 1080,
  padding: 64,
  gap: 24,
  cardPadding: 24,
  cardRadius: 0, // Bauhaus — zero radius
};
