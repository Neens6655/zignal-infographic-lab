"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useInView,
} from "motion/react";

/* ─── Constants ─── */

const FREE_FEATURES = [
  "Full seven-stage pipeline",
  "20 layouts + 20 styles",
  "22 trusted research sources",
  "PNG, JPEG, PDF, PPTX export",
  "Provenance certificates",
  "No watermarks",
] as const;

const PRO_FEATURES = [
  "Everything in Free",
  "Higher generation limits",
  "API access",
  "Batch processing",
  "Custom branding",
  "Priority rendering",
] as const;

const ENTERPRISE_FEATURES = [
  "Everything in Pro",
  "Dedicated pipeline",
  "SLA guarantee",
  "White-label output",
  "Custom styles & layouts",
  "SSO & team management",
] as const;

const FAQS = [
  {
    q: "What happens after the preview?",
    a: "When we launch paid plans, early preview users will be grandfathered into discounted pricing. You will never lose access to what you have today.",
  },
  {
    q: "Can I use generated infographics commercially?",
    a: "Yes. Every infographic you generate is yours. Use them in presentations, reports, social media, client deliverables — no attribution required.",
  },
  {
    q: "What formats can I export?",
    a: "PNG (high-res), JPEG (compressed), PDF (print-ready), and PPTX (editable in PowerPoint/Keynote). All exports include provenance metadata.",
  },
  {
    q: "Is my content stored?",
    a: "Your input content is processed in-memory and discarded after generation. Generated images are cached temporarily for download, then purged. We do not train on your data.",
  },
] as const;

const COMPARISON_ROWS = [
  { label: "Monthly generations", free: "50", pro: "500", enterprise: "Unlimited" },
  { label: "Styles & layouts", free: "20 + 20", pro: "40 + 40", enterprise: "Custom" },
  { label: "Export formats", free: "PNG, JPEG, PDF, PPTX", pro: "All + SVG", enterprise: "All + API" },
  { label: "API access", free: false, pro: true, enterprise: true },
  { label: "Custom branding", free: false, pro: true, enterprise: true },
  { label: "Priority rendering", free: false, pro: true, enterprise: true },
  { label: "SLA guarantee", free: false, pro: false, enterprise: true },
  { label: "Dedicated support", free: false, pro: false, enterprise: true },
] as const;

/* ─── Palette ─── */

const GOLD = "#D4A84B";
const BLUE = "#5B8DEF";
const PURPLE = "#9B7FD4";
const CHARCOAL = "#0A0A0B";
const CREAM = "#E8E5E0";

/* ─── Animation variants ─── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

/* ─── Geometric Header SVGs ─── */

function GoldGeometry() {
  return (
    <svg viewBox="0 0 320 80" className="w-full h-20" aria-hidden="true">
      <rect x="20" y="10" width="50" height="50" fill={GOLD} opacity="0.15" />
      <rect x="55" y="25" width="35" height="35" fill={GOLD} opacity="0.25" />
      <circle cx="140" cy="40" r="28" fill="none" stroke={GOLD} strokeWidth="2" opacity="0.3" />
      <circle cx="155" cy="35" r="16" fill={GOLD} opacity="0.12" />
      <rect x="200" y="15" width="60" height="4" fill={GOLD} opacity="0.35" />
      <rect x="210" y="28" width="40" height="4" fill={GOLD} opacity="0.2" />
      <rect x="220" y="41" width="25" height="4" fill={GOLD} opacity="0.15" />
      <rect x="270" y="8" width="30" height="64" fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.2" />
      <line x1="275" y1="8" x2="295" y2="72" stroke={GOLD} strokeWidth="1" opacity="0.15" />
    </svg>
  );
}

function BlueGeometry() {
  return (
    <svg viewBox="0 0 320 80" className="w-full h-20" aria-hidden="true">
      <circle cx="45" cy="40" r="30" fill="none" stroke={BLUE} strokeWidth="2" opacity="0.25" strokeDasharray="4 4" />
      <circle cx="45" cy="40" r="15" fill={BLUE} opacity="0.1" />
      <rect x="100" y="12" width="55" height="55" fill="none" stroke={BLUE} strokeWidth="1.5" opacity="0.2" transform="rotate(15 127 40)" />
      <rect x="115" y="22" width="30" height="30" fill={BLUE} opacity="0.1" transform="rotate(15 130 37)" />
      <line x1="190" y1="10" x2="190" y2="70" stroke={BLUE} strokeWidth="1.5" opacity="0.2" />
      <line x1="200" y1="20" x2="200" y2="60" stroke={BLUE} strokeWidth="1.5" opacity="0.15" />
      <line x1="210" y1="30" x2="210" y2="50" stroke={BLUE} strokeWidth="1.5" opacity="0.1" />
      <circle cx="270" cy="25" r="20" fill={BLUE} opacity="0.08" />
      <circle cx="285" cy="55" r="14" fill="none" stroke={BLUE} strokeWidth="1.5" opacity="0.2" />
    </svg>
  );
}

