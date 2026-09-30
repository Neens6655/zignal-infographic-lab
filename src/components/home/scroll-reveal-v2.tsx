"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * Reveal-on-scroll that DEFAULTS TO VISIBLE.
 *
 * Two defects fixed here, both of which had shipped:
 *
 * 1. NO REDUCED-MOTION GUARD. Every animation in this estate must be gated on
 *    prefers-reduced-motion, zero exceptions; this one was not.
 *
 * 2. `initial={{ opacity: 0 }}` WITH JS AS THE ONLY PATH BACK. The server rendered
 *    the content invisible and relied on an IntersectionObserver to bring it back.
 *    When that did not fire — a hydration failure, a slow observer, an automated
 *    screenshot that captures before the callback — the section stayed blank, and
 *    every static check still passed because the markup was all present. That is
 *    exactly how a 40%-tall band of the homepage rendered as empty space.
 *
 * So the hidden state is only ever entered AFTER mount, on the client, when motion
 * is allowed. Server HTML is visible HTML. The worst case is now "the animation did
 * not play", never "the content is not there".
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

  // False during SSR and the first client paint, so the content is never hidden
  // by markup the server produced.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    setArmed(true);
  }, []);

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  const hidden = armed && !isInView;

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? 30 : 0 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
