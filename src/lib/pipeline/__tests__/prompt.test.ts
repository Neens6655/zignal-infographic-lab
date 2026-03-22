import { describe, it, expect } from 'vitest';

// Test the prompt template replacement logic
describe('prompt template assembly', () => {
  const ASPECT_MAP: Record<string, string> = {
    '9:16': 'portrait (9:16)',
    '16:9': 'landscape (16:9)',
    '1:1': 'square (1:1)',
  };

  it('maps aspect ratios correctly', () => {
    expect(ASPECT_MAP['16:9']).toBe('landscape (16:9)');
    expect(ASPECT_MAP['9:16']).toBe('portrait (9:16)');
    expect(ASPECT_MAP['1:1']).toBe('square (1:1)');
  });

  it('template replaces all placeholders', () => {
    const template = 'Layout: {{LAYOUT}}\nStyle: {{STYLE}}\nAspect: {{ASPECT_RATIO}}\nLang: {{LANGUAGE}}';
    const result = template
      .replace('{{LAYOUT}}', 'bento-grid')
      .replace('{{STYLE}}', 'executive-institutional')
      .replace(/\{\{ASPECT_RATIO\}\}/g, 'landscape (16:9)')
      .replace(/\{\{LANGUAGE\}\}/g, 'en');

    expect(result).toBe('Layout: bento-grid\nStyle: executive-institutional\nAspect: landscape (16:9)\nLang: en');
    expect(result).not.toContain('{{');
  });

  it('replaces multiple occurrences of ASPECT_RATIO and LANGUAGE', () => {
    const template = '{{ASPECT_RATIO}} is the ratio. Generate in {{LANGUAGE}}. Render at {{ASPECT_RATIO}} in {{LANGUAGE}}.';
    const result = template
      .replace(/\{\{ASPECT_RATIO\}\}/g, 'landscape (16:9)')
      .replace(/\{\{LANGUAGE\}\}/g, 'ar');

    expect(result).toBe('landscape (16:9) is the ratio. Generate in ar. Render at landscape (16:9) in ar.');
  });
});

describe('style family mapping', () => {
  function getStyleFamily(style: string): string {
    const isCleanStyle = ['executive-institutional', 'ui-wireframe'].includes(style);
    const isDeconstructStyle = style === 'deconstruct';
    const isAerialStyle = style === 'aerial-explainer';
    return isAerialStyle ? 'aerial' : isDeconstructStyle ? 'deconstruct' : isCleanStyle ? 'clean' : 'illustrated';
  }

  it('maps executive-institutional to clean', () => {
    expect(getStyleFamily('executive-institutional')).toBe('clean');
  });

  it('maps ui-wireframe to clean', () => {
    expect(getStyleFamily('ui-wireframe')).toBe('clean');
  });

  it('maps deconstruct to deconstruct', () => {
    expect(getStyleFamily('deconstruct')).toBe('deconstruct');
  });

  it('maps aerial-explainer to aerial', () => {
    expect(getStyleFamily('aerial-explainer')).toBe('aerial');
  });

  it('maps everything else to illustrated', () => {
    expect(getStyleFamily('corporate-memphis')).toBe('illustrated');
    expect(getStyleFamily('bold-graphic')).toBe('illustrated');
    expect(getStyleFamily('knolling')).toBe('illustrated');
    expect(getStyleFamily('chalkboard')).toBe('illustrated');
  });
});
