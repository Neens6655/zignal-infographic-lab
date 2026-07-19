"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { HERO_SPECIMENS } from "./landing-content";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.15em] px-2.5 py-1 border border-(--z-gold)/20 bg-(--z-gold)/[0.05] text-(--z-cream)/70">
      {children}
    </span>
  );
}

/* The hero's visual star: a real engine output, framed like an instrument
   readout, with provenance chips. Output-first — the proof IS the pitch. */
export function HeroOutputShowcase() {
  const [active, setActive] = useState(0);
  const specimen = HERO_SPECIMENS[active];

  return (
    <motion.figure
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full lg:col-span-7 relative"
    >
      <div className="relative border border-white/[0.08] bg-[#0A0A0D] terminal-shadow overflow-hidden">
        {/* Bezel strip */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex gap-1.5 shrink-0">
              <div className="h-2 w-2 rounded-full bg-(--z-brick)/60" />
              <div className="h-2 w-2 rounded-full bg-(--z-gold)/60" />
              <div className="h-2 w-2 rounded-full bg-(--z-olive)/60" />
            </div>
            <span className="text-[9px] font-mono tracking-[0.2em] text-white/30 uppercase truncate">
              Output — {specimen.title}
            </span>
          </div>
          <span className="text-[9px] font-mono text-(--z-gold)/60 shrink-0">
            2K PNG
          </span>
        </div>

        {/* The output itself */}
        <div className="relative aspect-video">
          {HERO_SPECIMENS.map((s, i) => (
            <Image
              key={s.id}
              src={s.image}
              alt={`AI-generated infographic: ${s.title} — ${s.style} style, produced by the ZGNAL engine from ${s.prompt}`}
              fill
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className={`object-cover transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>

        {/* Specimen switcher */}
        <div className="flex items-center gap-1 border-t border-white/[0.06] bg-white/[0.02] px-3 py-2">
          {HERO_SPECIMENS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              aria-label={`Show ${s.title}`}
              className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.12em] transition-colors border ${
                i === active
                  ? "bg-(--z-gold)/10 text-(--z-gold) border-(--z-gold)/25"
                  : "text-white/40 border-transparent hover:text-white/60 hover:bg-white/[0.03]"
              }`}
            >
              {s.style.split(" ")[0]}
            </button>
          ))}
          <span className="ml-auto hidden sm:inline text-[9px] font-mono text-white/25">
            from {specimen.prompt}
          </span>
        </div>
      </div>

      {/* Provenance chips — the old stat bar, contextualized */}
      <figcaption className="flex gap-2 mt-3 overflow-x-auto z-scroll-x pb-1 lg:flex-wrap lg:overflow-visible">
        <Chip>generated in ~60s</Chip>
        <Chip>research: 22 trusted sources</Chip>
        <Chip>style: {specimen.style}</Chip>
        <Chip>400+ layout×style combos</Chip>
        <Chip>2K+ print resolution</Chip>
      </figcaption>
    </motion.figure>
  );
}
