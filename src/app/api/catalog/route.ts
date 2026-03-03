import { NextResponse } from 'next/server';

const PRESETS = [
  { id: 'executive-summary', name: 'Executive Summary', description: 'Clean overview for board decks' },
  { id: 'strategy-framework', name: 'Strategy Framework', description: 'Hub-spoke for strategy presentations' },
  { id: 'market-analysis', name: 'Market Analysis', description: 'Comparison matrix for market sizing' },
  { id: 'process-flow', name: 'Process Flow', description: 'Linear progression for workflows' },
  { id: 'competitive-landscape', name: 'Competitive Landscape', description: 'Binary comparison for analysis' },
  { id: 'institutional-brief', name: 'Institutional Brief', description: 'McKinsey-grade executive brief' },
  { id: 'deconstruct', name: 'Deconstruct', description: 'NYT-style exploded view' },
  { id: 'aerial-explainer', name: 'Aerial Explainer', description: 'Drone-view isometric cutaway' },
];

const LAYOUTS = [
  { id: 'bento-grid', name: 'Bento Grid' }, { id: 'dashboard', name: 'Dashboard' },
  { id: 'linear-progression', name: 'Linear Progression' }, { id: 'hub-spoke', name: 'Hub & Spoke' },
  { id: 'structural-breakdown', name: 'Structural Breakdown' }, { id: 'comparison-matrix', name: 'Comparison Matrix' },
  { id: 'binary-comparison', name: 'Binary Comparison' }, { id: 'winding-roadmap', name: 'Winding Roadmap' },
  { id: 'hierarchical-layers', name: 'Hierarchical Layers' }, { id: 'funnel', name: 'Funnel' },
];

const STYLES = [
  { id: 'corporate-memphis', name: 'Corporate Memphis' }, { id: 'executive-institutional', name: 'Executive Institutional' },
  { id: 'deconstruct', name: 'Deconstruct' }, { id: 'aerial-explainer', name: 'Aerial Explainer' },
  { id: 'bold-graphic', name: 'Bold Graphic' }, { id: 'technical-schematic', name: 'Technical Schematic' },
  { id: 'craft-handmade', name: 'Craft Handmade' }, { id: 'aged-academia', name: 'Aged Academia' },
  { id: 'claymation', name: 'Claymation' }, { id: 'kawaii', name: 'Kawaii' },
  { id: 'chalkboard', name: 'Chalkboard' }, { id: 'cyberpunk-neon', name: 'Cyberpunk Neon' },
  { id: 'ikea-manual', name: 'IKEA Manual' }, { id: 'pixel-art', name: 'Pixel Art' },
  { id: 'knolling', name: 'Knolling' }, { id: 'lego-brick', name: 'LEGO Brick' },
  { id: 'origami', name: 'Origami' }, { id: 'storybook-watercolor', name: 'Storybook Watercolor' },
];

export async function GET() {
  return NextResponse.json(
    { presets: PRESETS, layouts: LAYOUTS, styles: STYLES },
    { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' } },
  );
}
