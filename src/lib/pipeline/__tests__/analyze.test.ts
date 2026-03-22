import { describe, it, expect } from 'vitest';
import { detectContentDomain, detectIntentByRegex, getStyleForDomainIntent } from '../analyze';

describe('detectContentDomain', () => {
  it('detects business domain', () => {
    expect(detectContentDomain('Our strategy for market share growth and ROI improvement with stakeholder engagement')).toBe('business');
  });

  it('detects finance domain', () => {
    expect(detectContentDomain('GDP growth and inflation rates drive central bank interest rate decisions on bonds and equities')).toBe('finance');
  });

  it('detects technology domain', () => {
    expect(detectContentDomain('Deploy the API on Kubernetes with Docker containers and microservices architecture')).toBe('technology');
  });

  it('detects science domain', () => {
    expect(detectContentDomain('The hypothesis was tested in a peer review experiment on genome editing and DNA repair mechanisms')).toBe('science');
  });

  it('detects education domain', () => {
    expect(detectContentDomain('The university curriculum for STEM students focuses on pedagogy and enrollment in academic programs')).toBe('education');
  });

  it('detects creative domain', () => {
    expect(detectContentDomain('The design aesthetic uses Bauhaus typography and a bold palette for branding and visual identity')).toBe('creative');
  });

  it('detects editorial domain', () => {
    expect(detectContentDomain('This geopolitics analysis covers the debate on legislation and regulation reform for human rights')).toBe('editorial');
  });

  it('returns general for unrecognized content', () => {
    expect(detectContentDomain('Hello world this is a short test')).toBe('general');
  });

  it('picks the domain with the most keyword matches', () => {
    // Mix of finance and tech, but finance has more hits
    expect(detectContentDomain('GDP inflation interest rate bonds equities treasury stock portfolio — also uses an API')).toBe('finance');
  });

  it('requires at least 2 keyword matches to classify', () => {
    // Only one finance keyword
    expect(detectContentDomain('The GDP of the region was growing steadily over time')).toBe('general');
  });
});

describe('detectIntentByRegex', () => {
  it('detects ranking intent', () => {
    expect(detectIntentByRegex('top 10 largest economies in the world')).toBe('ranking');
    expect(detectIntentByRegex('the biggest companies by revenue')).toBe('ranking');
    expect(detectIntentByRegex('best 5 universities in Europe')).toBe('ranking');
    expect(detectIntentByRegex('most populated countries')).toBe('ranking');
  });

  it('detects comparison intent', () => {
    expect(detectIntentByRegex('iPhone vs Samsung Galaxy')).toBe('comparison');
    expect(detectIntentByRegex('React versus Angular')).toBe('comparison');
    expect(detectIntentByRegex('compared to last year')).toBe('comparison');
    expect(detectIntentByRegex('pros and cons of remote work')).toBe('comparison');
  });

  it('detects metrics intent', () => {
    expect(detectIntentByRegex('Q4 2025 revenue breakdown')).toBe('metrics');
    expect(detectIntentByRegex('Our KPI dashboard for the quarterly report')).toBe('metrics');
    expect(detectIntentByRegex('Financial earnings this year')).toBe('metrics');
  });

  it('detects process intent', () => {
    expect(detectIntentByRegex('How does blockchain work')).toBe('process');
    expect(detectIntentByRegex('Step by step guide to baking bread')).toBe('process');
    expect(detectIntentByRegex('The lifecycle of a butterfly')).toBe('process');
    expect(detectIntentByRegex('History of the internet')).toBe('process');
    expect(detectIntentByRegex('Evolution of smartphones')).toBe('process');
  });

  it('returns null for overview/general content', () => {
    expect(detectIntentByRegex('Climate change impacts on agriculture')).toBeNull();
    expect(detectIntentByRegex('What is artificial intelligence')).toBeNull();
  });
});

describe('getStyleForDomainIntent', () => {
  it('returns executive-institutional for business+ranking', () => {
    expect(getStyleForDomainIntent('business', 'ranking')).toBe('executive-institutional');
  });

  it('returns executive-institutional for technology+ranking', () => {
    expect(getStyleForDomainIntent('technology', 'ranking')).toBe('executive-institutional');
  });

  it('returns executive-institutional for finance+metrics', () => {
    expect(getStyleForDomainIntent('finance', 'metrics')).toBe('executive-institutional');
  });

  it('returns executive-institutional for science+process', () => {
    expect(getStyleForDomainIntent('science', 'process')).toBe('executive-institutional');
  });

  it('returns technical-schematic for technology+process', () => {
    expect(getStyleForDomainIntent('technology', 'process')).toBe('technical-schematic');
  });

  it('falls back to general for unknown domain', () => {
    expect(getStyleForDomainIntent('general', 'overview')).toBe('executive-institutional');
  });

  it('falls back to executive-institutional for unknown intent', () => {
    expect(getStyleForDomainIntent('business', 'unknown')).toBe('executive-institutional');
  });
});
