"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * Reveal-on-scroll that never makes text unreadable — at any instant.
 *
 * Three defects, in the order they were found:
 *
 * 1. NO REDUCED-MOTION GUARD. Every animation in this estate must be gated on
 *    prefers-reduced-motion, zero exceptions; this one was not.
 *
 * 2. AN OPACITY-ZERO INITIAL WITH JS AS THE ONLY PATH BACK. The server rendered
 *    the content invisible and relied on an IntersectionObserver to bring it back.
 *    When that did not fire the section stayed blank while every static check passed,
 *    because the markup was all present — that is how a band roughly 40% of the
 *    homepage height rendered as empty space.
 *
 * 3. ANIMATING OPACITY AT ALL FAILS CONTRAST MID-TWEEN. Fixing (2) was not enough.
 *    While a block is fading from 0 to 1 its text genuinely is below AA, and axe
 *    caught it: `text-white/50` measured 3.04:1 instead of 5.0:1 because an ancestor
 *    was passing through 0.6 at the moment of capture. Waiting for animations to
 *    settle before measuring made the number look good and changed nothing for a
 *    reader — the low-contrast moment was still on screen.
 *
 * So the reveal is now TRANSFORM-ONLY. Content is opaque from first paint to last;
 * it simply slides a short distance into place. Nothing to fade, nothing to catch
 * halfway, nothing that can hide a section if the observer never fires.
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={{ y: isInView ? 0 : 18 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
