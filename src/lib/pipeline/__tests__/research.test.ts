import { describe, it, expect } from 'vitest';
import { classifySourceTier } from '../research';

describe('classifySourceTier', () => {
  it('classifies .gov domains as tier 1', () => {
    expect(classifySourceTier('https://www.eia.gov/report')).toBe(1);
    expect(classifySourceTier('https://census.gov/data')).toBe(1);
    expect(classifySourceTier('https://cdc.gov/covid')).toBe(1);
  });

  it('classifies .edu domains as tier 1', () => {
    expect(classifySourceTier('https://mit.edu/research')).toBe(1);
    expect(classifySourceTier('https://stanford.edu/paper')).toBe(1);
  });

  it('classifies international org domains as tier 1', () => {
    expect(classifySourceTier('https://www.worldbank.org/data')).toBe(1);
    expect(classifySourceTier('https://who.int/report')).toBe(1);
    expect(classifySourceTier('https://imf.org/outlook')).toBe(1);
  });

  it('classifies wire services as tier 1', () => {
    expect(classifySourceTier('https://reuters.com/article')).toBe(1);
    expect(classifySourceTier('https://bloomberg.com/news')).toBe(1);
  });

  it('classifies quality news as tier 2', () => {
    expect(classifySourceTier('https://bbc.com/news')).toBe(2);
    expect(classifySourceTier('https://www.nytimes.com/article')).toBe(2);
    expect(classifySourceTier('https://cnbc.com/markets')).toBe(2);
  });

  it('classifies consulting firms as tier 2', () => {
    expect(classifySourceTier('https://mckinsey.com/insights')).toBe(2);
    expect(classifySourceTier('https://deloitte.com/report')).toBe(2);
  });

  it('classifies unknown domains as tier 3', () => {
    expect(classifySourceTier('https://randomblog.com/post')).toBe(3);
    expect(classifySourceTier('https://medium.com/article')).toBe(3);
  });

  it('handles subdomain matching', () => {
    expect(classifySourceTier('https://pmc.ncbi.nlm.nih.gov/article')).toBe(1);
    expect(classifySourceTier('https://ir.tesla.com/report')).toBe(2);
    expect(classifySourceTier('https://investor.apple.com/earnings')).toBe(2);
  });

  it('handles invalid URLs gracefully', () => {
    expect(classifySourceTier('not-a-url')).toBe(3);
    expect(classifySourceTier('')).toBe(3);
  });

  it('handles bbc.co.uk as tier 2', () => {
    expect(classifySourceTier('https://www.bbc.co.uk/news')).toBe(2);
  });
});
