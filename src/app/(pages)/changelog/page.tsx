"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "motion/react";

/* ================================================================== */
/*  Data                                                               */
/* ================================================================== */

type Tag = "Feature" | "Fix" | "Infrastructure" | "Design";

interface ChangelogEntry {
  text: string;
  tag: Tag;
}

interface Version {
  version: string;
  date: string;
  summary: string;
  latest?: boolean;
  accentColor: string;
  entries: ChangelogEntry[];
}

const TAG_COLORS: Record<Tag, { bg: string; text: string }> = {
  Feature: { bg: "bg-[#D4A84B]/15", text: "text-[#D4A84B]" },
  Fix: { bg: "bg-red-500/10", text: "text-red-400" },
  Infrastructure: { bg: "bg-cyan-500/10", text: "text-cyan-400" },
  Design: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400" },
};

const VERSIONS: Version[] = [
  {
    version: "v2.0",
    date: "March 3, 2026",
    summary: "Provenance system & content pages",
    latest: true,
    accentColor: "#D4A84B",
    entries: [
      {
        text: "Provenance certificate system — full pipeline trace, content hash, unique seed IDs",
        tag: "Feature",
      },
      {
        text: "Topic extraction and tagging for generated infographics",
        tag: "Feature",
      },
      {
        text: "Capabilities section redesigned — 3 cards with gold schematic illustration",
        tag: "Design",
      },
      {
        text: "Footer pages — About, Docs, Pricing, Privacy, Terms, Contact, Changelog",
        tag: "Feature",
      },
      {
        text: "Style Guide page with all 20 visual styles",
        tag: "Feature",
      },
      {
        text: "Logo navigation — click to return home from any view",
        tag: "Design",
      },
      {
        text: "All footer links now point to real pages",
        tag: "Fix",
      },
    ],
  },
  {
    version: "v1.1",
    date: "March 3, 2026",
    summary: "Pipeline inlining & production hardening",
    accentColor: "#5B8DEF",
    entries: [
      {
        text: "Inlined backend pipeline into Next.js API routes — eliminated external engine dependency",
        tag: "Infrastructure",
      },
      {
        text: "Fixed share/download links using localhost in production",
        tag: "Fix",
      },
      {
        text: "Added data: URL handling for Gemini image generation",
        tag: "Feature",
      },
      {
        text: "Environment variables configured on Vercel",
        tag: "Infrastructure",
      },
      {
        text: "Full Playwright E2E testing suite run against production",
        tag: "Infrastructure",
      },
    ],
  },
  {
    version: "v1.0",
    date: "March 2, 2026",
    summary: "Initial launch — 400+ combinations",
    accentColor: "#8BC34A",
    entries: [
      {
        text: "Initial release of ZGNAL.AI Infographic Lab",
        tag: "Feature",
      },
      {
        text: "Seven-stage AI pipeline with Gemini integration",
        tag: "Feature",
      },
      {
        text: "20 layouts, 20 styles, 8 presets, 3 aspect ratios",
        tag: "Feature",
      },
      {
        text: "Content input via text, URL, video, and file upload",
        tag: "Feature",
      },
      {
        text: "Export as PNG, JPEG, PDF, PPTX",
        tag: "Feature",
      },
      {
        text: "Social sharing to X, LinkedIn, WhatsApp",
        tag: "Feature",
      },
      {
        text: "Responsive landing page with interactive pipeline section",
        tag: "Design",
      },
      {
        text: "Gallery showcase with real generated examples",
        tag: "Design",
      },
      {
        text: "Style gallery with one-click regeneration",
        tag: "Design",
      },
      {
        text: "Deployed to Vercel with custom domain zgnal.ai",
        tag: "Infrastructure",
      },
    ],
  },
];

/* ================================================================== */
/*  SVG Version Icons (48x48, gold stroke, 2px, no fill)               */
/* ================================================================== */

function ShieldProvenanceIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path
        d="M24 4L8 12V24C8 34 14 42 24 46C34 42 40 34 40 24V12L24 4Z"
        stroke="#D4A84B"
        strokeWidth="2"
      />
      <path d="M18 24L22 28L30 18" stroke="#D4A84B" strokeWidth="2" />
      <circle cx="24" cy="24" r="8" stroke="#D4A84B" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

function ServerPipelineIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="6" width="32" height="12" stroke="#D4A84B" strokeWidth="2" />
      <rect x="8" y="22" width="32" height="12" stroke="#D4A84B" strokeWidth="2" />
      <circle cx="14" cy="12" r="2" stroke="#D4A84B" strokeWidth="1.5" />
      <circle cx="14" cy="28" r="2" stroke="#D4A84B" strokeWidth="1.5" />
      <line x1="20" y1="12" x2="34" y2="12" stroke="#D4A84B" strokeWidth="1.5" />
      <line x1="20" y1="28" x2="34" y2="28" stroke="#D4A84B" strokeWidth="1.5" />
      <path d="M24 34V42" stroke="#D4A84B" strokeWidth="2" />
      <path d="M18 42H30" stroke="#D4A84B" strokeWidth="2" />
    </svg>
  );
}

function RocketLaunchIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path
        d="M24 6C24 6 18 14 18 26L24 32L30 26C30 14 24 6 24 6Z"
        stroke="#D4A84B"
        strokeWidth="2"
      />
      <path d="M18 22L12 28L18 30" stroke="#D4A84B" strokeWidth="2" />
      <path d="M30 22L36 28L30 30" stroke="#D4A84B" strokeWidth="2" />
      <path d="M20 32L18 42L24 38L30 42L28 32" stroke="#D4A84B" strokeWidth="2" />
      <circle cx="24" cy="18" r="3" stroke="#D4A84B" strokeWidth="1.5" />
    </svg>
  );
}

const VERSION_ICONS: Record<string, React.ReactNode> = {
  "v2.0": <ShieldProvenanceIcon />,
  "v1.1": <ServerPipelineIcon />,
  "v1.0": <RocketLaunchIcon />,
};

/* ================================================================== */
/*  Vertical Lines Background                                          */
/* ================================================================== */

function VerticalLinesBg() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px bg-white/[0.02]"
          style={{ left: `${(i + 1) * 5}%` }}
        />
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Hero Growth Illustration                                           */
/* ================================================================== */

function GrowthIllustration() {
  return (
    <motion.svg
      viewBox="0 0 200 120"
      fill="none"
      className="w-full max-w-[240px] h-auto"
      aria-hidden="true"
    >
      {/* Base line */}
      <motion.line
        x1="20"
        y1="100"
        x2="180"
        y2="100"
        stroke="#D4A84B"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />

      {/* Growth bars ascending */}
      {[
        { x: 30, h: 20 },
        { x: 55, h: 35 },
        { x: 80, h: 45 },
        { x: 105, h: 60 },
        { x: 130, h: 75 },
        { x: 155, h: 88 },
      ].map((bar, i) => (
        <motion.rect
          key={i}
          x={bar.x}
          y={100 - bar.h}
          width="16"
          height={bar.h}
          stroke="#D4A84B"
          strokeWidth="2"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{
            duration: 0.4,
            delay: 0.6 + i * 0.12,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{ transformOrigin: `${bar.x + 8}px 100px` }}
        />
      ))}

      {/* Upward arrow */}
      <motion.path
        d="M170 90L170 15"
        stroke="#D4A84B"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 1.4 }}
      />
      <motion.path
        d="M164 22L170 12L176 22"
        stroke="#D4A84B"
        strokeWidth="2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      />

      {/* Connecting dots on top of bars */}
      {[
        { cx: 38, cy: 80 },
        { cx: 63, cy: 65 },
        { cx: 88, cy: 55 },
        { cx: 113, cy: 40 },
        { cx: 138, cy: 25 },
        { cx: 163, cy: 12 },
      ].map((dot, i) => (
        <motion.circle
          key={`dot-${i}`}
          cx={dot.cx}
          cy={dot.cy}
          r="3"
          stroke="#D4A84B"
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ delay: 0.8 + i * 0.12 }}
        />
      ))}

      {/* Trend line through dots */}
      <motion.path
        d="M38 80 L63 65 L88 55 L113 40 L138 25 L163 12"
        stroke="#D4A84B"
        strokeWidth="1"
        opacity="0.3"
        strokeDasharray="4 3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      />
    </motion.svg>
  );
}

