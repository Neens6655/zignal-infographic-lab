'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type Variants,
} from 'motion/react';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
  }),
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 1: Hero — Animated Infographic SVG
   The infographic "draws itself" over ~4 seconds
   ═══════════════════════════════════════════════════════════════ */

function HeroInfographicSVG() {
  return (
    <svg
      viewBox="0 0 360 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* === Phase 1: Grid appears (0-0.8s) === */}
      {/* Vertical grid lines */}
      {[60, 120, 180, 240, 300].map((x, i) => (
        <motion.line
          key={`vg-${x}`}
          x1={x} y1={40} x2={x} y2={480}
          stroke="#E8E5E0"
          strokeWidth="0.5"
          strokeOpacity="0.08"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: i * 0.08 }}
        />
      ))}
      {/* Horizontal grid lines */}
      {[80, 140, 200, 260, 320, 380, 440].map((y, i) => (
        <motion.line
          key={`hg-${y}`}
          x1={20} y1={y} x2={340} y2={y}
          stroke="#E8E5E0"
          strokeWidth="0.5"
          strokeOpacity="0.08"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
        />
      ))}

      {/* === Phase 2: Bar chart grows (0.8-2.2s) === */}
      {[
        { x: 45, h: 140, delay: 0.8 },
        { x: 105, h: 200, delay: 0.95 },
        { x: 165, h: 120, delay: 1.1 },
        { x: 225, h: 260, delay: 1.25 },
        { x: 285, h: 180, delay: 1.4 },
      ].map((bar, i) => (
        <motion.rect
          key={`bar-${i}`}
          x={bar.x}
          y={440 - bar.h}
          width={40}
          height={bar.h}
          fill={i === 3 ? '#D4A84B' : '#E8E5E0'}
          fillOpacity={i === 3 ? 0.35 : 0.1}
          stroke={i === 3 ? '#D4A84B' : '#E8E5E0'}
          strokeWidth={i === 3 ? 2 : 1}
          strokeOpacity={i === 3 ? 0.9 : 0.2}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{
            duration: 0.7,
            delay: bar.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: `${bar.x + 20}px 440px` }}
        />
      ))}

      {/* === Phase 3: Text labels fade in (2.0-2.8s) === */}
      {[
        { text: 'Q1', x: 65, y: 465, delay: 2.0 },
        { text: 'Q2', x: 125, y: 465, delay: 2.1 },
        { text: 'Q3', x: 185, y: 465, delay: 2.2 },
        { text: 'Q4', x: 245, y: 465, delay: 2.3 },
        { text: 'YTD', x: 300, y: 465, delay: 2.4 },
      ].map((label) => (
        <motion.text
          key={label.text}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          fill="#E8E5E0"
          fillOpacity="0.4"
          fontSize="10"
          fontFamily="'IBM Plex Mono', monospace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: label.delay }}
        >
          {label.text}
        </motion.text>
      ))}

      {/* KPI tiles at top */}
      {[
        { label: 'MARKET SIZE', value: '$184B', x: 30, delay: 2.1 },
        { label: 'CAGR', value: '36.2%', x: 140, delay: 2.25 },
        { label: 'TOP SEGMENT', value: 'GenAI', x: 250, delay: 2.4 },
      ].map((kpi) => (
        <motion.g key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: kpi.delay }}>
          <rect x={kpi.x} y={50} width={100} height={55} fill="#D4A84B" fillOpacity="0.06" stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.25" />
          <text x={kpi.x + 50} y={72} textAnchor="middle" fill="#D4A84B" fillOpacity="0.6" fontSize="8" fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.1em">
            {kpi.label}
          </text>
          <text x={kpi.x + 50} y={93} textAnchor="middle" fill="#E8E5E0" fontSize="16" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold">
            {kpi.value}
          </text>
        </motion.g>
      ))}

      {/* Trend line across the chart area */}
      <motion.polyline
        points="65,350 125,290 185,360 245,180 305,250"
        stroke="#D4A84B"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 2.5, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Trend line dots */}
      {[
        { cx: 65, cy: 350 },
        { cx: 125, cy: 290 },
        { cx: 185, cy: 360 },
        { cx: 245, cy: 180 },
        { cx: 305, cy: 250 },
      ].map((dot, i) => (
        <motion.circle
          key={`dot-${i}`}
          cx={dot.cx}
          cy={dot.cy}
          r={3}
          fill="#D4A84B"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 2.6 + i * 0.15 }}
        />
      ))}

      {/* === Phase 4: Title at top (3.0s) === */}
      <motion.text
        x={180}
        y={30}
        textAnchor="middle"
        fill="#E8E5E0"
        fontSize="13"
        fontFamily="'IBM Plex Mono', monospace"
        fontWeight="bold"
        letterSpacing="0.08em"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 3.0 }}
      >
        GLOBAL AI MARKET OVERVIEW
      </motion.text>

      {/* Subtitle line */}
      <motion.line
        x1={80} y1={38} x2={280} y2={38}
        stroke="#D4A84B"
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 3.2 }}
      />

      {/* === Phase 5: Logo stamp (3.5s) === */}
      <motion.g
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 3.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '325px 495px' }}
      >
        <rect x={290} y={485} width={56} height={20} fill="#D4A84B" fillOpacity="0.1" stroke="#D4A84B" strokeWidth="1" />
        <text x={318} y={498} textAnchor="middle" fill="#D4A84B" fontSize="8" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold" letterSpacing="0.15em">
          ZGNAL
        </text>
      </motion.g>

      {/* Source citations */}
      <motion.text
        x={30} y={500}
        fill="#E8E5E0"
        fillOpacity="0.2"
        fontSize="7"
        fontFamily="'IBM Plex Sans', sans-serif"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 3.6 }}
      >
        Sources: Statista, Grand View Research, Bloomberg
      </motion.text>

      {/* Outer frame */}
      <motion.rect
        x={12} y={12} width={336} height={496} rx={0}
        stroke="#E8E5E0"
        strokeWidth="1"
        strokeOpacity="0.08"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 2: Scrollytelling Pipeline — Stage Visuals
   Each stage renders a progressively more complete infographic
   ═══════════════════════════════════════════════════════════════ */

const PIPELINE_STAGES = [
  {
    name: 'SENTINEL',
    label: 'Analyzing your content',
    index: 0,
  },
  {
    name: 'ORACLE',
    label: 'Extracting insights',
    index: 1,
  },
  {
    name: 'ARCHITECT',
    label: 'Structuring the narrative',
    index: 2,
  },
  {
    name: 'FORGE',
    label: 'Composing the visual',
    index: 3,
  },
  {
    name: 'RENDERER',
    label: 'Final output',
    index: 4,
  },
  {
    name: 'PROVENANCE',
    label: 'Certified & traceable',
    index: 5,
  },
  {
    name: 'DONE',
    label: 'Done. 60 seconds.',
    index: 6,
  },
];

