"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import { useGenerate } from "@/hooks/use-generate";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { GeneratingExperience } from "@/components/generator/generating-experience";
import { ResultViewer } from "@/components/generator/result-viewer";
import { ChatFAB } from "@/components/chat/chat-fab";
import { HeroOutputShowcase } from "@/components/home/hero-output-showcase";
import { OutputGallery } from "@/components/home/output-gallery";
import { LouvreCaseStudy } from "@/components/home/louvre-case-study";
import { PipelineStory } from "@/components/home/pipeline-story";
import { OfferSection } from "@/components/home/offer-section";
import { StickyCta } from "@/components/home/sticky-cta";
import { ScrollReveal } from "@/components/home/scroll-reveal-v2";
import {
  Sparkles,
  ArrowRight,
  FileText,
  Globe,
  Upload,
  CheckCircle2,
  LayoutGrid,
  MonitorSmartphone,
  ChevronDown,
  SlidersHorizontal,
  X,
  Wand2,
  Loader2,
  Video,
  Link2,
  AlertCircle,
  UploadCloud,
  Mic,
  MicOff,
} from "lucide-react";
import type { GenerateInput } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════════
   GENERATOR DATA
   ═══════════════════════════════════════════════════════════════ */

const INPUT_MODES = [
  {
    id: "text",
    label: "Paste text",
    title: "Paste text",
    desc: "Notes, articles, or content",
    icon: FileText,
    bg: "bg-purple-500/10",
    iconColor: "text-purple-400",
  },
  {
    id: "url",
    label: "From URL",
    title: "Share a URL",
    desc: "Any web page or article",
    icon: Globe,
    bg: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    id: "video",
    label: "Video link",
    title: "Share a video",
    desc: "YouTube, Vimeo, or Loom",
    icon: Video,
    bg: "bg-rose-500/10",
    iconColor: "text-rose-400",
  },
  {
    id: "file",
    label: "Upload file",
    title: "Import a file",
    desc: "Docs, PDFs, or slides",
    icon: Upload,
    bg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
];

const SIZES = [
  { value: "16:9", label: "16:9", icon: MonitorSmartphone },
  { value: "9:16", label: "9:16", icon: MonitorSmartphone },
  { value: "1:1", label: "1:1", icon: LayoutGrid },
];

const POPULAR_PRESETS = [
  { id: "auto", label: "Auto", desc: "AI picks the best layout + style" },
  {
    id: "aerial-explainer",
    label: "Museum",
    desc: "Exhibition-grade aerial explainer",
  },
  {
    id: "executive-summary",
    label: "Executive",
    desc: "Board-ready bento grid",
  },
  { id: "deconstruct", label: "Deconstruct", desc: "NYT-style exploded view" },
];

const ALL_STYLES = [
  { id: "craft-handmade", label: "Craft Handmade" },
  { id: "claymation", label: "Claymation" },
  { id: "kawaii", label: "Kawaii" },
  { id: "storybook-watercolor", label: "Watercolor" },
  { id: "chalkboard", label: "Chalkboard" },
  { id: "cyberpunk-neon", label: "Cyberpunk" },
  { id: "bold-graphic", label: "Bold Graphic" },
  { id: "aged-academia", label: "Aged Academia" },
  { id: "corporate-memphis", label: "Corporate" },
  { id: "technical-schematic", label: "Schematic" },
  { id: "origami", label: "Origami" },
  { id: "pixel-art", label: "Pixel Art" },
  { id: "ikea-manual", label: "IKEA Manual" },
  { id: "knolling", label: "Knolling" },
  { id: "lego-brick", label: "LEGO Brick" },
  { id: "executive-institutional", label: "Institutional" },
  { id: "deconstruct", label: "Deconstruct" },
  { id: "aerial-explainer", label: "Aerial" },
];

/* ═══════════════════════════════════════════════════════════════
   ZGNAL LOGO
   ═══════════════════════════════════════════════════════════════ */

function ZignalLogo({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path d="M3 3H18V7L10 17H18V21H3V17L11 7H3V3Z" fill="currentColor" />
      <rect x="19.5" y="18" width="3.5" height="3.5" fill="currentColor" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function Home() {
  const { state, generate, reset } = useGenerate();
  const [content, setContent] = useState("");
  const [selectedSize, setSelectedSize] = useState("16:9");
  const [simplify, setSimplify] = useState(true);
  const [referenceQuery, setReferenceQuery] = useState("");
  const [inputMode, setInputMode] = useState("text");
  const [selectedPreset, setSelectedPreset] = useState("auto");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [extractUrl, setExtractUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [extractSource, setExtractSource] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generatorRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const {
    voiceState,
    transcript,
    interimTranscript,
    supported: voiceSupported,
    toggleListening,
    clearTranscript,
  } = useVoiceInput();

  const hasContent = content.trim().length > 50;
  const isGenerating =
    state.phase === "submitting" || state.phase === "streaming";

  /* Hero parallax — gated: scroll-bound style values are not covered by MotionConfig */
  const { scrollY } = useScroll();
  const heroContentY = useTransform(scrollY, [0, 800], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  /* Sync voice transcript → content */
  useEffect(() => {
    if (transcript) {
      setContent((prev) => prev + transcript);
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  /* Auto-resize textarea */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 300) + "px";
    }
  }, [content]);

  const handleGenerate = useCallback(
    (inputContent?: string) => {
      const text = inputContent || content.trim();
      if (!text || text.length < 50) return;
      const input: GenerateInput = {
        content: text,
        aspect_ratio: selectedSize,
        quality: "normal",
        simplify,
        reference_query: referenceQuery || undefined,
        preset: selectedPreset !== "auto" ? selectedPreset : undefined,
        style: selectedStyle || undefined,
      };
      generate(input);
    },
    [
      content,
      selectedSize,
      simplify,
      referenceQuery,
      selectedPreset,
      selectedStyle,
      generate,
    ],
  );

  const handleImprovePrompt = useCallback(async () => {
    if (!content.trim() || content.trim().length < 10 || isImproving) return;
    setIsImproving(true);
    try {
      const res = await fetch("/api/improve-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content }),
      });
      const data = await res.json();
      if (data.improved) setContent(data.improved);
    } catch {
      /* silent fail — user keeps original */
    }
    setIsImproving(false);
  }, [content, isImproving]);

  /* ─── Extract from URL ─── */
  const handleExtractUrl = useCallback(async () => {
    if (!extractUrl.trim() || isExtracting) return;
    setIsExtracting(true);
    setExtractError("");
    try {
      const endpoint =
        inputMode === "video" ? "/api/extract-video" : "/api/extract-url";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: extractUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      setContent(data.text);
      setExtractSource(data.title || extractUrl);
      setInputMode("text"); // switch to text view so user can see/edit extracted content
    } catch (err: any) {
      setExtractError(err.message || "Failed to extract content");
    }
    setIsExtracting(false);
  }, [extractUrl, isExtracting, inputMode]);

  /* ─── Extract from File ─── */
  const handleFileUpload = useCallback(async (file: File) => {
    setIsExtracting(true);
    setExtractError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "File parsing failed");
      setContent(data.text);
      setExtractSource(data.title || file.name);
      setInputMode("text");
    } catch (err: any) {
      setExtractError(err.message || "Failed to parse file");
    }
    setIsExtracting(false);
  }, []);

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
    setTimeout(() => inputRef.current?.focus(), reduce ? 0 : 600);
  };

  /* ─── GENERATING STATE ─── */
  if (state.phase === "submitting" || state.phase === "streaming") {
    const currentProgress = state.phase === "submitting" ? 0 : state.progress;
    const currentMessage =
      state.phase === "submitting" ? "Submitting..." : state.message;
    const currentStatus =
      state.phase === "submitting" ? "queued" : state.status;
    return (
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-[#060608] text-(--z-cream) flex flex-col">
          <Nav />
          <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-6xl relative"
            >
              {/* Retro screen frame */}
              <div className="engine-screen relative border border-white/[0.08] bg-[#0A0A0D] overflow-hidden">
                {/* Bezel top bar */}
                <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-(--z-brick)/60" />
                      <div className="h-2 w-2 rounded-full bg-(--z-gold)/60" />
                      <div className="h-2 w-2 rounded-full bg-(--z-olive)/60" />
                    </div>
                    <span className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase">
                      ZGNAL.ENGINE v2.0
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-(--z-gold) animate-pulse" />
                    <span className="text-[9px] font-mono text-(--z-gold)/60">
                      PROCESSING
                    </span>
                  </div>
                </div>

                {/* Screen content with scanline overlay */}
                <div className="relative px-6 sm:px-10 py-8 sm:py-10 engine-inner">
                  {/* Scanlines */}
                  <div className="engine-scanlines absolute inset-0 pointer-events-none z-10" />
                  {/* Vignette */}
                  <div
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background:
                        "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)",
                    }}
                  />

                  <GeneratingExperience
                    status={currentStatus}
                    progress={currentProgress}
                    message={currentMessage}
                    prompt={content}
                  />
                </div>

                {/* Bezel bottom */}
                <div className="flex items-center justify-center px-5 py-2 border-t border-white/[0.06] bg-white/[0.02]">
                  <span className="text-[8px] font-mono tracking-[0.3em] text-white/15 uppercase">
                    Agentic Infographic Pipeline — 5 modules
                  </span>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </MotionConfig>
    );
  }

  /* ─── ERROR STATE ─── (dedicated full-page screen, not buried below the fold) */
  if (state.phase === "error") {
    return (
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-(--z-bg) text-(--z-cream) flex flex-col">
          <Nav />
          <main className="flex-1 flex items-center justify-center px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-xl border-2 border-(--z-brick)/60 bg-(--z-brick)/10 px-6 py-8 space-y-5"
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-xl text-(--z-brick) leading-none mt-0.5">
                  !
                </span>
                <div className="space-y-2 min-w-0">
                  <h1 className="font-mono text-sm font-bold tracking-wider uppercase text-(--z-brick)">
                    Generation failed
                  </h1>
                  <p className="font-mono text-sm text-(--z-cream) break-words">
                    {state.message}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 bg-(--z-brick) px-5 py-2.5 text-xs font-mono font-semibold text-white hover:bg-(--z-brick)/80 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-brick)"
                >
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                  Try again
                </button>
                <button
                  onClick={() => handleGenerate()}
                  disabled={!hasContent}
                  className="inline-flex items-center gap-2 border border-(--z-cream)/20 px-5 py-2.5 text-xs font-mono text-(--z-cream)/80 hover:bg-(--z-cream)/[0.04] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Retry with same prompt
                </button>
              </div>
            </motion.div>
          </main>
        </div>
      </MotionConfig>
    );
  }

  /* ─── COMPLETE STATE ─── */
  if (state.phase === "complete") {
    return (
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-(--z-bg) text-(--z-cream) flex flex-col">
          <Nav />
          <main className="flex-1 px-6 pt-24 pb-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-3xl space-y-8"
            >
              <ResultViewer
                imageUrl={state.imageUrl}
                downloadUrl={state.downloadUrl}
                metadata={state.metadata}
                provenance={state.provenance}
                onRegenerate={reset}
                onRegenerateWithStyle={(style: string) => {
                  const input: GenerateInput = {
                    content: content.trim(),
                    aspect_ratio: selectedSize,
                    quality: "normal",
                    simplify,
                    reference_query: referenceQuery || undefined,
                    preset:
                      selectedPreset !== "auto" ? selectedPreset : undefined,
                    style,
                  };
                  generate(input);
                }}
                generationContext={{
                  content,
                  preset: selectedPreset,
                  style: selectedStyle,
                  aspectRatio: selectedSize,
                  simplify,
                }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="text-center"
              >
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 text-sm text-(--z-cream)/60 hover:text-(--z-cream) font-mono transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
                >
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                  Create another infographic
                </button>
              </motion.div>
            </motion.div>
          </main>
        </div>
      </MotionConfig>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     MAIN LANDING PAGE — output-first
     ═══════════════════════════════════════════════════════════════ */
  return (
    <MotionConfig reducedMotion="user">
      <main
        id="main-content"
        className="min-h-screen bg-(--z-bg) text-(--z-cream) overflow-x-clip"
      >
        <Nav />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HERO — output-first: a real generated infographic is the star;
            the generator is the path to make your own
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          id="hero"
          className="relative lg:min-h-[720px] flex flex-col overflow-hidden bg-(--z-bg)"
        >
          {/* Animated gradient orbs — slow, living background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="hero-orb hero-orb-gold" />
            <div className="hero-orb hero-orb-blue" />
            <div className="hero-orb hero-orb-warm" />
            {/* Grid lines — barely visible structural texture */}
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(212,168,75,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,75,0.3) 1px, transparent 1px)",
                backgroundSize: "80px 80px",
              }}
            />

            {/* Floating infographic motifs — thinned to two */}
            <svg
              className="hero-motif opacity-[0.06] hidden lg:block"
              style={{
                top: "14%",
                left: "4%",
                animation: "motif-drift-1 32s ease-in-out infinite",
              }}
              width="80"
              height="60"
              viewBox="0 0 80 60"
              fill="none"
            >
              <rect
                x="4"
                y="30"
                width="10"
                height="26"
                stroke="#D4A84B"
                strokeWidth="1"
              />
              <rect
                x="20"
                y="18"
                width="10"
                height="38"
                stroke="#D4A84B"
                strokeWidth="1"
              />
              <rect
                x="36"
                y="8"
                width="10"
                height="48"
                stroke="#D4A84B"
                strokeWidth="1"
              />
              <rect
                x="52"
                y="22"
                width="10"
                height="34"
                stroke="#D4A84B"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="57"
                x2="72"
                y2="57"
                stroke="#D4A84B"
                strokeWidth="0.5"
                opacity="0.5"
              />
            </svg>
            <svg
              className="hero-motif opacity-[0.04] hidden lg:block"
              style={{
                bottom: "16%",
                right: "4%",
                animation: "motif-drift-4 30s ease-in-out infinite",
              }}
              width="90"
              height="70"
              viewBox="0 0 90 70"
              fill="none"
            >
              <rect
                x="2"
                y="2"
                width="38"
                height="28"
                stroke="#D4A84B"
                strokeWidth="0.8"
              />
              <rect
                x="44"
                y="2"
                width="44"
                height="13"
                stroke="#5B8DEF"
                strokeWidth="0.8"
              />
              <rect
                x="44"
                y="18"
                width="20"
                height="12"
                stroke="#D4A84B"
                strokeWidth="0.8"
              />
              <rect
                x="68"
                y="18"
                width="20"
                height="12"
                stroke="#8BC34A"
                strokeWidth="0.8"
              />
              <rect
                x="2"
                y="34"
                width="86"
                height="8"
                stroke="#D4A84B"
                strokeWidth="0.5"
                strokeDasharray="2 4"
              />
              <rect
                x="2"
                y="46"
                width="28"
                height="20"
                stroke="#A78BFA"
                strokeWidth="0.8"
              />
              <rect
                x="34"
                y="46"
                width="54"
                height="20"
                stroke="#D4A84B"
                strokeWidth="0.8"
              />
            </svg>
          </div>

          {/* Hero content — interlocking layers: monumental headline (z-20)
              over the elevated artifact (z-10), command console riding the
              artifact's bottom-left corner (z-30). Not a grid of boxes. */}
          <motion.div
            className="relative flex-1 w-full max-w-[1480px] mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-10"
            style={
              reduce ? undefined : { y: heroContentY, opacity: heroOpacity }
            }
          >
            {/* Headline band — overlaps the artifact's top-left */}
            <div className="relative z-20 max-w-4xl lg:-mb-12">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="label-mono text-(--z-gold) mb-3 sm:mb-5"
              >
                The Infographic Engine
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.8,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="font-mono font-medium heading-editorial text-[42px] sm:text-6xl xl:text-[76px] [text-shadow:0_2px_40px_rgba(10,10,11,0.9)]"
              >
                <span className="block">Turn complexity</span>
                <span className="block text-gradient-gold">into clarity</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-4 text-[13px] text-(--z-muted) leading-relaxed max-w-md"
              >
                Paste anything. Seven AI agents research it across 22 trusted
                sources and render a publication-grade infographic in about a
                minute. Like this one —
              </motion.p>
            </div>

            {/* THE ARTIFACT — elevated, right-aligned, tucked under the headline.
                Width is capped by VIEWPORT HEIGHT so the full frame (bezel +
                image + footer tabs) fits above the fold on 768px laptops as
                well as 1080px monitors. mr-16 keeps it clear of the ChatFAB. */}
            <div className="relative z-10 mt-6 lg:mt-0 lg:ml-auto lg:mr-16 lg:w-[min(64%,calc((100vh-440px)*16/9))] lg:min-w-[560px]">
              <HeroOutputShowcase />
            </div>

            {/* Command console — bottom-anchored. Safe now: the artifact is
                viewport-sized, so the section's height tracks the viewport and
                the console always lands fully above the fold. At narrow widths
                it rides over the artifact's bottom-left corner (z-30). */}
            <div className="relative z-30 mt-6 lg:mt-0 lg:absolute lg:bottom-6 lg:left-4 sm:lg:left-6 lg:w-[38%] lg:max-w-[460px] lg:min-w-[400px]">
              <motion.div
                ref={generatorRef}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.8 }}
                className="w-full"
              >
                <div
                  className="metallic-frame relative overflow-hidden flex flex-col max-h-[70vh]"
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(255,255,255,0.06), 0 0 0 2px rgba(212,168,75,0.08), 0 8px 40px rgba(0,0,0,0.5), 0 2px 12px rgba(212,168,75,0.06)",
                  }}
                >
                  {/* Metallic bezel top bar */}
                  <div
                    className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.08] shrink-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background:
                              "radial-gradient(circle at 35% 35%, #E86B5F, #C04B3C)",
                          }}
                        />
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background:
                              "radial-gradient(circle at 35% 35%, #E8C96A, #D4A84B)",
                          }}
                        />
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background:
                              "radial-gradient(circle at 35% 35%, #A4D65E, #8BC34A)",
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono tracking-[0.25em] text-white/40 uppercase font-bold">
                        ZGNAL.LAB
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-(--z-olive)/50" />
                      <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider font-medium">
                        Ready
                      </span>
                    </div>
                  </div>

                  {/* Inner content area */}
                  <div className="bg-[#0A0A0D] flex-1 min-h-0 flex flex-col overflow-hidden">
                    {/* Input mode tabs — compact horizontal strip */}
                    <div className="flex border-b border-white/[0.06] shrink-0">
                      {INPUT_MODES.map((mode) => {
                        const Icon = mode.icon;
                        const isActive = inputMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => setInputMode(mode.id)}
                            aria-label={mode.label}
                            className={`group flex items-center gap-1.5 py-2 px-3 sm:px-4 transition-all text-[10px] sm:text-[11px] font-mono tracking-wide border-b-2 flex-1 justify-center ${
                              isActive
                                ? "bg-white/[0.05] border-b-(--z-gold) text-white"
                                : "bg-transparent border-b-transparent text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
                            }`}
                          >
                            <Icon
                              className={`h-3.5 w-3.5 ${isActive ? mode.iconColor : "text-white/30"}`}
                            />
                            <span className="hidden sm:inline">
                              {mode.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Input area — scrollable content zone */}
                    <div className="flex-1 min-h-0 overflow-y-auto z-scroll">
                      {inputMode === "text" ? (
                        <div className="p-4 sm:p-5 relative">
                          {extractSource && (
                            <div className="flex items-center gap-2 mb-3 text-[10px] font-mono text-(--z-olive)">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Extracted from: {extractSource}</span>
                              <button
                                onClick={() => {
                                  setExtractSource("");
                                  setContent("");
                                }}
                                className="text-white/30 hover:text-white/50 ml-auto"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                          <textarea
                            ref={inputRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={
                              "Paste text, a URL transcript, or your notes — the engine researches, verifies, and renders. 50+ characters."
                            }
                            className="w-full min-h-[72px] sm:min-h-[84px] max-h-[220px] resize-none bg-transparent text-[14px] sm:text-[15px] text-white placeholder:text-white/35 focus:outline-none leading-relaxed font-sans pr-16 sm:pr-24 z-scroll"
                            disabled={isGenerating || isImproving}
                          />
                          {/* Voice + Improve buttons */}
                          <div className="absolute bottom-4 right-4 flex items-center gap-2">
                            {voiceSupported && (
                              <button
                                onClick={toggleListening}
                                title={
                                  voiceState === "listening"
                                    ? "Stop recording"
                                    : "Voice input"
                                }
                                className={`flex items-center justify-center w-8 h-8 transition-all ${
                                  voiceState === "listening"
                                    ? "text-(--z-brick) voice-recording"
                                    : "text-white/30 hover:text-white/60"
                                }`}
                              >
                                {voiceState === "listening" ? (
                                  <MicOff className="h-4 w-4" />
                                ) : (
                                  <Mic className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            {content.trim().length >= 10 && !isGenerating && (
                              <button
                                onClick={handleImprovePrompt}
                                disabled={isImproving}
                                title="Enhance this prompt with AI"
                                className="improve-btn flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-mono font-semibold tracking-wide uppercase transition-all border border-(--z-gold)/30 text-(--z-gold) hover:border-(--z-gold)/60 disabled:opacity-60 disabled:animate-none overflow-hidden"
                              >
                                <span className="improve-shimmer absolute inset-0 pointer-events-none" />
                                {isImproving ? (
                                  <Loader2 className="h-3 w-3 animate-spin relative z-10" />
                                ) : (
                                  <Wand2 className="h-3 w-3 relative z-10" />
                                )}
                                <span className="relative z-10">
                                  {isImproving ? "Improving..." : "Improve"}
                                </span>
                              </button>
                            )}
                          </div>
                          {/* Voice interim transcript */}
                          {voiceState === "listening" && interimTranscript && (
                            <div className="absolute bottom-12 right-4 text-[11px] text-(--z-gold)/50 font-mono italic max-w-[200px] truncate">
                              {interimTranscript}
                            </div>
                          )}
                        </div>
                      ) : inputMode === "url" || inputMode === "video" ? (
                        <div className="p-4 sm:p-5">
                          <div className="flex items-center gap-2 mb-3">
                            {inputMode === "video" ? (
                              <Video className="h-4 w-4 text-rose-400" />
                            ) : (
                              <Link2 className="h-4 w-4 text-blue-400" />
                            )}
                            <span className="text-[11px] font-mono text-white/50">
                              {inputMode === "video"
                                ? "Paste a YouTube, Vimeo, or Loom link"
                                : "Paste any web page URL"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={extractUrl}
                              onChange={(e) => {
                                setExtractUrl(e.target.value);
                                setExtractError("");
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleExtractUrl();
                              }}
                              placeholder={
                                inputMode === "video"
                                  ? "https://youtube.com/watch?v=..."
                                  : "https://example.com/article"
                              }
                              className="flex-1 bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-(--z-gold)/30 font-mono"
                              disabled={isExtracting}
                            />
                            <button
                              onClick={handleExtractUrl}
                              disabled={!extractUrl.trim() || isExtracting}
                              className="flex items-center gap-2 bg-(--z-gold) px-5 py-3 text-xs font-mono font-bold text-(--z-bg) hover:bg-(--z-gold-dim) active:scale-[0.97] transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                            >
                              {isExtracting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <ArrowRight className="h-3.5 w-3.5" />
                              )}
                              {isExtracting ? "Extracting..." : "Extract"}
                            </button>
                          </div>
                          {extractError && (
                            <div className="flex items-center gap-2 mt-3 text-[11px] font-mono text-(--z-brick)">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              {extractError}
                            </div>
                          )}
                          <p className="text-[10px] text-white/25 font-mono mt-3">
                            {inputMode === "video"
                              ? "We'll extract the transcript and description to generate your infographic."
                              : "We'll fetch the page content, strip navigation, and extract the article text."}
                          </p>
                        </div>
                      ) : (
                        /* File upload mode */
                        <div className="p-4 sm:p-5">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.pptx,.txt,.md,.csv,.json"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleFileDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed cursor-pointer transition-all ${
                              dragOver
                                ? "border-(--z-gold)/40 bg-(--z-gold)/5"
                                : "border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]"
                            }`}
                          >
                            {isExtracting ? (
                              <>
                                <Loader2 className="h-8 w-8 text-(--z-gold) animate-spin" />
                                <span className="text-[12px] font-mono text-white/50">
                                  Parsing file...
                                </span>
                              </>
                            ) : (
                              <>
                                <UploadCloud
                                  className={`h-8 w-8 ${dragOver ? "text-(--z-gold)" : "text-white/20"}`}
                                />
                                <div className="text-center">
                                  <span className="text-[12px] font-mono text-white/50">
                                    Drop a file here or{" "}
                                    <span className="text-(--z-gold) underline underline-offset-2">
                                      browse
                                    </span>
                                  </span>
                                  <p className="text-[10px] text-white/25 font-mono mt-1">
                                    PDF, DOCX, PPTX, TXT, MD, CSV, JSON — up to
                                    10 MB
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                          {extractError && (
                            <div className="flex items-center gap-2 mt-3 text-[11px] font-mono text-(--z-brick)">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              {extractError}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* end scrollable input zone */}

                    {/* Style preset bar */}
                    <div className="flex items-center gap-2 border-t border-white/[0.06] px-3 sm:px-4 py-2.5 overflow-x-auto shrink-0 z-scroll-x">
                      {POPULAR_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedPreset(p.id);
                            setSelectedStyle("");
                          }}
                          title={p.desc}
                          className={`shrink-0 px-3 py-1.5 text-[10px] font-mono font-medium tracking-wide uppercase transition-all border ${
                            selectedPreset === p.id
                              ? "bg-(--z-gold)/10 text-(--z-gold) border-(--z-gold)/20"
                              : "text-white/40 border-transparent hover:text-white/60 hover:bg-white/[0.03]"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-medium tracking-wide uppercase transition-all border ${
                          showAdvanced
                            ? "text-white/90 border-white/20"
                            : "text-white/50 border-transparent hover:text-white/70"
                        }`}
                        style={
                          showAdvanced
                            ? {
                                background:
                                  "linear-gradient(135deg, rgba(212,168,75,0.15) 0%, rgba(91,141,239,0.1) 50%, rgba(167,139,250,0.1) 100%)",
                              }
                            : undefined
                        }
                      >
                        <SlidersHorizontal className="h-3 w-3" />
                        Advanced
                      </button>
                    </div>

                    {/* Advanced style panel — expandable */}
                    {showAdvanced && (
                      <div className="border-t border-white/[0.06] px-5 py-4 bg-white/[0.02] shrink-0">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-mono tracking-[0.15em] text-white/40 uppercase">
                            Visual Style Override
                          </span>
                          <button
                            onClick={() => setShowAdvanced(false)}
                            className="text-white/50 hover:text-white/70 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setSelectedStyle("")}
                            className={`px-2.5 py-1 text-[9px] font-mono font-medium uppercase tracking-wider transition-all ${
                              !selectedStyle
                                ? "bg-(--z-gold)/10 text-(--z-gold)"
                                : "text-white/50 hover:text-white/70 bg-white/[0.02]"
                            }`}
                          >
                            Auto
                          </button>
                          {ALL_STYLES.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setSelectedStyle(s.id);
                                setSelectedPreset("auto");
                              }}
                              className={`px-2.5 py-1 text-[9px] font-mono font-medium uppercase tracking-wider transition-all ${
                                selectedStyle === s.id
                                  ? "bg-(--z-gold)/10 text-(--z-gold)"
                                  : "text-white/50 hover:text-white/70 bg-white/[0.02]"
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Options bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-3 sm:px-4 py-2.5 shrink-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Aspect ratio */}
                        <div className="flex bg-white/[0.04] p-0.5">
                          {SIZES.map((s) => (
                            <button
                              key={s.value}
                              onClick={() => setSelectedSize(s.value)}
                              className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-mono font-medium transition-all ${
                                selectedSize === s.value
                                  ? "bg-white/[0.1] text-white"
                                  : "text-white/50 hover:text-white/70"
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>

                        {/* Simplify */}
                        <button
                          onClick={() => setSimplify(!simplify)}
                          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-mono font-medium transition-all border ${
                            simplify
                              ? "bg-(--z-gold)/10 text-(--z-gold) border-(--z-gold)/50"
                              : "text-white/50 border-white/20 hover:text-white/70 hover:border-white/35"
                          }`}
                        >
                          <div
                            className={`h-2 w-2 transition-colors ${simplify ? "bg-(--z-gold)" : "bg-white/20"}`}
                          />
                          Simplify
                        </button>
                      </div>

                      {/* Generate */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        {hasContent && (
                          <span className="text-[10px] text-white/50 font-mono hidden sm:inline">
                            ~60s
                          </span>
                        )}
                        <button
                          onClick={() => handleGenerate()}
                          disabled={!hasContent || isGenerating}
                          className="flex items-center gap-2 bg-(--z-gold) px-4 sm:px-6 py-2 sm:py-2.5 text-[11px] sm:text-xs font-mono font-bold text-(--z-bg) hover:bg-(--z-gold-dim) active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* end inner content area */}
                </div>

                {/* Char count + research hint */}
                <div className="flex justify-between items-center mt-3 px-1">
                  <span
                    className={`text-[11px] font-mono transition-colors ${content.length >= 50 ? "text-white/40" : content.length > 0 ? "text-(--z-brick)/70" : "text-white/40"}`}
                  >
                    {content.length > 0 ? (
                      <>
                        {content.length.toLocaleString()} / 50 characters{" "}
                        {content.length < 50 ? "minimum" : ""}
                      </>
                    ) : (
                      <>50 characters minimum</>
                    )}
                  </span>
                  {content.length >= 50 && (
                    <span className="text-[11px] text-(--z-olive) font-mono flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Ready
                    </span>
                  )}
                </div>

                {content.length >= 50 && (
                  <input
                    type="text"
                    value={referenceQuery}
                    onChange={(e) => setReferenceQuery(e.target.value)}
                    placeholder="Research hint (optional) — e.g., 'SpaceX Falcon 9 landing'"
                    maxLength={500}
                    aria-label="Research hint"
                    className="w-full mt-3 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-(--z-gold)/30 font-mono"
                  />
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="hidden lg:block absolute bottom-6 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="h-5 w-5 text-white/40 animate-scroll-bounce" />
          </motion.div>
        </section>

        {/* ━━━━ GALLERY — curated real outputs + styles band (#gallery, #examples) ━━━━ */}
        <OutputGallery scrollToGenerator={scrollToGenerator} />

        {/* ━━━━ CASE STUDY — the Louvre render, promoted from footer ghost to scene ━━━━ */}
        <LouvreCaseStudy scrollToGenerator={scrollToGenerator} />

        {/* ━━━━ PIPELINE — interactive seven-stage scroll experience (#pipeline) ━━━━ */}
        <PipelineStory scrollToGenerator={scrollToGenerator} />

        {/* ━━━━ OFFER — the one card grid: free preview + Pro waitlist (#offer) ━━━━ */}
        <OfferSection scrollToGenerator={scrollToGenerator} />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            CTA — Editorial close
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-32 sm:py-44 bg-(--z-bg) relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-radial from-(--z-gold)/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <ScrollReveal>
              <p className="label-mono text-(--z-muted) mb-8">Start creating</p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl xl:text-[110px] font-mono font-medium heading-editorial mb-8">
                From complexity,
                <br />
                <span className="text-gradient-gold">clarity.</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-sm text-(--z-muted) max-w-md mx-auto mb-12 leading-relaxed">
                Free to try — no credit card required. Paste content and
                generate your first research-backed infographic in about 60
                seconds.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <button
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: reduce ? "auto" : "smooth",
                  })
                }
                className="inline-flex items-center gap-2.5 bg-(--z-gold) px-8 py-4 text-sm font-mono font-semibold text-(--z-bg) hover:bg-(--z-gold-dim) active:scale-[0.97] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
              >
                Start generating
                <ArrowRight className="h-4 w-4" />
              </button>
            </ScrollReveal>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FOOTER — multi-column (Louvre backdrop promoted to case study)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <footer className="relative bg-[#080808] overflow-hidden">
          <div className="relative border-t border-white/[0.06]">
            <div className="mx-auto max-w-7xl px-6 pt-20 pb-12">
              {/* Large logo */}
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-9 w-9 bg-(--z-gold) flex items-center justify-center">
                    <ZignalLogo size={22} className="text-(--z-bg)" />
                  </div>
                  <span className="font-mono text-lg font-bold tracking-tight text-white">
                    ZGNAL<span className="text-white/50">.AI</span>
                  </span>
                </div>
                <p className="text-sm text-white/55 leading-relaxed max-w-md">
                  Research-backed infographics powered by a seven-stage AI
                  pipeline. 20 layouts. 20 styles. 22 trusted sources. Three
                  aspect ratios.
                </p>
              </div>

              {/* Links grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8 sm:gap-10 mb-16 sm:mb-20">
                <div>
                  <p className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-white/55 mb-5">
                    Product
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: "Infographic Lab", href: "/#main-content" },
                      { label: "API", href: "/docs#api" },
                      { label: "Pricing", href: "/pricing" },
                    ].map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="block text-xs text-white/50 hover:text-white transition-colors font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-white/55 mb-5">
                    Resources
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: "Documentation", href: "/docs" },
                      { label: "Changelog", href: "/changelog" },
                      { label: "Style Guide", href: "/styles" },
                    ].map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="block text-xs text-white/50 hover:text-white transition-colors font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-white/55 mb-5">
                    Company
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: "About", href: "/about" },
                      { label: "Contact", href: "/contact" },
                      { label: "GitHub", href: "https://github.com/Neens6655" },
                    ].map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="block text-xs text-white/50 hover:text-white transition-colors font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-white/55 mb-5">
                    Legal
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: "Privacy Policy", href: "/privacy" },
                      { label: "Terms of Service", href: "/terms" },
                    ].map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="block text-xs text-white/50 hover:text-white transition-colors font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Large ZIGNAL text */}
              <div className="mb-12 overflow-hidden">
                <div
                  aria-hidden="true"
                  style={{ "--wm": "'ZGNAL.AI'" } as React.CSSProperties}
                  className="text-[52px] sm:text-[120px] lg:text-[180px] font-mono font-bold text-white/[0.03] leading-none tracking-tighter select-none heading-editorial before:content-(--wm)"
                />
              </div>

              {/* Bottom bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
                <span className="text-[11px] text-white/55 font-mono">
                  &copy; {new Date().getFullYear()} ZGNAL.AI — All rights
                  reserved.
                </span>
                <div className="flex items-center gap-5 text-[11px] text-white/55 font-mono">
                  <a
                    href="/privacy"
                    className="hover:text-white/50 transition-colors"
                  >
                    Privacy
                  </a>
                  <a
                    href="/terms"
                    className="hover:text-white/50 transition-colors"
                  >
                    Terms
                  </a>
                  <a
                    href="https://github.com/Neens6655"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white/50 transition-colors"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* ── Conversion spine: appears after the value story, hides on offer ── */}
        <StickyCta scrollToGenerator={scrollToGenerator} />

        {/* ── Chat FAB ── */}
        <ChatFAB />
      </main>
    </MotionConfig>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════════════════ */

function Nav() {
  const reduce = useReducedMotion();
  return (
    <nav className="fixed top-0 z-50 w-full bg-[#0A0A0B]/60 backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a
          href="/"
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <div
            className="h-8 w-8 bg-gradient-to-br from-[#E8C96A] to-[#D4A84B] flex items-center justify-center shadow-[0_0_12px_rgba(212,168,75,0.25)]"
            style={{ borderRadius: "3px" }}
          >
            <ZignalLogo size={17} className="text-[#0A0A0B]" />
          </div>
          <div className="flex items-baseline gap-0">
            <span className="font-mono text-[15px] font-black tracking-tight text-white">
              ZGNAL
            </span>
            <span className="font-mono text-[15px] font-black tracking-tight text-white/25">
              .AI
            </span>
          </div>
          <span className="hidden sm:inline text-[9px] text-white/30 font-mono tracking-[0.15em] uppercase border-l border-white/[0.08] pl-3 ml-1">
            Infographic Lab
          </span>
        </a>

        <div className="flex items-center gap-6">
          {[
            { label: "Engine", href: "#pipeline" },
            { label: "Gallery", href: "#gallery" },
            { label: "Examples", href: "#examples" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hidden md:inline-flex text-xs text-white/60 hover:text-white transition-colors font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              document
                .getElementById("main-content")
                ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
            }}
            className="bg-(--z-gold) px-5 py-2 text-xs font-mono font-semibold text-(--z-bg) hover:bg-(--z-gold-dim) active:scale-[0.97] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
          >
            Try it free
          </button>
        </div>
      </div>
    </nav>
  );
}
