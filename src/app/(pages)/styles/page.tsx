'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'motion/react';

/* ═══════════════════════════════════════════════════════
   STYLES DATA — all 20
   ═══════════════════════════════════════════════════════ */

const STYLES = [
  {
    id: 'executive-institutional',
    name: 'Executive Institutional',
    category: 'Dashboard',
    accent: '#D4A84B',
    icon: '\u25A6',
    desc: 'McKinsey-grade multi-panel dashboard. Bento grids, KPI tiles, clean data visualizations with a corporate palette. The gold standard for boardroom presentations.',
    bestFor: 'Executive summaries, quarterly reports, investor briefs',
    layouts: ['bento-grid', 'dashboard', 'comparison-matrix'],
    image: '/showcase/style-executive.png',
    featured: true,
  },
  {
    id: 'deconstruct',
    name: 'Deconstruct',
    category: 'Exploded View',
    accent: '#C04B3C',
    icon: '\u25CE',
    desc: 'NYT-style exploded view with callout lines and numbered annotations. Takes a complex object or system apart to reveal how it works.',
    bestFor: 'Product breakdowns, system architecture, how-it-works explanations',
    layouts: ['structural-breakdown', 'hierarchical-layers'],
    image: '/showcase/style-deconstruct.png',
    featured: true,
  },
  {
    id: 'aerial-explainer',
    name: 'Aerial Explainer',
    category: 'Architectural',
    accent: '#5B8DEF',
    icon: '\u25C7',
    desc: 'Drone-view isometric cutaway with numbered architectural callouts. Shows spatial relationships and flows from above.',
    bestFor: 'Facilities, campus plans, supply chains, process overview',
    layouts: ['structural-breakdown', 'isometric-map'],
    image: '/showcase/style-aerial.png',
  },
  {
    id: 'technical-schematic',
    name: 'Technical Schematic',
    category: 'Blueprint',
    accent: '#8BC34A',
    icon: '\u2B21',
    desc: 'Blueprint grid with precise linework and step-by-step process flows. Engineering-grade clarity for technical audiences.',
    bestFor: 'Technical documentation, process flows, system diagrams',
    layouts: ['linear-progression', 'hub-spoke', 'tree-branching'],
    image: '/showcase/style-schematic.png',
  },
  {
    id: 'craft-handmade',
    name: 'Craft Handmade',
    category: 'Illustrated',
    accent: '#A78BFA',
    icon: '\u2726',
    desc: 'Watercolor textures, hand-drawn illustrations, and winding narrative paths. Warm, personal, and approachable.',
    bestFor: 'Storytelling, timelines, educational content, editorial pieces',
    layouts: ['winding-roadmap', 'story-mountain', 'linear-progression'],
    image: '/showcase/style-craft.png',
    featured: true,
  },
  {
    id: 'bold-graphic',
    name: 'Bold Graphic',
    category: 'Poster',
    accent: '#FF6B6B',
    icon: '\u25A0',
    desc: 'High-contrast Swiss poster aesthetic. Oversized type, flat shapes, maximum visual impact. Commands attention instantly.',
    bestFor: 'Social media, event announcements, key statistics, one-pagers',
    layouts: ['bento-grid', 'binary-comparison', 'dashboard'],
    image: null,
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    category: 'Digital',
    accent: '#00F5FF',
    icon: '\u25C8',
    desc: 'Glowing neon lines on dark backgrounds. Circuit patterns, holographic overlays, and futuristic data displays.',
    bestFor: 'Technology topics, AI/ML content, crypto, gaming, digital culture',
    layouts: ['dashboard', 'hub-spoke', 'bento-grid'],
    image: null,
    featured: true,
  },
  {
    id: 'claymation',
    name: 'Claymation',
    category: 'Playful',
    accent: '#FF9F43',
    icon: '\u25CF',
    desc: "Soft 3D clay-rendered objects. Playful, tactile, Saturday-morning aesthetic. Makes complex topics feel approachable.",
    bestFor: "Product launches, children's education, startup pitches",
    layouts: ['bento-grid', 'hub-spoke', 'linear-progression'],
    image: null,
  },
  {
    id: 'kawaii',
    name: 'Kawaii',
    category: 'Illustrated',
    accent: '#FF6B9D',
    icon: '\u2661',
    desc: 'Cute illustrated characters with pastel tones. Friendly, charming, and instantly engaging.',
    bestFor: "Social media, health & wellness, children's content, tutorials",
    layouts: ['comic-strip', 'linear-progression', 'hub-spoke'],
    image: null,
  },
  {
    id: 'storybook-watercolor',
    name: 'Storybook Watercolor',
    category: 'Artistic',
    accent: '#C4A882',
    icon: '\u273F',
    desc: "Delicate paint washes and whimsical illustrations. Children's book warmth meets informational clarity.",
    bestFor: 'Narratives, historical timelines, cultural topics, nature & environment',
    layouts: ['story-mountain', 'winding-roadmap', 'linear-progression'],
    image: null,
  },
  {
    id: 'chalkboard',
    name: 'Chalkboard',
    category: 'Educational',
    accent: '#7CB342',
    icon: '\u25A4',
    desc: 'White chalk on dark green. Hand-lettered headers, sketch-note diagrams. The classroom meets visual thinking.',
    bestFor: 'Educational content, lectures, brainstorming summaries, how-tos',
    layouts: ['hub-spoke', 'tree-branching', 'linear-progression'],
    image: null,
  },
  {
    id: 'aged-academia',
    name: 'Aged Academia',
    category: 'Scholarly',
    accent: '#8D6E63',
    icon: '\u269C',
    desc: 'Sepia tones, aged paper textures, classical engravings. Scholarly elegance for serious subjects.',
    bestFor: 'Research papers, historical analysis, philosophy, literature',
    layouts: ['hierarchical-layers', 'tree-branching', 'comparison-matrix'],
    image: null,
  },
  {
    id: 'corporate-memphis',
    name: 'Corporate Memphis',
    category: 'Corporate',
    accent: '#9C27B0',
    icon: '\u25B3',
    desc: 'Flat geometric characters with minimal detail. The Silicon Valley deck aesthetic \u2014 clean, recognizable, scalable.',
    bestFor: 'SaaS products, company decks, onboarding materials, blog posts',
    layouts: ['bento-grid', 'linear-progression', 'hub-spoke'],
    image: null,
  },
  {
    id: 'origami',
    name: 'Origami',
    category: 'Artistic',
    accent: '#E91E63',
    icon: '\u25C6',
    desc: 'Paper-folded 3D forms with crisp edges and subtle shadows. Geometric elegance that suggests precision and craft.',
    bestFor: 'Design topics, architecture, mathematics, art & creativity',
    layouts: ['structural-breakdown', 'bento-grid', 'jigsaw'],
    image: null,
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    category: 'Retro',
    accent: '#4CAF50',
    icon: '\u25AA',
    desc: 'Retro 8-bit sprites and low-resolution charm. Nostalgic gaming aesthetic for tech-savvy audiences.',
    bestFor: 'Gaming industry, developer content, retro themes, social media',
    layouts: ['periodic-table', 'bento-grid', 'comic-strip'],
    image: null,
  },
  {
    id: 'ui-wireframe',
    name: 'UI Wireframe',
    category: 'Technical',
    accent: '#78909C',
    icon: '\u229E',
    desc: 'Clean wireframe aesthetic with precise grid layouts. Looks like a polished design specification document.',
    bestFor: 'UX documentation, feature specs, app comparisons, tech reviews',
    layouts: ['dashboard', 'comparison-matrix', 'bento-grid'],
    image: null,
  },
  {
    id: 'subway-map',
    name: 'Subway Map',
    category: 'Diagrammatic',
    accent: '#FF5722',
    icon: '\u22A1',
    desc: 'Transit-map style with colored lines, station dots, and interchange nodes. Perfect for showing connected processes.',
    bestFor: 'Process flows, learning paths, roadmaps, organizational charts',
    layouts: ['linear-progression', 'hub-spoke', 'circular-flow'],
    image: null,
  },
  {
    id: 'ikea-manual',
    name: 'IKEA Manual',
    category: 'Instructional',
    accent: '#2196F3',
    icon: '\u229E',
    desc: 'Minimal line drawings, numbered assembly steps. Clean, universal, needs no words to be understood.',
    bestFor: 'How-to guides, assembly instructions, step-by-step tutorials',
    layouts: ['linear-progression', 'comic-strip'],
    image: null,
  },
  {
    id: 'knolling',
    name: 'Knolling',
    category: 'Organized',
    accent: '#607D8B',
    icon: '\u22A1',
    desc: 'Top-down flat-lay arrangement. Every object orthogonal, perfectly organized. Satisfying visual order.',
    bestFor: 'Product showcases, inventory lists, comparison grids, tool roundups',
    layouts: ['periodic-table', 'bento-grid', 'comparison-matrix'],
    image: null,
  },
  {
    id: 'lego-brick',
    name: 'LEGO Brick',
    category: 'Playful',
    accent: '#F44336',
    icon: '\u25A7',
    desc: "Everything built from plastic bricks. Colorful, modular, endlessly playful. Makes any topic feel constructive.",
    bestFor: "Team building, project planning, children's education, fun reports",
    layouts: ['structural-breakdown', 'bento-grid', 'jigsaw'],
    image: null,
  },
];

