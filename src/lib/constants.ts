export const GUEST_CREDIT_LIMIT = 2;
export const FREE_TIER_DAILY_LIMIT = 5;
export const ENGINE_API_URL = process.env.ENGINE_API_URL || 'http://localhost:3000';

export const PRESETS = [
  { id: 'auto', name: 'Auto', description: 'AI picks the best layout and style', icon: 'Sparkles' },
  { id: 'executive-summary', name: 'Executive Summary', description: 'Board decks, quarterly reviews', icon: 'BarChart3' },
  { id: 'strategy-framework', name: 'Strategy Framework', description: 'Strategy presentations, frameworks', icon: 'Network' },
  { id: 'market-analysis', name: 'Market Analysis', description: 'Market sizing, competitive analysis', icon: 'TrendingUp' },
  { id: 'process-flow', name: 'Process Flow', description: 'Operations, workflows, playbooks', icon: 'GitBranch' },
  { id: 'competitive-landscape', name: 'Competitive Landscape', description: 'Head-to-head comparisons', icon: 'Swords' },
  { id: 'institutional-brief', name: 'Institutional Brief', description: 'JP Morgan / McKinsey-grade executive briefs', icon: 'Building2' },
  { id: 'deconstruct', name: 'Deconstruct', description: 'NYT-style exploded views, how things work', icon: 'Scan' },
  { id: 'aerial-explainer', name: 'Aerial Explainer', description: 'Drone-view cutaways of buildings and spaces', icon: 'Plane' },
] as const;

export const ASPECT_RATIOS = [
  { value: '16:9', label: 'Landscape', description: '16:9' },
  { value: '9:16', label: 'Portrait', description: '9:16' },
  { value: '1:1', label: 'Square', description: '1:1' },
] as const;
