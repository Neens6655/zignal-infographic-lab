'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useSpring,
  AnimatePresence,
} from 'motion/react';
import { useGenerate } from '@/hooks/use-generate';
import { useVoiceInput } from '@/hooks/use-voice-input';
import { GeneratingExperience } from '@/components/generator/generating-experience';
import { ResultViewer } from '@/components/generator/result-viewer';
import { ChatFAB } from '@/components/chat/chat-fab';
import {
  Sparkles, ArrowRight, ArrowUpRight,
  FileText, Globe, Upload, CheckCircle2,
  LayoutGrid, MonitorSmartphone,
  Search,
  ChevronDown, SlidersHorizontal, X,
  Brain, Wand2, Layers3, FileCode, Cpu, Loader2, Video,
  Link2, AlertCircle, UploadCloud, Mic, MicOff,
} from 'lucide-react';
import type { GenerateInput } from '@/lib/types';

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const SHOWCASE = [
  { id: 'ai-healthcare', image: '/showcase/ai-healthcare-dashboard.png', title: 'AI in Healthcare 2025', field: 'Healthcare Intelligence', layout: 'Dashboard', style: 'Executive Institutional', aspect: '16:9', desc: 'Multi-panel KPI dashboard tracking drug discovery timelines, diagnostic accuracy, and clinical outcomes across six healthcare sectors.' },
  { id: 'louvre', image: '/showcase/louvre-abu-dhabi-aerial.png', title: 'Louvre Abu Dhabi Decoded', field: 'Architecture', layout: 'Structural Breakdown', style: 'Aerial Explainer', aspect: '16:9', desc: 'Drone-view isometric cutaway revealing the dome engineering, water channels, and gallery cluster of the $654M Saadiyat Island museum.' },
  { id: 'stablecoin', image: '/showcase/stablecoin-brief.png', title: 'Global Stablecoin Market', field: 'Digital Finance', layout: 'Dashboard', style: 'Executive Institutional', aspect: '16:9', desc: 'McKinsey-grade institutional brief mapping $232B market cap, transaction flows, regulatory landscape, and wallet adoption metrics.' },
  { id: 'crispr', image: '/showcase/crispr-schematic.png', title: 'CRISPR-Cas9 Gene Editing', field: 'Molecular Biology', layout: 'Linear Progression', style: 'Technical Schematic', aspect: '16:9', desc: 'Blueprint-style schematic showing the five-step molecular process from guide RNA design through DNA repair with success rate data.' },
  { id: 'ai-market', image: '/showcase/ai-market-analysis.png', title: 'AI Market Analysis 2025', field: 'Strategy', layout: 'Dashboard', style: 'Market Analysis', aspect: '16:9', desc: 'Competitive landscape matrix with $1.8T projected market size, growth drivers, regional leadership, and enterprise adoption curves.' },
  { id: 'ai-dashboard', image: '/showcase/ai-market-dashboard.png', title: 'AI Industry Dashboard', field: 'Intelligence', layout: 'Dashboard', style: 'Executive Institutional', aspect: '16:9', desc: 'Three-trend executive dashboard covering agents vs. chatbots, multimodal dominance, and open-source impact with strategic implications.' },
  { id: 'neural', image: '/showcase/neural-networks-schematic.png', title: 'Neural Network Architecture', field: 'AI / ML', layout: 'Hub & Spoke', style: 'Technical Schematic', aspect: '16:9', desc: 'Four-stage backpropagation walkthrough: forward pass, loss calculation, gradient flow, and weight updates with accuracy timeline.' },
];

const STYLES_SHOWCASE = [
  {
    style: 'Executive Institutional',
    technique: 'Bento Grid',
    desc: 'McKinsey-grade multi-panel dashboard. Data-dense KPI grids with corporate color coding, executive summaries, and chart-heavy compositions designed for boardroom presentations.',
    image: '/showcase/style-executive.png',
    accent: '#D4A84B',
  },
  {
    style: 'Deconstruct',
    technique: 'Exploded View',
    desc: 'NYT-style structural breakdown with callout lines, numbered annotations, and isometric dissection. Turns complex systems into labelled mechanical drawings.',
    image: '/showcase/style-deconstruct.png',
    accent: '#C04B3C',
  },
  {
    style: 'Aerial Explainer',
    technique: 'Isometric Cutaway',
    desc: 'Drone-perspective architectural rendering with numbered callouts, cross-section views, and scale references. Reveals hidden structure beneath the surface.',
    image: '/showcase/style-aerial.png',
    accent: '#5B8DEF',
  },
  {
    style: 'Technical Schematic',
    technique: 'Blueprint Process',
    desc: 'Engineering-blueprint aesthetic with precise linework, grid backgrounds, and step-by-step molecular or mechanical process flows. Data accuracy meets visual precision.',
    image: '/showcase/style-schematic.png',
    accent: '#8BC34A',
  },
  {
    style: 'Craft Handmade',
    technique: 'Artisan Roadmap',
    desc: 'Warm, illustrated aesthetic with hand-drawn textures, watercolor elements, and winding narrative paths. Transforms timelines into visual journeys.',
    image: '/showcase/style-craft.png',
    accent: '#A78BFA',
  },
  {
    style: 'Strategy Framework',
    technique: 'Consulting Canvas',
    desc: 'Structured enterprise frameworks with phased roadmaps, milestone markers, and metric callouts. Built for Fortune 500 strategy decks and C-suite alignment.',
    image: '/showcase/style-strategy.png',
    accent: '#E8C96A',
  },
];

const PIPELINE = [
  { num: '01', agent: 'Sentinel', name: 'Extract', desc: 'Parse any format — text, URL, PDF, audio', detail: 'Intelligent content parser handles articles, research papers, raw data, URLs, and file uploads. Strips formatting noise while preserving semantic structure.', icon: FileText },
  { num: '02', agent: 'Oracle', name: 'Research', desc: 'AI finds real references & verifies facts', detail: 'Routes content to 22 trusted sources — Wikipedia, BBC, WHO, Nature, and more. Every visual claim is verified. Reference images are sourced automatically.', highlight: true, icon: Search },
  { num: '03', agent: 'Scribe', name: 'Simplify', desc: 'Rewrite at 8th-grade reading level', detail: 'NLP rewriting engine distills complex jargon into clear, scannable language. Flesch-Kincaid optimized for maximum comprehension in visual format.', icon: Wand2 },
  { num: '04', agent: 'Strategist', name: 'Analyze', desc: 'Select optimal layout and style combination', detail: 'Content classifier maps topic, density, and hierarchy to the best layout × style pairing from 400+ combinations. Or override with your own selection.', icon: Brain },
  { num: '05', agent: 'Architect', name: 'Structure', desc: 'Organize content into visual hierarchy', detail: 'Builds the information architecture — decides section order, data visualization types, callout placement, and visual flow based on content type.', icon: Layers3 },
  { num: '06', agent: 'Forge', name: 'Prompt', desc: 'Assemble multimodal generation prompt', detail: 'Constructs a precise Gemini 3 Pro prompt combining text, reference images, style tokens, layout grids, and typography rules into a single payload.', icon: FileCode },
  { num: '07', agent: 'Renderer', name: 'Generate', desc: 'Render with Gemini 3 Pro + reference images', detail: 'Final render pass generates a high-resolution infographic in ~60 seconds. Output at print resolution (2K+) with consulting-grade visual quality.', icon: Cpu },
];



