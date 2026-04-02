'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';
import {
  WireframeBento,
  WireframeIceberg,
  WireframeHubSpoke,
  WireframeTimeline,
  WireframeDashboard,
  WireframeTree,
} from './wireframes';

export function CapabilitiesSection({ scrollToGenerator }: { scrollToGenerator: () => void }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  const boxes = [
    {
      stat: '22',
      unit: 'SOURCES',
      line: 'Multi-source verified with credibility scoring',
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
        <ScrollReveal>
          <p className="label-mono text-(--z-gold) mb-3 sm:mb-4">Capabilities</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-mono font-medium heading-editorial text-(--z-cream) mb-8 sm:mb-12 max-w-2xl">
            Built to generate.
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {boxes.map((box, i) => (
            <motion.div
              key={box.unit}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="group relative bg-(--z-surface) border border-(--border) p-4 sm:p-5 overflow-hidden hover:border-(--z-gold)/25 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-(--z-gold)/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                <div className="h-1.5 w-1.5 bg-(--z-gold)/40 group-hover:bg-(--z-gold)/70 transition-colors">
                  <div className="absolute inset-0 bg-(--z-gold)/30 animate-ping" style={{ animationDuration: `${2 + i * 0.5}s` }} />
                </div>
              </div>
              <div className="relative">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-(--z-gold) heading-editorial leading-none">
                  {box.stat}
                </p>
                <p className="text-[8px] sm:text-[9px] font-mono font-medium tracking-[0.2em] text-(--z-gold)/50 mt-1">
                  {box.unit}
                </p>
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono text-(--z-muted) leading-snug mt-2 sm:mt-3">
                {box.line}
              </p>
              <div className="relative">
                {box.visual}
              </div>
            </motion.div>
          ))}
        </div>

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