/* ================================================================== */
/*  Hero                                                               */
/* ================================================================== */

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const chars = "What's new.".split("");

  return (
    <div ref={ref} className="mb-20 sm:mb-28">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-5"
          >
            Changelog
          </motion.p>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-mono font-bold text-white leading-[1.05] mb-6">
            {chars.map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.4,
                  delay: 0.15 + i * 0.04,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="inline-block"
                style={{ whiteSpace: char === " " ? "pre" : undefined }}
              >
                {char}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 1,
                delay: 0.7,
                repeat: 3,
                times: [0, 0.01, 0.5, 0.51],
              }}
              className="inline-block w-[3px] h-[0.85em] bg-[#D4A84B] ml-1 align-baseline translate-y-[0.1em]"
            />
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-base sm:text-lg text-white/40 max-w-md font-sans"
          >
            Release history for the ZGNAL.AI Infographic Lab.
          </motion.p>
        </div>

        {/* Growth illustration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="shrink-0"
        >
          <GrowthIllustration />
        </motion.div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Version Card                                                       */
/* ================================================================== */

function VersionCard({ version, index }: { version: Version; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="relative pl-16 sm:pl-20 pb-16 last:pb-0"
    >
      {/* Node — square gold block */}
      <div className="absolute left-0 top-0 flex items-center justify-center">
        <div
          className={`
            relative z-10 h-10 w-10 sm:h-12 sm:w-12 border-2
            flex items-center justify-center
            ${
              version.latest
                ? "border-[#D4A84B] bg-[#D4A84B]/10"
                : "border-white/20 bg-white/[0.03]"
            }
          `}
        >
          <span
            className={`text-[10px] sm:text-xs font-mono font-bold tracking-wide ${
              version.latest ? "text-[#D4A84B]" : "text-white/50"
            }`}
          >
            {version.version.replace("v", "")}
          </span>

          {/* Pulsing ring on latest */}
          {version.latest && (
            <motion.div
              className="absolute inset-0 border-2 border-[#D4A84B]/40"
              animate={{
                scale: [1, 1.35],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
        </div>
      </div>

      {/* Card with colored accent bar */}
      <div className="border-2 border-white/[0.06] bg-white/[0.015] hover:border-white/[0.1] transition-colors duration-300 overflow-hidden">
        {/* Accent bar at top */}
        <motion.div
          className="h-[3px] w-full"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: index * 0.1 + 0.3, ease: "easeOut" }}
          style={{ backgroundColor: version.accentColor, transformOrigin: "left" }}
        />

        <div className="p-6 sm:p-8">
          {/* Header with icon */}
          <div className="flex items-start gap-4 mb-4">
            {/* Version icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
              className="shrink-0"
            >
              {VERSION_ICONS[version.version]}
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-2xl sm:text-3xl font-mono font-bold" style={{ color: version.accentColor }}>
                  {version.version}
                </h2>
                {version.latest && (
                  <motion.span
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="text-[9px] font-mono tracking-[0.15em] uppercase text-[#D4A84B] bg-[#D4A84B]/10 border border-[#D4A84B]/30 px-2.5 py-1"
                  >
                    Latest
                  </motion.span>
                )}
              </div>

              <p className="text-xs font-mono text-white/30 mb-2">{version.date}</p>
              <p className="text-sm sm:text-base font-sans text-white/60 leading-relaxed">
                {version.summary}
              </p>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-white/[0.06] my-5" />

          {/* Entries */}
          <ul className="space-y-0">
            {version.entries.map((entry, i) => (
              <BulletItem
                key={entry.text}
                entry={entry}
                index={i}
                parentInView={isInView}
              />
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Bullet Item                                                        */
/* ================================================================== */

function BulletItem({
  entry,
  index,
  parentInView,
}: {
  entry: ChangelogEntry;
  index: number;
  parentInView: boolean;
}) {
  const colors = TAG_COLORS[entry.tag];

  return (
    <motion.li
      initial={{ opacity: 0, x: -16 }}
      animate={parentInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.35,
        delay: 0.3 + index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group flex items-start gap-3 py-2.5 px-3 -mx-3 hover:bg-white/[0.025] transition-colors duration-200 cursor-default"
    >
      <span className="h-1.5 w-1.5 bg-[#D4A84B]/50 mt-[7px] shrink-0 group-hover:bg-[#D4A84B] transition-colors duration-200" />
      <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors duration-200 leading-relaxed flex-1">
        {entry.text}
      </span>
      <span
        className={`
          shrink-0 text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 mt-[3px]
          ${colors.bg} ${colors.text}
          opacity-60 group-hover:opacity-100 transition-opacity duration-200
        `}
      >
        {entry.tag}
      </span>
    </motion.li>
  );
}

/* ================================================================== */
/*  Timeline Line                                                      */
/* ================================================================== */

function TimelineLine() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.2", "end 0.8"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="absolute left-[19px] sm:left-[23px] top-0 bottom-0 w-[2px]">
      {/* Background track */}
      <div className="absolute inset-0 bg-white/[0.04]" />
      {/* Animated gold fill */}
      <motion.div
        className="absolute top-0 left-0 right-0 bottom-0 bg-[#D4A84B]/40 origin-top"
        style={{ scaleY }}
      />
    </div>
  );
}

/* ================================================================== */
/*  What's Next Teaser                                                 */
/* ================================================================== */

function WhatsNext() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  const upcoming = [
    { label: "AI Style Transfer", desc: "Apply any visual style to existing infographics" },
    { label: "Team Workspaces", desc: "Collaborative editing and shared brand kits" },
    { label: "API Access", desc: "Programmatic infographic generation at scale" },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="mt-20 border-t border-white/[0.06] pt-16"
    >
      <div className="flex items-center gap-3 mb-8">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L12 22" stroke="#D4A84B" strokeWidth="2" />
          <path d="M2 12L22 12" stroke="#D4A84B" strokeWidth="2" />
          <circle cx="12" cy="12" r="4" stroke="#D4A84B" strokeWidth="1.5" opacity="0.4" />
        </svg>
        <h3 className="text-xl font-mono font-bold text-white">
          What&rsquo;s next
        </h3>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {upcoming.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            className="p-5 border border-dashed border-white/[0.08] bg-white/[0.01]"
          >
            <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-[#D4A84B]/60 mb-2">
              Coming soon
            </p>
            <p className="text-sm font-mono font-semibold text-white/70 mb-1.5">
              {item.label}
            </p>
            <p className="text-xs font-sans text-white/35 leading-relaxed">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function ChangelogPage() {
  return (
    <div className="relative min-h-screen bg-[#0A0A0B] overflow-hidden">
      <VerticalLinesBg />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <Hero />

        <div className="relative">
          <TimelineLine />

          {VERSIONS.map((version, index) => (
            <VersionCard key={version.version} version={version} index={index} />
          ))}

          {/* Terminal node */}
          <div className="absolute left-[15px] sm:left-[19px] bottom-0 h-2 w-2 bg-white/10 border border-white/20" />
        </div>

        <WhatsNext />
      </div>
    </div>
  );
}