function PurpleGeometry() {
  return (
    <svg viewBox="0 0 320 80" className="w-full h-20" aria-hidden="true">
      <polygon points="40,10 70,60 10,60" fill="none" stroke={PURPLE} strokeWidth="1.5" opacity="0.25" />
      <polygon points="50,20 68,52 32,52" fill={PURPLE} opacity="0.1" />
      <rect x="100" y="15" width="45" height="45" fill={PURPLE} opacity="0.08" />
      <rect x="110" y="25" width="25" height="25" fill="none" stroke={PURPLE} strokeWidth="1.5" opacity="0.25" />
      <circle cx="200" cy="40" r="25" fill="none" stroke={PURPLE} strokeWidth="1" opacity="0.15" strokeDasharray="2 6" />
      <circle cx="200" cy="40" r="10" fill={PURPLE} opacity="0.12" />
      <line x1="250" y1="15" x2="300" y2="15" stroke={PURPLE} strokeWidth="2" opacity="0.2" />
      <line x1="260" y1="30" x2="300" y2="30" stroke={PURPLE} strokeWidth="2" opacity="0.15" />
      <line x1="270" y1="45" x2="300" y2="45" stroke={PURPLE} strokeWidth="2" opacity="0.1" />
      <line x1="280" y1="60" x2="300" y2="60" stroke={PURPLE} strokeWidth="2" opacity="0.08" />
    </svg>
  );
}

/* ─── Floating geometric shapes for hero ─── */

