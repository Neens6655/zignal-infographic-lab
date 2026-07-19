"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/* Conversion spine: slim buy-bar that appears only AFTER the visitor has
   scrolled past the value story (#gallery) and hides while the offer block
   (#offer) is on screen. IntersectionObserver only — zero scroll listeners,
   SSR-safe (initial false), unmounts automatically outside the idle phase. */
export function StickyCta({
  scrollToGenerator,
}: {
  scrollToGenerator: () => void;
}) {
  const [pastGallery, setPastGallery] = useState(false);
  const [offerVisible, setOfferVisible] = useState(false);

  useEffect(() => {
    // Trigger: past the hero (value promise + specimen seen). This bar carries a
    // free action, not a price — no anchoring risk in appearing this early.
    const hero = document.getElementById("hero");
    const offer = document.getElementById("offer");
    if (!hero) return;

    const galleryIO = new IntersectionObserver(([entry]) => {
      setPastGallery(
        !entry.isIntersecting && entry.boundingClientRect.bottom < 0,
      );
    });
    galleryIO.observe(hero);

    let offerIO: IntersectionObserver | undefined;
    if (offer) {
      offerIO = new IntersectionObserver(
        ([entry]) => setOfferVisible(entry.isIntersecting),
        { rootMargin: "0px 0px -15% 0px" },
      );
      offerIO.observe(offer);
    }

    return () => {
      galleryIO.disconnect();
      offerIO?.disconnect();
    };
  }, []);

  const show = pastGallery && !offerVisible;

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          aria-label="Start generating"
          initial={{ y: 64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 64, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed bottom-0 inset-x-0 z-40 border-t border-(--z-gold)/20 bg-[#0A0A0B]/90 backdrop-blur-xl"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between gap-3 md:pr-24">
            <p className="text-[10px] sm:text-[11px] font-mono text-(--z-cream)/60 truncate">
              Free during public preview — no credit card
            </p>
            <button
              onClick={scrollToGenerator}
              className="shrink-0 bg-(--z-gold) px-4 py-1.5 text-[10px] sm:text-[11px] font-mono font-bold text-(--z-bg) hover:bg-(--z-gold-dim) active:scale-[0.97] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
            >
              Generate an infographic
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
