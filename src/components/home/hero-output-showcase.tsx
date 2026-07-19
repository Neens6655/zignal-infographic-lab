"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { HERO_SPECIMENS } from "./landing-content";

/* The hero's star: a real engine output presented as an elevated artifact —
   gold aura, layered depth shadow, slight perspective tilt that straightens
   on hover. Provenance lives in the frame's own footer (one line), not in
   floating chip rows. */
export function HeroOutputShowcase() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const specimen = HERO_SPECIMENS[active];

  return (
    <motion.figure
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative w-full"
    >
      {/* Gold aura — the artifact's light source */}
      <div
        aria-hidden="true"
        className="absolute -inset-10 sm:-inset-16 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 55% 45%, rgba(212,168,75,0.16), rgba(212,168,75,0.05) 45%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />

      <div
        className="group relative border border-(--z-gold)/25 bg-[#0A0A0D] overflow-hidden transition-transform duration-700 ease-out will-change-transform"
        style={
          reduce
            ? {
                boxShadow:
                  "0 24px 80px rgba(0,0,0,0.6), 0 0 90px rgba(212,168,75,0.12), 6px 6px 0 rgba(212,168,75,0.18)",
              }
            : {
                transform: "perspective(1400px) rotateX(3deg) rotateY(-2deg)",
                boxShadow:
                  "0 24px 80px rgba(0,0,0,0.6), 0 0 90px rgba(212,168,75,0.12), 6px 6px 0 rgba(212,168,75,0.18)",
              }
        }
        onMouseEnter={(e) => {
          if (!reduce)
            e.currentTarget.style.transform =
              "perspective(1400px) rotateX(0deg) rotateY(0deg)";
        }}
        onMouseLeave={(e) => {
          if (!reduce)
            e.currentTarget.style.transform =
              "perspective(1400px) rotateX(3deg) rotateY(-2deg)";
        }}
      >
        {/* Bezel strip */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex gap-1.5 shrink-0">
              <div className="h-2 w-2 rounded-full bg-(--z-brick)/60" />
              <div className="h-2 w-2 rounded-full bg-(--z-gold)/60" />
              <div className="h-2 w-2 rounded-full bg-(--z-olive)/60" />
            </div>
            <span className="text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase truncate">
              Output — {specimen.title}
            </span>
          </div>
          <span className="text-[9px] font-mono text-(--z-gold)/70 shrink-0">
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
              sizes="(max-width: 1024px) 100vw, 62vw"
              className={`object-cover transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>

        {/* Frame footer — provenance line left, specimen tabs right. ONE row. */}
        <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] bg-white/[0.02] pl-4 pr-1">
          <p className="hidden sm:block text-[9px] font-mono uppercase tracking-[0.14em] text-(--z-cream)/60 truncate py-2.5">
            ~60s <span className="text-(--z-gold)/50">·</span> 22 trusted
            sources <span className="text-(--z-gold)/50">·</span>{" "}
            {specimen.style} <span className="text-(--z-gold)/50">·</span> from{" "}
            {specimen.prompt}
          </p>
          <div
            role="group"
            aria-label="Switch example output"
            className="flex items-center shrink-0"
          >
            <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-white/45 mr-2">
              View
            </span>
            {HERO_SPECIMENS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                aria-label={`Show ${s.title}`}
                className={`px-3 py-2.5 text-[9px] font-mono uppercase tracking-[0.12em] transition-all border-b-2 cursor-pointer ${
                  i === active
                    ? "border-b-(--z-gold) bg-(--z-gold)/[0.07] text-(--z-gold)"
                    : "border-b-transparent text-white/45 hover:text-(--z-gold)/80 hover:bg-white/[0.04] hover:border-b-(--z-gold)/30"
                }`}
              >
                {s.style.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.figure>
  );
}
