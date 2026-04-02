'use client';

import { useRef, useEffect, useState } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
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

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const statVariant: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ═══════════════════════════════════════════════════════════════
   Bauhaus Hero Illustration (animated SVG)
   ═══════════════════════════════════════════════════════════════ */

function BauhausIllustration() {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Large gold circle */}
      <motion.circle
        cx="250"
        cy="220"
        r="140"
        stroke="#D4A84B"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />
      {/* Floating inner circle */}
      <motion.circle
        cx="300"
        cy="180"
        r="60"
        fill="#D4A84B"
        fillOpacity="0.08"
        stroke="#D4A84B"
        strokeWidth="1.5"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}
      />
      <motion.circle
        cx="300"
        cy="180"
        r="60"
        fill="none"
        stroke="#D4A84B"
        strokeWidth="1"
        strokeOpacity="0.3"
        animate={{ r: [60, 68, 60] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* White rectangle — tilted */}
      <motion.rect
        x="140"
        y="160"
        width="120"
        height="160"
        stroke="#E8E5E0"
        strokeWidth="2"
        fill="#E8E5E0"
        fillOpacity="0.03"
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: -12, opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.4 }}
        style={{ transformOrigin: '200px 240px' }}
      />
      {/* Diagonal line */}
      <motion.line
        x1="80"
        y1="400"
        x2="420"
        y2="100"
        stroke="#D4A84B"
        strokeWidth="1"
        strokeOpacity="0.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.8, delay: 0.8 }}
      />
      {/* Second diagonal */}
      <motion.line
        x1="60"
        y1="350"
        x2="440"
        y2="150"
        stroke="#E8E5E0"
        strokeWidth="0.5"
        strokeOpacity="0.15"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 1.2 }}
      />
      {/* Small floating diamond */}
      <motion.rect
        x="350"
        y="310"
        width="50"
        height="50"
        stroke="#D4A84B"
        strokeWidth="1.5"
        fill="#D4A84B"
        fillOpacity="0.06"
        style={{ transformOrigin: '375px 335px' }}
        initial={{ rotate: 45, scale: 0 }}
        animate={{ rotate: 45, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
      />
      <motion.rect
        x="350"
        y="310"
        width="50"
        height="50"
        stroke="#D4A84B"
        strokeWidth="1"
        strokeOpacity="0.2"
        fill="none"
        style={{ transformOrigin: '375px 335px' }}
        animate={{ rotate: [45, 50, 45] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Triangle */}
      <motion.polygon
        points="180,380 230,300 280,380"
        stroke="#E8E5E0"
        strokeWidth="1.5"
        fill="#E8E5E0"
        fillOpacity="0.03"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
      />
      {/* Tiny accent circles */}
      {[
        { cx: 120, cy: 130, r: 4, delay: 1.4 },
        { cx: 400, cy: 260, r: 3, delay: 1.6 },
        { cx: 160, cy: 420, r: 5, delay: 1.8 },
        { cx: 380, cy: 400, r: 3, delay: 2.0 },
      ].map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill="#D4A84B"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{
            scale: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 },
          }}
        />
      ))}
      {/* Horizontal ruled lines */}
      {[280, 300, 320].map((yy, i) => (
        <motion.line
          key={yy}
          x1="100"
          y1={yy}
          x2="200"
          y2={yy}
          stroke="#E8E5E0"
          strokeWidth="0.5"
          strokeOpacity="0.1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.5 + i * 0.15 }}
        />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Geometric "Z" Logo Illustration
   ═══════════════════════════════════════════════════════════════ */

function ZLogoIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-48 h-48 sm:w-64 sm:h-64"
      aria-hidden="true"
    >
      {/* Outer square */}
      <motion.rect
        x="10"
        y="10"
        width="180"
        height="180"
        stroke="#D4A84B"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Z letterform */}
      <motion.path
        d="M 50 60 L 150 60 L 50 140 L 150 140"
        stroke="#D4A84B"
        strokeWidth="4"
        strokeLinecap="square"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Accent circle */}
      <motion.circle
        cx="150"
        cy="60"
        r="6"
        fill="#D4A84B"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: 1.5, duration: 0.4 }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Pipeline Node Shapes
   ═══════════════════════════════════════════════════════════════ */

