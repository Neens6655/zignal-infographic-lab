import { describe, it, expect } from 'vitest';
import { PRESETS } from '../types';

describe('PRESETS', () => {
  it('contains expected presets', () => {
    expect(PRESETS['executive-summary']).toBeDefined();
    expect(PRESETS['strategy-framework']).toBeDefined();
    expect(PRESETS['process-flow']).toBeDefined();
    expect(PRESETS['deconstruct']).toBeDefined();
  });

  it('each preset has layout, style, and tone', () => {
    for (const [name, preset] of Object.entries(PRESETS)) {
      expect(preset.layout, `${name} missing layout`).toBeTruthy();
      expect(preset.style, `${name} missing style`).toBeTruthy();
      expect(preset.tone, `${name} missing tone`).toBeTruthy();
    }
  });

  it('executive-summary maps to bento-grid layout with executive style', () => {
    expect(PRESETS['executive-summary'].layout).toBe('bento-grid');
    expect(PRESETS['executive-summary'].style).toBe('executive-institutional');
  });

  it('consulting presets all use executive-institutional style', () => {
    expect(PRESETS['strategy-framework'].style).toBe('executive-institutional');
    expect(PRESETS['market-analysis'].style).toBe('executive-institutional');
    expect(PRESETS['competitive-landscape'].style).toBe('executive-institutional');
    expect(PRESETS['institutional-brief'].style).toBe('executive-institutional');
  });
});
