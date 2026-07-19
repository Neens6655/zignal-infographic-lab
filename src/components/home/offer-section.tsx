"use client";

import { Check, ArrowRight } from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";
import { ScrollReveal } from "./scroll-reveal-v2";

const FREE_FEATURES = [
  "Full seven-stage pipeline",
  "20 layouts × 20 styles",
  "22 trusted research sources",
  "PNG · JPEG · PDF · PPTX export",
  "Provenance certificates",
  "No watermarks",
];

/* The ONE offer card on the page — Free is the only actionable tier, so it is
   the only card (Hick's law: non-purchasable tiers siphon the primary action).
   Pro/Enterprise collapse to a slim waitlist strip. No invented prices. */
export function OfferSection({
  scrollToGenerator,
}: {
  scrollToGenerator: () => void;
}) {
  return (
    <section id="offer" className="py-20 sm:py-32 bg-(--z-bg)">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 sm:mb-14 text-center">
          <ScrollReveal>
            <p className="label-mono text-(--z-gold) mb-4">Access</p>
            <h2 className="text-3xl sm:text-5xl font-mono font-medium heading-editorial">
              Free while in
              <br />
              <span className="text-(--z-muted)">public preview.</span>
            </h2>
          </ScrollReveal>
        </div>

        {/* FREE — the sole offer card */}
        <ScrollReveal>
          <div className="border-2 border-(--z-gold)/60 bg-(--z-surface) p-7 sm:p-9 terminal-shadow">
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-sm font-mono font-bold text-(--z-gold) uppercase tracking-[0.15em]">
                Free
              </p>
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-0.5 bg-(--z-gold)/10 text-(--z-gold) border border-(--z-gold)/20">
                Public preview
              </span>
            </div>
            <p className="text-4xl font-mono font-bold text-(--z-cream) mb-1">
              $0
            </p>
            <p className="text-[11px] font-mono text-(--z-muted) mb-7">
              No credit card. Full pipeline. Everything you generate is yours to
              keep.
            </p>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
              {FREE_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-[12px] font-mono text-(--z-cream)/80"
                >
                  <Check className="h-3.5 w-3.5 text-(--z-gold) shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={scrollToGenerator}
              className="w-full inline-flex items-center justify-center gap-2 bg-(--z-gold) px-5 py-3.5 text-xs font-mono font-bold text-(--z-bg) hover:bg-(--z-gold-dim) active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
            >
              Start generating — free
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </ScrollReveal>

        {/* Pro / Enterprise — slim, honest, non-competing */}
        <ScrollReveal delay={0.12}>
          <div className="mt-5 border border-dashed border-white/15 bg-white/[0.015] px-6 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div className="mb-3 sm:mb-0">
              <p className="text-[11px] font-mono font-bold text-(--z-cream)/80 uppercase tracking-[0.15em]">
                Pro &amp; Enterprise — coming soon
              </p>
              <p className="text-[10px] font-mono text-(--z-muted) mt-1">
                API access, batch generation, custom branding.{" "}
                <a
                  href="/contact"
                  className="text-(--z-gold)/70 hover:text-(--z-gold) underline underline-offset-2 transition-colors"
                >
                  Enterprise inquiry
                </a>
              </p>
            </div>
            <div className="sm:w-[320px] shrink-0">
              <WaitlistForm />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