/* ─── Derived data ─── */

const ALL_CATEGORIES = Array.from(new Set(STYLES.map((s) => s.category)));
const FEATURED_STYLES = STYLES.filter((s) => s.featured);

function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of STYLES) {
    counts[s.category] = (counts[s.category] || 0) + 1;
  }
  return counts;
}

const categoryCounts = getCategoryCounts();

/* ═══════════════════════════════════════════════════════
   STYLE PREVIEW SVGs — abstract visual for each style
   ═══════════════════════════════════════════════════════ */

function StylePreview({ styleId, accent }: { styleId: string; accent: string }) {
  const previewMap: Record<string, React.ReactNode> = {
    'executive-institutional': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <text x="20" y="40" fill={accent} fontFamily="monospace" fontSize="28" fontWeight="bold" opacity="0.9">$4.2M</text>
        <text x="20" y="55" fill={accent} fontFamily="monospace" fontSize="9" opacity="0.4">REVENUE YTD</text>
        <rect x="20" y="70" width="120" height="8" fill={accent} opacity="0.7" />
        <rect x="20" y="84" width="90" height="8" fill={accent} opacity="0.5" />
        <rect x="20" y="98" width="150" height="8" fill={accent} opacity="0.3" />
        <rect x="20" y="112" width="60" height="8" fill={accent} opacity="0.2" />
        <line x1="180" y1="30" x2="180" y2="160" stroke={accent} strokeOpacity="0.1" strokeWidth="1" />
        <line x1="200" y1="30" x2="200" y2="160" stroke={accent} strokeOpacity="0.1" strokeWidth="1" />
        <line x1="220" y1="30" x2="220" y2="160" stroke={accent} strokeOpacity="0.1" strokeWidth="1" />
        <line x1="240" y1="30" x2="240" y2="160" stroke={accent} strokeOpacity="0.1" strokeWidth="1" />
        <polyline points="180,140 195,110 210,125 225,80 240,90 255,60" stroke={accent} strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="255" cy="60" r="3" fill={accent} opacity="0.8" />
        <rect x="180" y="30" width="35" height="25" stroke={accent} strokeOpacity="0.15" strokeWidth="1" fill={accent} fillOpacity="0.05" />
        <rect x="220" y="30" width="40" height="25" stroke={accent} strokeOpacity="0.15" strokeWidth="1" fill={accent} fillOpacity="0.03" />
      </svg>
    ),
    'deconstruct': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <circle cx="140" cy="90" r="30" stroke={accent} strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="140" cy="90" r="12" fill={accent} opacity="0.15" />
        <line x1="165" y1="70" x2="220" y2="35" stroke={accent} strokeWidth="1.5" opacity="0.5" />
        <circle cx="220" cy="35" r="3" fill={accent} opacity="0.7" />
        <rect x="226" y="29" width="40" height="4" fill={accent} opacity="0.3" />
        <rect x="226" y="36" width="25" height="3" fill={accent} opacity="0.15" />
        <line x1="170" y1="90" x2="240" y2="90" stroke={accent} strokeWidth="1.5" opacity="0.5" />
        <circle cx="240" cy="90" r="3" fill={accent} opacity="0.7" />
        <rect x="246" y="84" width="30" height="4" fill={accent} opacity="0.3" />
        <line x1="115" y1="110" x2="50" y2="150" stroke={accent} strokeWidth="1.5" opacity="0.5" />
        <circle cx="50" cy="150" r="3" fill={accent} opacity="0.7" />
        <rect x="14" y="144" width="32" height="4" fill={accent} opacity="0.3" />
        <line x1="120" y1="68" x2="60" y2="35" stroke={accent} strokeWidth="1.5" opacity="0.5" />
        <circle cx="60" cy="35" r="3" fill={accent} opacity="0.7" />
        <rect x="14" y="29" width="40" height="4" fill={accent} opacity="0.3" />
        <text x="218" y="28" fill={accent} fontFamily="monospace" fontSize="8" opacity="0.6">01</text>
        <text x="238" y="83" fill={accent} fontFamily="monospace" fontSize="8" opacity="0.6">02</text>
        <text x="48" y="143" fill={accent} fontFamily="monospace" fontSize="8" opacity="0.6">03</text>
      </svg>
    ),
    'aerial-explainer': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        {[0,1,2,3,4,5,6].map((i) => <line key={`h${i}`} x1="20" y1={30+i*22} x2="260" y2={30+i*22} stroke={accent} strokeOpacity="0.08" strokeWidth="0.5" />)}
        {[0,1,2,3,4,5].map((i) => <line key={`d${i}`} x1={40+i*44} y1="20" x2={20+i*44} y2="170" stroke={accent} strokeOpacity="0.08" strokeWidth="0.5" />)}
        <polygon points="100,60 140,45 180,60 140,75" fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="1" strokeOpacity="0.3" />
        <polygon points="100,60 100,90 140,105 140,75" fill={accent} fillOpacity="0.08" stroke={accent} strokeWidth="1" strokeOpacity="0.2" />
        <polygon points="180,60 180,90 140,105 140,75" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="1" strokeOpacity="0.2" />
        <polygon points="60,110 80,100 100,110 80,120" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="0.5" strokeOpacity="0.2" />
        <polygon points="60,110 60,130 80,140 80,120" fill={accent} fillOpacity="0.06" />
        <line x1="140" y1="50" x2="220" y2="30" stroke={accent} strokeWidth="1" opacity="0.4" strokeDasharray="3 2" />
        <text x="222" y="33" fill={accent} fontFamily="monospace" fontSize="7" opacity="0.5">ZONE A</text>
      </svg>
    ),
    'technical-schematic': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        {[0,1,2,3,4,5,6,7,8].map((i) => <line key={`g${i}`} x1="10" y1={20+i*18} x2="270" y2={20+i*18} stroke={accent} strokeOpacity="0.06" strokeWidth="0.5" />)}
        {[0,1,2,3,4,5,6,7,8,9].map((i) => <line key={`v${i}`} x1={10+i*29} y1="10" x2={10+i*29} y2="170" stroke={accent} strokeOpacity="0.06" strokeWidth="0.5" />)}
        <circle cx="90" cy="70" r="25" stroke={accent} strokeWidth="1" strokeDasharray="4 3" fill="none" opacity="0.3" />
        <circle cx="190" cy="100" r="20" stroke={accent} strokeWidth="1" strokeDasharray="4 3" fill="none" opacity="0.3" />
        <line x1="115" y1="70" x2="170" y2="100" stroke={accent} strokeWidth="1.5" opacity="0.4" />
        <polygon points="170,100 164,96 164,104" fill={accent} opacity="0.4" />
        <rect x="30" y="120" width="50" height="20" stroke={accent} strokeWidth="1" fill="none" opacity="0.25" />
        <text x="38" y="133" fill={accent} fontFamily="monospace" fontSize="7" opacity="0.4">STEP 1</text>
        <line x1="80" y1="130" x2="100" y2="130" stroke={accent} strokeWidth="1" opacity="0.25" />
        <rect x="100" y="120" width="50" height="20" stroke={accent} strokeWidth="1" fill="none" opacity="0.25" />
        <text x="108" y="133" fill={accent} fontFamily="monospace" fontSize="7" opacity="0.4">STEP 2</text>
      </svg>
    ),
    'craft-handmade': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <path d="M20,40 Q70,25 120,45 T220,35 T270,50" stroke={accent} strokeWidth="3" fill="none" opacity="0.3" strokeLinecap="round" />
        <path d="M30,70 Q80,55 130,75 T230,65 T260,80" stroke={accent} strokeWidth="2" fill="none" opacity="0.2" strokeLinecap="round" />
        <path d="M20,100 Q90,85 140,105 T240,95" stroke={accent} strokeWidth="4" fill="none" opacity="0.15" strokeLinecap="round" />
        <circle cx="60" cy="50" r="6" fill={accent} opacity="0.1" />
        <circle cx="180" cy="45" r="8" fill={accent} opacity="0.08" />
        <circle cx="100" cy="120" r="10" fill={accent} opacity="0.06" />
        <circle cx="220" cy="110" r="5" fill={accent} opacity="0.12" />
        <path d="M140,130 L145,145 L160,145 L148,155 L153,170 L140,160 L127,170 L132,155 L120,145 L135,145 Z" fill={accent} opacity="0.15" stroke={accent} strokeWidth="1" strokeOpacity="0.3" />
        <path d="M40,150 Q80,135 100,155 T160,145 T200,160" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.25" strokeDasharray="6 4" strokeLinecap="round" />
      </svg>
    ),
    'bold-graphic': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <rect x="30" y="20" width="100" height="100" fill={accent} opacity="0.2" />
        <rect x="80" y="50" width="100" height="100" fill={accent} opacity="0.15" />
        <circle cx="220" cy="60" r="45" fill={accent} opacity="0.12" />
        <rect x="30" y="140" width="180" height="16" fill={accent} opacity="0.3" />
        <rect x="30" y="160" width="100" height="8" fill={accent} opacity="0.15" />
        <line x1="200" y1="120" x2="260" y2="170" stroke={accent} strokeWidth="6" opacity="0.2" strokeLinecap="square" />
      </svg>
    ),
    'cyberpunk-neon': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <defs>
          <filter id="nGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <rect x="20" y="30" width="200" height="2" fill={accent} opacity="0.8" filter="url(#nGlow)" />
        <rect x="60" y="36" width="80" height="1" fill={accent} opacity="0.3" />
        <rect x="30" y="70" width="160" height="2" fill={accent} opacity="0.6" filter="url(#nGlow)" />
        <rect x="100" y="76" width="60" height="1" fill={accent} opacity="0.2" />
        <rect x="40" y="110" width="180" height="2" fill={accent} opacity="0.5" filter="url(#nGlow)" />
        <rect x="20" y="150" width="120" height="2" fill={accent} opacity="0.4" filter="url(#nGlow)" />
        <circle cx="230" cy="30" r="4" fill={accent} opacity="0.8" filter="url(#nGlow)" />
        <circle cx="200" cy="70" r="3" fill={accent} opacity="0.6" filter="url(#nGlow)" />
        <circle cx="240" cy="110" r="5" fill={accent} opacity="0.5" filter="url(#nGlow)" />
        <polyline points="230,34 230,70 200,70" stroke={accent} strokeWidth="1" opacity="0.3" fill="none" />
        <polyline points="200,73 200,110 240,110" stroke={accent} strokeWidth="1" opacity="0.2" fill="none" />
        <text x="40" y="48" fill={accent} fontFamily="monospace" fontSize="8" opacity="0.5">0xF7A2</text>
        <text x="50" y="88" fill={accent} fontFamily="monospace" fontSize="7" opacity="0.3">SYS.ONLINE</text>
      </svg>
    ),
    'claymation': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <ellipse cx="80" cy="70" rx="40" ry="35" fill={accent} opacity="0.2" />
        <ellipse cx="160" cy="90" rx="50" ry="40" fill={accent} opacity="0.15" />
        <ellipse cx="220" cy="60" rx="30" ry="25" fill={accent} opacity="0.12" />
        <circle cx="50" cy="130" r="20" fill={accent} opacity="0.1" />
        <circle cx="130" cy="150" r="15" fill={accent} opacity="0.08" />
        <circle cx="240" cy="140" r="25" fill={accent} opacity="0.1" />
        <ellipse cx="70" cy="60" rx="12" ry="8" fill="white" opacity="0.06" />
        <ellipse cx="150" cy="78" rx="15" ry="10" fill="white" opacity="0.04" />
        <ellipse cx="80" cy="100" rx="35" ry="5" fill={accent} opacity="0.06" />
        <ellipse cx="160" cy="125" rx="40" ry="6" fill={accent} opacity="0.05" />
      </svg>
    ),
    'kawaii': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <circle cx="140" cy="80" r="45" fill={accent} opacity="0.15" stroke={accent} strokeWidth="2" strokeOpacity="0.3" />
        <ellipse cx="122" cy="72" rx="5" ry="6" fill={accent} opacity="0.5" />
        <ellipse cx="158" cy="72" rx="5" ry="6" fill={accent} opacity="0.5" />
        <ellipse cx="110" cy="88" rx="8" ry="5" fill={accent} opacity="0.12" />
        <ellipse cx="170" cy="88" rx="8" ry="5" fill={accent} opacity="0.12" />
        <path d="M125,92 Q140,108 155,92" stroke={accent} strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round" />
        <text x="50" y="50" fill={accent} fontSize="14" opacity="0.3">{'\u2726'}</text>
        <text x="220" y="60" fill={accent} fontSize="10" opacity="0.2">{'\u2726'}</text>
        <text x="200" y="150" fill={accent} fontSize="12" opacity="0.25">{'\u2726'}</text>
        <text x="60" y="140" fill={accent} fontSize="11" opacity="0.2">{'\u2665'}</text>
        <text x="240" y="100" fill={accent} fontSize="8" opacity="0.15">{'\u2665'}</text>
      </svg>
    ),
    'storybook-watercolor': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <ellipse cx="80" cy="60" rx="70" ry="40" fill={accent} opacity="0.08" />
        <ellipse cx="200" cy="80" rx="60" ry="50" fill={accent} opacity="0.06" />
        <ellipse cx="140" cy="130" rx="80" ry="35" fill={accent} opacity="0.05" />
        <circle cx="40" cy="40" r="20" fill={accent} opacity="0.04" />
        <circle cx="250" cy="50" r="15" fill={accent} opacity="0.06" />
        <circle cx="60" cy="150" r="25" fill={accent} opacity="0.03" />
        <path d="M30,90 Q80,75 130,95 T230,85" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.2" />
        <path d="M50,110 Q100,95 150,115 T250,105" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.15" />
        <circle cx="230" cy="140" r="4" fill={accent} opacity="0.2" />
        <circle cx="225" cy="134" r="3" fill={accent} opacity="0.12" />
        <circle cx="236" cy="134" r="3" fill={accent} opacity="0.12" />
        <circle cx="224" cy="146" r="3" fill={accent} opacity="0.12" />
        <circle cx="236" cy="146" r="3" fill={accent} opacity="0.12" />
      </svg>
    ),
    'chalkboard': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <rect x="10" y="10" width="260" height="160" fill="#2E5A2E" opacity="0.3" />
        <line x1="30" y1="40" x2="150" y2="40" stroke="#E8E8E0" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
        <line x1="30" y1="60" x2="110" y2="60" stroke="#E8E8E0" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
        <circle cx="200" cy="70" r="25" stroke="#E8E8E0" strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="4 3" />
        <line x1="130" y1="90" x2="180" y2="90" stroke="#E8E8E0" strokeWidth="1.5" opacity="0.3" />
        <polygon points="180,90 175,86 175,94" fill="#E8E8E0" opacity="0.3" />
        <rect x="40" y="110" width="60" height="40" stroke="#E8E8E0" strokeWidth="1" fill="none" opacity="0.2" />
        <text x="50" y="134" fill="#E8E8E0" fontFamily="monospace" fontSize="8" opacity="0.3">abc</text>
        <text x="160" y="130" fill={accent} fontFamily="monospace" fontSize="10" opacity="0.4">E=mc2</text>
      </svg>
    ),
    'aged-academia': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <rect x="60" y="20" width="160" height="140" fill={accent} opacity="0.06" stroke={accent} strokeWidth="1" strokeOpacity="0.15" />
        <rect x="65" y="25" width="150" height="130" fill="none" stroke={accent} strokeWidth="0.5" strokeOpacity="0.1" />
        <rect x="80" y="40" width="120" height="3" fill={accent} opacity="0.2" />
        <rect x="80" y="50" width="100" height="3" fill={accent} opacity="0.15" />
        <rect x="80" y="60" width="110" height="3" fill={accent} opacity="0.15" />
        <rect x="80" y="75" width="120" height="3" fill={accent} opacity="0.12" />
        <rect x="80" y="85" width="90" height="3" fill={accent} opacity="0.12" />
        <line x1="80" y1="100" x2="200" y2="100" stroke={accent} strokeWidth="0.5" opacity="0.2" />
        <circle cx="140" cy="125" r="15" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.15" />
        <line x1="60" y1="20" x2="60" y2="160" stroke={accent} strokeWidth="2" opacity="0.15" />
      </svg>
    ),
    'corporate-memphis': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <circle cx="140" cy="50" r="18" fill={accent} opacity="0.3" />
        <rect x="120" y="68" width="40" height="50" fill={accent} opacity="0.2" />
        <rect x="90" y="75" width="30" height="8" fill={accent} opacity="0.15" />
        <rect x="160" y="75" width="30" height="8" fill={accent} opacity="0.15" />
        <rect x="122" y="118" width="12" height="30" fill={accent} opacity="0.15" />
        <rect x="146" y="118" width="12" height="30" fill={accent} opacity="0.15" />
        <circle cx="50" cy="40" r="10" fill={accent} opacity="0.1" />
        <rect x="220" y="30" width="20" height="20" fill={accent} opacity="0.08" />
        <polygon points="240,130 250,110 260,130" fill={accent} opacity="0.1" />
        <rect x="35" y="120" width="6" height="30" fill={accent} opacity="0.1" />
        <circle cx="38" cy="115" r="8" fill={accent} opacity="0.08" />
      </svg>
    ),
    'origami': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <polygon points="140,20 220,90 140,160 60,90" fill={accent} opacity="0.08" stroke={accent} strokeWidth="1.5" strokeOpacity="0.3" />
        <line x1="140" y1="20" x2="140" y2="160" stroke={accent} strokeWidth="0.5" opacity="0.2" />
        <line x1="60" y1="90" x2="220" y2="90" stroke={accent} strokeWidth="0.5" opacity="0.2" />
        <polygon points="140,20 220,90 140,90" fill={accent} opacity="0.12" />
        <polygon points="140,90 220,90 140,160" fill={accent} opacity="0.06" />
        <polygon points="40,40 60,30 60,50" fill={accent} opacity="0.15" stroke={accent} strokeWidth="0.5" strokeOpacity="0.2" />
        <polygon points="230,130 250,120 250,140" fill={accent} opacity="0.1" stroke={accent} strokeWidth="0.5" strokeOpacity="0.15" />
        <ellipse cx="145" cy="165" rx="40" ry="4" fill={accent} opacity="0.06" />
      </svg>
    ),
    'pixel-art': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        {[0,1,2,3,4,5,6,7,8,9,10,11].map((row) =>
          [0,1,2,3,4,5,6,7,8,9,10,11,12,13].map((col) => {
            const show = (row+col) % 3 === 0 || (row*col) % 7 === 1;
            if (!show) return null;
            const op = 0.05 + ((row*col) % 5) * 0.04;
            return <rect key={`px${row}-${col}`} x={20+col*18} y={15+row*14} width="14" height="11" fill={accent} opacity={op} />;
          })
        )}
        <rect x="110" y="57" width="14" height="11" fill={accent} opacity="0.4" />
        <rect x="128" y="57" width="14" height="11" fill={accent} opacity="0.4" />
        <rect x="146" y="57" width="14" height="11" fill={accent} opacity="0.4" />
        <rect x="92" y="71" width="14" height="11" fill={accent} opacity="0.3" />
        <rect x="164" y="71" width="14" height="11" fill={accent} opacity="0.3" />
        <rect x="110" y="85" width="14" height="11" fill={accent} opacity="0.35" />
        <rect x="128" y="85" width="14" height="11" fill={accent} opacity="0.35" />
        <rect x="146" y="85" width="14" height="11" fill={accent} opacity="0.35" />
      </svg>
    ),
    'ui-wireframe': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <rect x="20" y="20" width="240" height="16" stroke={accent} strokeWidth="1" fill={accent} fillOpacity="0.05" strokeOpacity="0.2" />
        <rect x="24" y="24" width="30" height="8" fill={accent} opacity="0.15" />
        <rect x="200" y="24" width="14" height="8" fill={accent} opacity="0.1" />
        <rect x="220" y="24" width="14" height="8" fill={accent} opacity="0.1" />
        <rect x="20" y="42" width="60" height="120" stroke={accent} strokeWidth="1" fill="none" strokeOpacity="0.15" />
        <rect x="28" y="52" width="44" height="6" fill={accent} opacity="0.12" />
        <rect x="28" y="64" width="44" height="6" fill={accent} opacity="0.08" />
        <rect x="28" y="76" width="44" height="6" fill={accent} opacity="0.08" />
        <rect x="28" y="88" width="44" height="6" fill={accent} opacity="0.08" />
        <rect x="86" y="42" width="174" height="70" stroke={accent} strokeWidth="1" fill="none" strokeOpacity="0.12" />
        <rect x="94" y="50" width="80" height="8" fill={accent} opacity="0.15" />
        <rect x="94" y="64" width="150" height="4" fill={accent} opacity="0.06" />
        <rect x="94" y="72" width="140" height="4" fill={accent} opacity="0.06" />
        <rect x="86" y="118" width="82" height="44" stroke={accent} strokeWidth="1" fill="none" strokeOpacity="0.1" />
        <rect x="178" y="118" width="82" height="44" stroke={accent} strokeWidth="1" fill="none" strokeOpacity="0.1" />
      </svg>
    ),
    'subway-map': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <line x1="30" y1="50" x2="250" y2="50" stroke={accent} strokeWidth="3" opacity="0.5" />
        <circle cx="60" cy="50" r="5" fill="#0A0A0B" stroke={accent} strokeWidth="2" opacity="0.6" />
        <circle cx="120" cy="50" r="5" fill="#0A0A0B" stroke={accent} strokeWidth="2" opacity="0.6" />
        <circle cx="180" cy="50" r="5" fill="#0A0A0B" stroke={accent} strokeWidth="2" opacity="0.6" />
        <circle cx="230" cy="50" r="5" fill="#0A0A0B" stroke={accent} strokeWidth="2" opacity="0.6" />
        <polyline points="40,120 120,120 150,80 250,80" stroke={accent} strokeWidth="3" opacity="0.3" fill="none" />
        <circle cx="40" cy="120" r="4" fill="#0A0A0B" stroke={accent} strokeWidth="2" opacity="0.4" />
        <circle cx="120" cy="120" r="6" fill="#0A0A0B" stroke={accent} strokeWidth="2" opacity="0.5" />
        <circle cx="250" cy="80" r="4" fill="#0A0A0B" stroke={accent} strokeWidth="2" opacity="0.4" />
        <circle cx="120" cy="50" r="8" fill="none" stroke={accent} strokeWidth="1" opacity="0.2" />
        <polyline points="60,150 120,120 200,150" stroke={accent} strokeWidth="2" opacity="0.2" fill="none" />
        <circle cx="60" cy="150" r="3" fill="#0A0A0B" stroke={accent} strokeWidth="1.5" opacity="0.3" />
        <circle cx="200" cy="150" r="3" fill="#0A0A0B" stroke={accent} strokeWidth="1.5" opacity="0.3" />
        <text x="55" y="40" fill={accent} fontFamily="monospace" fontSize="6" opacity="0.3">STA.1</text>
        <text x="115" y="40" fill={accent} fontFamily="monospace" fontSize="6" opacity="0.3">HUB</text>
      </svg>
    ),
    'ikea-manual': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="14" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.3" />
        <text x="46" y="55" fill={accent} fontFamily="monospace" fontSize="12" opacity="0.5">1</text>
        <rect x="30" y="70" width="40" height="30" stroke={accent} strokeWidth="1" fill="none" opacity="0.15" strokeDasharray="3 2" />
        <line x1="80" y1="50" x2="110" y2="50" stroke={accent} strokeWidth="1" opacity="0.2" />
        <polygon points="110,50 106,46 106,54" fill={accent} opacity="0.2" />
        <circle cx="140" cy="50" r="14" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.3" />
        <text x="136" y="55" fill={accent} fontFamily="monospace" fontSize="12" opacity="0.5">2</text>
        <rect x="120" y="70" width="40" height="30" stroke={accent} strokeWidth="1" fill="none" opacity="0.15" strokeDasharray="3 2" />
        <line x1="170" y1="50" x2="200" y2="50" stroke={accent} strokeWidth="1" opacity="0.2" />
        <polygon points="200,50 196,46 196,54" fill={accent} opacity="0.2" />
        <circle cx="230" cy="50" r="14" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.3" />
        <text x="226" y="55" fill={accent} fontFamily="monospace" fontSize="12" opacity="0.5">3</text>
        <rect x="210" y="70" width="40" height="30" stroke={accent} strokeWidth="1" fill="none" opacity="0.15" strokeDasharray="3 2" />
        <path d="M225,130 L235,145 L255,120" stroke={accent} strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round" />
      </svg>
    ),
    'knolling': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <rect x="20" y="20" width="50" height="35" fill={accent} opacity="0.15" stroke={accent} strokeWidth="0.5" strokeOpacity="0.2" />
        <rect x="78" y="20" width="35" height="35" fill={accent} opacity="0.1" stroke={accent} strokeWidth="0.5" strokeOpacity="0.15" />
        <rect x="121" y="20" width="60" height="35" fill={accent} opacity="0.08" stroke={accent} strokeWidth="0.5" strokeOpacity="0.12" />
        <rect x="189" y="20" width="35" height="35" fill={accent} opacity="0.12" stroke={accent} strokeWidth="0.5" strokeOpacity="0.18" />
        <rect x="20" y="63" width="35" height="50" fill={accent} opacity="0.12" stroke={accent} strokeWidth="0.5" strokeOpacity="0.15" />
        <rect x="63" y="63" width="50" height="50" fill={accent} opacity="0.06" stroke={accent} strokeWidth="0.5" strokeOpacity="0.1" />
        <rect x="121" y="63" width="45" height="25" fill={accent} opacity="0.1" stroke={accent} strokeWidth="0.5" strokeOpacity="0.15" />
        <rect x="174" y="63" width="50" height="50" fill={accent} opacity="0.08" stroke={accent} strokeWidth="0.5" strokeOpacity="0.12" />
        <rect x="121" y="96" width="45" height="17" fill={accent} opacity="0.14" stroke={accent} strokeWidth="0.5" strokeOpacity="0.2" />
        <rect x="20" y="121" width="70" height="35" fill={accent} opacity="0.09" stroke={accent} strokeWidth="0.5" strokeOpacity="0.12" />
        <rect x="98" y="121" width="35" height="35" fill={accent} opacity="0.11" stroke={accent} strokeWidth="0.5" strokeOpacity="0.15" />
        <rect x="141" y="121" width="55" height="35" fill={accent} opacity="0.07" stroke={accent} strokeWidth="0.5" strokeOpacity="0.1" />
      </svg>
    ),
    'lego-brick': (
      <svg viewBox="0 0 280 180" fill="none" className="w-full h-full">
        <rect x="40" y="40" width="60" height="30" fill={accent} opacity="0.25" stroke={accent} strokeWidth="1" strokeOpacity="0.3" />
        <circle cx="55" cy="37" r="5" fill={accent} opacity="0.3" />
        <circle cx="75" cy="37" r="5" fill={accent} opacity="0.3" />
        <circle cx="95" cy="37" r="5" fill={accent} opacity="0.3" />
        <rect x="100" y="40" width="40" height="30" fill={accent} opacity="0.18" stroke={accent} strokeWidth="1" strokeOpacity="0.25" />
        <circle cx="115" cy="37" r="5" fill={accent} opacity="0.22" />
        <circle cx="135" cy="37" r="5" fill={accent} opacity="0.22" />
        <rect x="160" y="40" width="60" height="30" fill={accent} opacity="0.12" stroke={accent} strokeWidth="1" strokeOpacity="0.2" />
        <circle cx="175" cy="37" r="5" fill={accent} opacity="0.15" />
        <circle cx="195" cy="37" r="5" fill={accent} opacity="0.15" />
        <circle cx="215" cy="37" r="5" fill={accent} opacity="0.15" />
        <rect x="60" y="70" width="40" height="30" fill={accent} opacity="0.2" stroke={accent} strokeWidth="1" strokeOpacity="0.25" />
        <circle cx="75" cy="67" r="5" fill={accent} opacity="0.25" />
        <circle cx="95" cy="67" r="5" fill={accent} opacity="0.25" />
        <rect x="100" y="70" width="60" height="30" fill={accent} opacity="0.15" stroke={accent} strokeWidth="1" strokeOpacity="0.2" />
        <circle cx="115" cy="67" r="5" fill={accent} opacity="0.2" />
        <circle cx="135" cy="67" r="5" fill={accent} opacity="0.2" />
        <circle cx="155" cy="67" r="5" fill={accent} opacity="0.2" />
        <rect x="80" y="100" width="60" height="30" fill={accent} opacity="0.22" stroke={accent} strokeWidth="1" strokeOpacity="0.28" />
        <circle cx="95" cy="97" r="5" fill={accent} opacity="0.28" />
        <circle cx="115" cy="97" r="5" fill={accent} opacity="0.28" />
        <circle cx="135" cy="97" r="5" fill={accent} opacity="0.28" />
        <rect x="140" y="100" width="40" height="30" fill={accent} opacity="0.16" stroke={accent} strokeWidth="1" strokeOpacity="0.22" />
        <circle cx="155" cy="97" r="5" fill={accent} opacity="0.2" />
        <circle cx="175" cy="97" r="5" fill={accent} opacity="0.2" />
      </svg>
    ),
  };

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: styleId === 'chalkboard' ? '#1a3a1a' : '#0A0A0B' }}>
      {previewMap[styleId] || (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-3xl opacity-20">{STYLES.find((s) => s.id === styleId)?.icon}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Animated counter ─── */

function AnimatedCounter({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration * 60);
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(id);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

/* ─── Staggered card wrapper ─── */

function StaggerCard({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Hero color mosaic (pulsing style accent colors) ─── */

function HeroMosaic() {
  const colors = STYLES.map((s) => s.accent);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 gap-[1px] opacity-[0.12]">
        {colors.map((color, i) => (
          <motion.div
            key={i}
            className="w-full h-full"
            style={{ backgroundColor: color }}
            animate={{ opacity: [0.3, 0.8, 0.5, 1, 0.3] }}
            transition={{
              duration: 4 + (i % 5) * 0.8,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/30 via-[#0A0A0B]/60 to-[#0A0A0B]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B]/50 via-transparent to-[#0A0A0B]/50" />
    </div>
  );
}

/* ─── Style Card ─── */

function StyleCard({ style, large = false }: { style: (typeof STYLES)[number]; large?: boolean }) {
  return (
    <motion.div
      layout
      className="group relative border-2 border-white/[0.06] bg-white/[0.015] overflow-hidden transition-all duration-300 hover:-translate-y-[2px]"
      style={{
        // @ts-expect-error CSS custom properties
        '--card-accent': style.accent,
      }}
      whileHover={{
        borderColor: style.accent,
        boxShadow: `0 8px 40px ${style.accent}20`,
      }}
    >
      {/* Preview area with SVG illustration */}
      <div
        className={`relative overflow-hidden ${large ? 'h-[220px]' : 'h-[180px]'}`}
        style={{ borderBottom: `1px solid ${style.accent}15` }}
      >
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <StylePreview styleId={style.id} accent={style.accent} />
        </motion.div>
        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at center, ${style.accent}08 0%, transparent 70%)` }}
        />
        {/* Icon badge */}
        <div
          className="absolute top-3 right-3 flex items-center justify-center h-8 w-8 border border-white/[0.08] bg-[#0A0A0B]/80 backdrop-blur-sm"
          style={{ color: style.accent }}
        >
          <span className="text-sm transition-all duration-300 group-hover:drop-shadow-[0_0_8px_var(--card-accent)]">
            {style.icon}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h3 className="text-sm font-mono font-bold text-white">{style.name}</h3>
          <span className="text-[9px] font-mono tracking-widest uppercase text-white/25">{style.category}</span>
        </div>

        <p className={`text-xs text-white/40 leading-relaxed ${large ? '' : 'line-clamp-2'}`}>
          {style.desc}
        </p>

        <div className="flex flex-wrap gap-1">
          {style.bestFor.split(', ').map((tag) => (
            <span key={tag} className="text-[9px] font-mono text-white/35 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {style.layouts.map((layout) => (
            <span key={layout} className="flex items-center gap-1.5">
              <span className="h-[4px] w-[4px] inline-block shrink-0" style={{ backgroundColor: style.accent }} />
              <span className="text-[9px] font-mono text-white/25">{layout}</span>
            </span>
          ))}
        </div>

        {/* CTA — always visible */}
        <div className="pt-1">
          <Link
            href={`/?style=${style.id}`}
            className="inline-flex items-center gap-2 text-[10px] font-mono font-semibold tracking-widest uppercase px-4 py-2 border-2 transition-all duration-200"
            style={{ color: style.accent, borderColor: style.accent }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = style.accent;
              e.currentTarget.style.color = '#0A0A0B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = style.accent;
            }}
          >
            Try this style
            <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>&#8599;</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Featured Style Card ─── */

function FeaturedStyleCard({ style, index }: { style: (typeof STYLES)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
    >
      <StyleCard style={style} large />
    </motion.div>
  );
}

/* ─── Marquee ticker (fast) ─── */

function MarqueeTicker() {
  const items = STYLES.map((s) => ({ name: s.name, accent: s.accent }));
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden py-5">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0A0A0B] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0A0A0B] to-transparent z-10 pointer-events-none" />

      <div className="flex gap-4 animate-marquee-fast whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={`${item.name}-${i}`} className="flex items-center gap-3 shrink-0">
            <span className="h-[6px] w-[6px] inline-block" style={{ backgroundColor: item.accent }} />
            <span className="text-sm font-mono text-white/20 uppercase tracking-widest">{item.name}</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee-fast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-fast {
          animation: marquee-fast 22s linear infinite;
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */

export default function StylesPage() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = activeFilter ? STYLES.filter((s) => s.category === activeFilter) : STYLES;

  return (
    <div className="min-h-screen bg-[#0A0A0B]">

      {/* ── IMMERSIVE HERO ── */}
      <div className="relative overflow-hidden">
        <HeroMosaic />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-8 sm:pt-28 sm:pb-12">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[10px] font-mono font-semibold tracking-[0.25em] uppercase text-[#D4A84B] mb-5"
          >
            Style Gallery
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-mono font-bold text-white leading-[0.95] mb-4"
          >
            20 visual styles.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base sm:text-lg font-mono text-white/30 max-w-xl"
          >
            Each one a different visual language. Pair with 20 layouts for{' '}
            <span className="text-[#D4A84B]">400+ combinations</span>.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10"
        >
          <MarqueeTicker />
        </motion.div>
      </div>

      {/* ── STATS COUNTER — dramatic gold numbers ── */}
      <div className="border-y border-white/[0.06] bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10 flex items-center justify-center gap-6 sm:gap-12 text-center">
          <div className="flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-mono font-bold text-[#D4A84B]">
              <AnimatedCounter target={20} />
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-white/25 mt-1">styles</span>
          </div>
          <span className="text-white/10 text-3xl sm:text-4xl font-mono select-none">&times;</span>
          <div className="flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-mono font-bold text-[#D4A84B]">
              <AnimatedCounter target={20} />
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-white/25 mt-1">layouts</span>
          </div>
          <span className="text-white/10 text-3xl sm:text-4xl font-mono select-none">=</span>
          <div className="flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-mono font-bold text-white">
              <AnimatedCounter target={400} duration={1.6} />
              <span className="text-2xl sm:text-3xl text-[#D4A84B]">+</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-white/25 mt-1">combinations</span>
          </div>
        </div>
      </div>

      {/* ── FEATURED STYLES ── */}
      <div className="mx-auto max-w-6xl px-6 pt-16 sm:pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-[10px] font-mono font-semibold tracking-[0.25em] uppercase text-[#D4A84B] mb-2">
            Popular picks
          </p>
          <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white">Featured styles</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_STYLES.map((style, i) => (
            <FeaturedStyleCard key={style.id} style={style} index={i} />
          ))}
        </div>
      </div>

      {/* ── FULL GALLERY ── */}
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-16 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white">All {STYLES.length} styles</h2>
        </motion.div>

        {/* Category filter with sliding gold underline */}
        <div className="sticky top-0 z-30 -mx-6 px-6 py-3 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/[0.04] mb-10">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 relative">
            <button
              onClick={() => setActiveFilter(null)}
              className={`relative shrink-0 text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 transition-colors duration-200 ${
                activeFilter === null ? 'text-[#D4A84B]' : 'text-white/30 hover:text-white/50'
              }`}
            >
              All
              <span className="ml-1 text-white/20">{STYLES.length}</span>
              {activeFilter === null && (
                <motion.div
                  layoutId="filter-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4A84B]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>

            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat === activeFilter ? null : cat)}
                className={`relative shrink-0 text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 transition-colors duration-200 ${
                  activeFilter === cat ? 'text-[#D4A84B]' : 'text-white/30 hover:text-white/50'
                }`}
              >
                {cat}
                <span className="ml-1 text-white/20">{categoryCounts[cat]}</span>
                {activeFilter === cat && (
                  <motion.div
                    layoutId="filter-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4A84B]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3-column grid */}
        <AnimatePresence mode="popLayout">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((style, i) => (
              <AnimatePresence key={style.id} mode="popLayout">
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                >
                  <StaggerCard index={i}>
                    <StyleCard style={style} />
                  </StaggerCard>
                </motion.div>
              </AnimatePresence>
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm font-mono text-white/30">No styles in this category.</p>
          </div>
        )}
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-mono font-bold text-white mb-4">
              Can&apos;t decide?
            </h2>
            <p className="text-sm font-mono text-white/30 mb-8 max-w-md mx-auto">
              Let the AI analyze your content and pick the perfect style + layout combination automatically.
            </p>
            <Link
              href="/?preset=auto"
              className="inline-flex items-center gap-3 text-xs font-mono font-bold tracking-widest uppercase px-8 py-3 border-2 border-[#D4A84B] text-[#D4A84B] transition-all duration-200 hover:bg-[#D4A84B] hover:text-[#0A0A0B]"
            >
              Let the AI choose
              <span aria-hidden>&#8599;</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
