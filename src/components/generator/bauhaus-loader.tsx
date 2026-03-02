'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';

/* ═══════════════════════════════════════════════════════════════
   BAUHAUS LOADER
   A generative Neo-Bauhaus composition that assembles from chaos.
   Seeded by the user's prompt text so each generation looks unique.
   ═══════════════════════════════════════════════════════════════ */

const PALETTE = [
  '#D4A84B', // gold
  '#5B8DEF', // blue
  '#C04B3C', // brick
  '#8BC34A', // olive
  '#E8E5E0', // cream
  '#A78BFA', // violet
];

type Shape = {
  type: 'circle' | 'rect' | 'triangle' | 'line' | 'arc';
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  delay: number;
  startX: number;
  startY: number;
};

/** Simple hash → [0,1] from a string */
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (h * 16807 + 0) % 2147483647;
    return (h & 0x7fffffff) / 2147483647;
  };
}

function generateShapes(prompt: string): Shape[] {
  const rng = seededRandom(prompt + prompt.length);
  const count = 12 + Math.floor(rng() * 6); // 12-17 shapes
  const shapes: Shape[] = [];

  for (let i = 0; i < count; i++) {
    const types: Shape['type'][] = ['circle', 'rect', 'triangle', 'line', 'arc'];
    const type = types[Math.floor(rng() * types.length)];
    shapes.push({
      type,
      x: rng() * 300 - 150,
      y: rng() * 300 - 150,
      size: 16 + rng() * 48,
      rotation: Math.floor(rng() * 12) * 30, // Bauhaus: grid-snapped angles
      color: PALETTE[Math.floor(rng() * PALETTE.length)],
      delay: 0.1 + i * 0.12,
      startX: (rng() - 0.5) * 400,
      startY: (rng() - 0.5) * 400,
    });
  }
  return shapes;
}

function ShapeSVG({ shape }: { shape: Shape }) {
  const { type, size, color } = shape;

  switch (type) {
    case 'circle':
      return <circle cx="0" cy="0" r={size / 2} fill="none" stroke={color} strokeWidth="2" opacity="0.7" />;
    case 'rect':
      return <rect x={-size / 2} y={-size / 2} width={size} height={size} fill="none" stroke={color} strokeWidth="2" opacity="0.7" />;
    case 'triangle': {
      const h = size * 0.866;
      return (
        <polygon
          points={`0,${-h / 2} ${-size / 2},${h / 2} ${size / 2},${h / 2}`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.7"
        />
      );
    }
    case 'line':
      return <line x1={-size / 2} y1="0" x2={size / 2} y2="0" stroke={color} strokeWidth="2" opacity="0.5" />;
    case 'arc':
      return (
        <path
          d={`M ${-size / 2} 0 A ${size / 2} ${size / 2} 0 0 1 ${size / 2} 0`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.6"
        />
      );
    default:
      return null;
  }
}

type Props = {
  prompt: string;
  progress: number;
};

export function BauhausLoader({ prompt, progress }: Props) {
  const shapes = useMemo(() => generateShapes(prompt), [prompt]);

  // Central rotating ring grows with progress
  const ringRadius = 60 + (progress / 100) * 30;

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* The generative composition */}
      <div className="relative w-[400px] h-[400px] sm:w-[500px] sm:h-[500px]">
        <svg
          viewBox="-200 -200 400 400"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Slow-rotating outer ring */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          >
            <circle
              cx="0"
              cy="0"
              r={ringRadius}
              fill="none"
              stroke="rgba(212, 168, 75, 0.15)"
              strokeWidth="1"
              strokeDasharray="8 6"
            />
          </motion.g>

          {/* Progress ring — fills as generation progresses */}
          <motion.circle
            cx="0"
            cy="0"
            r={ringRadius - 8}
            fill="none"
            stroke="rgba(212, 168, 75, 0.4)"
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * (ringRadius - 8)}`}
            strokeDashoffset={2 * Math.PI * (ringRadius - 8) * (1 - progress / 100)}
            transform="rotate(-90)"
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />

          {/* Shapes assemble from chaos into composition */}
          {shapes.map((shape, i) => (
            <motion.g
              key={i}
              initial={{
                x: shape.startX,
                y: shape.startY,
                opacity: 0,
                scale: 0,
                rotate: shape.rotation + 180,
              }}
              animate={{
                x: shape.x,
                y: shape.y,
                opacity: 1,
                scale: 1,
                rotate: shape.rotation,
              }}
              transition={{
                delay: shape.delay,
                duration: 1.2,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <ShapeSVG shape={shape} />
            </motion.g>
          ))}

          {/* Central pulsing dot */}
          <motion.circle
            cx="0"
            cy="0"
            r="4"
            fill="#D4A84B"
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Crosshair lines */}
          <line x1="-12" y1="0" x2="12" y2="0" stroke="rgba(212, 168, 75, 0.3)" strokeWidth="1" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke="rgba(212, 168, 75, 0.3)" strokeWidth="1" />
        </svg>

        {/* Corner brackets — Bauhaus framing */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-(--z-gold)/20" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-(--z-gold)/20" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-(--z-gold)/20" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-(--z-gold)/20" />
      </div>
    </div>
  );
}
