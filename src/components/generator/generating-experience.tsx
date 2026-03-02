'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, FileText, BarChart3, Layers, Sparkles,
  CheckCircle2,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   THE ENGINE ROOM
   Full-screen generating experience — centered illustration per
   stage with a horizontal step flow at the bottom. Each completed
   step freezes its mini illustration, next step activates.
   ═══════════════════════════════════════════════════════════════ */

/* ── Stage definitions ─────────────────────────────────────── */

type Stage = {
  id: string;
  num: string;
  agent: string;
  name: string;
  verb: string;
  icon: React.ElementType;
  progressRange: [number, number];
};

const STAGES: Stage[] = [
  { id: 'extract',   num: '01', agent: 'Sentinel',   name: 'Extract',   verb: 'Scanning',      icon: FileText,  progressRange: [0, 10] },
  { id: 'research',  num: '02', agent: 'Oracle',      name: 'Research',   verb: 'Researching',   icon: Search,    progressRange: [10, 25] },
  { id: 'analyze',   num: '03', agent: 'Strategist',  name: 'Analyze',    verb: 'Analyzing',     icon: BarChart3, progressRange: [25, 45] },
  { id: 'structure', num: '04', agent: 'Architect',   name: 'Structure',  verb: 'Structuring',   icon: Layers,    progressRange: [45, 60] },
  { id: 'generate',  num: '05', agent: 'Renderer',    name: 'Generate',   verb: 'Rendering',     icon: Sparkles,  progressRange: [60, 100] },
];

/* ═══════════════════════════════════════════════════════════════
   STAGE-SPECIFIC SVG SCENES
   ═══════════════════════════════════════════════════════════════ */