const INPUT_MODES = [
  { id: 'text', label: 'Paste text', title: 'Paste text', desc: 'Notes, articles, or content', icon: FileText, bg: 'bg-purple-500/10', iconColor: 'text-purple-400' },
  { id: 'url', label: 'From URL', title: 'Share a URL', desc: 'Any web page or article', icon: Globe, bg: 'bg-blue-500/10', iconColor: 'text-blue-400' },
  { id: 'video', label: 'Video link', title: 'Share a video', desc: 'YouTube, Vimeo, or Loom', icon: Video, bg: 'bg-rose-500/10', iconColor: 'text-rose-400' },
  { id: 'file', label: 'Upload file', title: 'Import a file', desc: 'Docs, PDFs, or slides', icon: Upload, bg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
];

const SIZES = [
  { value: '16:9', label: '16:9', icon: MonitorSmartphone },
  { value: '9:16', label: '9:16', icon: MonitorSmartphone },
  { value: '1:1', label: '1:1', icon: LayoutGrid },
];

const POPULAR_PRESETS = [
  { id: 'auto', label: 'Auto', desc: 'AI picks the best layout + style' },
  { id: 'aerial-explainer', label: 'Museum', desc: 'Exhibition-grade aerial explainer' },
  { id: 'executive-summary', label: 'Executive', desc: 'Board-ready bento grid' },
  { id: 'deconstruct', label: 'Deconstruct', desc: 'NYT-style exploded view' },
  { id: 'process-flow', label: 'Process Flow', desc: 'Step-by-step IKEA manual' },
  { id: 'institutional-brief', label: 'Institutional', desc: 'McKinsey / JP Morgan brief' },
];

const ALL_STYLES = [
  { id: 'craft-handmade', label: 'Craft Handmade' },
  { id: 'claymation', label: 'Claymation' },
  { id: 'kawaii', label: 'Kawaii' },
  { id: 'storybook-watercolor', label: 'Watercolor' },
  { id: 'chalkboard', label: 'Chalkboard' },
  { id: 'cyberpunk-neon', label: 'Cyberpunk' },
  { id: 'bold-graphic', label: 'Bold Graphic' },
  { id: 'aged-academia', label: 'Aged Academia' },
  { id: 'corporate-memphis', label: 'Corporate' },
  { id: 'technical-schematic', label: 'Schematic' },
  { id: 'origami', label: 'Origami' },
  { id: 'pixel-art', label: 'Pixel Art' },
  { id: 'ikea-manual', label: 'IKEA Manual' },
  { id: 'knolling', label: 'Knolling' },
  { id: 'lego-brick', label: 'LEGO Brick' },
  { id: 'executive-institutional', label: 'Institutional' },
  { id: 'deconstruct', label: 'Deconstruct' },
  { id: 'aerial-explainer', label: 'Aerial' },
];

/* ═══════════════════════════════════════════════════════════════
   ZGNAL LOGO
   ═══════════════════════════════════════════════════════════════ */

function ZignalLogo({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 3H18V7L10 17H18V21H3V17L11 7H3V3Z" fill="currentColor" />
      <rect x="19.5" y="18" width="3.5" height="3.5" fill="currentColor" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL ANIMATION COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function ScrollReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WIREFRAME SVGs — Gold geometric infographic layout skeletons
   ═══════════════════════════════════════════════════════════════ */

function WireframeBento() {
  return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <rect x="8" y="8" width="88" height="60" stroke="#D4A84B" strokeWidth="1.2" opacity="0.7" />
      <rect x="8" y="74" width="42" height="58" stroke="#D4A84B" strokeWidth="1.2" opacity="0.5" />
      <rect x="56" y="74" width="40" height="28" stroke="#D4A84B" strokeWidth="1.2" opacity="0.6" />
      <rect x="56" y="108" width="40" height="24" stroke="#D4A84B" strokeWidth="1.2" fill="#D4A84B" fillOpacity="0.05" opacity="0.5" />
      <rect x="102" y="8" width="90" height="40" stroke="#D4A84B" strokeWidth="1.2" fill="#D4A84B" fillOpacity="0.04" opacity="0.6" />
      <rect x="102" y="54" width="90" height="78" stroke="#D4A84B" strokeWidth="1.2" opacity="0.7" />
      {/* Inner detail lines */}
      <line x1="16" y1="20" x2="60" y2="20" stroke="#D4A84B" strokeWidth="0.6" opacity="0.3" />
      <line x1="16" y1="28" x2="48" y2="28" stroke="#D4A84B" strokeWidth="0.6" opacity="0.2" />
      <line x1="110" y1="70" x2="170" y2="70" stroke="#D4A84B" strokeWidth="0.6" opacity="0.2" />
      <line x1="110" y1="78" x2="155" y2="78" stroke="#D4A84B" strokeWidth="0.6" opacity="0.15" />
      <circle cx="118" cy="28" r="10" stroke="#D4A84B" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

function WireframeIceberg() {
  return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      {/* Water line */}
      <path d="M0 55 Q50 50 100 55 Q150 60 200 55" stroke="#D4A84B" strokeWidth="0.8" opacity="0.4" strokeDasharray="4 3" />
      {/* Tip above water */}
      <polygon points="100,12 120,55 80,55" stroke="#D4A84B" strokeWidth="1.2" fill="#D4A84B" fillOpacity="0.06" opacity="0.8" />
      {/* Mass below water */}
      <polygon points="65,58 135,58 155,95 145,125 55,125 45,95" stroke="#D4A84B" strokeWidth="1.2" fill="#D4A84B" fillOpacity="0.04" opacity="0.6" />
      {/* Detail lines inside mass */}
      <line x1="72" y1="72" x2="128" y2="72" stroke="#D4A84B" strokeWidth="0.6" opacity="0.2" />
      <line x1="68" y1="86" x2="132" y2="86" stroke="#D4A84B" strokeWidth="0.6" opacity="0.15" />
      <line x1="62" y1="100" x2="138" y2="100" stroke="#D4A84B" strokeWidth="0.6" opacity="0.15" />
      <line x1="58" y1="114" x2="142" y2="114" stroke="#D4A84B" strokeWidth="0.6" opacity="0.12" />
      {/* Label lines on tip */}
      <line x1="122" y1="35" x2="155" y2="25" stroke="#D4A84B" strokeWidth="0.5" opacity="0.3" />
      <line x1="155" y1="25" x2="178" y2="25" stroke="#D4A84B" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

function WireframeHubSpoke() {
  return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      {/* Central octagon */}
      <polygon points="100,45 118,52 125,70 118,88 100,95 82,88 75,70 82,52" stroke="#D4A84B" strokeWidth="1.4" fill="#D4A84B" fillOpacity="0.06" opacity="0.8" />
      <circle cx="100" cy="70" r="6" fill="#D4A84B" fillOpacity="0.3" />
      {/* Spokes + outer nodes */}
      {[[40, 25], [160, 25], [170, 105], [30, 105], [100, 130]].map(([cx, cy], i) => (
        <g key={i}>
          <line x1={100} y1={70} x2={cx} y2={cy} stroke="#D4A84B" strokeWidth="0.8" opacity="0.25" strokeDasharray="3 2" />
          <circle cx={cx} cy={cy} r="10" stroke="#D4A84B" strokeWidth="1" opacity="0.5" />
          <circle cx={cx} cy={cy} r="3" fill="#D4A84B" fillOpacity="0.25" />
        </g>
      ))}
    </svg>
  );
}

function WireframeTimeline() {
  return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      {/* Wavy path */}
      <path d="M10 70 Q40 40 70 70 Q100 100 130 70 Q160 40 190 70" stroke="#D4A84B" strokeWidth="1.2" opacity="0.5" fill="none" />
      {/* Milestone diamonds */}
      {[30, 70, 110, 150, 190].map((x, i) => {
        const y = i % 2 === 0 ? 70 : 70;
        return (
          <g key={i}>
            <rect x={x - 6} y={64} width="12" height="12" stroke="#D4A84B" strokeWidth="1" fill="#D4A84B" fillOpacity={i === 2 ? 0.15 : 0.05} opacity="0.7" transform={`rotate(45 ${x} 70)`} />
            {/* Date line */}
            <line x1={x} y1={i % 2 === 0 ? 30 : 46} x2={x} y2={58} stroke="#D4A84B" strokeWidth="0.5" opacity="0.2" />
            <line x1={x - 12} y1={i % 2 === 0 ? 26 : 42} x2={x + 12} y2={i % 2 === 0 ? 26 : 42} stroke="#D4A84B" strokeWidth="0.5" opacity="0.15" />
            {/* Content below */}
            <line x1={x} y1={82} x2={x} y2={i % 2 === 0 ? 105 : 98} stroke="#D4A84B" strokeWidth="0.5" opacity="0.2" />
            <line x1={x - 14} y1={i % 2 === 0 ? 108 : 102} x2={x + 14} y2={i % 2 === 0 ? 108 : 102} stroke="#D4A84B" strokeWidth="0.5" opacity="0.12" />
          </g>
        );
      })}
    </svg>
  );
}

function WireframeDashboard() {
  return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      {/* Top bar */}
      <rect x="8" y="8" width="184" height="16" stroke="#D4A84B" strokeWidth="1" opacity="0.4" />
      <circle cx="18" cy="16" r="3" fill="#D4A84B" fillOpacity="0.3" />
      <line x1="28" y1="16" x2="70" y2="16" stroke="#D4A84B" strokeWidth="0.6" opacity="0.2" />
      {/* Main chart area */}
      <rect x="8" y="30" width="120" height="72" stroke="#D4A84B" strokeWidth="1.2" opacity="0.6" />
      {/* Chart bars */}
      {[20, 38, 56, 74, 92, 110].map((x, i) => (
        <rect key={i} x={x} y={102 - [30, 45, 35, 55, 40, 50][i]} width="10" height={[30, 45, 35, 55, 40, 50][i]} fill="#D4A84B" fillOpacity={0.08 + i * 0.02} stroke="#D4A84B" strokeWidth="0.5" opacity="0.5" />
      ))}
      {/* KPI panels */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="136" y={30 + i * 26} width="56" height="20" stroke="#D4A84B" strokeWidth="0.8" opacity="0.4" />
          <line x1="142" y1={38 + i * 26} x2="168" y2={38 + i * 26} stroke="#D4A84B" strokeWidth="0.6" opacity="0.2" />
          <line x1="142" y1={44 + i * 26} x2="158" y2={44 + i * 26} stroke="#D4A84B" strokeWidth="0.4" opacity="0.15" />
        </g>
      ))}
      {/* Bottom row */}
      <rect x="8" y="108" width="88" height="24" stroke="#D4A84B" strokeWidth="0.8" opacity="0.35" />
      <rect x="102" y="108" width="90" height="24" stroke="#D4A84B" strokeWidth="0.8" opacity="0.35" />
    </svg>
  );
}