/* The raw text that transforms through the pipeline */
const RAW_TEXT = `The global artificial intelligence market reached $184 billion in 2024, growing at a compound annual rate of 36.2%. Generative AI is the fastest-growing segment, projected to reach $67 billion by 2025. Enterprise adoption has doubled year-over-year, with 78% of Fortune 500 companies now deploying AI in production. Key growth drivers include healthcare diagnostics, autonomous vehicles, and financial modeling.`;

const TEXT_PHRASES = [
  { text: '$184 billion', start: 62, end: 74 },
  { text: '36.2%', start: 118, end: 123 },
  { text: 'Generative AI', start: 125, end: 138 },
  { text: '$67 billion', start: 181, end: 192 },
  { text: '78%', start: 249, end: 252 },
  { text: 'Fortune 500', start: 256, end: 267 },
  { text: 'healthcare diagnostics', start: 333, end: 355 },
  { text: 'autonomous vehicles', start: 357, end: 376 },
  { text: 'financial modeling', start: 382, end: 400 },
];

function HighlightedText({ progress }: { progress: number }) {
  if (progress < 0.14) {
    /* Stage 1: Raw text */
    return (
      <p className="font-sans text-[13px] sm:text-[15px] leading-[1.9] text-white/40">
        {RAW_TEXT}
      </p>
    );
  }

  if (progress < 0.28) {
    /* Stage 2: Key phrases highlighted gold */
    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    TEXT_PHRASES.forEach((phrase, i) => {
      if (phrase.start > lastIdx) {
        parts.push(
          <span key={`t-${i}`} className="text-white/40">
            {RAW_TEXT.slice(lastIdx, phrase.start)}
          </span>,
        );
      }
      parts.push(
        <span key={`h-${i}`} className="text-[#D4A84B] font-bold">
          {RAW_TEXT.slice(phrase.start, phrase.end)}
        </span>,
      );
      lastIdx = phrase.end;
    });
    if (lastIdx < RAW_TEXT.length) {
      parts.push(
        <span key="rest" className="text-white/40">
          {RAW_TEXT.slice(lastIdx)}
        </span>,
      );
    }
    return <p className="font-sans text-[13px] sm:text-[15px] leading-[1.9]">{parts}</p>;
  }

  if (progress < 0.42) {
    /* Stage 3: Reorganized into outline */
    return (
      <div className="space-y-4 font-mono text-[12px] sm:text-[13px]">
        <div>
          <p className="text-[#D4A84B] font-bold text-[10px] tracking-[0.2em] mb-1">SECTION 1 / OVERVIEW</p>
          <p className="text-white/50 pl-4 border-l border-[#D4A84B]/30">Market size: $184B | CAGR: 36.2%</p>
        </div>
        <div>
          <p className="text-[#D4A84B] font-bold text-[10px] tracking-[0.2em] mb-1">SECTION 2 / KEY SEGMENT</p>
          <p className="text-white/50 pl-4 border-l border-[#D4A84B]/30">Generative AI: $67B projected (2025)</p>
        </div>
        <div>
          <p className="text-[#D4A84B] font-bold text-[10px] tracking-[0.2em] mb-1">SECTION 3 / ADOPTION</p>
          <p className="text-white/50 pl-4 border-l border-[#D4A84B]/30">78% of Fortune 500 in production</p>
        </div>
        <div>
          <p className="text-[#D4A84B] font-bold text-[10px] tracking-[0.2em] mb-1">SECTION 4 / DRIVERS</p>
          <p className="text-white/50 pl-4 border-l border-[#D4A84B]/30">Healthcare, Autonomous, Finance</p>
        </div>
      </div>
    );
  }

  /* Stage 4+: outline fades, visual takes over on right */
  return (
    <div className="space-y-4 font-mono text-[12px] sm:text-[13px] opacity-40">
      <div>
        <p className="text-[#D4A84B]/60 font-bold text-[10px] tracking-[0.2em] mb-1">NARRATIVE LOCKED</p>
        <p className="text-white/30 pl-4 border-l border-white/10">4 sections | 3 KPIs | 2 charts</p>
      </div>
      <div className="mt-6 border border-[#D4A84B]/20 p-3">
        <p className="text-[10px] text-[#D4A84B]/50 tracking-[0.15em]">PIPELINE STATUS</p>
        <div className="mt-2 h-1 bg-white/5">
          <motion.div
            className="h-full bg-[#D4A84B]"
            animate={{ width: `${Math.min(100, (progress - 0.42) / 0.58 * 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}

function PipelineVisual({ progress }: { progress: number }) {
  /* The right panel — evolves from nothing to a complete infographic */

  if (progress < 0.14) {
    /* Empty — just a placeholder frame */
    return (
      <div className="w-full aspect-[3/4] border border-white/5 flex items-center justify-center">
        <p className="text-white/10 font-mono text-[11px] tracking-[0.2em]">AWAITING INPUT</p>
      </div>
    );
  }

  if (progress < 0.28) {
    /* Stage 2: Data extraction — numbers appearing */
    return (
      <div className="w-full aspect-[3/4] border border-[#D4A84B]/20 p-4 sm:p-6 space-y-4">
        <div className="flex gap-3">
          {['$184B', '36.2%', '$67B'].map((v) => (
            <div key={v} className="flex-1 border border-[#D4A84B]/30 p-2 text-center">
              <p className="font-mono text-[#D4A84B] text-lg sm:text-xl font-bold">{v}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {['Generative AI segment', 'Fortune 500 adoption', 'Healthcare diagnostics', 'Financial modeling'].map((t) => (
            <div key={t} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#D4A84B]/40" />
              <p className="font-sans text-[11px] text-white/30">{t}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (progress < 0.42) {
    /* Stage 3: Structure — wireframe layout */
    return (
      <div className="w-full aspect-[3/4] border border-white/10 p-3 sm:p-4">
        {/* Title placeholder */}
        <div className="h-4 bg-white/10 w-3/4 mb-4" />
        <div className="h-2 bg-white/5 w-1/2 mb-6" />
        {/* KPI row */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 h-14 border border-white/10" />
          <div className="flex-1 h-14 border border-white/10" />
          <div className="flex-1 h-14 border border-white/10" />
        </div>
        {/* Chart placeholder */}
        <div className="h-32 border border-white/10 mb-4 flex items-end px-2 pb-2 gap-2">
          {[40, 60, 35, 80, 55].map((h, i) => (
            <div key={i} className="flex-1 bg-white/5" style={{ height: `${h}%` }} />
          ))}
        </div>
        {/* Text lines */}
        <div className="space-y-2">
          <div className="h-2 bg-white/5 w-full" />
          <div className="h-2 bg-white/5 w-5/6" />
          <div className="h-2 bg-white/5 w-2/3" />
        </div>
      </div>
    );
  }

  if (progress < 0.56) {
    /* Stage 4: Visual composition — colors and shapes */
    return (
      <div className="w-full aspect-[3/4] border-2 border-[#D4A84B]/30 bg-[#0A0A0B] p-3 sm:p-4">
        <div className="mb-3">
          <div className="h-4 bg-[#D4A84B]/20 w-3/4 mb-2" />
          <div className="h-1 bg-[#D4A84B] w-16" />
        </div>
        {/* KPI tiles with color */}
        <div className="flex gap-2 mb-4">
          {[
            { v: '$184B', l: 'Market' },
            { v: '36.2%', l: 'CAGR' },
            { v: 'GenAI', l: 'Top' },
          ].map((kpi) => (
            <div key={kpi.l} className="flex-1 border border-[#D4A84B]/30 bg-[#D4A84B]/5 p-2 text-center">
              <p className="font-mono text-[#D4A84B] text-sm font-bold">{kpi.v}</p>
              <p className="font-mono text-[8px] text-white/30 tracking-[0.1em] mt-0.5">{kpi.l}</p>
            </div>
          ))}
        </div>
        {/* Colored bar chart */}
        <div className="h-28 border border-[#D4A84B]/20 bg-[#D4A84B]/3 mb-3 flex items-end px-3 pb-2 gap-2">
          {[40, 60, 35, 80, 55].map((h, i) => (
            <div key={i} className="flex-1" style={{ height: `${h}%`, background: i === 3 ? 'rgba(212,168,75,0.5)' : 'rgba(232,229,224,0.12)' }} />
          ))}
        </div>
        {/* Trend line mock */}
        <svg viewBox="0 0 200 40" className="w-full h-8" aria-hidden="true">
          <polyline points="10,30 50,18 90,32 130,8 170,20" stroke="#D4A84B" strokeWidth="2" fill="none" />
        </svg>
      </div>
    );
  }

  if (progress < 0.70) {
    /* Stage 5: Finished infographic — detailed SVG */
    return (
      <div className="w-full aspect-[3/4] border-2 border-[#D4A84B]/50 bg-[#0A0A0B] overflow-hidden">
        <svg viewBox="0 0 300 400" fill="none" className="w-full h-full" aria-hidden="true">
          {/* Title */}
          <text x={150} y={24} textAnchor="middle" fill="#E8E5E0" fontSize="10" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold" letterSpacing="0.08em">
            GLOBAL AI MARKET OVERVIEW
          </text>
          <line x1={50} y1={30} x2={250} y2={30} stroke="#D4A84B" strokeWidth="1" />
          {/* KPI tiles */}
          {[
            { v: '$184B', l: 'MARKET SIZE', x: 15 },
            { v: '36.2%', l: 'CAGR', x: 110 },
            { v: 'GenAI', l: 'TOP SEGMENT', x: 205 },
          ].map((kpi) => (
            <g key={kpi.l}>
              <rect x={kpi.x} y={40} width={80} height={42} fill="#D4A84B" fillOpacity="0.06" stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.3" />
              <text x={kpi.x + 40} y={56} textAnchor="middle" fill="#D4A84B" fillOpacity="0.6" fontSize="6" fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.1em">{kpi.l}</text>
              <text x={kpi.x + 40} y={72} textAnchor="middle" fill="#E8E5E0" fontSize="13" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold">{kpi.v}</text>
            </g>
          ))}
          {/* Bar chart */}
          {[
            { x: 30, h: 80, label: 'Q1' },
            { x: 82, h: 120, label: 'Q2' },
            { x: 134, h: 65, label: 'Q3' },
            { x: 186, h: 155, label: 'Q4' },
            { x: 238, h: 105, label: 'YTD' },
          ].map((bar, i) => (
            <g key={bar.label}>
              <rect x={bar.x} y={310 - bar.h} width={35} height={bar.h} fill={i === 3 ? '#D4A84B' : '#E8E5E0'} fillOpacity={i === 3 ? 0.35 : 0.08} stroke={i === 3 ? '#D4A84B' : '#E8E5E0'} strokeWidth={i === 3 ? 1.5 : 0.5} strokeOpacity={i === 3 ? 0.8 : 0.15} />
              <text x={bar.x + 17} y={325} textAnchor="middle" fill="#E8E5E0" fillOpacity="0.35" fontSize="7" fontFamily="'IBM Plex Mono', monospace">{bar.label}</text>
            </g>
          ))}
          {/* Trend line */}
          <polyline points="47,260 100,200 152,275 204,155 256,210" stroke="#D4A84B" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {[{ cx: 47, cy: 260 }, { cx: 100, cy: 200 }, { cx: 152, cy: 275 }, { cx: 204, cy: 155 }, { cx: 256, cy: 210 }].map((d, i) => (
            <circle key={i} cx={d.cx} cy={d.cy} r={2.5} fill="#D4A84B" />
          ))}
          {/* Section labels */}
          <text x={15} y={100} fill="#D4A84B" fillOpacity="0.5" fontSize="6" fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.1em">QUARTERLY REVENUE ($B)</text>
          {/* Sources */}
          <text x={15} y={380} fill="#E8E5E0" fillOpacity="0.2" fontSize="5.5" fontFamily="'IBM Plex Sans', sans-serif">Sources: Statista, Grand View Research, Bloomberg Intelligence</text>
          {/* ZGNAL stamp */}
          <rect x={230} y={370} width={54} height={18} fill="#D4A84B" fillOpacity="0.1" stroke="#D4A84B" strokeWidth="0.8" />
          <text x={257} y={382} textAnchor="middle" fill="#D4A84B" fontSize="7" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold" letterSpacing="0.15em">ZGNAL</text>
          {/* Outer frame */}
          <rect x={5} y={5} width={290} height={390} stroke="#E8E5E0" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
        </svg>
      </div>
    );
  }

  if (progress < 0.85) {
    /* Stage 6: Provenance badge */
    return (
      <div className="w-full aspect-[3/4] border-2 border-[#D4A84B]/50 bg-[#0A0A0B] relative overflow-hidden">
        <svg viewBox="0 0 300 400" fill="none" className="w-full h-full opacity-60" aria-hidden="true">
          <text x={150} y={24} textAnchor="middle" fill="#E8E5E0" fontSize="10" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold" letterSpacing="0.08em">GLOBAL AI MARKET OVERVIEW</text>
          <line x1={50} y1={30} x2={250} y2={30} stroke="#D4A84B" strokeWidth="1" />
          {[{ v: '$184B', l: 'MARKET SIZE', x: 15 }, { v: '36.2%', l: 'CAGR', x: 110 }, { v: 'GenAI', l: 'TOP SEGMENT', x: 205 }].map((kpi) => (
            <g key={kpi.l}>
              <rect x={kpi.x} y={40} width={80} height={42} fill="#D4A84B" fillOpacity="0.06" stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.3" />
              <text x={kpi.x + 40} y={56} textAnchor="middle" fill="#D4A84B" fillOpacity="0.6" fontSize="6" fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.1em">{kpi.l}</text>
              <text x={kpi.x + 40} y={72} textAnchor="middle" fill="#E8E5E0" fontSize="13" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold">{kpi.v}</text>
            </g>
          ))}
          {[{ x: 30, h: 80 }, { x: 82, h: 120 }, { x: 134, h: 65 }, { x: 186, h: 155 }, { x: 238, h: 105 }].map((bar, i) => (
            <rect key={i} x={bar.x} y={310 - bar.h} width={35} height={bar.h} fill={i === 3 ? '#D4A84B' : '#E8E5E0'} fillOpacity={i === 3 ? 0.35 : 0.08} />
          ))}
          <polyline points="47,260 100,200 152,275 204,155 256,210" stroke="#D4A84B" strokeWidth="1.5" fill="none" />
        </svg>
        {/* Provenance overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="border-2 border-[#D4A84B] p-5 sm:p-6 text-center bg-[#0A0A0B]/95 max-w-[220px]">
            <div className="w-8 h-8 border-2 border-[#D4A84B] mx-auto mb-3 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8l4 4 8-8" stroke="#D4A84B" strokeWidth="2" strokeLinecap="square" />
              </svg>
            </div>
            <p className="font-mono text-[10px] text-[#D4A84B] tracking-[0.2em] font-bold mb-1">PROVENANCE</p>
            <p className="font-sans text-[10px] text-white/40 leading-relaxed">Pipeline traced. Sources verified. Content hash recorded.</p>
            <div className="mt-3 h-px bg-[#D4A84B]/20" />
            <p className="font-mono text-[8px] text-white/20 mt-2">SHA-256: a3f8...c912</p>
          </div>
        </div>
      </div>
    );
  }

  /* Stage 7: Done — download ready */
  return (
    <div className="w-full aspect-[3/4] border-2 border-[#D4A84B] bg-[#0A0A0B] relative overflow-hidden">
      <svg viewBox="0 0 300 400" fill="none" className="w-full h-full" aria-hidden="true">
        <text x={150} y={24} textAnchor="middle" fill="#E8E5E0" fontSize="10" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold" letterSpacing="0.08em">GLOBAL AI MARKET OVERVIEW</text>
        <line x1={50} y1={30} x2={250} y2={30} stroke="#D4A84B" strokeWidth="1" />
        {[{ v: '$184B', l: 'MARKET SIZE', x: 15 }, { v: '36.2%', l: 'CAGR', x: 110 }, { v: 'GenAI', l: 'TOP SEGMENT', x: 205 }].map((kpi) => (
          <g key={kpi.l}>
            <rect x={kpi.x} y={40} width={80} height={42} fill="#D4A84B" fillOpacity="0.06" stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.3" />
            <text x={kpi.x + 40} y={56} textAnchor="middle" fill="#D4A84B" fillOpacity="0.6" fontSize="6" fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.1em">{kpi.l}</text>
            <text x={kpi.x + 40} y={72} textAnchor="middle" fill="#E8E5E0" fontSize="13" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold">{kpi.v}</text>
          </g>
        ))}
        {[{ x: 30, h: 80 }, { x: 82, h: 120 }, { x: 134, h: 65 }, { x: 186, h: 155 }, { x: 238, h: 105 }].map((bar, i) => (
          <rect key={i} x={bar.x} y={310 - bar.h} width={35} height={bar.h} fill={i === 3 ? '#D4A84B' : '#E8E5E0'} fillOpacity={i === 3 ? 0.35 : 0.08} stroke={i === 3 ? '#D4A84B' : '#E8E5E0'} strokeWidth={i === 3 ? 1.5 : 0.5} strokeOpacity={i === 3 ? 0.8 : 0.15} />
        ))}
        <polyline points="47,260 100,200 152,275 204,155 256,210" stroke="#D4A84B" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {[{ cx: 47, cy: 260 }, { cx: 100, cy: 200 }, { cx: 152, cy: 275 }, { cx: 204, cy: 155 }, { cx: 256, cy: 210 }].map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={2.5} fill="#D4A84B" />
        ))}
        <rect x={230} y={370} width={54} height={18} fill="#D4A84B" fillOpacity="0.1" stroke="#D4A84B" strokeWidth="0.8" />
        <text x={257} y={382} textAnchor="middle" fill="#D4A84B" fontSize="7" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold" letterSpacing="0.15em">ZGNAL</text>
        <text x={15} y={380} fill="#E8E5E0" fillOpacity="0.2" fontSize="5.5" fontFamily="'IBM Plex Sans', sans-serif">Sources: Statista, Grand View Research, Bloomberg</text>
        <rect x={5} y={5} width={290} height={390} stroke="#D4A84B" strokeWidth="0.8" strokeOpacity="0.3" fill="none" />
      </svg>
      {/* Download CTA overlay at bottom */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/90 to-transparent">
        <div className="flex gap-2 justify-center">
          <div className="border border-[#D4A84B] px-4 py-2 font-mono text-[10px] text-[#D4A84B] tracking-[0.1em] font-bold">
            DOWNLOAD PNG
          </div>
          <div className="border border-white/20 px-4 py-2 font-mono text-[10px] text-white/40 tracking-[0.1em]">
            SHARE
          </div>
        </div>
      </div>
    </div>
  );
}

function ScrollytellingPipeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [progress, setProgress] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setProgress(v);
  });

  /* Determine active stage */
  const stageThresholds = [0, 0.14, 0.28, 0.42, 0.56, 0.70, 0.85];
  let activeStage = 0;
  for (let i = stageThresholds.length - 1; i >= 0; i--) {
    if (progress >= stageThresholds[i]) {
      activeStage = i;
      break;
    }
  }

  return (
    <section ref={containerRef} className="relative z-10" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 w-full">
          {/* Section header */}
          <div className="mb-6 sm:mb-8">
            <p className="text-[9px] font-mono font-semibold tracking-[0.3em] uppercase text-[#D4A84B] mb-2">
              The Pipeline
            </p>
            <h2 className="text-2xl sm:text-3xl font-mono font-bold text-[#E8E5E0]">
              Watch it happen.
            </h2>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-start">
            {/* Left — text transformation (40%) */}
            <div className="lg:col-span-2 min-h-[200px]">
              <HighlightedText progress={progress} />

              {/* Stage indicator */}
              <div className="mt-6 sm:mt-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-[#D4A84B] animate-pulse" />
                  <p className="font-mono text-[11px] text-[#D4A84B] font-bold tracking-[0.15em]">
                    {PIPELINE_STAGES[activeStage].name}
                  </p>
                </div>
                <p className="font-sans text-[13px] text-white/35">
                  {PIPELINE_STAGES[activeStage].label}
                </p>
                {/* Progress dots */}
                <div className="flex gap-1.5 mt-4">
                  {PIPELINE_STAGES.map((_, i) => (
                    <div
                      key={i}
                      className="h-1 transition-all duration-300"
                      style={{
                        width: i === activeStage ? 24 : 8,
                        backgroundColor: i <= activeStage ? '#D4A84B' : 'rgba(255,255,255,0.08)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right — visual output (60%) */}
            <div className="lg:col-span-3">
              <PipelineVisual progress={progress} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 3: Gallery — Style Showcase SVG Cards
   ═══════════════════════════════════════════════════════════════ */

function ExecutiveCard() {
  return (
    <svg viewBox="0 0 240 420" fill="none" className="w-full h-full" aria-hidden="true">
      <rect width={240} height={420} fill="#0E1629" />
      <text x={20} y={30} fill="#C9A84C" fontSize="8" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold" letterSpacing="0.1em">EXECUTIVE BRIEF</text>
      <line x1={20} y1={38} x2={100} y2={38} stroke="#C9A84C" strokeWidth="1" />
      {[{ v: '2.4M', l: 'Users', x: 15 }, { v: '94%', l: 'Retain', x: 85 }, { v: '$18B', l: 'Rev', x: 155 }].map((k) => (
        <g key={k.l}>
          <rect x={k.x} y={50} width={65} height={40} fill="#C9A84C" fillOpacity="0.06" stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.3" />
          <text x={k.x + 32} y={68} textAnchor="middle" fill="#E8E5E0" fontSize="11" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold">{k.v}</text>
          <text x={k.x + 32} y={82} textAnchor="middle" fill="#C9A84C" fillOpacity="0.5" fontSize="6" fontFamily="'IBM Plex Mono', monospace">{k.l}</text>
        </g>
      ))}
      {[50, 75, 40, 95, 65, 80, 55].map((h, i) => (
        <rect key={i} x={20 + i * 28} y={200 - h} width={20} height={h} fill="#C9A84C" fillOpacity={i === 3 ? 0.4 : 0.12} stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.2" />
      ))}
      <text x={20} y={108} fill="#C9A84C" fillOpacity="0.4" fontSize="6" fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.08em">QUARTERLY REVENUE</text>
      <polyline points="30,350 70,320 110,340 150,290 190,310" stroke="#C9A84C" strokeWidth="1.5" fill="none" />
      {[30, 70, 110, 150, 190].map((x, i) => (
        <circle key={i} cx={x} cy={[350, 320, 340, 290, 310][i]} r={2} fill="#C9A84C" />
      ))}
      <text x={20} y={260} fill="#C9A84C" fillOpacity="0.4" fontSize="6" fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.08em">GROWTH TREND</text>
      {[380, 390, 400].map((y, i) => (
        <g key={y}><rect x={20} y={y} width={[140, 100, 170][i]} height={6} fill="#C9A84C" fillOpacity={0.08 + i * 0.04} /><text x={20 + [140, 100, 170][i] + 6} y={y + 6} fill="#E8E5E0" fillOpacity="0.2" fontSize="5" fontFamily="'IBM Plex Mono', monospace">{['ENTERPRISE', 'SMB', 'CONSUMER'][i]}</text></g>
      ))}
    </svg>
  );
}

function CyberpunkCard() {
  return (
    <svg viewBox="0 0 240 420" fill="none" className="w-full h-full" aria-hidden="true">
      <rect width={240} height={420} fill="#0A0A12" />
      {/* Neon grid */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 50 + 20} x2={240} y2={i * 50 + 20} stroke="#00FFFF" strokeWidth="0.3" strokeOpacity="0.15" />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`v${i}`} x1={i * 50 + 20} y1={0} x2={i * 50 + 20} y2={420} stroke="#FF00FF" strokeWidth="0.3" strokeOpacity="0.1" />
      ))}
      <text x={20} y={35} fill="#00FFFF" fontSize="10" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold" letterSpacing="0.2em">SYS//REPORT</text>
      <text x={20} y={50} fill="#FF00FF" fontSize="6" fontFamily="'IBM Plex Mono', monospace" fillOpacity="0.6">NEURAL_SCAN v4.2.1</text>
      {/* Glitch bars */}
      {[80, 120, 160, 200].map((y, i) => (
        <g key={y}>
          <rect x={20} y={y} width={[120, 80, 160, 100][i]} height={3} fill={i % 2 === 0 ? '#00FFFF' : '#FF00FF'} fillOpacity="0.6" />
          <text x={20 + [120, 80, 160, 100][i] + 8} y={y + 3} fill="#E8E5E0" fillOpacity="0.3" fontSize="5" fontFamily="'IBM Plex Mono', monospace">{['0xF4A2', '0x91B7', '0xCC03', '0x7E11'][i]}</text>
        </g>
      ))}
      {/* Hex data blocks */}
      <rect x={20} y={250} width={200} height={80} stroke="#00FFFF" strokeWidth="0.5" strokeOpacity="0.3" fill="#00FFFF" fillOpacity="0.02" />
      {Array.from({ length: 4 }, (_, row) => (
        <text key={row} x={28} y={268 + row * 16} fill="#00FFFF" fillOpacity="0.4" fontSize="6" fontFamily="'IBM Plex Mono', monospace">
          {`${(row * 4).toString(16).padStart(4, '0')}: ${'FF A2 3C 91 00 E7 B4 2D'.split(' ').map(() => Math.floor(Math.random() * 255).toString(16).padStart(2, '0').toUpperCase()).join(' ')}`}
        </text>
      ))}
      {/* Neon circle */}
      <circle cx={120} cy={380} r={25} stroke="#FF00FF" strokeWidth="1" fill="none" strokeOpacity="0.4" />
      <circle cx={120} cy={380} r={15} stroke="#00FFFF" strokeWidth="0.5" fill="#00FFFF" fillOpacity="0.05" />
      <text x={120} y={383} textAnchor="middle" fill="#00FFFF" fontSize="8" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold">42%</text>
    </svg>
  );
}

function CraftCard() {
  return (
    <svg viewBox="0 0 240 420" fill="none" className="w-full h-full" aria-hidden="true">
      <rect width={240} height={420} fill="#F5F0E8" />
      {/* Warm textured feel */}
      <text x={20} y={35} fill="#5C4A32" fontSize="12" fontFamily="'IBM Plex Sans', sans-serif" fontWeight="bold">Field Notes</text>
      <text x={20} y={50} fill="#8B7355" fontSize="7" fontFamily="'IBM Plex Sans', sans-serif">A study in organic growth</text>
      {/* Wavy line separator */}
      <path d="M20,60 Q60,55 80,62 T140,58 T200,62 T220,58" stroke="#C4A882" strokeWidth="1.5" fill="none" />
      {/* Hand-drawn-style bars */}
      {[60, 90, 45, 110, 75].map((h, i) => (
        <rect key={i} x={25 + i * 40} y={180 - h} width={28} height={h} rx={0} fill={['#D4A882', '#8B7355', '#C4A882', '#5C4A32', '#A89070'][i]} fillOpacity="0.5" />
      ))}
      {/* "Brushstroke" accents */}
      <path d="M20,220 Q80,210 120,225 T220,215" stroke="#8B7355" strokeWidth="3" strokeOpacity="0.2" fill="none" strokeLinecap="round" />
      <path d="M20,240 Q100,230 150,245 T220,235" stroke="#C4A882" strokeWidth="2" strokeOpacity="0.3" fill="none" strokeLinecap="round" />
      {/* Text blocks */}
      {[270, 282, 294, 306, 318].map((y) => (
        <rect key={y} x={20} y={y} width={[180, 160, 190, 140, 170][y % 5]} height={4} fill="#5C4A32" fillOpacity="0.1" rx={2} />
      ))}
      {/* Circle callouts */}
      <circle cx={60} cy={370} r={20} fill="#D4A882" fillOpacity="0.2" stroke="#8B7355" strokeWidth="1" />
      <text x={60} y={373} textAnchor="middle" fill="#5C4A32" fontSize="8" fontFamily="'IBM Plex Sans', sans-serif" fontWeight="bold">67%</text>
      <circle cx={130} cy={370} r={20} fill="#C4A882" fillOpacity="0.15" stroke="#8B7355" strokeWidth="1" />
      <text x={130} y={373} textAnchor="middle" fill="#5C4A32" fontSize="8" fontFamily="'IBM Plex Sans', sans-serif" fontWeight="bold">23%</text>
      <circle cx={200} cy={370} r={20} fill="#8B7355" fillOpacity="0.15" stroke="#8B7355" strokeWidth="1" />
      <text x={200} y={373} textAnchor="middle" fill="#5C4A32" fontSize="8" fontFamily="'IBM Plex Sans', sans-serif" fontWeight="bold">10%</text>
    </svg>
  );
}

function SchematicCard() {
  return (
    <svg viewBox="0 0 240 420" fill="none" className="w-full h-full" aria-hidden="true">
      <rect width={240} height={420} fill="#0B1628" />
      {/* Blueprint grid */}
      {Array.from({ length: 22 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 20} x2={240} y2={i * 20} stroke="#3A7BD5" strokeWidth="0.3" strokeOpacity="0.15" />
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <line key={`v${i}`} x1={i * 20} y1={0} x2={i * 20} y2={420} stroke="#3A7BD5" strokeWidth="0.3" strokeOpacity="0.15" />
      ))}
      <text x={20} y={25} fill="#3A7BD5" fontSize="7" fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.15em">SCHEMATIC-004</text>
      <text x={20} y={38} fill="#6BA4E8" fontSize="5" fontFamily="'IBM Plex Mono', monospace" fillOpacity="0.5">REV. 2.1 | SCALE 1:100</text>
      {/* Technical drawing lines */}
      <rect x={30} y={60} width={180} height={100} stroke="#3A7BD5" strokeWidth="1" fill="none" strokeOpacity="0.4" />
      <line x1={30} y1={60} x2={210} y2={160} stroke="#3A7BD5" strokeWidth="0.5" strokeOpacity="0.2" />
      <line x1={210} y1={60} x2={30} y2={160} stroke="#3A7BD5" strokeWidth="0.5" strokeOpacity="0.2" />
      <circle cx={120} cy={110} r={30} stroke="#6BA4E8" strokeWidth="1" fill="none" strokeOpacity="0.3" />
      <circle cx={120} cy={110} r={15} stroke="#3A7BD5" strokeWidth="0.5" fill="#3A7BD5" fillOpacity="0.05" />
      {/* Dimension lines */}
      <line x1={25} y1={55} x2={25} y2={165} stroke="#6BA4E8" strokeWidth="0.5" strokeOpacity="0.3" />
      <text x={15} y={115} fill="#6BA4E8" fillOpacity="0.4" fontSize="5" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle" transform="rotate(-90, 15, 115)">240mm</text>
      {/* Data table */}
      {[200, 220, 240, 260, 280].map((y, i) => (
        <g key={y}>
          <line x1={20} y1={y} x2={220} y2={y} stroke="#3A7BD5" strokeWidth="0.5" strokeOpacity="0.2" />
          <text x={25} y={y + 14} fill="#6BA4E8" fillOpacity="0.5" fontSize="5" fontFamily="'IBM Plex Mono', monospace">
            {['PARAM_01  |  42.5  |  PASS', 'PARAM_02  |  38.1  |  PASS', 'PARAM_03  |  91.7  |  WARN', 'PARAM_04  |  55.3  |  PASS', 'PARAM_05  |  12.8  |  FAIL'][i]}
          </text>
        </g>
      ))}
      {/* Tolerance indicator */}
      <rect x={20} y={330} width={200} height={30} stroke="#3A7BD5" strokeWidth="0.5" fill="none" strokeOpacity="0.3" />
      <rect x={20} y={330} width={142} height={30} fill="#3A7BD5" fillOpacity="0.08" />
      <text x={120} y={350} textAnchor="middle" fill="#6BA4E8" fontSize="7" fontFamily="'IBM Plex Mono', monospace">TOLERANCE: 71.2%</text>
      {/* Stamp */}
      <rect x={160} y={380} width={60} height={24} stroke="#3A7BD5" strokeWidth="1" fill="none" strokeOpacity="0.4" />
      <text x={190} y={396} textAnchor="middle" fill="#3A7BD5" fontSize="7" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold">APPROVED</text>
    </svg>
  );
}

function KawaiiCard() {
  return (
    <svg viewBox="0 0 240 420" fill="none" className="w-full h-full" aria-hidden="true">
      <rect width={240} height={420} fill="#FFF5F9" />
      {/* Pastel header */}
      <rect x={0} y={0} width={240} height={60} fill="#FFD4E8" fillOpacity="0.4" />
      <text x={120} y={30} textAnchor="middle" fill="#E87BAE" fontSize="11" fontFamily="'IBM Plex Sans', sans-serif" fontWeight="bold">Happy Stats!</text>
      <text x={120} y={45} textAnchor="middle" fill="#D4A0B9" fontSize="7" fontFamily="'IBM Plex Sans', sans-serif">Everything is looking great</text>
      {/* Cute pie/donut */}
      <circle cx={120} cy={130} r={40} fill="#FFD4E8" fillOpacity="0.3" />
      <circle cx={120} cy={130} r={40} fill="none" stroke="#E87BAE" strokeWidth="8" strokeDasharray="150 251" strokeDashoffset="0" />
      <circle cx={120} cy={130} r={40} fill="none" stroke="#B4E8D4" strokeWidth="8" strokeDasharray="60 251" strokeDashoffset="-150" />
      <circle cx={120} cy={130} r={40} fill="none" stroke="#D4B4E8" strokeWidth="8" strokeDasharray="41 251" strokeDashoffset="-210" />
      <circle cx={120} cy={130} r={25} fill="#FFF5F9" />
      {/* Happy face in center */}
      <circle cx={112} cy={127} r={2} fill="#E87BAE" />
      <circle cx={128} cy={127} r={2} fill="#E87BAE" />
      <path d="M112,134 Q120,140 128,134" stroke="#E87BAE" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Pastel bars */}
      {[
        { h: 50, c: '#FFD4E8' },
        { h: 70, c: '#B4E8D4' },
        { h: 40, c: '#D4B4E8' },
        { h: 85, c: '#FFE8B4' },
        { h: 60, c: '#B4D4E8' },
      ].map((bar, i) => (
        <rect key={i} x={25 + i * 40} y={310 - bar.h} width={28} height={bar.h} rx={0} fill={bar.c} fillOpacity="0.5" />
      ))}
      {/* Star decorations */}
      {[{ x: 30, y: 210 }, { x: 200, y: 225 }, { x: 115, y: 205 }].map((s, i) => (
        <text key={i} x={s.x} y={s.y} fill="#FFD4E8" fontSize="12" fillOpacity="0.5">*</text>
      ))}
      {/* Legend */}
      {['Happiness', 'Puppies', 'Rainbows'].map((label, i) => (
        <g key={label}>
          <rect x={30} y={340 + i * 18} width={10} height={10} fill={['#E87BAE', '#B4E8D4', '#D4B4E8'][i]} fillOpacity="0.6" rx={0} />
          <text x={48} y={349 + i * 18} fill="#C490A8" fontSize="7" fontFamily="'IBM Plex Sans', sans-serif">{label}</text>
        </g>
      ))}
    </svg>
  );
}

function PixelCard() {
  return (
    <svg viewBox="0 0 240 420" fill="none" className="w-full h-full" aria-hidden="true">
      <rect width={240} height={420} fill="#1A1A2E" />
      {/* Pixel grid overlay */}
      {Array.from({ length: 43 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 10} x2={240} y2={i * 10} stroke="#2A2A4E" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 25 }, (_, i) => (
        <line key={`v${i}`} x1={i * 10} y1={0} x2={i * 10} y2={420} stroke="#2A2A4E" strokeWidth="0.5" />
      ))}
      {/* Pixel text header */}
      {/* P */}
      {[[2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [3, 1], [4, 1], [4, 2], [3, 2]].map(([x, y], i) => (
        <rect key={`p${i}`} x={x * 10} y={y * 10} width={10} height={10} fill="#4ADE80" fillOpacity="0.6" />
      ))}
      {/* X */}
      {[[7, 1], [7, 5], [8, 2], [8, 4], [9, 3], [10, 2], [10, 4], [11, 1], [11, 5]].map(([x, y], i) => (
        <rect key={`x${i}`} x={x * 10} y={y * 10} width={10} height={10} fill="#4ADE80" fillOpacity="0.6" />
      ))}
      {/* L */}
      {[[14, 1], [14, 2], [14, 3], [14, 4], [14, 5], [15, 5], [16, 5]].map(([x, y], i) => (
        <rect key={`l${i}`} x={x * 10} y={y * 10} width={10} height={10} fill="#4ADE80" fillOpacity="0.6" />
      ))}
      {/* Pixel bar chart */}
      {[
        { col: 3, rows: 5 },
        { col: 6, rows: 8 },
        { col: 9, rows: 4 },
        { col: 12, rows: 10 },
        { col: 15, rows: 7 },
        { col: 18, rows: 6 },
      ].map((bar, i) => (
        <g key={i}>
          {Array.from({ length: bar.rows }, (_, r) => (
            <rect key={r} x={bar.col * 10} y={(26 - r) * 10} width={20} height={10} fill={i === 3 ? '#F59E0B' : '#4ADE80'} fillOpacity={i === 3 ? 0.5 : 0.2} stroke="#1A1A2E" strokeWidth="0.5" />
          ))}
        </g>
      ))}
      {/* Score display */}
      <rect x={60} y={300} width={120} height={40} fill="#4ADE80" fillOpacity="0.05" stroke="#4ADE80" strokeWidth="1" strokeOpacity="0.3" />
      <text x={120} y={316} textAnchor="middle" fill="#4ADE80" fontSize="6" fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.1em">HIGH SCORE</text>
      <text x={120} y={332} textAnchor="middle" fill="#F59E0B" fontSize="14" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold">999,999</text>
      {/* Pixel hearts */}
      {[30, 50, 70].map((x, i) => (
        <g key={i}>
          <rect x={x} y={370} width={8} height={8} fill="#EF4444" fillOpacity="0.5" />
          <rect x={x + 8} y={370} width={8} height={8} fill="#EF4444" fillOpacity="0.5" />
          <rect x={x - 4} y={378} width={8} height={8} fill="#EF4444" fillOpacity="0.5" />
          <rect x={x + 4} y={378} width={8} height={8} fill="#EF4444" fillOpacity="0.5" />
          <rect x={x + 12} y={378} width={8} height={8} fill="#EF4444" fillOpacity="0.5" />
          <rect x={x} y={386} width={8} height={8} fill="#EF4444" fillOpacity="0.5" />
          <rect x={x + 8} y={386} width={8} height={8} fill="#EF4444" fillOpacity="0.5" />
          <rect x={x + 4} y={394} width={8} height={8} fill="#EF4444" fillOpacity="0.5" />
        </g>
      ))}
    </svg>
  );
}

const GALLERY_ITEMS = [
  { name: 'Executive Institutional', Component: ExecutiveCard },
  { name: 'Cyberpunk Neon', Component: CyberpunkCard },
  { name: 'Craft Handmade', Component: CraftCard },
  { name: 'Technical Schematic', Component: SchematicCard },
  { name: 'Kawaii', Component: KawaiiCard },
  { name: 'Pixel Art', Component: PixelCard },
];

/* ═══════════════════════════════════════════════════════════════
   SECTION 4: Animated Counter (inline stats)
   ═══════════════════════════════════════════════════════════════ */

function InlineCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1600;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-mono font-bold tabular-nums" style={{
      background: 'linear-gradient(135deg, #D4A84B 0%, #F5DFA0 40%, #D4A84B 70%, #B8923A 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    }}>
      {display}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(heroScrollProgress, [0, 0.5], [0, -60]);

  const galleryRef = useRef<HTMLDivElement>(null);
  const galleryInView = useInView(galleryRef, { once: true, amount: 0.05 });

  return (
    <div className="relative min-h-screen bg-[#0A0A0B] overflow-hidden">
      {/* ═══ Dot Grid Background ═══ */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(212,168,75,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO — "The Infographic Lab"
          Full viewport. Left: text. Right: animated infographic SVG.
          ═══════════════════════════════════════════════════════════ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 min-h-screen flex items-center"
      >
        <div className="mx-auto max-w-7xl px-6 w-full py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left — Text */}
            <div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-[10px] font-mono font-semibold tracking-[0.3em] uppercase text-[#D4A84B] mb-6"
              >
                ZGNAL.AI
              </motion.p>

              <motion.h1
                className="font-mono font-bold text-[#E8E5E0] leading-[1.05] tracking-tight mb-8"
                style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.span custom={0} variants={fadeUp} className="inline-block mr-[0.3em]">The</motion.span>
                <br className="sm:hidden" />
                <motion.span custom={1} variants={fadeUp} className="inline-block mr-[0.3em]">Infographic</motion.span>
                <br />
                <motion.span custom={2} variants={fadeUp} className="inline-block">
                  <span style={{
                    background: 'linear-gradient(135deg, #D4A84B 0%, #F5DFA0 30%, #D4A84B 60%, #B8923A 100%)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'shimmer 3s ease-in-out infinite',
                  }}>Lab.</span>
                </motion.span>
              </motion.h1>

              {/* Gold accent line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="h-[3px] bg-[#D4A84B] mb-8"
              />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-lg sm:text-xl text-white/50 leading-relaxed max-w-lg font-sans mb-10"
              >
                We turn complex ideas into visuals that command attention.
                60 seconds. No designer needed.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <Link
                  href="/"
                  className="inline-block border-2 border-[#D4A84B] px-8 py-3 font-mono text-sm font-bold tracking-[0.15em] uppercase text-[#D4A84B] hover:bg-[#D4A84B] hover:text-[#0A0A0B] transition-all duration-300"
                >
                  Start generating
                </Link>
              </motion.div>
            </div>

            {/* Right — Animated infographic SVG */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              <div className="relative w-full max-w-md mx-auto lg:max-w-none">
                <HeroInfographicSVG />
                {/* Soft glow */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(212,168,75,0.06) 0%, transparent 70%)',
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.0, duration: 0.8 }}
          >
            <p className="font-mono text-[9px] text-white/20 tracking-[0.2em] uppercase">Scroll</p>
            <motion.svg
              width="20" height="20" viewBox="0 0 20 20" fill="none"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M4 8L10 14L16 8" stroke="#D4A84B" strokeWidth="2" strokeLinecap="square" />
            </motion.svg>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: SCROLLYTELLING PIPELINE
          ═══════════════════════════════════════════════════════════ */}
      <ScrollytellingPipeline />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: GALLERY — "See what's possible"
          Horizontal scrolling carousel with detailed SVG cards
          ═══════════════════════════════════════════════════════════ */}
      <section ref={galleryRef} className="relative z-10 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 mb-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={galleryInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[9px] font-mono font-semibold tracking-[0.3em] uppercase text-[#D4A84B] mb-3"
          >
            Showcase
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={galleryInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.7 }}
            className="text-2xl sm:text-3xl font-mono font-bold text-[#E8E5E0]"
          >
            See what&apos;s possible.
          </motion.h2>
        </div>

        {/* Horizontal scroll carousel */}
        <div
          className="flex gap-4 px-6 pb-4 overflow-x-auto"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(212,168,75,0.3) transparent',
          }}
        >
          {GALLERY_ITEMS.map((item, i) => (
            <motion.div
              key={item.name}
              className="flex-shrink-0 group relative cursor-pointer"
              style={{
                width: 280,
                scrollSnapAlign: 'start',
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={galleryInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="border-2 border-white/8 group-hover:border-[#D4A84B]/40 transition-colors duration-300 overflow-hidden" style={{ aspectRatio: '9/16' }}>
                <item.Component />
              </div>
              <div className="mt-3">
                <p className="font-mono text-xs font-bold text-white/60 tracking-wide uppercase group-hover:text-[#D4A84B] transition-colors duration-300">
                  {item.name}
                </p>
                <p className="font-sans text-[10px] text-white/25 mt-0.5">Infographic style</p>
              </div>
            </motion.div>
          ))}
          {/* Spacer for scroll padding at end */}
          <div className="flex-shrink-0 w-6" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: BY THE NUMBERS — Inline dramatic stats
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
            className="font-sans text-lg sm:text-xl md:text-2xl text-white/40 leading-[2.2] sm:leading-[2.4]"
          >
            <InlineCounter value={20} /> styles.{' '}
            <InlineCounter value={20} /> layouts.{' '}
            <InlineCounter value={400} suffix="+" /> combinations.{' '}
            <InlineCounter value={22} /> trusted sources.{' '}
            Generated in <InlineCounter value={60} suffix="s" />.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: WHY THIS EXISTS — The Story
          Personal, human, honest. Founder's voice.
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#0D0D0E] py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            className="text-[9px] font-mono font-semibold tracking-[0.3em] uppercase text-[#D4A84B] mb-6"
          >
            Why this exists
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="relative pl-6 sm:pl-8 border-l-2 border-[#D4A84B]/30"
          >
            <p className="font-sans text-white/50 leading-[2] text-[15px] sm:text-base">
              I got tired of ugly infographics. Every tool either gave you a template
              from 2015 or charged $200/hour for a designer. So I built an AI that
              thinks like a McKinsey designer but moves like software. Seven stages.
              No shortcuts. No templates. Every infographic is generated from scratch
              — researched, structured, rendered at publication quality.
            </p>
            <p className="font-sans text-white/50 leading-[2] text-[15px] sm:text-base mt-6">
              One person built this. Thousands use it. That&apos;s the point.
            </p>
          </motion.div>

          {/* Made in Dubai + GitHub */}
          <motion.div
            className="mt-10 flex items-center gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-3 border border-white/15 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1/3 bg-green-700/40" />
                <div className="absolute inset-y-0 left-1/3 w-1/3 bg-white/20" />
                <div className="absolute inset-y-0 right-0 w-1/3 bg-black/30" />
                <div className="absolute inset-y-0 left-0 w-[6px] bg-red-600/40" />
              </div>
              <span className="font-mono text-[10px] text-white/20 tracking-[0.1em]">Made in Dubai</span>
            </div>
            <a
              href="https://github.com/zignal"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] text-white/20 tracking-[0.1em] hover:text-[#D4A84B] transition-colors duration-300 underline underline-offset-2 decoration-white/10"
            >
              GitHub
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6: CTA — "Try it yourself"
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 sm:py-24" style={{
        background: 'linear-gradient(135deg, rgba(212,168,75,0.06) 0%, rgba(10,10,11,1) 40%, rgba(212,168,75,0.04) 100%)',
      }}>
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl sm:text-4xl font-mono font-bold text-[#E8E5E0] mb-4">
              Your first infographic is{' '}
              <span style={{
                background: 'linear-gradient(135deg, #D4A84B 0%, #F5DFA0 40%, #D4A84B 70%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>free.</span>
            </h2>
            <p className="font-sans text-white/35 text-base mb-10 max-w-md mx-auto">
              No signup required. Paste any text. 60 seconds.
            </p>
            <Link
              href="/"
              className="inline-block border-2 border-[#D4A84B] bg-[#D4A84B] px-10 py-4 font-mono text-sm font-bold tracking-[0.15em] uppercase text-[#0A0A0B] hover:bg-transparent hover:text-[#D4A84B] transition-all duration-300"
            >
              Start generating
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ Shimmer Keyframes ═══ */}
      <style jsx global>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