function PipelineShape({
  shape,
  size = 48,
  color = '#D4A84B',
}: {
  shape: 'circle' | 'square' | 'diamond' | 'hexagon' | 'triangle' | 'pentagon' | 'octagon';
  size?: number;
  color?: string;
}) {
  const half = size / 2;
  const svgProps = { width: size, height: size, viewBox: `0 0 ${size} ${size}`, fill: 'none', xmlns: 'http://www.w3.org/2000/svg' };

  switch (shape) {
    case 'circle':
      return (
        <svg {...svgProps}>
          <circle cx={half} cy={half} r={half - 4} stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08" />
        </svg>
      );
    case 'square':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width={size - 8} height={size - 8} stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08" />
        </svg>
      );
    case 'diamond':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width={size - 8} height={size - 8} stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08" transform={`rotate(45 ${half} ${half})`} />
        </svg>
      );
    case 'hexagon': {
      const r = half - 4;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        return `${half + r * Math.cos(a)},${half + r * Math.sin(a)}`;
      }).join(' ');
      return (
        <svg {...svgProps}>
          <polygon points={pts} stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08" />
        </svg>
      );
    }
    case 'triangle': {
      const pts = `${half},4 ${size - 4},${size - 4} 4,${size - 4}`;
      return (
        <svg {...svgProps}>
          <polygon points={pts} stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08" />
        </svg>
      );
    }
    case 'pentagon': {
      const r = half - 4;
      const pts = Array.from({ length: 5 }, (_, i) => {
        const a = (2 * Math.PI / 5) * i - Math.PI / 2;
        return `${half + r * Math.cos(a)},${half + r * Math.sin(a)}`;
      }).join(' ');
      return (
        <svg {...svgProps}>
          <polygon points={pts} stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08" />
        </svg>
      );
    }
    case 'octagon': {
      const r = half - 4;
      const pts = Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI / 4) * i - Math.PI / 8;
        return `${half + r * Math.cos(a)},${half + r * Math.sin(a)}`;
      }).join(' ');
      return (
        <svg {...svgProps}>
          <polygon points={pts} stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08" />
        </svg>
      );
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   Principle Card Icons (unique SVG per card)
   ═══════════════════════════════════════════════════════════════ */

const PRINCIPLE_ICONS: Record<string, React.ReactNode> = {
  Simplicity: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="12" stroke="#D4A84B" strokeWidth="1.5" />
      <line x1="16" y1="8" x2="16" y2="24" stroke="#D4A84B" strokeWidth="1.5" />
    </svg>
  ),
  Discipline: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="24" height="24" stroke="#D4A84B" strokeWidth="1.5" />
      <rect x="10" y="10" width="12" height="12" stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.5" />
    </svg>
  ),
  Transparency: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="12" stroke="#D4A84B" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="6" stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="16" cy="16" r="2" fill="#D4A84B" />
    </svg>
  ),
  Quality: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <polygon points="16,2 20,12 30,12 22,18 25,28 16,22 7,28 10,18 2,12 12,12" stroke="#D4A84B" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  Survival: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <polygon points="16,4 28,28 4,28" stroke="#D4A84B" strokeWidth="1.5" fill="none" />
      <line x1="16" y1="14" x2="16" y2="22" stroke="#D4A84B" strokeWidth="1.5" />
      <circle cx="16" cy="25" r="1" fill="#D4A84B" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   Animated Counter
   ═══════════════════════════════════════════════════════════════ */