function WireframeTree() {
  return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      {/* Root */}
      <rect x="80" y="8" width="40" height="18" stroke="#D4A84B" strokeWidth="1.2" fill="#D4A84B" fillOpacity="0.06" opacity="0.8" />
      <line x1="88" y1="16" x2="110" y2="16" stroke="#D4A84B" strokeWidth="0.6" opacity="0.3" />
      {/* Level 1 branches */}
      <line x1="100" y1="26" x2="100" y2="38" stroke="#D4A84B" strokeWidth="0.8" opacity="0.4" />
      <line x1="40" y1="38" x2="160" y2="38" stroke="#D4A84B" strokeWidth="0.8" opacity="0.3" />
      {[40, 100, 160].map((x, i) => (
        <g key={i}>
          <line x1={x} y1={38} x2={x} y2={48} stroke="#D4A84B" strokeWidth="0.8" opacity="0.3" />
          <rect x={x - 18} y={48} width="36" height="14" stroke="#D4A84B" strokeWidth="1" opacity="0.6" />
          <line x1={x - 12} y1={54} x2={x + 10} y2={54} stroke="#D4A84B" strokeWidth="0.5" opacity="0.2" />
        </g>
      ))}
      {/* Level 2 branches */}
      {[20, 60, 80, 120, 140, 180].map((x, i) => (
        <g key={i}>
          <line x1={[40, 40, 100, 100, 160, 160][i]} y1={62} x2={x} y2={78} stroke="#D4A84B" strokeWidth="0.6" opacity="0.2" />
          <rect x={x - 14} y={78} width="28" height="12" stroke="#D4A84B" strokeWidth="0.8" opacity="0.4" />
        </g>
      ))}
      {/* Level 3 leaf nodes */}
      {[15, 35, 55, 75, 95, 115, 135, 155, 175].map((x, i) => (
        <g key={i}>
          <line x1={[20, 20, 60, 80, 80, 120, 140, 180, 180][i]} y1={90} x2={x} y2={105} stroke="#D4A84B" strokeWidth="0.4" opacity="0.15" />
          <circle cx={x} cy={110} r="5" stroke="#D4A84B" strokeWidth="0.6" opacity="0.3" />
        </g>
      ))}
    </svg>
  );
}


/* ═══════════════════════════════════════════════════════════════
   CAPABILITIES SECTION — 6 interactive boxes
   ═══════════════════════════════════════════════════════════════ */

