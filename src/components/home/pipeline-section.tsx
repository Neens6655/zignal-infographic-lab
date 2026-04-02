'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  FileText, Search, Wand2, Brain, Layers3, FileCode, Cpu,
} from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

const PIPELINE = [
  { num: '01', agent: 'Sentinel', name: 'Extract', desc: 'Parse any format — text, URL, PDF, audio', detail: 'Intelligent content parser handles articles, research papers, raw data, URLs, and file uploads. Strips formatting noise while preserving semantic structure.', icon: FileText },
  { num: '02', agent: 'Oracle', name: 'Verify', desc: 'Multi-source research & cross-verification', detail: 'Exa + Perplexity search in parallel. Each claim is triangulated against multiple sources. Credibility score is deterministic — no AI self-grading.', highlight: true, icon: Search },
  { num: '03', agent: 'Scribe', name: 'Simplify', desc: 'Rewrite at 8th-grade reading level', detail: 'NLP rewriting engine distills complex jargon into clear, scannable language. Flesch-Kincaid optimized for maximum comprehension in visual format.', icon: Wand2 },
  { num: '04', agent: 'Strategist', name: 'Analyze', desc: 'Select optimal layout and style combination', detail: 'Content classifier maps topic, density, and hierarchy to the best layout × style pairing from 400+ combinations. Or override with your own selection.', icon: Brain },
  { num: '05', agent: 'Architect', name: 'Structure', desc: 'Organize content into visual hierarchy', detail: 'Builds the information architecture — decides section order, data visualization types, callout placement, and visual flow based on content type.', icon: Layers3 },
  { num: '06', agent: 'Forge', name: 'Prompt', desc: 'Assemble multimodal generation prompt', detail: 'Constructs a precise Gemini 3 Pro prompt combining text, reference images, style tokens, layout grids, and typography rules into a single payload.', icon: FileCode },
  { num: '07', agent: 'Renderer', name: 'Generate', desc: 'Render with Gemini 3 Pro + reference images', detail: 'Final render pass generates a high-resolution infographic in ~60 seconds. Output at print resolution (2K+) with consulting-grade visual quality.', icon: Cpu },
];

export function PipelineSection({ scrollToGenerator }: { scrollToGenerator: () => void }) {
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
            <div className="absolute top-[28px] left-[28px] right-[28px] h-[2px] bg-white/[0.06]" />
            <motion.div
              className="absolute top-[28px] left-[28px] h-[2px] bg-gradient-to-r from-(--z-gold) to-(--z-gold)/60 origin-left"
              style={{ scaleX: lineProgress, width: 'calc(100% - 56px)' }}
            />
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
                      <div className={`relative z-10 h-[14px] w-[14px] mb-6 transition-all duration-500 ${
                        stage.highlight
                          ? 'bg-(--z-gold) shadow-[0_0_20px_rgba(212,168,75,0.5)]'
                          : isActive
                            ? 'bg-(--z-gold)/80 shadow-[0_0_16px_rgba(212,168,75,0.3)] scale-[1.3]'
                            : 'bg-(--z-surface-2) border border-white/10 group-hover:bg-(--z-gold)/40 group-hover:scale-[1.3]'
                      }`} />

                      <div className={`h-10 w-10 flex items-center justify-center mb-4 transition-all duration-300 ${
                        stage.highlight || isActive
                          ? 'bg-(--z-gold)/10 text-(--z-gold)'
                          : 'bg-white/[0.03] text-white/50 group-hover:bg-(--z-gold)/10 group-hover:text-(--z-gold)/70'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className={`text-3xl font-mono font-bold mb-1 transition-colors duration-300 ${
                        stage.highlight ? 'text-(--z-gold)' : isActive ? 'text-(--z-gold)/80' : 'text-white/[0.06] group-hover:text-white/15'
                      }`}>
                        {stage.num}
                      </div>

                      <div className={`text-sm font-mono font-bold mb-0.5 transition-colors duration-300 ${
                        stage.highlight ? 'text-(--z-gold)' : isActive ? 'text-(--z-gold)/80' : 'text-(--z-cream) group-hover:text-(--z-gold)'
                      }`}>
                        {stage.agent}
                      </div>

                      <div className={`text-[9px] font-mono font-medium tracking-[0.15em] uppercase mb-2 transition-colors duration-300 ${
                        stage.highlight ? 'text-(--z-gold)/60' : isActive ? 'text-(--z-gold)/50' : 'text-(--z-muted)/60'
                      }`}>
                        {stage.name}
                      </div>

                      <p className="text-[11px] text-(--z-muted) leading-relaxed">{stage.desc}</p>

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
                      <span className={`text-[10px] font-mono font-bold ${stage.highlight ? 'text-(--z-gold)' : 'text-white/50'}`}>
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
