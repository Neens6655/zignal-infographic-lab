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

const PRO_PLANNED = [
  "API access",
  "Batch generation",
  "Custom branding",
  "Priority rendering",
];

/* The ONE card grid on the page. Honest by construction: Free is real and
   fully described; Pro/Enterprise show no invented prices — waitlist only. */
export function OfferSection({
  scrollToGenerator,
}: {
  scrollToGenerator: () => void;
}) {
  return (
    <section id="offer" className="py-20 sm:py-32 bg-(--z-bg)">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 sm:mb-16">
          <ScrollReveal>
            <p className="label-mono text-(--z-gold) mb-4">Access</p>
            <h2 className="text-3xl sm:text-5xl font-mono font-medium heading-editorial max-w-2xl">
              Free while in
              <br />
              <span className="text-(--z-muted)">public preview.</span>
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* FREE — the live tier */}
          <ScrollReveal>
            <div className="h-full border-2 border-(--z-gold)/60 bg-(--z-surface) p-6 sm:p-7 flex flex-col terminal-shadow">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm font-mono font-bold text-(--z-gold) uppercase tracking-[0.15em]">
                  Free
                </p>
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-0.5 bg-(--z-gold)/10 text-(--z-gold) border border-(--z-gold)/20">
                  Public preview
                </span>
              </div>
              <p className="text-3xl font-mono font-bold text-(--z-cream) mb-1">
                $0
              </p>
              <p className="text-[11px] font-mono text-(--z-muted) mb-6">
                No credit card. Full pipeline.
              </p>
              <ul className="space-y-2.5 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-[12px] font-mono text-(--z-cream)/75"
                  >
                    <Check className="h-3.5 w-3.5 text-(--z-gold) shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={scrollToGenerator}
                className="mt-auto inline-flex items-center justify-center gap-2 bg-(--z-gold) px-5 py-3 text-xs font-mono font-bold text-(--z-bg) hover:bg-(--z-gold-dim) active:scale-[0.97] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
              >
                Start generating — free
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </ScrollReveal>

          {/* PRO — coming soon, waitlist */}
          <ScrollReveal delay={0.1}>
            <div className="h-full border border-dashed border-white/15 bg-white/[0.015] p-6 sm:p-7 flex flex-col">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm font-mono font-bold text-(--z-cream)/80 uppercase tracking-[0.15em]">
                  Pro
                </p>
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-0.5 text-white/40 border border-white/10">
                  Coming soon
                </span>
              </div>
              <p className="text-[11px] font-mono text-(--z-muted) mb-6 mt-2">
                For teams shipping visuals daily. Pricing announced at launch.
              </p>
              <ul className="space-y-2.5 mb-8">
                {PRO_PLANNED.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-[12px] font-mono text-(--z-cream)/55"
                  >
                    <Check className="h-3.5 w-3.5 text-white/25 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                  Get notified at launch
                </p>
                <WaitlistForm />
              </div>
            </div>
          </ScrollReveal>

          {/* ENTERPRISE — contact */}
          <ScrollReveal delay={0.2}>
            <div className="h-full border border-dashed border-white/15 bg-white/[0.015] p-6 sm:p-7 flex flex-col">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm font-mono font-bold text-(--z-cream)/80 uppercase tracking-[0.15em]">
                  Enterprise
                </p>
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-0.5 text-white/40 border border-white/10">
                  Coming soon
                </span>
              </div>
              <p className="text-[11px] font-mono text-(--z-muted) mb-6 mt-2">
                Custom pipeline, SLA, and white-label output for institutions.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  "Custom research sources",
                  "White-label rendering",
                  "SLA + dedicated support",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-[12px] font-mono text-(--z-cream)/55"
                  >
                    <Check className="h-3.5 w-3.5 text-white/25 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/contact"
                className="mt-auto inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 text-xs font-mono font-semibold text-(--z-cream)/70 hover:bg-white/[0.04] hover:text-(--z-cream) transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
              >
                Get in touch
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