function CapabilitiesSection({ scrollToGenerator }: { scrollToGenerator: () => void }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  const boxes = [
    {
      stat: '22',
      unit: 'SOURCES',
      line: 'Fact-verified by institutional sources',
      visual: (
        <div className="flex flex-wrap gap-1 mt-3">
          {['BBC', 'WHO', 'Nature', 'PubMed', 'Wikipedia'].map((s, i) => (
            <motion.span
              key={s}
              initial={{ opacity: 0, x: -6 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
              className="text-[8px] font-mono text-(--z-gold)/50 bg-(--z-gold)/[0.05] px-1.5 py-0.5 border border-(--z-gold)/10"
            >
              {s}
            </motion.span>
          ))}
          <span className="text-[8px] font-mono text-(--z-muted)/40 self-center">+17</span>
        </div>
      ),
    },
    {
      stat: '20',
      unit: 'LAYOUTS',
      line: 'Bento, iceberg, hub, timeline & more',
      visual: (
        <div className="grid grid-cols-3 gap-1 mt-3">
          {[WireframeBento, WireframeIceberg, WireframeHubSpoke, WireframeTimeline, WireframeDashboard, WireframeTree].map((WF, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.9 + i * 0.06, duration: 0.3 }}
              className="aspect-[4/3] bg-(--z-bg)/50 border border-(--z-gold)/8 p-0.5"
            >
              <WF />
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      stat: '20',
      unit: 'STYLES',
      line: 'From watercolor to technical schematic',
      visual: (
        <div className="flex flex-wrap gap-1 mt-3">
          {['Craft', 'Kawaii', 'Cyberpunk', 'IKEA', 'Origami', 'Schematic'].map((s, i) => (
            <motion.span
              key={s}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.0 + i * 0.08, duration: 0.3 }}
              className="text-[8px] font-mono text-(--z-cream)/40 bg-white/[0.03] px-1.5 py-0.5 border border-white/[0.06]"
            >
              {s}
            </motion.span>
          ))}
        </div>
      ),
    },
    {
      stat: '60',
      unit: 'SECONDS',
      line: 'Publication-grade, consulting-ready',
      visual: (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 border border-(--z-gold)/12 bg-(--z-gold)/[0.04]">
            <div className="h-1.5 w-1.5" style={{ background: '#4CAF50' }} />
            <span className="text-[8px] font-mono text-(--z-cream)/50">2K+</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 border border-(--z-gold)/12 bg-(--z-gold)/[0.04]">
            <div className="h-1.5 w-1.5 bg-(--z-gold)" />
            <span className="text-[8px] font-mono text-(--z-cream)/50">PRINT</span>
          </div>
        </div>
      ),
    },
    {
      stat: '7',
      unit: 'AGENTS',
      line: 'Agentic pipeline, zero guesswork',
      visual: (
        <div className="flex items-center gap-0.5 mt-3">
          {['S', 'O', 'Sc', 'St', 'A', 'F', 'R'].map((a, i) => (
            <motion.div
              key={a}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1.1 + i * 0.07, duration: 0.25, type: 'spring', stiffness: 300 }}
              className="h-5 w-5 flex items-center justify-center text-[7px] font-mono font-bold bg-white/[0.04] border border-white/[0.08] text-(--z-cream)/40"
            >
              {a}
            </motion.div>
          ))}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="ml-1 h-[1px] flex-1 bg-gradient-to-r from-(--z-gold)/30 to-transparent origin-left"
          />
        </div>
      ),
    },
    {
      stat: '3',
      unit: 'RATIOS',
      line: '16:9, 9:16, and 1:1 output',
      visual: (
        <div className="flex items-end gap-2 mt-3">
          {[
            { w: 32, h: 18, label: '16:9' },
            { w: 14, h: 24, label: '9:16' },
            { w: 20, h: 20, label: '1:1' },
          ].map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.0 + i * 0.12, duration: 0.35 }}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="border border-(--z-gold)/25 bg-(--z-gold)/[0.04]"
                style={{ width: r.w, height: r.h }}
              />
              <span className="text-[7px] font-mono text-(--z-muted)/50">{r.label}</span>
            </motion.div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-28 bg-(--z-bg)">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section header */}
        <ScrollReveal>
          <p className="label-mono text-(--z-gold) mb-3 sm:mb-4">Capabilities</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-mono font-medium heading-editorial text-(--z-cream) mb-8 sm:mb-12 max-w-2xl">
            Built to generate.
          </h2>
        </ScrollReveal>

        {/* 6-box grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {boxes.map((box, i) => (
            <motion.div
              key={box.unit}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="group relative bg-(--z-surface) border border-(--border) p-4 sm:p-5 overflow-hidden hover:border-(--z-gold)/25 transition-all duration-500"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-(--z-gold)/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Pulse dot — top right */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                <div className="h-1.5 w-1.5 bg-(--z-gold)/40 group-hover:bg-(--z-gold)/70 transition-colors">
                  <div className="absolute inset-0 bg-(--z-gold)/30 animate-ping" style={{ animationDuration: `${2 + i * 0.5}s` }} />
                </div>
              </div>

              {/* Stat */}
              <div className="relative">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-(--z-gold) heading-editorial leading-none">
                  {box.stat}
                </p>
                <p className="text-[8px] sm:text-[9px] font-mono font-medium tracking-[0.2em] text-(--z-gold)/50 mt-1">
                  {box.unit}
                </p>
              </div>

              {/* Description */}
              <p className="text-[10px] sm:text-[11px] font-mono text-(--z-muted) leading-snug mt-2 sm:mt-3">
                {box.line}
              </p>

              {/* Embedded visual */}
              <div className="relative">
                {box.visual}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 sm:mt-12 text-center">
          <ScrollReveal delay={0.2}>
            <button
              onClick={scrollToGenerator}
              className="inline-flex items-center gap-2.5 bg-(--z-gold) px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-mono font-semibold text-(--z-bg) hover:bg-(--z-gold-dim) active:scale-[0.97] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
            >
              Start generating
              <ArrowRight className="h-4 w-4" />
            </button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PIPELINE SECTION — Interactive scroll-driven experience
   ═══════════════════════════════════════════════════════════════ */

function PipelineSection({ scrollToGenerator }: { scrollToGenerator: () => void }) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const lineProgress = useSpring(useTransform(scrollYProgress, [0.15, 0.65], [0, 1]), {
    stiffness: 100,
    damping: 30,
  });

  return (
    <section
      ref={sectionRef}
      id="pipeline"
      className="py-16 sm:py-40 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0E0E12 0%, #111118 20%, #13131A 50%, #111118 80%, #0E0E12 100%)' }}
    >
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/3 w-[800px] h-[400px] bg-gradient-radial from-(--z-gold)/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-gradient-radial from-(--z-blue)/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />
      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(rgba(212,168,75,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,75,0.4) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <p className="label-mono text-(--z-gold) mb-4">Agentic Workflow</p>
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-mono font-medium heading-editorial mb-6 max-w-3xl">
            Seven agents.<br />
            <span className="text-(--z-muted)">Zero guesswork.</span>
          </h2>
          <p className="text-sm text-(--z-muted) leading-relaxed max-w-lg mb-10 sm:mb-20">
            Every infographic flows through an agentic pipeline — seven specialized AI agents, from raw content to publication-ready output in approximately 60 seconds.
          </p>
        </ScrollReveal>

        {/* Desktop: interactive horizontal pipeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Background line (track) */}
            <div className="absolute top-[28px] left-[28px] right-[28px] h-[2px] bg-white/[0.06]" />
            {/* Animated progress line */}
            <motion.div
              className="absolute top-[28px] left-[28px] h-[2px] bg-gradient-to-r from-(--z-gold) to-(--z-gold)/60 origin-left"
              style={{ scaleX: lineProgress, width: 'calc(100% - 56px)' }}
            />
            {/* Pulse dot on line tip */}
            <motion.div
              className="absolute top-[24px] h-[10px] w-[10px] bg-(--z-gold) shadow-[0_0_20px_rgba(212,168,75,0.6)]"
              style={{
                left: useTransform(lineProgress, (v: number) => `calc(28px + ${v * (100 - 4)}% - 5px)`),
                opacity: useTransform(lineProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]),
              }}
            />

            <div className="grid grid-cols-7 gap-0">
              {PIPELINE.map((stage, i) => {
                const Icon = stage.icon;
                const isActive = activeStep === i;
                return (
                  <motion.div
                    key={stage.num}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: i * 0.08, duration: 0.6 }}
                  >
                    <div
                      className="relative group px-2 cursor-pointer"
                      onMouseEnter={() => setActiveStep(i)}
                      onMouseLeave={() => setActiveStep(null)}
                    >
                      {/* Node */}
                      <div className={`relative z-10 h-[14px] w-[14px] mb-6 transition-all duration-500 ${
                        stage.highlight
                          ? 'bg-(--z-gold) shadow-[0_0_20px_rgba(212,168,75,0.5)]'
                          : isActive
                            ? 'bg-(--z-gold)/80 shadow-[0_0_16px_rgba(212,168,75,0.3)] scale-[1.3]'
                            : 'bg-(--z-surface-2) border border-white/10 group-hover:bg-(--z-gold)/40 group-hover:scale-[1.3]'
                      }`} />

                      {/* Icon */}
                      <div className={`h-10 w-10 flex items-center justify-center mb-4 transition-all duration-300 ${
                        stage.highlight || isActive
                          ? 'bg-(--z-gold)/10 text-(--z-gold)'
                          : 'bg-white/[0.03] text-white/50 group-hover:bg-(--z-gold)/10 group-hover:text-(--z-gold)/70'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Number */}
                      <div className={`text-3xl font-mono font-bold mb-1 transition-colors duration-300 ${
                        stage.highlight ? 'text-(--z-gold)' : isActive ? 'text-(--z-gold)/80' : 'text-white/[0.06] group-hover:text-white/15'
                      }`}>
                        {stage.num}
                      </div>

                      {/* Agent name */}
                      <div className={`text-sm font-mono font-bold mb-0.5 transition-colors duration-300 ${
                        stage.highlight ? 'text-(--z-gold)' : isActive ? 'text-(--z-gold)/80' : 'text-(--z-cream) group-hover:text-(--z-gold)'
                      }`}>
                        {stage.agent}
                      </div>

                      {/* Function label */}
                      <div className={`text-[9px] font-mono font-medium tracking-[0.15em] uppercase mb-2 transition-colors duration-300 ${
                        stage.highlight ? 'text-(--z-gold)/60' : isActive ? 'text-(--z-gold)/50' : 'text-(--z-muted)/60'
                      }`}>
                        {stage.name}
                      </div>

                      {/* Short desc */}
                      <p className="text-[11px] text-(--z-muted) leading-relaxed">{stage.desc}</p>

                      {/* Expanded detail on hover */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <p className="text-[10px] text-(--z-cream)/50 leading-relaxed mt-3 pt-3 border-t border-white/[0.06]">
                              {stage.detail}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Pipeline output summary */}
          <ScrollReveal delay={0.4}>
            <div className="mt-16 flex items-center justify-between border-t border-white/[0.06] pt-8">
              <div className="flex items-center gap-10">
                {[
                  { value: '~60s', label: 'Generation time' },
                  { value: '22', label: 'Trusted sources' },
                  { value: '2K+', label: 'Output resolution' },
                  { value: '400+', label: 'Style combinations' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-lg font-mono font-bold text-(--z-gold)">{stat.value}</div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={scrollToGenerator}
                className="inline-flex items-center gap-2 text-xs font-mono text-(--z-cream)/60 hover:text-(--z-gold) transition-colors"
              >
                Try the pipeline
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </ScrollReveal>
        </div>

        {/* Mobile: compact grid */}
        <div className="lg:hidden">
          <ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {PIPELINE.map((stage) => {
                const Icon = stage.icon;
                return (
                  <div
                    key={stage.num}
                    className={`p-3 sm:p-4 border transition-colors ${
                      stage.highlight
                        ? 'bg-(--z-gold)/[0.06] border-(--z-gold)/20'
                        : 'bg-white/[0.02] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-mono font-bold ${stage.highlight ? 'text-(--z-gold)' : 'text-white/30'}`}>
                        {stage.num}
                      </span>
                      <Icon className={`h-3.5 w-3.5 ${stage.highlight ? 'text-(--z-gold)' : 'text-white/40'}`} />
                    </div>
                    <p className={`text-xs font-mono font-bold mb-0.5 ${stage.highlight ? 'text-(--z-gold)' : 'text-(--z-cream)'}`}>
                      {stage.agent}
                    </p>
                    <p className="text-[10px] text-(--z-muted) leading-snug">{stage.desc}</p>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
          <div className="mt-6 flex items-center justify-center">
            <button
              onClick={scrollToGenerator}
              className="inline-flex items-center gap-2 text-xs font-mono text-(--z-cream)/60 hover:text-(--z-gold) transition-colors"
            >
              Try the pipeline
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function Home() {
  const { state, generate, reset } = useGenerate();
  const [content, setContent] = useState('');
  const [selectedSize, setSelectedSize] = useState('16:9');
  const [simplify, setSimplify] = useState(true);
  const [referenceQuery, setReferenceQuery] = useState('');
  const [inputMode, setInputMode] = useState('text');
  const [selectedPreset, setSelectedPreset] = useState('auto');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [extractUrl, setExtractUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [extractSource, setExtractSource] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generatorRef = useRef<HTMLDivElement>(null);
  const { voiceState, transcript, interimTranscript, supported: voiceSupported, toggleListening, clearTranscript } = useVoiceInput();

  const hasContent = content.trim().length > 50;
  const isGenerating = state.phase === 'submitting' || state.phase === 'streaming';

  /* Hero parallax */
  const { scrollY } = useScroll();
  const heroContentY = useTransform(scrollY, [0, 800], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  /* Sync voice transcript → content */
  useEffect(() => {
    if (transcript) {
      setContent((prev) => prev + transcript);
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  /* Auto-resize textarea */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 300) + 'px';
    }
  }, [content]);

  const handleGenerate = useCallback((inputContent?: string) => {
    const text = inputContent || content.trim();
    if (!text || text.length < 50) return;
    const input: GenerateInput = {
      content: text,
      aspect_ratio: selectedSize,
      quality: 'normal',
      simplify,
      reference_query: referenceQuery || undefined,
      preset: selectedPreset !== 'auto' ? selectedPreset : undefined,
      style: selectedStyle || undefined,
    };
    generate(input);
  }, [content, selectedSize, simplify, referenceQuery, selectedPreset, selectedStyle, generate]);

  const handleImprovePrompt = useCallback(async () => {
    if (!content.trim() || content.trim().length < 10 || isImproving) return;
    setIsImproving(true);
    try {
      const res = await fetch('/api/improve-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: content }),
      });
      const data = await res.json();
      if (data.improved) setContent(data.improved);
    } catch { /* silent fail — user keeps original */ }
    setIsImproving(false);
  }, [content, isImproving]);

  /* ─── Extract from URL ─── */
  const handleExtractUrl = useCallback(async () => {
    if (!extractUrl.trim() || isExtracting) return;
    setIsExtracting(true);
    setExtractError('');
    try {
      const endpoint = inputMode === 'video' ? '/api/extract-video' : '/api/extract-url';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: extractUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Extraction failed');
      setContent(data.text);
      setExtractSource(data.title || extractUrl);
      setInputMode('text'); // switch to text view so user can see/edit extracted content
    } catch (err: any) {
      setExtractError(err.message || 'Failed to extract content');
    }
    setIsExtracting(false);
  }, [extractUrl, isExtracting, inputMode]);

  /* ─── Extract from File ─── */
  const handleFileUpload = useCallback(async (file: File) => {
    setIsExtracting(true);
    setExtractError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/extract-file', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'File parsing failed');
      setContent(data.text);
      setExtractSource(data.title || file.name);
      setInputMode('text');
    } catch (err: any) {
      setExtractError(err.message || 'Failed to parse file');
    }
    setIsExtracting(false);
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => inputRef.current?.focus(), 600);
  };

  /* ─── GENERATING STATE ─── */
  if (state.phase === 'submitting' || state.phase === 'streaming') {
    const currentProgress = state.phase === 'submitting' ? 0 : state.progress;
    const currentMessage = state.phase === 'submitting' ? 'Submitting...' : state.message;
    const currentStatus = state.phase === 'submitting' ? 'queued' : state.status;
    return (
      <div className="min-h-screen bg-[#060608] text-(--z-cream) flex flex-col">
        <Nav />
        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-6xl relative"
          >
            {/* Retro screen frame */}
            <div className="engine-screen relative border border-white/[0.08] bg-[#0A0A0D] overflow-hidden">
              {/* Bezel top bar */}
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-(--z-brick)/60" />
                    <div className="h-2 w-2 rounded-full bg-(--z-gold)/60" />
                    <div className="h-2 w-2 rounded-full bg-(--z-olive)/60" />
                  </div>
                  <span className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase">ZGNAL.ENGINE v2.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-(--z-gold) animate-pulse" />
                  <span className="text-[9px] font-mono text-(--z-gold)/60">PROCESSING</span>
                </div>
              </div>

              {/* Screen content with scanline overlay */}
              <div className="relative px-6 sm:px-10 py-8 sm:py-10 engine-inner">
                {/* Scanlines */}
                <div className="engine-scanlines absolute inset-0 pointer-events-none z-10" />
                {/* Vignette */}
                <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)' }} />

                <GeneratingExperience
                  status={currentStatus}
                  progress={currentProgress}
                  message={currentMessage}
                  prompt={content}
                />
              </div>

              {/* Bezel bottom */}
              <div className="flex items-center justify-center px-5 py-2 border-t border-white/[0.06] bg-white/[0.02]">
                <span className="text-[8px] font-mono tracking-[0.3em] text-white/15 uppercase">Agentic Infographic Pipeline — 5 modules</span>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  /* ─── COMPLETE STATE ─── */
  if (state.phase === 'complete') {
    return (
      <div className="min-h-screen bg-(--z-bg) text-(--z-cream) flex flex-col">
        <Nav />
        <main className="flex-1 px-6 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-3xl space-y-8"
          >
            <ResultViewer
              imageUrl={state.imageUrl}
              downloadUrl={state.downloadUrl}
              metadata={state.metadata}
              provenance={state.provenance}
              onRegenerate={reset}
              onRegenerateWithStyle={(style: string) => {
                const input: GenerateInput = {
                  content: content.trim(),
                  aspect_ratio: selectedSize,
                  quality: 'normal',
                  simplify,
                  reference_query: referenceQuery || undefined,
                  preset: selectedPreset !== 'auto' ? selectedPreset : undefined,
                  style,
                };
                generate(input);
              }}
              generationContext={{
                content,
                preset: selectedPreset,
                style: selectedStyle,
                aspectRatio: selectedSize,
                simplify,
              }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="text-center"
            >
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 text-sm text-(--z-cream)/60 hover:text-(--z-cream) font-mono transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
              >
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                Create another infographic
              </button>
            </motion.div>
          </motion.div>
        </main>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     MAIN LANDING PAGE
     ═══════════════════════════════════════════════════════════════ */
  return (
    <main id="main-content" className="min-h-screen bg-(--z-bg) text-(--z-cream)">
      <Nav />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO — Clean, generator-first, subtle ambient backdrop
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative h-screen min-h-[680px] sm:min-h-[800px] flex flex-col overflow-hidden bg-(--z-bg)">
        {/* Animated gradient orbs — slow, living background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="hero-orb hero-orb-gold" />
          <div className="hero-orb hero-orb-blue" />
          <div className="hero-orb hero-orb-warm" />
          {/* Grid lines — barely visible structural texture */}
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(212,168,75,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,75,0.3) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

          {/* Floating infographic motifs — wireframe data viz fragments */}
          {/* Bar chart skeleton */}
          <svg className="hero-motif opacity-[0.06] hidden lg:block" style={{ top: '12%', left: '6%', animation: 'motif-drift-1 32s ease-in-out infinite' }} width="80" height="60" viewBox="0 0 80 60" fill="none">
            <rect x="4" y="30" width="10" height="26" stroke="#D4A84B" strokeWidth="1" />
            <rect x="20" y="18" width="10" height="38" stroke="#D4A84B" strokeWidth="1" />
            <rect x="36" y="8" width="10" height="48" stroke="#D4A84B" strokeWidth="1" />
            <rect x="52" y="22" width="10" height="34" stroke="#D4A84B" strokeWidth="1" />
            <line x1="0" y1="57" x2="72" y2="57" stroke="#D4A84B" strokeWidth="0.5" opacity="0.5" />
          </svg>

          {/* Pie chart arc */}
          <svg className="hero-motif opacity-[0.05] hidden lg:block" style={{ top: '20%', right: '8%', animation: 'motif-drift-2 28s ease-in-out infinite' }} width="70" height="70" viewBox="0 0 70 70" fill="none">
            <circle cx="35" cy="35" r="28" stroke="#5B8DEF" strokeWidth="0.8" strokeDasharray="4 6" />
            <path d="M35 7 A28 28 0 0 1 60.2 47.5" stroke="#D4A84B" strokeWidth="1.5" fill="none" />
            <line x1="35" y1="35" x2="35" y2="7" stroke="#D4A84B" strokeWidth="0.5" opacity="0.4" />
            <line x1="35" y1="35" x2="60.2" y2="47.5" stroke="#D4A84B" strokeWidth="0.5" opacity="0.4" />
          </svg>

          {/* Flow connector dots */}
          <svg className="hero-motif opacity-[0.05] hidden lg:block" style={{ bottom: '25%', left: '4%', animation: 'motif-drift-3 36s ease-in-out infinite' }} width="120" height="30" viewBox="0 0 120 30" fill="none">
            <circle cx="8" cy="15" r="3" stroke="#D4A84B" strokeWidth="0.8" />
            <line x1="12" y1="15" x2="36" y2="15" stroke="#D4A84B" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx="42" cy="15" r="3" stroke="#5B8DEF" strokeWidth="0.8" />
            <line x1="46" y1="15" x2="70" y2="15" stroke="#5B8DEF" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx="76" cy="15" r="3" stroke="#D4A84B" strokeWidth="0.8" />
            <line x1="80" y1="15" x2="104" y2="15" stroke="#D4A84B" strokeWidth="0.5" strokeDasharray="3 3" />
            <rect x="108" y="12" width="6" height="6" stroke="#8BC34A" strokeWidth="0.8" />
          </svg>

          {/* Bento grid fragment */}
          <svg className="hero-motif opacity-[0.04] hidden lg:block" style={{ bottom: '18%', right: '5%', animation: 'motif-drift-4 30s ease-in-out infinite' }} width="90" height="70" viewBox="0 0 90 70" fill="none">
            <rect x="2" y="2" width="38" height="28" stroke="#D4A84B" strokeWidth="0.8" />
            <rect x="44" y="2" width="44" height="13" stroke="#5B8DEF" strokeWidth="0.8" />
            <rect x="44" y="18" width="20" height="12" stroke="#D4A84B" strokeWidth="0.8" />
            <rect x="68" y="18" width="20" height="12" stroke="#8BC34A" strokeWidth="0.8" />
            <rect x="2" y="34" width="86" height="8" stroke="#D4A84B" strokeWidth="0.5" strokeDasharray="2 4" />
            <rect x="2" y="46" width="28" height="20" stroke="#A78BFA" strokeWidth="0.8" />
            <rect x="34" y="46" width="54" height="20" stroke="#D4A84B" strokeWidth="0.8" />
          </svg>

          {/* Scatter points */}
          <svg className="hero-motif opacity-[0.05] hidden xl:block" style={{ top: '55%', left: '10%', animation: 'motif-drift-2 26s ease-in-out infinite' }} width="60" height="50" viewBox="0 0 60 50" fill="none">
            <circle cx="8" cy="35" r="2" fill="#D4A84B" opacity="0.6" />
            <circle cx="18" cy="22" r="2" fill="#D4A84B" opacity="0.6" />
            <circle cx="28" cy="28" r="2" fill="#5B8DEF" opacity="0.6" />
            <circle cx="35" cy="14" r="2" fill="#D4A84B" opacity="0.6" />
            <circle cx="45" cy="8" r="2" fill="#8BC34A" opacity="0.6" />
            <circle cx="52" cy="18" r="2" fill="#D4A84B" opacity="0.6" />
            <line x1="4" y1="40" x2="56" y2="5" stroke="#D4A84B" strokeWidth="0.4" opacity="0.3" strokeDasharray="2 3" />
          </svg>
        </div>

        {/* Hero content */}
        <motion.div
          className="relative flex-1 flex flex-col items-center justify-center px-3 sm:px-6 pt-20"
          style={{ y: heroContentY, opacity: heroOpacity }}
        >
          {/* Label */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="label-mono text-(--z-gold) mb-3 sm:mb-6"
          >
            The Infographic Engine
          </motion.p>

          {/* Headline — restrained, lets generator breathe */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center font-mono font-medium heading-editorial mb-6 sm:mb-14 text-3xl sm:text-5xl lg:text-6xl xl:text-7xl max-w-4xl"
          >
            <span className="block">Turn complexity</span>
            <span className="block text-gradient-gold">into clarity</span>
          </motion.h1>

          {/* Generator card — THE first touchpoint */}
          <motion.div
            ref={generatorRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="w-full max-w-3xl"
          >
            <div className="metallic-frame relative overflow-hidden flex flex-col max-h-[80vh]" style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 0 0 2px rgba(212,168,75,0.08), 0 8px 40px rgba(0,0,0,0.5), 0 2px 12px rgba(212,168,75,0.06)' }}>
              {/* Metallic bezel top bar */}
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.08] shrink-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #E86B5F, #C04B3C)' }} />
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #E8C96A, #D4A84B)' }} />
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #A4D65E, #8BC34A)' }} />
                  </div>
                  <span className="text-[10px] font-mono tracking-[0.25em] text-white/40 uppercase font-bold">ZGNAL.LAB</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-(--z-olive)/50" />
                  <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider font-medium">Ready</span>
                </div>
              </div>

              {/* Inner content area */}
              <div className="bg-[#0A0A0D] flex-1 min-h-0 flex flex-col overflow-hidden">

              {/* Input mode tabs — compact horizontal strip */}
              <div className="flex border-b border-white/[0.06] shrink-0">
                {INPUT_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = inputMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setInputMode(mode.id)}
                      className={`group flex items-center gap-1.5 py-2 px-3 sm:px-4 transition-all text-[10px] sm:text-[11px] font-mono tracking-wide border-b-2 flex-1 justify-center ${
                        isActive
                          ? 'bg-white/[0.05] border-b-(--z-gold) text-white'
                          : 'bg-transparent border-b-transparent text-white/40 hover:text-white/60 hover:bg-white/[0.02]'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? mode.iconColor : 'text-white/30'}`} />
                      <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input area — scrollable content zone */}
              <div className="flex-1 min-h-0 overflow-y-auto z-scroll">
              {inputMode === 'text' ? (
                <div className="p-4 sm:p-6 relative">
                  {extractSource && (
                    <div className="flex items-center gap-2 mb-3 text-[10px] font-mono text-(--z-olive)">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Extracted from: {extractSource}</span>
                      <button onClick={() => { setExtractSource(''); setContent(''); }} className="text-white/30 hover:text-white/50 ml-auto"><X className="h-3 w-3" /></button>
                    </div>
                  )}
                  <textarea
                    ref={inputRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={"e.g. How Coffee Goes From Farm to Cup: 70% grown in Brazil, Vietnam, Colombia. A single bean travels 3 continents before reaching your mug. Fair trade covers only 5% of global supply. The industry is worth $450B and employs 125 million people worldwide."}
                    className="w-full min-h-[90px] sm:min-h-[130px] max-h-[300px] resize-none bg-transparent text-[14px] sm:text-[15px] text-white placeholder:text-white/35 focus:outline-none leading-relaxed font-sans pr-16 sm:pr-24 z-scroll"
                    disabled={isGenerating || isImproving}
                  />
                  {/* Voice + Improve buttons */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    {voiceSupported && (
                      <button
                        onClick={toggleListening}
                        title={voiceState === 'listening' ? 'Stop recording' : 'Voice input'}
                        className={`flex items-center justify-center w-8 h-8 transition-all ${
                          voiceState === 'listening'
                            ? 'text-(--z-brick) voice-recording'
                            : 'text-white/30 hover:text-white/60'
                        }`}
                      >
                        {voiceState === 'listening' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                    )}
                    {content.trim().length >= 10 && !isGenerating && (
                      <button
                        onClick={handleImprovePrompt}
                        disabled={isImproving}
                        title="Enhance this prompt with AI"
                        className="improve-btn flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-mono font-semibold tracking-wide uppercase transition-all border border-(--z-gold)/30 text-(--z-gold) hover:border-(--z-gold)/60 disabled:opacity-60 disabled:animate-none overflow-hidden"
                      >
                        <span className="improve-shimmer absolute inset-0 pointer-events-none" />
                        {isImproving ? <Loader2 className="h-3 w-3 animate-spin relative z-10" /> : <Wand2 className="h-3 w-3 relative z-10" />}
                        <span className="relative z-10">{isImproving ? 'Improving...' : 'Improve'}</span>
                      </button>
                    )}
                  </div>
                  {/* Voice interim transcript */}
                  {voiceState === 'listening' && interimTranscript && (
                    <div className="absolute bottom-12 right-4 text-[11px] text-(--z-gold)/50 font-mono italic max-w-[200px] truncate">
                      {interimTranscript}
                    </div>
                  )}
                </div>
              ) : inputMode === 'url' || inputMode === 'video' ? (
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {inputMode === 'video' ? <Video className="h-4 w-4 text-rose-400" /> : <Link2 className="h-4 w-4 text-blue-400" />}
                    <span className="text-[11px] font-mono text-white/50">
                      {inputMode === 'video' ? 'Paste a YouTube, Vimeo, or Loom link' : 'Paste any web page URL'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={extractUrl}
                      onChange={(e) => { setExtractUrl(e.target.value); setExtractError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleExtractUrl(); }}
                      placeholder={inputMode === 'video' ? 'https://youtube.com/watch?v=...' : 'https://example.com/article'}
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-(--z-gold)/30 font-mono"
                      disabled={isExtracting}
                    />
                    <button
                      onClick={handleExtractUrl}
                      disabled={!extractUrl.trim() || isExtracting}
                      className="flex items-center gap-2 bg-(--z-gold) px-5 py-3 text-xs font-mono font-bold text-(--z-bg) hover:bg-(--z-gold-dim) active:scale-[0.97] transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    >
                      {isExtracting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                      {isExtracting ? 'Extracting...' : 'Extract'}
                    </button>
                  </div>
                  {extractError && (
                    <div className="flex items-center gap-2 mt-3 text-[11px] font-mono text-(--z-brick)">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {extractError}
                    </div>
                  )}
                  <p className="text-[10px] text-white/25 font-mono mt-3">
                    {inputMode === 'video'
                      ? 'We\'ll extract the transcript and description to generate your infographic.'
                      : 'We\'ll fetch the page content, strip navigation, and extract the article text.'}
                  </p>
                </div>
              ) : (
                /* File upload mode */
                <div className="p-4 sm:p-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.pptx,.txt,.md,.csv,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed cursor-pointer transition-all ${
                      dragOver
                        ? 'border-(--z-gold)/40 bg-(--z-gold)/5'
                        : 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]'
                    }`}
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="h-8 w-8 text-(--z-gold) animate-spin" />
                        <span className="text-[12px] font-mono text-white/50">Parsing file...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className={`h-8 w-8 ${dragOver ? 'text-(--z-gold)' : 'text-white/20'}`} />
                        <div className="text-center">
                          <span className="text-[12px] font-mono text-white/50">
                            Drop a file here or <span className="text-(--z-gold) underline underline-offset-2">browse</span>
                          </span>
                          <p className="text-[10px] text-white/25 font-mono mt-1">
                            PDF, DOCX, PPTX, TXT, MD, CSV, JSON — up to 10 MB
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  {extractError && (
                    <div className="flex items-center gap-2 mt-3 text-[11px] font-mono text-(--z-brick)">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {extractError}
                    </div>
                  )}
                </div>
              )}
              </div>{/* end scrollable input zone */}

              {/* Style preset bar */}
              <div className="flex items-center gap-2 border-t border-white/[0.06] px-3 sm:px-5 py-2.5 overflow-x-auto shrink-0 z-scroll-x">
                {POPULAR_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPreset(p.id); setSelectedStyle(''); }}
                    title={p.desc}
                    className={`shrink-0 px-3 py-1.5 text-[10px] font-mono font-medium tracking-wide uppercase transition-all border ${
                      selectedPreset === p.id
                        ? 'bg-(--z-gold)/10 text-(--z-gold) border-(--z-gold)/20'
                        : 'text-white/40 border-transparent hover:text-white/60 hover:bg-white/[0.03]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-medium tracking-wide uppercase transition-all border ${
                    showAdvanced
                      ? 'text-white/90 border-white/20'
                      : 'text-white/50 border-transparent hover:text-white/70'
                  }`}
                  style={showAdvanced ? {
                    background: 'linear-gradient(135deg, rgba(212,168,75,0.15) 0%, rgba(91,141,239,0.1) 50%, rgba(167,139,250,0.1) 100%)',
                  } : undefined}
                >
                  <SlidersHorizontal className="h-3 w-3" />
                  Advanced
                </button>
              </div>

              {/* Advanced style panel — expandable */}
              {showAdvanced && (
                <div className="border-t border-white/[0.06] px-5 py-4 bg-white/[0.02] shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono tracking-[0.15em] text-white/40 uppercase">Visual Style Override</span>
                    <button onClick={() => setShowAdvanced(false)} className="text-white/50 hover:text-white/70 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedStyle('')}
                      className={`px-2.5 py-1 text-[9px] font-mono font-medium uppercase tracking-wider transition-all ${
                        !selectedStyle
                          ? 'bg-(--z-gold)/10 text-(--z-gold)'
                          : 'text-white/50 hover:text-white/70 bg-white/[0.02]'
                      }`}
                    >
                      Auto
                    </button>
                    {ALL_STYLES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedStyle(s.id); setSelectedPreset('auto'); }}
                        className={`px-2.5 py-1 text-[9px] font-mono font-medium uppercase tracking-wider transition-all ${
                          selectedStyle === s.id
                            ? 'bg-(--z-gold)/10 text-(--z-gold)'
                            : 'text-white/50 hover:text-white/70 bg-white/[0.02]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Options bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-3 sm:px-5 py-2.5 sm:py-3 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Aspect ratio */}
                  <div className="flex bg-white/[0.04] p-0.5">
                    {SIZES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setSelectedSize(s.value)}
                        className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-mono font-medium transition-all ${
                          selectedSize === s.value
                            ? 'bg-white/[0.1] text-white'
                            : 'text-white/50 hover:text-white/70'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Simplify */}
                  <button
                    onClick={() => setSimplify(!simplify)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-mono font-medium transition-all border ${
                      simplify
                        ? 'bg-(--z-gold)/10 text-(--z-gold) border-(--z-gold)/20'
                        : 'text-white/50 border-transparent hover:text-white/70'
                    }`}
                  >
                    <div className={`h-2 w-2 transition-colors ${simplify ? 'bg-(--z-gold)' : 'bg-white/20'}`} />
                    Simplify
                  </button>
                </div>

                {/* Generate */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {hasContent && (
                    <span className="text-[10px] text-white/50 font-mono hidden sm:inline">~60s</span>
                  )}
                  <button
                    onClick={() => handleGenerate()}
                    disabled={!hasContent || isGenerating}
                    className="flex items-center gap-2 bg-(--z-gold) px-4 sm:px-6 py-2 sm:py-2.5 text-[11px] sm:text-xs font-mono font-bold text-(--z-bg) hover:bg-(--z-gold-dim) active:scale-[0.97] transition-all disabled:opacity-20 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate
                  </button>
                </div>
              </div>

              </div>{/* end inner content area */}

              {/* Metallic bezel bottom bar */}
              <div className="hidden sm:flex items-center justify-center px-5 py-2 border-t border-white/[0.08] shrink-0" style={{ background: 'linear-gradient(0deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)' }}>
                <span className="text-[8px] font-mono tracking-[0.3em] text-white/20 uppercase">Agentic Infographic Pipeline — 7 modules — 400+ style combinations</span>
              </div>
            </div>

            {/* Char count + research hint */}
            <div className="flex justify-between items-center mt-3 px-1">
              <span className={`text-[11px] font-mono transition-colors ${content.length >= 50 ? 'text-white/40' : content.length > 0 ? 'text-(--z-brick)/70' : 'text-white/40'}`}>
                {content.length > 0 ? (
                  <>{content.length.toLocaleString()} / 50 characters {content.length < 50 ? 'minimum' : ''}</>
                ) : (
                  <>50 characters minimum</>
                )}
              </span>
              {content.length >= 50 && (
                <span className="text-[11px] text-(--z-olive) font-mono flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Ready
                </span>
              )}
            </div>

            {content.length >= 50 && (
              <input
                type="text"
                value={referenceQuery}
                onChange={(e) => setReferenceQuery(e.target.value)}
                placeholder="Research hint (optional) — e.g., 'SpaceX Falcon 9 landing'"
                maxLength={500}
                className="w-full mt-3 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-(--z-gold)/30 font-mono"
              />
            )}

            {/* Error */}
            {state.phase === 'error' && (
              <div
                ref={(el) => { el?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                className="mt-4 border-2 border-(--z-brick)/50 bg-(--z-brick)/10 px-5 py-5"
              >
                <p className="text-sm text-(--z-brick) font-mono font-semibold mb-4">{state.message}</p>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 bg-(--z-brick) px-5 py-2.5 text-xs font-mono font-semibold text-white hover:bg-(--z-brick)/80 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-brick)"
                >
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                  Try again
                </button>
              </div>
            )}
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="grid grid-cols-4 gap-3 sm:flex sm:items-center sm:gap-10 mt-4 sm:mt-8"
          >
            {[
              { value: '20', label: 'Layouts' },
              { value: '20', label: 'Styles' },
              { value: '22', label: 'Sources' },
              { value: '3', label: 'Ratios' },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-3 sm:gap-6 md:gap-10">
                <div className="text-center flex-1 sm:flex-none">
                  <div className="text-lg sm:text-2xl font-mono font-bold text-white">{stat.value}</div>
                  <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mt-0.5">{stat.label}</div>
                </div>
                {i < 3 && <div className="hidden sm:block h-8 w-px bg-white/10" />}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="h-5 w-5 text-white/40 animate-scroll-bounce" />
        </motion.div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          GALLERY — Napkin-style multi-row auto-scrolling marquee
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="gallery" className="py-20 sm:py-28 bg-(--z-light) overflow-hidden">
        {/* Centered header */}
        <div className="text-center mb-14 px-6">
          <ScrollReveal>
            <div className="flex justify-center mb-5">
              <ZignalLogo size={32} className="text-(--z-gold)" />
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-mono font-medium heading-editorial text-(--z-light-text) mb-3">
              Gallery
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-sm text-(--z-light-muted) max-w-md mx-auto">
              Every visual below was generated by the engine. Real research. Real data. Not mockups.
            </p>
          </ScrollReveal>
        </div>

        {/* Row 1 — scrolling left */}
        <div className="mb-5 overflow-hidden">
          <div className="gallery-marquee-track">
            {[...SHOWCASE, ...SHOWCASE].map((item, i) => (
              <div key={`r1-${i}`} className="shrink-0 w-[320px] sm:w-[420px] aspect-video overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <Image src={item.image} alt={item.title} width={420} height={236} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 — scrolling right */}
        <div className="overflow-hidden">
          <div className="gallery-marquee-track-reverse">
            {(() => {
              const row2 = [
                ...STYLES_SHOWCASE.map(s => ({ image: s.image, alt: s.style })),
                ...SHOWCASE.slice(0, 2).map(s => ({ image: s.image, alt: s.title })),
                ...STYLES_SHOWCASE.map(s => ({ image: s.image, alt: s.style })),
                ...SHOWCASE.slice(0, 2).map(s => ({ image: s.image, alt: s.title })),
              ];
              return row2.map((item, i) => (
                <div key={`r2-${i}`} className="shrink-0 w-[280px] sm:w-[360px] aspect-video overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <Image src={item.image} alt={item.alt} width={360} height={202} className="w-full h-full object-cover" />
                </div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CAPABILITIES — Hybrid: Equation + Reel
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <CapabilitiesSection scrollToGenerator={scrollToGenerator} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PIPELINE — Interactive seven-stage scroll experience
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <PipelineSection scrollToGenerator={scrollToGenerator} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STYLES SHOWCASE — Visual art technique gallery
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="examples" className="py-24 sm:py-32 bg-(--z-light)">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <ScrollReveal>
              <p className="label-mono text-(--z-gold) mb-4">Art & Technique</p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-mono font-medium heading-editorial text-(--z-light-text) max-w-3xl">
                Every style has<br />
                <span className="text-(--z-light-muted)">a visual language.</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="mt-6 text-sm text-(--z-light-muted) max-w-lg leading-relaxed">
                Six distinct illustration techniques — each with its own visual grammar, composition rules, and aesthetic heritage.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STYLES_SHOWCASE.map((item, i) => (
              <ScrollReveal key={item.style} delay={i * 0.08}>
                <div className="group relative overflow-hidden cursor-pointer bg-white terminal-shadow-light">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.style}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Gradient overlay — always visible at bottom, stronger on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Technique badge — top left */}
                    <div className="absolute top-4 left-4">
                      <span
                        className="text-[9px] font-mono uppercase tracking-[0.2em] px-2.5 py-1 backdrop-blur-sm border"
                        style={{ color: item.accent, borderColor: `${item.accent}40`, backgroundColor: `${item.accent}15` }}
                      >
                        {item.technique}
                      </span>
                    </div>

                    {/* Arrow — top right, visible on touch devices */}
                    <div className="absolute top-4 right-4 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowUpRight className="h-4 w-4 text-white/70" />
                    </div>
                  </div>

                  {/* Text content below image */}
                  <div className="p-5">
                    <h3 className="text-base font-mono font-semibold text-(--z-light-text) mb-2 group-hover:text-(--z-light-text)/80 transition-colors">
                      {item.style}
                    </h3>
                    <p className="text-[11px] text-(--z-light-muted) leading-relaxed line-clamp-3">
                      {item.desc}
                    </p>
                  </div>

                  {/* Bottom accent line on hover */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                    style={{ backgroundColor: item.accent }}
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CTA — Editorial close
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-32 sm:py-44 bg-(--z-bg) relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-radial from-(--z-gold)/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <ScrollReveal>
            <p className="label-mono text-(--z-muted) mb-8">Start creating</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl xl:text-[110px] font-mono font-medium heading-editorial mb-8">
              From complexity,<br />
              <span className="text-gradient-gold">clarity.</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-sm text-(--z-muted) max-w-md mx-auto mb-12 leading-relaxed">
              Free to try — no credit card required. Paste content and generate your first research-backed infographic in about 60 seconds.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2.5 bg-(--z-gold) px-8 py-4 text-sm font-mono font-semibold text-(--z-bg) hover:bg-(--z-gold-dim) active:scale-[0.97] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
            >
              Start generating
              <ArrowRight className="h-4 w-4" />
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER — Rich, multi-column, showcase background
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="relative bg-[#080808] overflow-hidden">
        {/* Background showcase image */}
        <div className="absolute inset-0 opacity-[0.06]">
          <Image
            src="/showcase/louvre-abu-dhabi-aerial.png"
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-[#080808]/60" />

        <div className="relative border-t border-white/[0.06]">
          <div className="mx-auto max-w-7xl px-6 pt-20 pb-12">
            {/* Large logo */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-9 w-9 bg-(--z-gold) flex items-center justify-center">
                  <ZignalLogo size={22} className="text-(--z-bg)" />
                </div>
                <span className="font-mono text-lg font-bold tracking-tight text-white">
                  ZGNAL<span className="text-white/30">.AI</span>
                </span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed max-w-md">
                Research-backed infographics powered by a seven-stage AI pipeline.
                20 layouts. 20 styles. 22 trusted sources. Three aspect ratios.
              </p>
            </div>

            {/* Links grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8 sm:gap-10 mb-16 sm:mb-20">
              <div>
                <p className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-white/40 mb-5">Product</p>
                <div className="space-y-3">
                  {[
                    { label: 'Infographic Lab', href: '/#main-content' },
                    { label: 'API', href: '/docs#api' },
                    { label: 'Pricing', href: '/pricing' },
                  ].map((link) => (
                    <a key={link.label} href={link.href} className="block text-xs text-white/50 hover:text-white transition-colors font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)">{link.label}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-white/40 mb-5">Resources</p>
                <div className="space-y-3">
                  {[
                    { label: 'Documentation', href: '/docs' },
                    { label: 'Changelog', href: '/changelog' },
                    { label: 'Style Guide', href: '/styles' },
                  ].map((link) => (
                    <a key={link.label} href={link.href} className="block text-xs text-white/50 hover:text-white transition-colors font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)">{link.label}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-white/40 mb-5">Company</p>
                <div className="space-y-3">
                  {[
                    { label: 'About', href: '/about' },
                    { label: 'Contact', href: '/contact' },
                    { label: 'GitHub', href: 'https://github.com/Neens6655' },
                  ].map((link) => (
                    <a key={link.label} href={link.href} className="block text-xs text-white/50 hover:text-white transition-colors font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)">{link.label}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-white/40 mb-5">Legal</p>
                <div className="space-y-3">
                  {[
                    { label: 'Privacy Policy', href: '/privacy' },
                    { label: 'Terms of Service', href: '/terms' },
                  ].map((link) => (
                    <a key={link.label} href={link.href} className="block text-xs text-white/50 hover:text-white transition-colors font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)">{link.label}</a>
                  ))}
                </div>
              </div>
            </div>

            {/* Large ZIGNAL text */}
            <div className="mb-12 overflow-hidden">
              <p className="text-[52px] sm:text-[120px] lg:text-[180px] font-mono font-bold text-white/[0.03] leading-none tracking-tighter select-none heading-editorial">
                ZGNAL.AI
              </p>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
              <span className="text-[11px] text-white/40 font-mono">
                &copy; {new Date().getFullYear()} ZGNAL.AI — All rights reserved.
              </span>
              <div className="flex items-center gap-5 text-[11px] text-white/40 font-mono">
                <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-white/50 transition-colors">Terms</a>
                <a href="https://github.com/Neens6655" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* ── Chat FAB ── */}
      <ChatFAB />
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════════════════ */

function Nav() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-[#0A0A0B]/60 backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="h-8 w-8 bg-gradient-to-br from-[#E8C96A] to-[#D4A84B] flex items-center justify-center shadow-[0_0_12px_rgba(212,168,75,0.25)]" style={{ borderRadius: '3px' }}>
            <ZignalLogo size={17} className="text-[#0A0A0B]" />
          </div>
          <div className="flex items-baseline gap-0">
            <span className="font-mono text-[15px] font-black tracking-tight text-white">ZGNAL</span>
            <span className="font-mono text-[15px] font-black tracking-tight text-white/25">.AI</span>
          </div>
          <span className="hidden sm:inline text-[9px] text-white/30 font-mono tracking-[0.15em] uppercase border-l border-white/[0.08] pl-3 ml-1">
            Infographic Lab
          </span>
        </a>

        <div className="flex items-center gap-6">
          {[
            { label: 'Engine', href: '#pipeline' },
            { label: 'Gallery', href: '#gallery' },
            { label: 'Examples', href: '#examples' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hidden md:inline-flex text-xs text-white/60 hover:text-white transition-colors font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => { document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="bg-(--z-gold) px-5 py-2 text-xs font-mono font-semibold text-(--z-bg) hover:bg-(--z-gold-dim) active:scale-[0.97] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
          >
            Try it free
          </button>
        </div>
      </div>
    </nav>
  );
}
