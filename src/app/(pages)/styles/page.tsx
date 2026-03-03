import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Style Guide — ZGNAL.AI',
  description: 'Explore all 20 visual styles available in the ZGNAL.AI Infographic Lab.',
};

const STYLES = [
  {
    id: 'executive-institutional',
    name: 'Executive Institutional',
    category: 'Dashboard',
    accent: '#D4A84B',
    icon: '▦',
    desc: 'McKinsey-grade multi-panel dashboard. Bento grids, KPI tiles, clean data visualizations with a corporate palette. The gold standard for boardroom presentations.',
    bestFor: 'Executive summaries, quarterly reports, investor briefs',
    layouts: ['bento-grid', 'dashboard', 'comparison-matrix'],
    image: '/showcase/style-executive.png',
  },
  {
    id: 'deconstruct',
    name: 'Deconstruct',
    category: 'Exploded View',
    accent: '#C04B3C',
    icon: '◎',
    desc: 'NYT-style exploded view with callout lines and numbered annotations. Takes a complex object or system apart to reveal how it works.',
    bestFor: 'Product breakdowns, system architecture, how-it-works explanations',
    layouts: ['structural-breakdown', 'hierarchical-layers'],
    image: '/showcase/style-deconstruct.png',
  },
  {
    id: 'aerial-explainer',
    name: 'Aerial Explainer',
    category: 'Architectural',
    accent: '#5B8DEF',
    icon: '◇',
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
    icon: '⬡',
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
    icon: '✦',
    desc: 'Watercolor textures, hand-drawn illustrations, and winding narrative paths. Warm, personal, and approachable.',
    bestFor: 'Storytelling, timelines, educational content, editorial pieces',
    layouts: ['winding-roadmap', 'story-mountain', 'linear-progression'],
    image: '/showcase/style-craft.png',
  },
  {
    id: 'bold-graphic',
    name: 'Bold Graphic',
    category: 'Poster',
    accent: '#FF6B6B',
    icon: '■',
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
    icon: '◈',
    desc: 'Glowing neon lines on dark backgrounds. Circuit patterns, holographic overlays, and futuristic data displays.',
    bestFor: 'Technology topics, AI/ML content, crypto, gaming, digital culture',
    layouts: ['dashboard', 'hub-spoke', 'bento-grid'],
    image: null,
  },
  {
    id: 'claymation',
    name: 'Claymation',
    category: 'Playful',
    accent: '#FF9F43',
    icon: '●',
    desc: 'Soft 3D clay-rendered objects. Playful, tactile, Saturday-morning aesthetic. Makes complex topics feel approachable.',
    bestFor: 'Product launches, children\'s education, startup pitches',
    layouts: ['bento-grid', 'hub-spoke', 'linear-progression'],
    image: null,
  },
  {
    id: 'kawaii',
    name: 'Kawaii',
    category: 'Illustrated',
    accent: '#FF6B9D',
    icon: '♡',
    desc: 'Cute illustrated characters with pastel tones. Friendly, charming, and instantly engaging.',
    bestFor: 'Social media, health & wellness, children\'s content, tutorials',
    layouts: ['comic-strip', 'linear-progression', 'hub-spoke'],
    image: null,
  },
  {
    id: 'storybook-watercolor',
    name: 'Storybook Watercolor',
    category: 'Artistic',
    accent: '#C4A882',
    icon: '✿',
    desc: 'Delicate paint washes and whimsical illustrations. Children\'s book warmth meets informational clarity.',
    bestFor: 'Narratives, historical timelines, cultural topics, nature & environment',
    layouts: ['story-mountain', 'winding-roadmap', 'linear-progression'],
    image: null,
  },
  {
    id: 'chalkboard',
    name: 'Chalkboard',
    category: 'Educational',
    accent: '#7CB342',
    icon: '▤',
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
    icon: '⚜',
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
    icon: '△',
    desc: 'Flat geometric characters with minimal detail. The Silicon Valley deck aesthetic — clean, recognizable, scalable.',
    bestFor: 'SaaS products, company decks, onboarding materials, blog posts',
    layouts: ['bento-grid', 'linear-progression', 'hub-spoke'],
    image: null,
  },
  {
    id: 'origami',
    name: 'Origami',
    category: 'Artistic',
    accent: '#E91E63',
    icon: '◆',
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
    icon: '▪',
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
    icon: '⊞',
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
    icon: '⊡',
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
    icon: '⊞',
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
    icon: '⊡',
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
    icon: '▧',
    desc: 'Everything built from plastic bricks. Colorful, modular, endlessly playful. Makes any topic feel constructive.',
    bestFor: 'Team building, project planning, children\'s education, fun reports',
    layouts: ['structural-breakdown', 'bento-grid', 'jigsaw'],
    image: null,
  },
];

export default function StylesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">Style Guide</p>
        <h1 className="text-4xl sm:text-5xl font-mono font-bold text-white leading-tight mb-6">
          20 visual styles.
        </h1>
        <p className="text-base text-white/50 max-w-2xl">
          Each style is a distinct visual language — from McKinsey-grade dashboards to hand-drawn watercolors. Combined with 20 layouts, the engine offers 400+ unique combinations.
        </p>
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STYLES.map((style) => (
          <div
            key={style.id}
            className="group border border-white/[0.06] bg-white/[0.01] overflow-hidden hover:border-white/[0.12] transition-colors"
          >
            {/* Image or placeholder */}
            {style.image ? (
              <div className="relative aspect-video bg-[#0D0D0E] overflow-hidden">
                <Image
                  src={style.image}
                  alt={`${style.name} style example`}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent" />
              </div>
            ) : (
              <div className="aspect-video bg-[#0D0D0E] flex items-center justify-center relative">
                <span className="text-5xl opacity-30" style={{ color: style.accent }}>{style.icon}</span>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0A0A0B] to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center h-8 w-8 border border-white/[0.06] text-sm"
                  style={{ color: style.accent }}
                >
                  {style.icon}
                </span>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white">{style.name}</h3>
                  <span className="text-[9px] font-mono tracking-widest uppercase text-white/30">{style.category}</span>
                </div>
              </div>

              <p className="text-xs text-white/40 leading-relaxed">{style.desc}</p>

              <div>
                <p className="text-[9px] font-mono tracking-widest uppercase text-[#D4A84B]/60 mb-1">Best for</p>
                <p className="text-[11px] text-white/50">{style.bestFor}</p>
              </div>

              <div>
                <p className="text-[9px] font-mono tracking-widest uppercase text-[#D4A84B]/60 mb-1.5">Pairs with</p>
                <div className="flex flex-wrap gap-1">
                  {style.layouts.map((layout) => (
                    <span key={layout} className="text-[9px] font-mono text-white/30 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5">
                      {layout}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