function AnimatedCounter({
  value,
  suffix = '',
  label,
  sublabel,
}: {
  value: number;
  suffix?: string;
  label: string;
  sublabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1800;
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
    <motion.div
      ref={ref}
      variants={statVariant}
      className="text-center py-10 px-6"
    >
      <div className="font-mono font-bold tabular-nums mb-2" style={{
        fontSize: 'clamp(3rem, 6vw, 4.5rem)',
        background: 'linear-gradient(135deg, #D4A84B 0%, #F5DFA0 40%, #D4A84B 70%, #B8923A 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        {display}{suffix}
      </div>
      <p className="text-sm font-mono font-bold text-white/70 tracking-wide uppercase mb-1">
        {label}
      </p>
      <p className="text-xs font-sans text-white/30">
        {sublabel}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════════════════ */

const PRINCIPLES = [
  {
    name: 'Simplicity',
    desc: "Complex systems fail. We remove, we don't add. Every visual element must justify its existence.",
  },
  {
    name: 'Discipline',
    desc: 'Systematic pipelines beat ad-hoc design. We build repeatable processes, not one-off templates.',
  },
  {
    name: 'Transparency',
    desc: 'Every infographic comes with a provenance certificate — full pipeline trace, sources, and methodology.',
  },
  {
    name: 'Quality',
    desc: 'Output meets the visual standard of McKinsey, BCG, and Bloomberg. Consulting-grade is the baseline.',
  },
  {
    name: 'Survival',
    desc: 'We build for longevity. Clean architecture, responsible AI, and honest representations of data.',
  },
];

const PIPELINE_STAGES = [
  { name: 'Sentinel', desc: 'Analyze & classify input', shape: 'circle' as const },
  { name: 'Scout', desc: 'Deep research & sourcing', shape: 'square' as const },
  { name: 'Oracle', desc: 'Extract key insights', shape: 'diamond' as const },
  { name: 'Strategist', desc: 'Structure the narrative', shape: 'hexagon' as const },
  { name: 'Architect', desc: 'Design the visual layout', shape: 'triangle' as const },
  { name: 'Forge', desc: 'Compose & render', shape: 'pentagon' as const },
  { name: 'Renderer', desc: 'Final pixel-perfect output', shape: 'octagon' as const },
];

const STATS = [
  { value: 20, suffix: '', label: 'Layouts', sublabel: 'Dashboard to editorial' },
  { value: 20, suffix: '', label: 'Styles', sublabel: 'Bauhaus to watercolor' },
  { value: 22, suffix: '', label: 'Sources', sublabel: 'Verified research feeds' },
  { value: 60, suffix: 's', label: 'Generation', sublabel: 'Idea to infographic' },
];

const SHOWCASE_ITEMS = [
  { name: 'Executive Institutional', accent: '#1a2744', icon: '◆' },
  { name: 'Neo Bauhaus', accent: '#D4A84B', icon: '■' },
  { name: 'Watercolor Botanical', accent: '#3d6b5e', icon: '●' },
  { name: 'Dark Editorial', accent: '#1a1a2e', icon: '▲' },
];

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const missionLineRef = useRef<HTMLDivElement>(null);
  const missionLineInView = useInView(missionLineRef, { once: true, amount: 0.2 });
  const pipelineRef = useRef<HTMLDivElement>(null);
  const pipelineInView = useInView(pipelineRef, { once: true, amount: 0.2 });
  const quoteRef = useRef<HTMLDivElement>(null);
  const quoteInView = useInView(quoteRef, { once: true, amount: 0.2 });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

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
          HERO — Split: Text Left (40%) / Illustration Right (60%)
          ═══════════════════════════════════════════════════════════ */}
      <motion.div
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 mx-auto max-w-7xl px-6 pt-28 sm:pt-36 pb-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center min-h-[60vh]">
          {/* Text — 2/5 */}
          <div className="lg:col-span-2">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[10px] font-mono font-semibold tracking-[0.3em] uppercase text-[#D4A84B] mb-6"
            >
              About ZGNAL
            </motion.p>

            <div className="mb-8 overflow-hidden">
              <motion.h1
                className="font-mono font-bold text-[#E8E5E0] leading-[1.05] tracking-tight"
                style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {['The', 'signal'].map((word, i) => (
                  <motion.span
                    key={word}
                    custom={i}
                    variants={fadeUp}
                    className="inline-block mr-[0.3em]"
                  >
                    {word}
                  </motion.span>
                ))}
                <br />
                <motion.span custom={2} variants={fadeUp} className="inline-block">
                  is{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #D4A84B 0%, #F5DFA0 30%, #D4A84B 60%, #B8923A 100%)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'shimmer 3s ease-in-out infinite',
                    }}
                  >
                    truth.
                  </span>
                </motion.span>
              </motion.h1>
            </div>

            {/* Gold accent line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-0.75 bg-[#D4A84B] mb-10"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-lg text-white/50 leading-relaxed max-w-md font-sans"
            >
              ZGNAL.AI transforms complex information into publication-ready visual
              intelligence. Seven AI stages. One beautiful output.
            </motion.p>
          </div>

          {/* Illustration — 3/5 */}
          <motion.div
            className="lg:col-span-3 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          >
            <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
              <BauhausIllustration />
              {/* Soft glow behind illustration */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(212,168,75,0.06) 0%, transparent 70%)',
                }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          MISSION — Full-Bleed Dark Section
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#0D0D0E] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Pull quote */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-[9px] font-mono font-semibold tracking-[0.3em] uppercase text-[#D4A84B] mb-6">
                Mission
              </p>
              <p
                className="font-sans text-white/60 leading-[1.9]"
                style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
              >
                We believe every idea deserves to be understood. Complex data
                shouldn&apos;t stay locked in spreadsheets. Research shouldn&apos;t
                be limited by design skills.
              </p>
              <p className="mt-6 font-sans text-white/40 leading-[1.8] text-base">
                Our seven-stage AI pipeline handles the research, design, and
                rendering — so you can focus on the insight.
              </p>
            </motion.div>

            {/* Geometric line illustration + animated line */}
            <div ref={missionLineRef} className="relative">
              <svg
                viewBox="0 0 400 200"
                fill="none"
                className="w-full"
                aria-hidden="true"
              >
                {/* Grid of horizontal lines */}
                {Array.from({ length: 7 }, (_, i) => (
                  <motion.line
                    key={i}
                    x1="0"
                    y1={30 + i * 24}
                    x2="400"
                    y2={30 + i * 24}
                    stroke="#E8E5E0"
                    strokeWidth="0.5"
                    strokeOpacity={0.06 + i * 0.02}
                    initial={{ pathLength: 0 }}
                    animate={missionLineInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1.2, delay: i * 0.1 }}
                  />
                ))}
                {/* Gold accent line sweeping across */}
                <motion.line
                  x1="0"
                  y1="100"
                  x2="400"
                  y2="100"
                  stroke="#D4A84B"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={missionLineInView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
                {/* Accent circle at line end */}
                <motion.circle
                  cx="400"
                  cy="100"
                  r="4"
                  fill="#D4A84B"
                  initial={{ scale: 0 }}
                  animate={missionLineInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ delay: 1.8, duration: 0.3 }}
                />
                {/* Vertical bars — data visualization hint */}
                {[60, 120, 200, 260, 340].map((x, i) => (
                  <motion.rect
                    key={x}
                    x={x}
                    y={100 - (20 + i * 8)}
                    width="8"
                    height={20 + i * 8}
                    fill="#D4A84B"
                    fillOpacity={0.08 + i * 0.03}
                    initial={{ scaleY: 0 }}
                    animate={missionLineInView ? { scaleY: 1 } : { scaleY: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + i * 0.12 }}
                    style={{ transformOrigin: `${x + 4}px 100px` }}
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PIPELINE — The Showpiece
          ═══════════════════════════════════════════════════════════ */}
      <section ref={pipelineRef} className="relative z-10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={pipelineInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[9px] font-mono font-semibold tracking-[0.3em] uppercase text-[#D4A84B] mb-4 text-center"
          >
            The Pipeline
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={pipelineInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-mono font-bold text-[#E8E5E0] text-center mb-4"
          >
            Seven stages. One vision.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={pipelineInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/35 font-sans text-center mb-16 max-w-xl mx-auto"
          >
            From raw input to publication-ready infographic — every stage is orchestrated by specialized AI.
          </motion.p>

          {/* Pipeline nodes — horizontal on desktop, vertical on mobile */}
          <div className="relative">
            {/* Desktop: horizontal layout */}
            <div className="hidden lg:flex items-start justify-between relative">
              {/* Connecting dashed line */}
              <svg className="absolute top-6 left-0 w-full h-4 pointer-events-none" aria-hidden="true">
                <motion.line
                  x1="24"
                  y1="7"
                  x2="100%"
                  y2="7"
                  stroke="#D4A84B"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  initial={{ pathLength: 0 }}
                  animate={pipelineInView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>

              {PIPELINE_STAGES.map((stage, i) => (
                <motion.div
                  key={stage.name}
                  className="flex flex-col items-center text-center relative z-10"
                  style={{ width: `${100 / PIPELINE_STAGES.length}%` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={pipelineInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <PipelineShape shape={stage.shape} size={48} />
                  </motion.div>
                  <p className="text-xs font-mono font-bold text-[#D4A84B] mt-4 tracking-wide uppercase">
                    {stage.name}
                  </p>
                  <p className="text-[11px] font-sans text-white/30 mt-1 max-w-25">
                    {stage.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Mobile: vertical layout */}
            <div className="lg:hidden space-y-0">
              {PIPELINE_STAGES.map((stage, i) => (
                <motion.div
                  key={stage.name}
                  className="flex items-center gap-5 relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={pipelineInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                >
                  <div className="flex flex-col items-center">
                    <PipelineShape shape={stage.shape} size={40} />
                    {i < PIPELINE_STAGES.length - 1 && (
                      <div className="w-px h-8 border-l border-dashed border-[#D4A84B]/40" />
                    )}
                  </div>
                  <div className="pb-8">
                    <p className="text-xs font-mono font-bold text-[#D4A84B] tracking-wide uppercase">
                      {stage.name}
                    </p>
                    <p className="text-[11px] font-sans text-white/30 mt-0.5">
                      {stage.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRINCIPLES — Cards with Geometric Icons
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 sm:py-32" style={{
        backgroundImage: `repeating-linear-gradient(
          135deg,
          transparent,
          transparent 20px,
          rgba(212,168,75,0.015) 20px,
          rgba(212,168,75,0.015) 21px
        )`,
      }}>
        <div className="mx-auto max-w-7xl px-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-[9px] font-mono font-semibold tracking-[0.3em] uppercase text-[#D4A84B] mb-8"
          >
            Principles
          </motion.p>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {PRINCIPLES.map((p, i) => (
              <motion.div
                key={p.name}
                variants={cardVariant}
                className="relative group border-2 border-white/6 bg-[#0A0A0B]/80 p-7 overflow-hidden transition-all duration-500 hover:border-transparent"
                style={{
                  backgroundImage: 'linear-gradient(#0A0A0B, #0A0A0B), linear-gradient(135deg, rgba(212,168,75,0.3), transparent 60%)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
                whileHover={{
                  backgroundImage: 'linear-gradient(#0A0A0B, #0A0A0B), linear-gradient(135deg, rgba(212,168,75,0.6), transparent 60%)',
                }}
              >
                {/* Gold left bar on hover */}
                <div className="absolute left-0 top-0 w-0.75 h-0 bg-[#D4A84B] group-hover:h-full transition-all duration-500" />
                <div className="absolute inset-0 bg-[#D4A84B]/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="mb-4">
                    {PRINCIPLE_ICONS[p.name]}
                  </div>
                  <span className="text-[10px] font-mono text-[#D4A84B]/60 tracking-[0.2em] block mb-3">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-sm font-mono font-bold text-white mb-3 tracking-wide uppercase">
                    {p.name}
                  </h3>
                  <p className="text-[13px] text-white/40 leading-relaxed font-sans">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS — Full-Width Gold-Tinted
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-24" style={{
        background: 'linear-gradient(135deg, rgba(212,168,75,0.04) 0%, rgba(10,10,11,1) 50%, rgba(212,168,75,0.03) 100%)',
      }}>
        <div className="mx-auto max-w-7xl px-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-[9px] font-mono font-semibold tracking-[0.3em] uppercase text-[#D4A84B] mb-8 text-center"
          >
            By the Numbers
          </motion.p>
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {STATS.map((s) => (
              <div key={s.label} className="bg-[#0A0A0B]">
                <AnimatedCounter
                  value={s.value}
                  suffix={s.suffix}
                  label={s.label}
                  sublabel={s.sublabel}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SHOWCASE GALLERY — "See What's Possible"
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-[9px] font-mono font-semibold tracking-[0.3em] uppercase text-[#D4A84B] mb-4"
          >
            Showcase
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="text-3xl sm:text-4xl font-mono font-bold text-[#E8E5E0] mb-12"
          >
            See what&apos;s possible.
          </motion.h2>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {SHOWCASE_ITEMS.map((item) => (
              <motion.div
                key={item.name}
                variants={cardVariant}
                className="group relative aspect-4/5 border-2 border-white/6 overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Colored background */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(160deg, ${item.accent} 0%, ${item.accent}CC 50%, #0A0A0B 100%)`,
                  }}
                />
                {/* Decorative shape */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                  <span className="text-white" style={{ fontSize: '6rem' }}>
                    {item.icon}
                  </span>
                </div>
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent" />
                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                    {item.name}
                  </p>
                  <p className="text-[10px] font-sans text-white/40 mt-1">
                    Infographic style
                  </p>
                </div>
                {/* Hover border glow */}
                <div className="absolute inset-0 border-2 border-[#D4A84B]/0 group-hover:border-[#D4A84B]/40 transition-colors duration-500" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STUDIO / PHILOSOPHY — Cinematic
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#0D0D0E] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Z Logo illustration */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, rotate: -5 }}
              whileInView={{ opacity: 1, rotate: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <ZLogoIllustration />
            </motion.div>

            {/* Text + Quote */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7 }}
              >
                <p className="text-[9px] font-mono font-semibold tracking-[0.3em] uppercase text-[#D4A84B] mb-6">
                  The Studio
                </p>
                <h2 className="text-3xl sm:text-4xl font-mono font-bold text-[#E8E5E0] leading-tight mb-6">
                  Built by one.
                  <br />
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #D4A84B 0%, #F5DFA0 40%, #D4A84B 70%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Used by many.
                  </span>
                </h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-white/45 leading-[1.8] font-sans text-[15px] mb-8"
              >
                ZGNAL is a one-person product studio. No committees. No
                compromise. Every pixel, every pipeline stage, every design
                decision flows from a single vision: make complex information
                visible and actionable.
              </motion.p>

              {/* Quote with gold bar */}
              <div ref={quoteRef} className="relative pl-8">
                <motion.div
                  initial={{ height: 0 }}
                  animate={quoteInView ? { height: '100%' } : { height: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 top-0 w-0.75 bg-[#D4A84B]"
                />
                <motion.blockquote
                  initial={{ opacity: 0, x: -12 }}
                  animate={quoteInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <p className="text-white/40 leading-[1.9] italic font-sans text-sm">
                    &ldquo;Proven. Clear. Executable. We don&apos;t add complexity
                    — we extract signal from noise. Every infographic is a
                    distillation: the minimum visual structure needed to communicate
                    maximum insight.&rdquo;
                  </p>
                </motion.blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA — Final Call to Action
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-28">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="inline-block"
          >
            <p className="text-[9px] font-mono font-semibold tracking-[0.3em] uppercase text-[#D4A84B] mb-6">
              Ready?
            </p>
            <h2 className="text-3xl sm:text-4xl font-mono font-bold text-[#E8E5E0] mb-8">
              See what the pipeline builds.
            </h2>
            <Link
              href="/"
              className="inline-block border-2 border-[#D4A84B] px-10 py-4 font-mono text-sm font-bold tracking-[0.15em] uppercase text-[#D4A84B] hover:bg-[#D4A84B] hover:text-[#0A0A0B] transition-all duration-300"
            >
              Try the Pipeline
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