function SentinelScene({ mini }: { mini?: boolean }) {
  const pages = [
    { x: -180, y: -60, r: -12, delay: 0 },
    { x: 160, y: 40, r: 8, delay: 0.2 },
    { x: -50, y: 180, r: -5, delay: 0.4 },
    { x: 120, y: -150, r: 15, delay: 0.3 },
  ];
  return (
    <g>
      {pages.map((p, i) => (
        <motion.g
          key={i}
          initial={mini ? undefined : { x: p.x, y: p.y, opacity: 0, rotate: p.r }}
          animate={{ x: (i % 2 === 0 ? -1 : 1) * 20 * (i - 1.5), y: (i - 1.5) * 28, opacity: 0.7, rotate: 0 }}
          transition={mini ? { duration: 0 } : { delay: p.delay, duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <rect x="-22" y="-30" width="44" height="60" fill="none" stroke="#E8E5E0" strokeWidth="1" opacity="0.5" />
          <path d="M 12,-30 L 22,-30 L 22,-20 Z" fill="none" stroke="#E8E5E0" strokeWidth="0.5" opacity="0.3" />
          {[0, 1, 2, 3, 4].map((l) => (
            <motion.rect
              key={l}
              x="-16"
              y={-18 + l * 10}
              width={28 - (l === 4 ? 12 : l === 2 ? 6 : 0)}
              height="2"
              fill="#D4A84B"
              initial={mini ? { opacity: 0.4, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
              animate={{ opacity: 0.4, scaleX: 1 }}
              transition={mini ? { duration: 0 } : { delay: p.delay + 1.2 + l * 0.15, duration: 0.4 }}
            />
          ))}
        </motion.g>
      ))}
    </g>
  );
}

function OracleScene({ mini }: { mini?: boolean }) {
  const satellites = [
    { angle: 0, dist: 80, color: '#5B8DEF' },
    { angle: 51, dist: 90, color: '#5B8DEF' },
    { angle: 103, dist: 75, color: '#8BC34A' },
    { angle: 154, dist: 85, color: '#5B8DEF' },
    { angle: 206, dist: 70, color: '#A78BFA' },
    { angle: 257, dist: 95, color: '#5B8DEF' },
    { angle: 309, dist: 80, color: '#8BC34A' },
  ];
  return (
    <g>
      {[40, 70, 100].map((r, i) => (
        <motion.circle
          key={r}
          cx="0" cy="0" r={r}
          fill="none" stroke="#5B8DEF" strokeWidth="0.5" strokeDasharray="4 6"
          initial={mini ? { opacity: 0.1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.15, 0.08], scale: 1 }}
          transition={mini ? { duration: 0 } : { delay: i * 0.3, duration: 1.5 }}
        />
      ))}
      {satellites.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * s.dist;
        const ty = Math.sin(rad) * s.dist;
        return (
          <motion.g key={i}>
            <motion.line
              x1="0" y1="0" x2={tx} y2={ty}
              stroke={s.color} strokeWidth="0.5"
              initial={mini ? { opacity: 0.25 } : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.25 }}
              transition={mini ? { duration: 0 } : { delay: 0.5 + i * 0.2, duration: 0.8 }}
            />
            <motion.circle
              cx={tx} cy={ty} r="5"
              fill="none" stroke={s.color} strokeWidth="1.5"
              initial={mini ? { opacity: 0.7, scale: 1 } : { opacity: 0, scale: 0 }}
              animate={{ opacity: 0.7, scale: 1 }}
              transition={mini ? { duration: 0 } : { delay: 0.8 + i * 0.2, duration: 0.6 }}
            />
            {!mini && (
              <motion.circle
                cx="0" cy="0" r="2" fill={s.color}
                initial={{ opacity: 0 }}
                animate={{ cx: [0, tx], cy: [0, ty], opacity: [0, 0.8, 0] }}
                transition={{ delay: 1.5 + i * 0.3, duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
              />
            )}
          </motion.g>
        );
      })}
      <motion.circle
        cx="0" cy="0" r="8" fill="#D4A84B" opacity="0.3"
        animate={mini ? {} : { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <circle cx="0" cy="0" r="4" fill="#D4A84B" opacity="0.6" />
    </g>
  );
}

function StrategistScene({ mini }: { mini?: boolean }) {
  const layouts = [
    { x: -55, y: -50, type: 'bento', delay: 0 },
    { x: 55, y: -50, type: 'cols', delay: 0.15 },
    { x: -55, y: 50, type: 'hero', delay: 0.2 },
    { x: 55, y: 50, type: 'grid', delay: 0.1 },
    { x: 0, y: 0, type: 'selected', delay: 0.3 },
  ];
  return (
    <g>
      {layouts.map((l, i) => {
        const isSelected = l.type === 'selected';
        return (
          <motion.g
            key={i}
            initial={mini ? { opacity: isSelected ? 0.9 : 0.4, scale: isSelected ? 1.3 : 0.9, x: l.x, y: l.y } : { opacity: 0, scale: 0.6 }}
            animate={{
              opacity: isSelected ? 0.9 : [0.6, 0.4],
              scale: isSelected ? 1.3 : [1, 0.9],
              x: l.x,
              y: l.y,
            }}
            transition={mini ? { duration: 0 } : { delay: l.delay, duration: isSelected ? 1.5 : 1, ease: 'easeOut' }}
          >
            <rect
              x="-28" y="-22" width="56" height="44"
              fill={isSelected ? 'rgba(212, 168, 75, 0.08)' : 'none'}
              stroke={isSelected ? '#D4A84B' : 'rgba(232, 229, 224, 0.15)'}
              strokeWidth={isSelected ? 1.5 : 0.5}
            />
            {l.type === 'bento' && (
              <g opacity="0.4">
                <rect x="-22" y="-16" width="20" height="12" fill="none" stroke={isSelected ? '#D4A84B' : '#E8E5E0'} strokeWidth="0.5" />
                <rect x="2" y="-16" width="20" height="5" fill="none" stroke={isSelected ? '#D4A84B' : '#E8E5E0'} strokeWidth="0.5" />
                <rect x="2" y="-8" width="20" height="5" fill="none" stroke={isSelected ? '#D4A84B' : '#E8E5E0'} strokeWidth="0.5" />
                <rect x="-22" y="0" width="44" height="14" fill="none" stroke={isSelected ? '#D4A84B' : '#E8E5E0'} strokeWidth="0.5" />
              </g>
            )}
            {l.type === 'cols' && (
              <g opacity="0.4">
                {[-18, -4, 10].map(x => <rect key={x} x={x} y="-16" width="12" height="28" fill="none" stroke="#E8E5E0" strokeWidth="0.5" />)}
              </g>
            )}
            {l.type === 'hero' && (
              <g opacity="0.4">
                <rect x="-22" y="-16" width="44" height="16" fill="none" stroke="#E8E5E0" strokeWidth="0.5" />
                <rect x="-22" y="4" width="20" height="10" fill="none" stroke="#E8E5E0" strokeWidth="0.5" />
                <rect x="2" y="4" width="20" height="10" fill="none" stroke="#E8E5E0" strokeWidth="0.5" />
              </g>
            )}
            {l.type === 'grid' && (
              <g opacity="0.4">
                {[-18, 2].map(x => [-14, 2].map(y => <rect key={`${x}${y}`} x={x} y={y} width="18" height="14" fill="none" stroke="#E8E5E0" strokeWidth="0.5" />))}
              </g>
            )}
            {l.type === 'selected' && (
              <g opacity="0.6">
                <rect x="-22" y="-16" width="20" height="12" fill="none" stroke="#D4A84B" strokeWidth="0.5" />
                <rect x="2" y="-16" width="20" height="5" fill="none" stroke="#D4A84B" strokeWidth="0.5" />
                <rect x="2" y="-8" width="20" height="5" fill="none" stroke="#D4A84B" strokeWidth="0.5" />
                <rect x="-22" y="0" width="44" height="14" fill="none" stroke="#D4A84B" strokeWidth="0.5" />
              </g>
            )}
            {isSelected && !mini && (
              <motion.rect
                x="-30" y="-24" width="60" height="48"
                fill="none" stroke="#D4A84B" strokeWidth="0.5"
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.g>
        );
      })}
    </g>
  );
}

function ArchitectScene({ mini }: { mini?: boolean }) {
  const nodes = [
    { x: 0, y: -70, level: 0 },
    { x: -60, y: -20, level: 1 },
    { x: 0, y: -20, level: 1 },
    { x: 60, y: -20, level: 1 },
    { x: -80, y: 30, level: 2 },
    { x: -40, y: 30, level: 2 },
    { x: -10, y: 30, level: 2 },
    { x: 30, y: 30, level: 2 },
    { x: 60, y: 30, level: 2 },
    { x: 85, y: 30, level: 2 },
    { x: -60, y: 75, level: 3 },
    { x: -20, y: 75, level: 3 },
    { x: 20, y: 75, level: 3 },
    { x: 60, y: 75, level: 3 },
  ];
  const edges = [
    [0, 1], [0, 2], [0, 3],
    [1, 4], [1, 5], [2, 6], [2, 7], [3, 8], [3, 9],
    [4, 10], [5, 11], [8, 12], [9, 13],
  ];
  return (
    <g>
      {edges.map(([from, to], i) => {
        const f = nodes[from];
        const t = nodes[to];
        const level = nodes[to].level;
        return (
          <motion.line
            key={i}
            x1={f.x} y1={f.y} x2={t.x} y2={t.y}
            stroke="#8BC34A" strokeWidth="1"
            initial={mini ? { opacity: 0.35, pathLength: 1 } : { opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.35, pathLength: 1 }}
            transition={mini ? { duration: 0 } : { delay: level * 0.6 + (i % 3) * 0.1, duration: 0.8 }}
          />
        );
      })}
      {nodes.map((n, i) => (
        <motion.g
          key={i}
          initial={mini ? { opacity: 0.8, scale: 1 } : { opacity: 0, scale: 0 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={mini ? { duration: 0 } : { delay: n.level * 0.6 + 0.2, duration: 0.5, ease: 'backOut' }}
        >
          <rect
            x={n.x - (n.level === 0 ? 10 : 7)}
            y={n.y - (n.level === 0 ? 10 : 7)}
            width={n.level === 0 ? 20 : 14}
            height={n.level === 0 ? 20 : 14}
            fill={n.level === 0 ? 'rgba(212, 168, 75, 0.15)' : 'rgba(139, 195, 74, 0.08)'}
            stroke={n.level === 0 ? '#D4A84B' : n.level === 1 ? '#8BC34A' : '#E8E5E0'}
            strokeWidth={n.level === 0 ? 1.5 : 1}
            opacity={n.level <= 1 ? 1 : 0.5}
          />
          {n.level <= 1 && (
            <>
              <rect x={n.x - 4} y={n.y - 2} width="8" height="1.5" fill={n.level === 0 ? '#D4A84B' : '#8BC34A'} opacity="0.4" />
              <rect x={n.x - 4} y={n.y + 2} width="5" height="1.5" fill={n.level === 0 ? '#D4A84B' : '#8BC34A'} opacity="0.3" />
            </>
          )}
        </motion.g>
      ))}
    </g>
  );
}

function RendererScene({ progress, mini }: { progress: number; mini?: boolean }) {
  const cols = 10;
  const rows = 7;
  const cellSize = 20;
  const gap = 3;
  const palette = ['#D4A84B', '#5B8DEF', '#C04B3C', '#8BC34A', '#A78BFA', '#E8E5E0'];
  const totalCells = cols * rows;
  const filledCount = mini ? totalCells : Math.floor((progress / 100) * totalCells);
  const offsetX = -((cols * (cellSize + gap) - gap) / 2);
  const offsetY = -((rows * (cellSize + gap) - gap) / 2);

  return (
    <g>
      {Array.from({ length: totalCells }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = offsetX + col * (cellSize + gap);
        const y = offsetY + row * (cellSize + gap);
        const isFilled = i < filledCount;
        const colorIdx = (col * 3 + row * 7 + i) % palette.length;
        return (
          <motion.rect
            key={i}
            x={x} y={y}
            width={cellSize} height={cellSize}
            fill={isFilled ? palette[colorIdx] : 'transparent'}
            stroke={isFilled ? palette[colorIdx] : 'rgba(232, 229, 224, 0.06)'}
            strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: isFilled ? 0.7 : 0.3 }}
            transition={mini ? { duration: 0 } : { delay: isFilled ? (i * 0.02) : 0, duration: 0.3 }}
          />
        );
      })}
      {!mini && (
        <motion.rect
          x={offsetX}
          y={offsetY}
          width="2"
          height={rows * (cellSize + gap)}
          fill="#D4A84B"
          animate={{ x: [offsetX, offsetX + cols * (cellSize + gap)] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          opacity="0.4"
        />
      )}
    </g>
  );
}

/* ── Scene dispatcher ──────────────────────────────────────── */

function SceneContent({ stageId, progress, mini }: { stageId: string; progress: number; mini?: boolean }) {
  switch (stageId) {
    case 'extract':   return <SentinelScene mini={mini} />;
    case 'research':  return <OracleScene mini={mini} />;
    case 'analyze':   return <StrategistScene mini={mini} />;
    case 'structure': return <ArchitectScene mini={mini} />;
    case 'generate':  return <RendererScene progress={progress} mini={mini} />;
    default:          return null;
  }
}

/* ── Main Visualization (big, centered) ────────────────────── */

function StageVisualization({ stageId, progress }: { stageId: string; progress: number }) {
  const ringR = 130;
  const ringCircumference = 2 * Math.PI * ringR;

  return (
    <svg viewBox="-160 -160 320 320" className="w-full h-full" aria-hidden="true">
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}>
        <circle cx="0" cy="0" r={ringR} fill="none" stroke="rgba(212, 168, 75, 0.08)" strokeWidth="1" strokeDasharray="6 8" />
      </motion.g>
      <circle
        cx="0" cy="0" r={ringR - 6}
        fill="none"
        stroke="rgba(212, 168, 75, 0.25)"
        strokeWidth="2"
        strokeDasharray={`${ringCircumference}`}
        strokeDashoffset={ringCircumference * (1 - progress / 100)}
        transform="rotate(-90)"
        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
      />
      <AnimatePresence mode="wait">
        <motion.g
          key={stageId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SceneContent stageId={stageId} progress={progress} />
        </motion.g>
      </AnimatePresence>
      <motion.circle
        cx="0" cy="0" r="3"
        fill="#D4A84B"
        animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <line x1="-10" y1="0" x2="10" y2="0" stroke="rgba(212, 168, 75, 0.2)" strokeWidth="0.5" />
      <line x1="0" y1="-10" x2="0" y2="10" stroke="rgba(212, 168, 75, 0.2)" strokeWidth="0.5" />
    </svg>
  );
}

/* ── Mini illustration for step flow ───────────────────────── */

function MiniIllustration({ stageId }: { stageId: string }) {
  return (
    <svg viewBox="-160 -160 320 320" className="w-full h-full" aria-hidden="true">
      <SceneContent stageId={stageId} progress={100} mini />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP FLOW — horizontal progression with mini illustrations
   ═══════════════════════════════════════════════════════════════ */

function StepFlow({ currentStageId }: { currentStageId: string }) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStageId);

  return (
    <div className="w-full flex items-stretch gap-0">
      {STAGES.map((stage, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isPending = i > currentIndex;

        return (
          <div key={stage.id} className="flex items-center flex-1 min-w-0">
            {/* Step card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative flex flex-col items-center w-full p-3 border transition-all duration-700 ${
                isCurrent
                  ? 'border-(--z-gold)/30 bg-(--z-gold)/[0.04]'
                  : isComplete
                    ? 'border-(--z-olive)/20 bg-(--z-olive)/[0.02]'
                    : 'border-white/[0.04] bg-white/[0.01]'
              }`}
            >
              {/* Mini illustration */}
              <div className={`w-14 h-14 sm:w-16 sm:h-16 mb-2 transition-opacity duration-500 ${
                isPending ? 'opacity-15' : isComplete ? 'opacity-40' : 'opacity-80'
              }`}>
                {isCurrent || isComplete ? (
                  <MiniIllustration stageId={stage.id} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <stage.icon className="h-5 w-5 text-white/20" />
                  </div>
                )}
              </div>

              {/* Agent name */}
              <span className={`text-[9px] sm:text-[10px] font-mono font-semibold tracking-wider uppercase transition-colors duration-500 ${
                isCurrent
                  ? 'text-(--z-gold)'
                  : isComplete
                    ? 'text-(--z-olive)'
                    : 'text-white/20'
              }`}>
                {stage.agent}
              </span>

              {/* Function label */}
              <span className={`text-[8px] font-mono tracking-widest uppercase mt-0.5 transition-colors duration-500 ${
                isCurrent
                  ? 'text-(--z-gold)/50'
                  : isComplete
                    ? 'text-(--z-olive)/40'
                    : 'text-white/10'
              }`}>
                {stage.name}
              </span>

              {/* Status indicator */}
              {isComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5"
                >
                  <CheckCircle2 className="h-3 w-3 text-(--z-olive)" />
                </motion.div>
              )}

              {/* Active pulse dot */}
              {isCurrent && (
                <motion.div
                  className="absolute top-1.5 right-1.5 h-2 w-2 bg-(--z-gold)"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Connector */}
            {i < STAGES.length - 1 && (
              <div className={`w-4 sm:w-6 h-px shrink-0 transition-colors duration-500 ${
                i < currentIndex ? 'bg-(--z-olive)/30' : 'bg-white/[0.06]'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT — GeneratingExperience
   ═══════════════════════════════════════════════════════════════ */

type Props = {
  status: string;
  progress: number;
  message: string;
  prompt: string;
};

export function GeneratingExperience({ progress, message }: Props) {
  const currentStageId = useMemo(() => {
    if (progress <= 10) return 'extract';
    if (progress <= 25) return 'research';
    if (progress <= 45) return 'analyze';
    if (progress <= 60) return 'structure';
    return 'generate';
  }, [progress]);

  const currentStage = STAGES.find(s => s.id === currentStageId) || STAGES[0];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Top: Agent heading */}
      <motion.div
        key={currentStageId}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <span className="text-[10px] font-mono tracking-[0.3em] text-(--z-gold)/60 uppercase">
          Agent {currentStage.num} — {currentStage.agent}
        </span>
        <h2 className="text-2xl sm:text-3xl font-mono font-medium heading-editorial mt-1">
          {currentStage.verb}<span className="text-(--z-muted)">...</span>
        </h2>
      </motion.div>

      {/* Center: Big illustration */}
      <div className="relative w-full max-w-[420px] aspect-square mx-auto mb-6">
        <StageVisualization stageId={currentStageId} progress={progress} />
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-(--z-gold)/15" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-(--z-gold)/15" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-(--z-gold)/15" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-(--z-gold)/15" />
      </div>

      {/* Progress bar + message */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-mono text-(--z-muted)">{message}</span>
          <span className="text-sm font-mono font-bold text-(--z-gold)">{progress}%</span>
        </div>
        <div className="h-0.5 w-full bg-white/[0.04] overflow-hidden">
          <motion.div
            className="h-full bg-(--z-gold)"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Bottom: Step flow with mini illustrations */}
      <div className="w-full">
        <StepFlow currentStageId={currentStageId} />
      </div>
    </div>
  );
}
