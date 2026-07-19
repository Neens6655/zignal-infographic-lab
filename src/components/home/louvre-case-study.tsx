"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal-v2";

const BEATS = [
  {
    num: "01",
    label: "Input",
    text: "One Wikipedia URL — no brief, no data prep.",
  },
  {
    num: "02",
    label: "Pipeline",
    text: "Seven agents research the dome engineering across 22 trusted sources and verify every figure.",
  },
  {
    num: "03",
    label: "Output",
    text: "A 2K aerial explainer — 7,850 steel stars, the rain-of-light effect, and the $654M budget, all sourced.",
  },
];

/* Full-bleed case-study scene. The Louvre render was previously buried at
   6% opacity behind the footer — here it IS the section. */
export function LouvreCaseStudy({
  scrollToGenerator,
}: {
  scrollToGenerator: () => void;
}) {
  return (
    <section
      id="case-study"
      className="relative py-20 sm:py-32 bg-[#0B0B0D] overflow-hidden"
    >
      {/* Giant ghost watermark */}
      <p
        aria-hidden="true"
        className="absolute -top-4 left-0 right-0 text-[90px] sm:text-[180px] font-mono font-bold text-white/[0.02] leading-none tracking-tighter select-none whitespace-nowrap overflow-hidden"
      >
        CASE STUDY — LOUVRE
      </p>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Narrative rail */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <ScrollReveal>
              <p className="label-mono text-(--z-gold) mb-4">Case study</p>
              <h2 className="text-3xl sm:text-5xl font-mono font-medium heading-editorial mb-8">
                Louvre Abu Dhabi,
                <br />
                <span className="text-(--z-muted)">decoded in ~60s.</span>
              </h2>
            </ScrollReveal>

            <div className="space-y-7">
              {BEATS.map((beat, i) => (
                <ScrollReveal key={beat.num} delay={0.1 + i * 0.12}>
                  <div
                    className="flex gap-5"
                    style={{ marginLeft: `${i * 12}px` }}
                  >
                    <span className="text-3xl sm:text-4xl font-mono font-bold text-(--z-gold)/25 leading-none shrink-0">
                      {beat.num}
                    </span>
                    <div className="pt-1">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-(--z-gold)/70 mb-1">
                        {beat.label}
                      </p>
                      <p className="text-[13px] text-(--z-cream)/70 leading-relaxed">
                        {beat.text}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.5}>
              <button
                onClick={scrollToGenerator}
                className="mt-10 inline-flex items-center gap-2.5 bg-(--z-gold) px-6 py-3 text-xs font-mono font-semibold text-(--z-bg) hover:bg-(--z-gold-dim) active:scale-[0.97] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
              >
                Decode your own topic
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </ScrollReveal>
          </div>

          {/* The output — star of the scene */}
          <motion.figure
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-8 order-1 lg:order-2"
          >
            <div className="relative border border-white/[0.08] terminal-shadow overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                <span className="text-[9px] font-mono tracking-[0.2em] text-white/30 uppercase">
                  Output — Louvre Abu Dhabi: How It Was Built
                </span>
                <span className="text-[9px] font-mono text-(--z-gold)/60">
                  Aerial Explainer · 16:9
                </span>
              </div>
              <div className="relative aspect-video">
                <Image
                  src="/showcase/louvre-abu-dhabi-aerial.png"
                  alt="AI-generated aerial explainer infographic of the Louvre Abu Dhabi: isometric cutaway of the dome, water channels, and gallery cluster with verified figures"
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            </div>
            <figcaption className="mt-3 text-[10px] font-mono text-(--z-muted)">
              Generated from a single URL. Every figure verified against tier-1
              sources — the provenance certificate lists them all.
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