function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div
        className="absolute w-16 h-16 border-2 opacity-[0.06]"
        style={{ borderColor: GOLD, top: "12%", left: "8%" }}
        animate={{ y: [0, -20, 0], rotate: [0, 45, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-6 h-6 opacity-[0.08]"
        style={{ backgroundColor: GOLD, top: "25%", right: "12%" }}
        animate={{ y: [0, 15, 0], x: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-10 h-10 border-2 opacity-[0.05]"
        style={{ borderColor: BLUE, bottom: "30%", left: "15%", borderRadius: "50%" }}
        animate={{ y: [0, -12, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-4 h-4 opacity-[0.07]"
        style={{ backgroundColor: PURPLE, top: "18%", right: "30%", borderRadius: "50%" }}
        animate={{ y: [0, 10, 0], x: [0, 5, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ─── Animated counter ─── */

function AnimatedCounter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const duration = 2000;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
    </span>
  );
}

/* ─── Scrolling thumbnail strip ─── */

const THUMBNAIL_COLORS = [
  GOLD, BLUE, PURPLE, "#E85D75", "#4ECDC4", "#F4A261",
  GOLD, BLUE, PURPLE, "#E85D75", "#4ECDC4", "#F4A261",
  GOLD, BLUE, PURPLE, "#E85D75", "#4ECDC4", "#F4A261",
];

function ScrollingThumbnails() {
  return (
    <div className="relative w-full overflow-hidden mt-6" style={{ height: 72 }}>
      {/* Fade masks */}
      <div
        className="absolute left-0 top-0 bottom-0 w-20 z-10"
        style={{ background: `linear-gradient(to right, ${CHARCOAL}, transparent)` }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-20 z-10"
        style={{ background: `linear-gradient(to left, ${CHARCOAL}, transparent)` }}
      />
      <div className="flex gap-3 animate-scroll-strip">
        {THUMBNAIL_COLORS.map((color, i) => (
          <div
            key={i}
            className="shrink-0"
            style={{
              width: 40,
              height: 60,
              backgroundColor: color,
              opacity: 0.2,
              border: `1px solid ${color}`,
            }}
          />
        ))}
        {/* Duplicate for seamless loop */}
        {THUMBNAIL_COLORS.map((color, i) => (
          <div
            key={`dup-${i}`}
            className="shrink-0"
            style={{
              width: 40,
              height: 60,
              backgroundColor: color,
              opacity: 0.2,
              border: `1px solid ${color}`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes scroll-strip {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-strip {
          animation: scroll-strip 20s linear infinite;
          width: max-content;
        }
      `}</style>
    </div>
  );
}

/* ─── FAQ item ─── */

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border-b"
      style={{
        borderImage: `linear-gradient(to right, ${GOLD}33, transparent) 1`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left group cursor-pointer"
      >
        <span
          className="text-sm font-sans font-medium pr-8 transition-colors"
          style={{ color: CREAM }}
        >
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-lg font-mono shrink-0"
          style={{ color: GOLD }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            className="overflow-hidden"
          >
            <p className="text-sm text-white/50 font-sans leading-relaxed pb-6">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Section wrapper with inView ─── */

function Section({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Pricing Card ─── */

function PricingCard({
  title,
  priceLabel,
  description,
  features,
  accentColor,
  geometry,
  badge,
  ctaLabel,
  ctaHref,
  ctaActive,
  dimmed,
}: {
  title: string;
  priceLabel: string;
  description: string;
  features: readonly string[];
  accentColor: string;
  geometry: React.ReactNode;
  badge: string;
  ctaLabel: string;
  ctaHref?: string;
  ctaActive?: boolean;
  dimmed?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group"
    >
      {/* Glow on hover */}
      <motion.div
        className="absolute -inset-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          boxShadow: `0 0 40px ${accentColor}22, inset 0 0 40px ${accentColor}08`,
        }}
      />

      <div
        className="relative border-2 transition-colors duration-300"
        style={{
          borderColor: dimmed ? "rgba(255,255,255,0.08)" : accentColor,
          borderStyle: dimmed ? "dashed" : "solid",
          backgroundColor: `${accentColor}08`,
        }}
      >
        {/* Badge */}
        <div className="absolute -top-3 left-6 z-10">
          <span
            className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase px-3 py-1"
            style={{
              color: ctaActive ? CHARCOAL : "rgba(255,255,255,0.3)",
              backgroundColor: ctaActive ? accentColor : CHARCOAL,
              border: ctaActive ? "none" : "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {badge}
          </span>
        </div>

        {/* Geometric header illustration */}
        <div
          className="pt-6"
          style={{ opacity: dimmed ? 0.4 : 1 }}
        >
          {geometry}
        </div>

        {/* Content */}
        <div
          className="px-8 pb-8"
          style={{ opacity: dimmed ? 0.5 : 1 }}
        >
          <h2
            className="text-3xl font-mono font-bold mb-1"
            style={{ color: dimmed ? `${CREAM}99` : CREAM }}
          >
            {title}
          </h2>
          <p className="text-xs font-mono mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            {priceLabel}
          </p>
          <p
            className="text-[10px] font-mono mb-6"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            {description}
          </p>

          <ul className="space-y-3 mb-8">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm font-mono"
                style={{ color: dimmed ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)" }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 mt-1.5"
                  style={{ backgroundColor: dimmed ? "rgba(255,255,255,0.2)" : accentColor }}
                />
                {feature}
              </li>
            ))}
          </ul>

          {ctaActive && ctaHref ? (
            <Link href={ctaHref}>
              <motion.div
                className="relative block w-full text-center px-6 py-3.5 text-sm font-mono font-semibold cursor-pointer overflow-hidden"
                style={{ backgroundColor: accentColor, color: CHARCOAL }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ backgroundColor: accentColor }}
                  animate={{
                    boxShadow: [
                      `0 0 0px ${accentColor}00`,
                      `0 0 30px ${accentColor}4D`,
                      `0 0 0px ${accentColor}00`,
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="relative z-10">{ctaLabel}</span>
              </motion.div>
            </Link>
          ) : (
            <div
              className="w-full text-center border-2 border-dashed px-6 py-3.5 text-sm font-mono font-semibold cursor-default"
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              {ctaLabel}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Checkmark / Dash for comparison table ─── */

function ComparisonCell({ value }: { value: string | boolean }) {
  if (typeof value === "string") {
    return (
      <span className="text-xs font-mono" style={{ color: `${CREAM}99` }}>
        {value}
      </span>
    );
  }
  if (value) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-label="Included">
        <path
          d="M3 8.5L6.5 12L13 4"
          fill="none"
          stroke={GOLD}
          strokeWidth="2"
          strokeLinecap="square"
        />
      </svg>
    );
  }
  return (
    <span className="text-white/20 font-mono text-sm">&mdash;</span>
  );
}

/* ─── Dot grid background ─── */

function DotGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.04]"
      aria-hidden="true"
      style={{
        backgroundImage: `radial-gradient(circle, ${CREAM} 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    />
  );
}

/* ─── Main Page ─── */

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: CHARCOAL }}>

      {/* ══════════════════ HERO ══════════════════ */}
      <div className="relative overflow-hidden">
        {/* Animated gradient mesh background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 40%, ${GOLD}15 0%, transparent 70%),
              radial-gradient(ellipse 60% 80% at 80% 30%, ${BLUE}10 0%, transparent 70%),
              radial-gradient(ellipse 70% 50% at 50% 80%, ${PURPLE}08 0%, transparent 70%)
            `,
          }}
        />
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              `conic-gradient(from 0deg at 30% 50%, ${GOLD}08, transparent 120deg, ${BLUE}06, transparent 240deg, ${PURPLE}04, transparent)`,
              `conic-gradient(from 120deg at 50% 40%, ${GOLD}08, transparent 120deg, ${BLUE}06, transparent 240deg, ${PURPLE}04, transparent)`,
              `conic-gradient(from 240deg at 40% 60%, ${GOLD}08, transparent 120deg, ${BLUE}06, transparent 240deg, ${PURPLE}04, transparent)`,
              `conic-gradient(from 360deg at 30% 50%, ${GOLD}08, transparent 120deg, ${BLUE}06, transparent 240deg, ${PURPLE}04, transparent)`,
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        <FloatingShapes />

        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <Section className="text-center">
            <motion.p
              variants={fadeUp}
              className="text-[10px] font-mono font-semibold tracking-[0.3em] uppercase mb-6"
              style={{ color: GOLD }}
            >
              Pricing
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl md:text-7xl font-mono font-bold leading-[1.05] mb-2"
              style={{ color: CREAM }}
            >
              Start free.
            </motion.h1>
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl md:text-7xl font-mono font-bold leading-[1.05] mb-8"
              style={{ color: GOLD }}
            >
              Scale when ready.
            </motion.h1>

            {/* Animated gold line */}
            <motion.div
              className="mx-auto mb-8"
              style={{ height: 2, backgroundColor: GOLD, originX: 0 }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            />

            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg font-sans max-w-xl mx-auto leading-relaxed"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              The full pipeline is available at no cost during our public preview.
              No credit card. No strings.
            </motion.p>
          </Section>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6">

        {/* ══════════════════ PRICING CARDS ══════════════════ */}
        <Section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32" delay={0.1}>
          <PricingCard
            title="Free"
            priceLabel="$0 / forever during preview"
            description="For individuals & exploration"
            features={FREE_FEATURES}
            accentColor={GOLD}
            geometry={<GoldGeometry />}
            badge="Public Preview"
            ctaLabel="Start generating — free"
            ctaHref="/"
            ctaActive
          />
          <PricingCard
            title="Pro"
            priceLabel="$---/mo"
            description="For teams & power users"
            features={PRO_FEATURES}
            accentColor={BLUE}
            geometry={<BlueGeometry />}
            badge="Coming Soon"
            ctaLabel="Notify me"
            dimmed
          />
          <PricingCard
            title="Enterprise"
            priceLabel="Contact us"
            description="For organizations & agencies"
            features={ENTERPRISE_FEATURES}
            accentColor={PURPLE}
            geometry={<PurpleGeometry />}
            badge="Coming Soon"
            ctaLabel="Get in touch"
            dimmed
          />
        </Section>

        {/* ══════════════════ SOCIAL PROOF ══════════════════ */}
        <Section className="text-center mb-32">
          <motion.div variants={fadeUp}>
            <p
              className="text-4xl sm:text-5xl font-mono font-bold mb-2"
              style={{ color: CREAM }}
            >
              <AnimatedCounter target={2847} />+
            </p>
            <p
              className="text-[11px] font-mono tracking-[0.2em] uppercase mb-1"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              infographics generated during preview
            </p>
            <ScrollingThumbnails />
          </motion.div>
        </Section>

        {/* ══════════════════ FEATURE COMPARISON ══════════════════ */}
        <Section className="relative mb-32">
          <DotGrid />
          <motion.div variants={fadeUp} className="relative z-10">
            <p
              className="text-[10px] font-mono font-semibold tracking-[0.3em] uppercase mb-3"
              style={{ color: GOLD }}
            >
              Compare Plans
            </p>
            <h2
              className="text-2xl sm:text-3xl font-mono font-bold mb-10"
              style={{ color: CREAM }}
            >
              Everything you get
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} className="relative z-10 overflow-x-auto">
            <table className="w-full text-left" style={{ minWidth: 600 }}>
              <thead>
                <tr className="border-b-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <th className="pb-4 pr-8 text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Feature
                  </th>
                  <th className="pb-4 px-4 text-xs font-mono font-semibold uppercase tracking-wider text-center" style={{ color: GOLD }}>
                    Free
                  </th>
                  <th className="pb-4 px-4 text-xs font-mono font-semibold uppercase tracking-wider text-center" style={{ color: BLUE }}>
                    Pro
                  </th>
                  <th className="pb-4 px-4 text-xs font-mono font-semibold uppercase tracking-wider text-center" style={{ color: PURPLE }}>
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b"
                    style={{ borderColor: "rgba(255,255,255,0.04)" }}
                  >
                    <td className="py-4 pr-8 text-sm font-mono" style={{ color: `${CREAM}AA` }}>
                      {row.label}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <ComparisonCell value={row.free} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <ComparisonCell value={row.pro} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <ComparisonCell value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </Section>

        {/* ══════════════════ FAQ ══════════════════ */}
        <Section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            {/* Left — sticky headline */}
            <div className="md:col-span-4">
              <div className="md:sticky md:top-32">
                <motion.p
                  variants={fadeUp}
                  className="text-[10px] font-mono font-semibold tracking-[0.3em] uppercase mb-3"
                  style={{ color: GOLD }}
                >
                  FAQ
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl sm:text-3xl font-mono font-bold"
                  style={{ color: CREAM }}
                >
                  Common
                  <br />
                  questions
                </motion.h2>
              </div>
            </div>

            {/* Right — FAQ items */}
            <div className="md:col-span-8">
              {FAQS.map((faq) => (
                <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </Section>

        {/* ══════════════════ BOTTOM CTA ══════════════════ */}
        <Section className="relative mb-20">
          <div
            className="relative border-2 px-8 py-16 sm:py-20 text-center overflow-hidden"
            style={{ borderColor: `${GOLD}33` }}
          >
            {/* Gold tinted background */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${GOLD}, transparent)`,
              }}
            />

            {/* Flanking geometric decorations */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden sm:block" aria-hidden="true">
              <svg width="40" height="120" viewBox="0 0 40 120">
                <rect x="0" y="0" width="40" height="40" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.15" />
                <rect x="10" y="45" width="20" height="20" fill={GOLD} opacity="0.06" />
                <circle cx="20" cy="90" r="15" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.1" />
              </svg>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden sm:block" aria-hidden="true">
              <svg width="40" height="120" viewBox="0 0 40 120">
                <circle cx="20" cy="20" r="18" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.15" />
                <rect x="5" y="50" width="30" height="30" fill={GOLD} opacity="0.06" />
                <rect x="10" y="90" width="20" height="20" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.1" />
              </svg>
            </div>

            <div className="relative z-10">
              <motion.p
                variants={fadeUp}
                className="text-[10px] font-mono tracking-[0.2em] uppercase mb-5"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                No credit card &middot; No limits during preview
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold mb-8 leading-tight"
                style={{ color: CREAM }}
              >
                Your next infographic is
                <br />
                <span style={{ color: GOLD }}>60 seconds away.</span>
              </motion.h2>
              <motion.div variants={fadeUp}>
                <Link href="/">
                  <motion.span
                    className="relative inline-block px-12 py-4 text-sm font-mono font-semibold cursor-pointer overflow-hidden"
                    style={{ backgroundColor: GOLD, color: CHARCOAL }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Subtle pulse */}
                    <motion.span
                      className="absolute inset-0"
                      style={{ backgroundColor: GOLD }}
                      animate={{
                        boxShadow: [
                          `0 0 0px ${GOLD}00`,
                          `0 0 40px ${GOLD}40`,
                          `0 0 0px ${GOLD}00`,
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span className="relative z-10">Start generating — free</span>
                  </motion.span>
                </Link>
              </motion.div>
              <motion.p
                variants={fadeIn}
                className="text-[10px] font-mono mt-6"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                Join thousands of teams already using ZGNAL in preview.
              </motion.p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
