'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { Copy, Check, ExternalLink, ChevronRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface Section {
  id: string;
  label: string;
}

interface Endpoint {
  method: string;
  path: string;
  description: string;
  requestBody?: string;
  requestNote?: string;
  responseBody: string;
  responseNote?: string;
  curlExample?: string;
}

/* ------------------------------------------------------------------ */
/*  INLINE SVG ICONS — Bauhaus geometric, gold stroke, no fill         */
/* ------------------------------------------------------------------ */

const ICON_PROPS = {
  width: 64,
  height: 64,
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: '#D4A84B',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const ICON_PROPS_80 = {
  ...ICON_PROPS,
  width: 80,
  height: 80,
  viewBox: '0 0 64 64',
};

/* Pipeline Icons — 80x80 geometric Bauhaus */
function ShieldIcon() {
  return (
    <svg {...ICON_PROPS_80}>
      <path d="M32 6 L54 18 L54 38 C54 50 32 58 32 58 C32 58 10 50 10 38 L10 18 Z" />
      <polyline points="24,32 30,38 40,26" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg {...ICON_PROPS_80}>
      <circle cx="32" cy="32" r="24" />
      <circle cx="32" cy="32" r="4" />
      <polygon points="32,12 35,28 32,32 29,28" />
      <polygon points="32,52 29,36 32,32 35,36" />
      <polygon points="12,32 28,29 32,32 28,35" />
      <polygon points="52,32 36,35 32,32 36,29" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg {...ICON_PROPS_80}>
      <path d="M6 32 C6 32 18 14 32 14 C46 14 58 32 58 32 C58 32 46 50 32 50 C18 50 6 32 6 32 Z" />
      <circle cx="32" cy="32" r="8" />
      <circle cx="32" cy="32" r="3" />
    </svg>
  );
}

function CrosshairIcon() {
  return (
    <svg {...ICON_PROPS_80}>
      <circle cx="32" cy="32" r="20" />
      <circle cx="32" cy="32" r="10" />
      <circle cx="32" cy="32" r="2" />
      <line x1="32" y1="6" x2="32" y2="16" />
      <line x1="32" y1="48" x2="32" y2="58" />
      <line x1="6" y1="32" x2="16" y2="32" />
      <line x1="48" y1="32" x2="58" y2="32" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg {...ICON_PROPS_80}>
      <rect x="8" y="8" width="48" height="48" />
      <line x1="8" y1="24" x2="56" y2="24" />
      <line x1="8" y1="40" x2="56" y2="40" />
      <line x1="24" y1="8" x2="24" y2="56" />
      <line x1="40" y1="8" x2="40" y2="56" />
    </svg>
  );
}

function AnvilIcon() {
  return (
    <svg {...ICON_PROPS_80}>
      <rect x="24" y="8" width="16" height="24" />
      <line x1="32" y1="8" x2="32" y2="2" />
      <rect x="12" y="32" width="40" height="8" />
      <polygon points="8,40 16,40 12,52" />
      <polygon points="48,40 56,40 52,52" />
      <line x1="12" y1="52" x2="52" y2="52" />
      <rect x="20" y="52" width="24" height="6" />
    </svg>
  );
}

function FrameIcon() {
  return (
    <svg {...ICON_PROPS_80}>
      <rect x="8" y="12" width="48" height="40" />
      <rect x="14" y="18" width="36" height="28" />
      <circle cx="24" cy="34" r="6" />
      <polyline points="14,42 26,32 36,40 44,34 50,40" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const SECTIONS: Section[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'installation', label: 'Installation' },
  { id: 'project-structure', label: 'Project Structure' },
  { id: 'pipeline', label: 'Pipeline Architecture' },
  { id: 'api-reference', label: 'API Reference' },
  { id: 'input-formats', label: 'Input Formats' },
  { id: 'styles-layouts', label: 'Styles & Layouts' },
  { id: 'export-formats', label: 'Export Formats' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'contributing', label: 'Contributing' },
  { id: 'deployment', label: 'Deployment' },
];

const GITHUB_URL = 'https://github.com/Neens6655/zignal-infographic-lab';

const PIPELINE_STAGES = [
  {
    agent: 'Sentinel',
    stage: 'Extract',
    icon: <ShieldIcon />,
    functionName: 'runSentinel()',
    model: 'Gemini 2.5 Flash',
    input: 'Raw content (text | URL | file)',
    output: 'CleanPayload { text, charCount, source }',
    desc: 'Validates and extracts raw content from any input format. Parses text, URLs, YouTube links, PDFs, DOCX, PPTX, and plain text files. Normalizes encoding, strips boilerplate, and produces a clean content payload. Caps extraction at 15,000 characters.',
  },
  {
    agent: 'Oracle',
    stage: 'Analyze',
    icon: <CompassIcon />,
    functionName: 'runOracle()',
    model: 'Gemini 2.5 Flash',
    input: 'CleanPayload',
    output: 'ContentAnalysis { domain, density, tone, audience, complexity }',
    desc: 'Runs a multi-dimensional content classifier: topic domain, information density, emotional tone, audience level, and visual complexity score. These signals drive every downstream decision.',
  },
  {
    agent: 'Architect',
    stage: 'Structure',
    icon: <EyeIcon />,
    functionName: 'runArchitect()',
    model: 'Gemini 2.5 Flash',
    input: 'ContentAnalysis + CleanPayload',
    output: 'Blueprint { sections, hierarchy, readingPath, typography }',
    desc: 'Creates the section hierarchy, assigns content to grid regions, defines the visual reading path, and sets typographic scale. Outputs a structured JSON blueprint consumed by the Assembler.',
  },
  {
    agent: 'Compliance',
    stage: 'Validate',
    icon: <CrosshairIcon />,
    functionName: 'runCompliance()',
    model: 'Rule engine (no LLM)',
    input: 'Blueprint + ContentAnalysis',
    output: 'ComplianceResult { score, violations, corrections }',
    desc: 'Validates the blueprint against layout constraints, text density rules, and accessibility requirements. Scores the design and flags violations. Pure deterministic scoring, no LLM involved.',
  },
  {
    agent: 'Assembler',
    stage: 'Prompt',
    icon: <GridIcon />,
    functionName: 'runAssembler()',
    model: 'Template engine (no LLM)',
    input: 'Blueprint + style refs + layout refs',
    output: 'MegaPrompt { system, user, references[] }',
    desc: 'Injects 41 reference files (layout guide, style guide, base prompt) into a single mega-prompt with style tokens, color palettes, typography specs, and composition rules. This is the DNA of output quality.',
  },
  {
    agent: 'Renderer',
    stage: 'Generate',
    icon: <AnvilIcon />,
    functionName: 'runRenderer()',
    model: 'Gemini 2.5 Flash (image)',
    input: 'MegaPrompt',
    output: 'GeneratedImage { base64, width, height }',
    desc: 'Sends the assembled prompt to Gemini with image generation mode. Returns a print-resolution infographic with embedded text. Average render time: 45 seconds.',
  },
  {
    agent: 'Provenance',
    stage: 'Trace',
    icon: <FrameIcon />,
    functionName: 'runProvenance()',
    model: 'Hash + metadata (no LLM)',
    input: 'GeneratedImage + all stage outputs',
    output: 'ProvenanceRecord { seed, hash, stages, sources, score }',
    desc: 'Generates a full trace of the generation pipeline: content hash, seed, all stage timings, research sources used, compliance score, and reference files injected. Enables reproducibility and auditing.',
  },
];

const ENDPOINTS: Endpoint[] = [
  {
    method: 'POST',
    path: '/api/generate',
    description: 'Main generation endpoint. Accepts content and options, returns an SSE stream with progress events and the final generated infographic.',
    requestBody: `{
  "content": "string — raw text or extracted content",
  "preset": "auto | executive-summary | strategy-framework | ...",
  "style": "executive-institutional | deconstruct | bold-graphic | ...",
  "layout": "bento-grid | hub-spoke | dashboard | ...",
  "aspect_ratio": "16:9 | 9:16 | 1:1",
  "quality": "normal",
  "language": "en"
}`,
    responseBody: `event: progress
data: {"stage": "sentinel", "progress": 15, "message": "Analyzing content..."}

event: progress
data: {"stage": "oracle", "progress": 42, "message": "Classifying content..."}

event: progress
data: {"stage": "renderer", "progress": 85, "message": "Generating image..."}

event: complete
data: {
  "image": "data:image/png;base64,iVBOR...",
  "metadata": {
    "layout": "bento-grid",
    "style": "executive-institutional",
    "compliance_score": 0.94
  },
  "provenance": { "seed": 42, "hash": "a1b2c3..." }
}`,
    responseNote: 'The stream emits progress events for each pipeline stage, a complete event with the base64 image + metadata + provenance, or an error event if generation fails.',
    curlExample: `curl -X POST https://zgnal.ai/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Your text content here",
    "preset": "auto",
    "aspect_ratio": "16:9"
  }'`,
  },
  {
    method: 'GET',
    path: '/api/jobs/:id',
    description: 'Poll the status of a generation job. Returns current progress, result (when complete), or error details.',
    responseBody: `{
  "id": "job_abc123",
  "status": "pending | processing | complete | error",
  "progress": 65,
  "result": {
    "image": "data:image/png;base64,...",
    "metadata": { ... }
  },
  "error": null
}`,
    curlExample: `curl https://zgnal.ai/api/jobs/job_abc123`,
  },
  {
    method: 'POST',
    path: '/api/extract-file',
    description: 'Extract text content from uploaded files. Accepts PDF, DOCX, PPTX, TXT, MD, CSV, and JSON files up to 10MB.',
    requestNote: 'Send as multipart/form-data with a "file" field.',
    responseBody: `{
  "text": "extracted content...",
  "charCount": 4521
}`,
    curlExample: `curl -X POST https://zgnal.ai/api/extract-file \\
  -F "file=@report.pdf"`,
  },
  {
    method: 'POST',
    path: '/api/extract-url',
    description: 'Scrape and extract text content from a web page URL.',
    requestBody: `{
  "url": "https://example.com/article"
}`,
    responseBody: `{
  "text": "extracted article content...",
  "title": "Article Title",
  "source": "example.com"
}`,
    curlExample: `curl -X POST https://zgnal.ai/api/extract-url \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com/article"}'`,
  },
  {
    method: 'POST',
    path: '/api/improve-prompt',
    description: 'Enhance a rough content brief into a structured, optimized prompt for better generation results.',
    requestBody: `{
  "content": "rough brief text"
}`,
    responseBody: `{
  "improved": "Enhanced, structured brief with clear sections..."
}`,
    curlExample: `curl -X POST https://zgnal.ai/api/improve-prompt \\
  -H "Content-Type: application/json" \\
  -d '{"content": "rough brief text"}'`,
  },
  {
    method: 'GET',
    path: '/api/catalog',
    description: 'Returns all available presets, layouts, and styles. Use this to populate option pickers in your UI.',
    responseBody: `{
  "presets": [
    { "id": "executive-summary", "label": "Executive Summary", "layout": "dashboard", "style": "executive-institutional" },
    ...
  ],
  "layouts": [
    { "id": "bento-grid", "label": "Bento Grid", "category": "grid" },
    ...
  ],
  "styles": [
    { "id": "executive-institutional", "label": "Executive Institutional", "category": "professional" },
    ...
  ]
}`,
    curlExample: `curl https://zgnal.ai/api/catalog`,
  },
];

const STYLES_TABLE = [
  ['executive-institutional', 'Professional', 'Corporate reports, board decks'],
  ['bold-graphic', 'Creative', 'Social media, marketing materials'],
  ['deconstruct', 'Experimental', 'Art direction, editorial spreads'],
  ['neo-bauhaus', 'Geometric', 'Technical docs, architecture'],
  ['data-ink', 'Analytical', 'Data-heavy content, research'],
  ['swiss-minimal', 'Minimal', 'Clean presentations, summaries'],
  ['retro-terminal', 'Tech', 'Developer content, changelogs'],
  ['paper-craft', 'Organic', 'Education, storytelling'],
  ['blueprint', 'Technical', 'Engineering, specifications'],
  ['neon-dark', 'Bold', 'Gaming, entertainment, tech'],
  ['editorial-serif', 'Editorial', 'Long-form articles, essays'],
  ['gradient-mesh', 'Modern', 'Startup pitches, product launches'],
  ['isometric', '3D', 'Process flows, system architecture'],
  ['collage', 'Mixed media', 'Creative briefs, mood boards'],
  ['watercolor', 'Artistic', 'Lifestyle, wellness, culture'],
  ['pixel-grid', 'Retro', 'Gaming, nostalgia, tech history'],
  ['monochrome', 'Minimal', 'Professional, elegant, timeless'],
  ['pop-art', 'Bold', 'Marketing, social media, campaigns'],
  ['line-art', 'Illustrative', 'Explainers, tutorials, guides'],
  ['glassmorphism', 'Modern', 'SaaS, apps, product features'],
];

const LAYOUTS_TABLE = [
  ['bento-grid', 'Grid', 'Multi-section content, dashboards'],
  ['hub-spoke', 'Radial', 'Central concept with branches'],
  ['dashboard', 'Grid', 'KPIs, metrics, data summaries'],
  ['timeline', 'Linear', 'Chronological events, history'],
  ['comparison', 'Split', 'Versus, pros/cons, before/after'],
  ['pyramid', 'Hierarchy', 'Priority levels, funnels'],
  ['flowchart', 'Process', 'Step-by-step workflows'],
  ['magazine', 'Editorial', 'Article summaries, digests'],
  ['cards', 'Grid', 'Feature lists, team bios'],
  ['kanban', 'Columns', 'Status boards, categorization'],
  ['mind-map', 'Radial', 'Brainstorms, topic exploration'],
  ['split-screen', 'Binary', 'Two-sided arguments, A/B'],
  ['hero-stack', 'Vertical', 'Single narrative, storytelling'],
  ['quadrant', 'Matrix', '2x2 frameworks, positioning'],
  ['accordion', 'Vertical', 'FAQ, expandable sections'],
  ['mosaic', 'Irregular', 'Photo-heavy, visual stories'],
  ['sidebar', 'Asymmetric', 'Main content + supporting data'],
  ['circular', 'Radial', 'Cycles, recurring processes'],
  ['waterfall', 'Cascading', 'Sequential dependencies'],
  ['infographic-strip', 'Vertical', 'Social media stories, scrolling'],
];

const ENV_VARS = [
  { name: 'GOOGLE_API_KEY', required: true, description: 'Gemini API key for text analysis and image generation' },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: false, description: 'Supabase project URL for auth and storage' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: false, description: 'Supabase anonymous key for client-side auth' },
  { name: 'EXA_API_KEY', required: false, description: 'Exa API key for web search in research stage' },
  { name: 'FIRECRAWL_API_KEY', required: false, description: 'Firecrawl key for deep content extraction' },
];

const EXPORT_TABLE = [
  { format: 'PNG', type: 'Lossless', useCase: 'Social media, presentations, highest quality' },
  { format: 'JPEG', type: 'Compressed', useCase: 'Web, email, smaller file size' },
  { format: 'PDF', type: 'Document', useCase: 'Print, reports, archival' },
  { format: 'PPTX', type: 'Editable', useCase: 'PowerPoint decks, further editing' },
];

/* ------------------------------------------------------------------ */
/*  REUSABLE COMPONENTS                                                */
/* ------------------------------------------------------------------ */

function SectionDivider() {
  return <div className="h-px bg-gradient-to-r from-[#D4A84B]/40 via-[#D4A84B]/10 to-transparent" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-mono font-semibold tracking-[0.25em] uppercase text-[#D4A84B] mb-6">
      {children}
    </p>
  );
}

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.05 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function DotGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.04]"
      style={{
        backgroundImage: 'radial-gradient(circle, #D4A84B 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  CODE BLOCK WITH COPY + OPTIONAL LANGUAGE TABS                      */
/* ------------------------------------------------------------------ */

function CodeBlock({
  code,
  language = 'json',
  title,
  tabs,
}: {
  code: string;
  language?: string;
  title?: string;
  tabs?: { label: string; code: string; language?: string }[];
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const displayCode = tabs ? tabs[activeTab].code : code;
  const displayLang = tabs ? (tabs[activeTab].language || 'bash') : language;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [displayCode]);

  return (
    <div className="border border-white/[0.06] bg-[#0D0D0F] relative overflow-hidden my-4">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-[#0A0A0C]">
        <div className="flex items-center gap-3">
          {/* Language badge */}
          <span className="text-[9px] font-mono font-semibold tracking-[0.15em] uppercase text-[#D4A84B]/60">
            {displayLang}
          </span>
          {title && (
            <span className="text-[10px] font-mono text-white/30">
              {title}
            </span>
          )}
        </div>
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] font-mono text-white/30 hover:text-[#D4A84B] transition-colors"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1 text-[#D4A84B]"
              >
                <Check size={12} /> Copied
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1"
              >
                <Copy size={12} /> Copy
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Optional tabs */}
      {tabs && (
        <div className="flex border-b border-white/[0.06] bg-[#08080A]">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setActiveTab(i)}
              className={`
                relative px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider uppercase transition-all duration-200
                ${activeTab === i ? 'text-[#D4A84B] bg-[#0D0D0F]' : 'text-white/30 hover:text-white/50'}
              `}
            >
              {activeTab === i && (
                <motion.div
                  layoutId="code-tab-indicator"
                  className="absolute top-0 left-0 right-0 h-[2px] bg-[#D4A84B]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Code content */}
      <pre className="px-5 py-4 text-[13px] font-mono overflow-x-auto leading-[1.7]">
        {highlightCode(displayCode, displayLang)}
      </pre>
    </div>
  );
}

function highlightCode(code: string, language: string): React.ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, li) => {
    let content: React.ReactNode;

    if (language === 'json' || language === 'jsonc') {
      content = highlightJsonLine(line, li);
    } else if (language === 'bash' || language === 'shell') {
      content = highlightBashLine(line, li);
    } else if (language === 'sse') {
      content = highlightSseLine(line, li);
    } else {
      content = <span className="text-white/50">{line}</span>;
    }

    return (
      <span key={`line-${li}`}>
        {content}
        {li < lines.length - 1 ? '\n' : ''}
      </span>
    );
  });
}

function highlightJsonLine(line: string, li: number): React.ReactNode {
  // Comments
  if (/^\s*\/\//.test(line)) {
    return <span className="text-white/25 italic">{line}</span>;
  }

  const parts: React.ReactNode[] = [];
  let remaining = line;
  let lastIndex = 0;
  let keyIdx = 0;

  const keyRegex = /("[\w_]+")\s*:/g;
  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = keyRegex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`b${li}-${keyIdx}`} className="text-white/30">{remaining.slice(lastIndex, match.index)}</span>);
    }
    parts.push(<span key={`k${li}-${keyIdx}`} className="text-[#D4A84B]">{match[1]}</span>);
    parts.push(<span key={`c${li}-${keyIdx}`} className="text-white/30">:</span>);
    lastIndex = match.index + match[0].length;
    keyIdx++;
  }

  if (keyIdx === 0) {
    // event: or data: lines (SSE mixed in JSON)
    if (/^event:/.test(line)) {
      return <span className="text-[#D4A84B]/70">{line}</span>;
    }
    if (/^\s*data:/.test(line)) {
      return (
        <span>
          <span className="text-[#D4A84B]/50">data:</span>
          <span className="text-white/40">{line.replace(/^\s*data:/, '')}</span>
        </span>
      );
    }
    // "..." or standalone values
    if (/^\s*"/.test(line)) {
      return <span className="text-white/50">{line}</span>;
    }
    return <span className="text-white/30">{line}</span>;
  }

  if (lastIndex < remaining.length) {
    const rest = remaining.slice(lastIndex);
    const valMatch = rest.match(/^(\s*)("[^"]*")(.*)/);
    if (valMatch) {
      parts.push(<span key={`sp${li}`} className="text-white/30">{valMatch[1]}</span>);
      parts.push(<span key={`sv${li}`} className="text-white/60">{valMatch[2]}</span>);
      parts.push(<span key={`sr${li}`} className="text-white/30">{valMatch[3]}</span>);
    } else {
      // numbers, booleans, etc.
      const numMatch = rest.match(/^(\s*)([\d.]+|true|false|null)(.*)/);
      if (numMatch) {
        parts.push(<span key={`sp${li}`} className="text-white/30">{numMatch[1]}</span>);
        parts.push(<span key={`nv${li}`} className="text-[#7EC8E3]">{numMatch[2]}</span>);
        parts.push(<span key={`nr${li}`} className="text-white/30">{numMatch[3]}</span>);
      } else {
        parts.push(<span key={`r${li}`} className="text-white/50">{rest}</span>);
      }
    }
  }

  return <>{parts}</>;
}

function highlightBashLine(line: string, _li: number): React.ReactNode {
  // Comments
  if (/^\s*#/.test(line)) {
    return <span className="text-white/25 italic">{line}</span>;
  }
  // Variable assignments
  const envMatch = line.match(/^(\s*)([\w_]+)(=)(.*)/);
  if (envMatch) {
    return (
      <span>
        <span className="text-white/30">{envMatch[1]}</span>
        <span className="text-[#D4A84B]">{envMatch[2]}</span>
        <span className="text-white/30">{envMatch[3]}</span>
        <span className="text-white/60">{envMatch[4]}</span>
      </span>
    );
  }
  // Commands at start of line
  const cmdMatch = line.match(/^(\s*)(git|npm|npx|cd|cp|curl|bun|node|open|mkdir)\b(.*)/);
  if (cmdMatch) {
    return (
      <span>
        <span className="text-white/30">{cmdMatch[1]}</span>
        <span className="text-[#D4A84B]">{cmdMatch[2]}</span>
        <span className="text-white/50">{cmdMatch[3]}</span>
      </span>
    );
  }
  // Flags
  const flagged = line.replace(/(--?\w[\w-]*)/g, '\x00FLAG\x00$1\x00ENDFLAG\x00');
  if (flagged.includes('\x00FLAG\x00')) {
    const segs = flagged.split('\x00');
    return (
      <span>
        {segs.map((seg, i) => {
          if (seg === 'FLAG') return null;
          if (seg === 'ENDFLAG') return null;
          if (segs[i - 1] === 'FLAG') {
            return <span key={i} className="text-[#7EC8E3]">{seg}</span>;
          }
          return <span key={i} className="text-white/50">{seg}</span>;
        })}
      </span>
    );
  }
  return <span className="text-white/50">{line}</span>;
}

function highlightSseLine(line: string, _li: number): React.ReactNode {
  if (/^event:/.test(line)) {
    return <span className="text-[#D4A84B]/80 font-semibold">{line}</span>;
  }
  if (/^data:/.test(line)) {
    return (
      <span>
        <span className="text-[#D4A84B]/50 font-semibold">data:</span>
        <span className="text-white/50">{line.slice(5)}</span>
      </span>
    );
  }
  return <span className="text-white/30">{line}</span>;
}

/* ------------------------------------------------------------------ */
/*  TABLE COMPONENT                                                    */
/* ------------------------------------------------------------------ */

function DocTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-[#D4A84B]/30">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-[11px] font-mono font-bold tracking-[0.1em] uppercase text-[#D4A84B] bg-[#D4A84B]/[0.04]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={`border-b border-white/[0.04] ${ri % 2 === 1 ? 'bg-white/[0.01]' : ''}`}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-4 py-3 text-[13px] ${ci === 0 ? 'font-mono text-white/70' : 'text-white/45'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HERO PIPELINE FLOW DIAGRAM                                         */
/* ------------------------------------------------------------------ */

function HeroPipelineFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.05 });

  const stages = [
    { label: 'Sentinel', icon: 'M8 4 L16 10 L16 22 C16 28 8 32 8 32 C8 32 0 28 0 22 L0 10 Z' },
    { label: 'Oracle', icon: 'M8 0 A8 8 0 1 1 8 16 A8 8 0 1 1 8 0 M8 4 A4 4 0 1 1 8 12' },
    { label: 'Architect', icon: 'M0 8 C0 8 5 0 8 0 C11 0 16 8 16 8 C16 8 11 16 8 16 C5 16 0 8 0 8 Z M8 5 A3 3 0 1 1 8 11' },
    { label: 'Compliance', icon: 'M8 0 A8 8 0 1 0 8.01 0 M8 3 A5 5 0 1 0 8.01 3 M8 8 L8 8.01' },
    { label: 'Assembler', icon: 'M0 0 H16 V16 H0 Z M0 8 H16 M8 0 V16' },
    { label: 'Renderer', icon: 'M5 0 H11 V10 H16 L8 16 L0 10 H5 Z' },
    { label: 'Provenance', icon: 'M0 2 H16 V14 H0 Z M2 4 H14 V12 H2 Z M4 8 A2 2 0 1 0 4.01 8' },
  ];

  return (
    <div ref={ref} className="mt-10 mb-4">
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {stages.map((stage, i) => (
          <div key={stage.label} className="flex items-center shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col items-center"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 border border-[#D4A84B]/30 flex items-center justify-center bg-[#D4A84B]/[0.03]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="#D4A84B"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-60"
                >
                  <path d={stage.icon} />
                </svg>
              </div>
              <span className="mt-2 text-[7px] sm:text-[8px] font-mono text-white/30 tracking-[0.1em] uppercase">
                {stage.label}
              </span>
            </motion.div>

            {i < stages.length - 1 && (
              <motion.div
                className="flex items-center mx-0.5 sm:mx-1.5"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <svg width="24" height="2" className="hidden sm:block">
                  <motion.line
                    x1="0" y1="1" x2="24" y2="1"
                    stroke="#D4A84B" strokeWidth="1" strokeDasharray="4 3"
                    initial={{ pathLength: 0 }}
                    animate={inView ? { pathLength: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.12 }}
                  />
                </svg>
                <svg width="16" height="2" className="sm:hidden">
                  <motion.line
                    x1="0" y1="1" x2="16" y2="1"
                    stroke="#D4A84B" strokeWidth="1" strokeDasharray="3 2"
                    initial={{ pathLength: 0 }}
                    animate={inView ? { pathLength: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.12 }}
                  />
                </svg>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SIDEBAR TOC                                                        */
/* ------------------------------------------------------------------ */

function SidebarTOC({ activeId }: { activeId: string }) {
  return (
    <nav className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-40 w-44">
      <ul className="space-y-0.5">
        {SECTIONS.map((s) => {
          const isActive = activeId === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`
                  group flex items-center gap-3 py-1.5 text-[10px] font-mono transition-all duration-300
                  ${isActive ? 'text-[#D4A84B]' : 'text-white/25 hover:text-white/50'}
                `}
              >
                <span
                  className={`
                    block h-px transition-all duration-300
                    ${isActive ? 'w-6 bg-[#D4A84B]' : 'w-3 bg-white/20 group-hover:w-5 group-hover:bg-white/40'}
                  `}
                />
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  PIPELINE SECTION                                                   */
/* ------------------------------------------------------------------ */

function PipelineSection() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.05 });

  return (
    <div ref={containerRef} className="relative">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(#D4A84B 1px, transparent 1px), linear-gradient(90deg, #D4A84B 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Desktop horizontal pipeline */}
      <div className="hidden md:block overflow-x-auto pb-6 -mx-2 relative">
        <div className="flex items-start gap-0 min-w-[1000px] px-2">
          {PIPELINE_STAGES.map((agent, i) => (
            <div key={agent.agent} className="flex items-start">
              <motion.button
                initial={{ opacity: 0, y: 32 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                className="relative group flex flex-col items-center w-[130px] shrink-0 cursor-pointer transition-all duration-300"
              >
                <div
                  className={`
                    w-20 h-20 border-2 flex items-center justify-center transition-all duration-300 bg-[#0A0A0B] relative overflow-hidden
                    ${expandedIdx === i ? 'border-[#D4A84B] text-[#D4A84B] shadow-[0_0_32px_rgba(212,168,75,0.25)]' : 'border-white/10 text-white/40 group-hover:border-[#D4A84B]/50 group-hover:text-[#D4A84B]/70'}
                  `}
                >
                  <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-300 ${expandedIdx === i ? 'border-[#D4A84B]' : 'border-white/10 group-hover:border-[#D4A84B]/40'}`} />
                  <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-300 ${expandedIdx === i ? 'border-[#D4A84B]' : 'border-white/10 group-hover:border-[#D4A84B]/40'}`} />
                  <div className="scale-[0.55]">{agent.icon}</div>
                </div>

                <span className="mt-3 text-[11px] font-mono font-bold text-white tracking-wide">
                  {agent.agent}
                </span>
                <span className="text-[9px] font-mono text-white/30 tracking-[0.15em] uppercase mt-0.5">
                  {agent.stage}
                </span>

                <span
                  className={`absolute -top-2 -right-1 text-[8px] font-mono px-1.5 py-0.5 transition-colors duration-300 ${expandedIdx === i ? 'bg-[#D4A84B] text-[#0A0A0B]' : 'bg-white/5 text-white/20'}`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </motion.button>

              {i < PIPELINE_STAGES.length - 1 && (
                <div className="flex items-center h-20 shrink-0">
                  <svg width="36" height="2" className="overflow-visible">
                    <motion.line
                      x1="0" y1="1" x2="36" y2="1"
                      stroke="#D4A84B" strokeWidth="1.5" strokeDasharray="6 4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={isInView ? { pathLength: 1, opacity: 0.5 } : {}}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                    />
                  </svg>
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={isInView ? { opacity: 0.5, x: 0 } : {}}
                    transition={{ delay: 0.6 + i * 0.12 }}
                    className="text-[#D4A84B] -ml-1.5 text-xs"
                  >
                    &#9654;
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile vertical list */}
      <div className="md:hidden space-y-3 relative">
        {PIPELINE_STAGES.map((agent, i) => (
          <Reveal key={agent.agent} delay={i * 0.06}>
            <button
              onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
              className="w-full text-left"
            >
              <div
                className={`
                  flex items-center gap-4 p-4 border transition-all duration-300
                  ${expandedIdx === i ? 'border-[#D4A84B]/40 bg-[#D4A84B]/[0.04]' : 'border-white/[0.06] bg-white/[0.01]'}
                `}
              >
                <div
                  className={`
                    w-12 h-12 border-2 flex items-center justify-center shrink-0 transition-colors
                    ${expandedIdx === i ? 'border-[#D4A84B] text-[#D4A84B]' : 'border-white/10 text-white/40'}
                  `}
                >
                  <div className="scale-[0.4]">{agent.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{agent.agent}</span>
                    <span className="text-[9px] font-mono text-white/30 tracking-[0.15em] uppercase">
                      {agent.stage}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed mt-0.5 truncate">{agent.desc.slice(0, 80)}...</p>
                </div>
                <span
                  className={`
                    text-white/20 text-xs font-mono transition-transform duration-300
                    ${expandedIdx === i ? 'rotate-90' : ''}
                  `}
                >
                  &#9654;
                </span>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {/* Expanded detail panel */}
      <AnimatePresence mode="wait">
        {expandedIdx !== null && (
          <motion.div
            key={expandedIdx}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="mt-6 p-6 border border-[#D4A84B]/20 bg-[#D4A84B]/[0.03] relative">
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.015]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, #D4A84B, #D4A84B 1px, transparent 1px, transparent 3px)',
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="scale-[0.35] -m-4">
                    {PIPELINE_STAGES[expandedIdx].icon}
                  </div>
                  <span className="font-mono font-bold text-white text-sm ml-2">{PIPELINE_STAGES[expandedIdx].agent}</span>
                  <span className="text-[9px] font-mono text-[#D4A84B]/60 tracking-[0.15em] uppercase">
                    Stage {String(expandedIdx + 1).padStart(2, '0')} / {PIPELINE_STAGES[expandedIdx].stage}
                  </span>
                </div>
                <p className="text-sm text-white/50 leading-relaxed mb-4">{PIPELINE_STAGES[expandedIdx].desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#D4A84B]/10">
                  <div>
                    <p className="text-[9px] font-mono text-[#D4A84B]/60 tracking-[0.15em] uppercase mb-1">Function</p>
                    <code className="text-xs font-mono text-white/70">{PIPELINE_STAGES[expandedIdx].functionName}</code>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-[#D4A84B]/60 tracking-[0.15em] uppercase mb-1">Model</p>
                    <code className="text-xs font-mono text-white/70">{PIPELINE_STAGES[expandedIdx].model}</code>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-[#D4A84B]/60 tracking-[0.15em] uppercase mb-1">Output</p>
                    <code className="text-xs font-mono text-white/70">{PIPELINE_STAGES[expandedIdx].output}</code>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  API ENDPOINT COMPONENT                                             */
/* ------------------------------------------------------------------ */

function ApiEndpoint({ endpoint }: { endpoint: Endpoint }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Reveal>
      <div className="border border-white/[0.06] mb-4">
        {/* Header — always visible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-white/[0.01] transition-colors"
        >
          <span
            className={`
              inline-block px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider
              ${endpoint.method === 'GET' ? 'bg-[#2D5A27]/30 text-[#7EC87E]' : 'bg-[#D4A84B]/10 text-[#D4A84B]'}
            `}
          >
            {endpoint.method}
          </span>
          <code className="text-sm font-mono text-white/80">{endpoint.path}</code>
          <span className="ml-auto text-white/20">
            <ChevronRight
              size={16}
              className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            />
          </span>
        </button>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-white/[0.04]">
                <p className="text-sm text-white/45 leading-relaxed mt-4 mb-4">{endpoint.description}</p>

                {endpoint.requestNote && (
                  <p className="text-xs text-white/30 italic mb-3">{endpoint.requestNote}</p>
                )}

                {endpoint.requestBody && (
                  <>
                    <p className="text-[10px] font-mono font-semibold tracking-[0.15em] uppercase text-[#D4A84B]/60 mb-2">Request Body</p>
                    <CodeBlock code={endpoint.requestBody} language="json" />
                  </>
                )}

                <p className="text-[10px] font-mono font-semibold tracking-[0.15em] uppercase text-[#D4A84B]/60 mb-2 mt-4">Response</p>
                <CodeBlock code={endpoint.responseBody} language={endpoint.path === '/api/generate' ? 'sse' : 'json'} />

                {endpoint.responseNote && (
                  <p className="text-xs text-white/35 leading-relaxed mt-2">{endpoint.responseNote}</p>
                )}

                {endpoint.curlExample && (
                  <>
                    <p className="text-[10px] font-mono font-semibold tracking-[0.15em] uppercase text-[#D4A84B]/60 mb-2 mt-4">cURL Example</p>
                    <CodeBlock code={endpoint.curlExample} language="bash" />
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/*  EDIT ON GITHUB LINK                                                */
/* ------------------------------------------------------------------ */

function EditOnGithub({ section }: { section: string }) {
  return (
    <a
      href={`${GITHUB_URL}/edit/main/src/app/(pages)/docs/DocsClient.tsx`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white/20 hover:text-[#D4A84B]/60 transition-colors mt-6"
    >
      Edit &ldquo;{section}&rdquo; on GitHub <ExternalLink size={10} />
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN DOCS PAGE — CLIENT COMPONENT                                  */
/* ------------------------------------------------------------------ */

export default function DocsClient() {
  const [activeSection, setActiveSection] = useState('quick-start');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(s.id);
            }
          });
        },
        { rootMargin: '-20% 0px -70% 0px' },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      <SidebarTOC activeId={activeSection} />

      <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28 lg:pl-56 relative">

        {/* ================================================================ */}
        {/*  HERO                                                            */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-20 relative"
        >
          <DotGrid />

          <p className="text-[10px] font-mono font-semibold tracking-[0.25em] uppercase text-[#D4A84B] mb-4 relative">
            Documentation
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-mono font-bold text-white leading-tight mb-6 relative">
            Documentation
          </h1>
          <p className="text-base sm:text-lg text-white/45 leading-relaxed max-w-2xl relative mb-8">
            Everything you need to build with ZGNAL.AI — from quick start to API reference.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-4 relative mb-6">
            <a
              href="#quick-start"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('quick-start')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A84B] text-[#0A0A0B] font-mono font-bold text-sm hover:bg-[#C49A3F] transition-colors"
            >
              Quick Start
              <ChevronRight size={16} />
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/20 text-white/70 font-mono font-bold text-sm hover:border-[#D4A84B]/50 hover:text-white transition-colors"
            >
              View on GitHub
              <ExternalLink size={14} />
            </a>

            {/* GitHub stars badge */}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-white/40 hover:text-[#D4A84B] hover:border-[#D4A84B]/30 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
              </svg>
              Star on GitHub
            </a>
          </div>

          <HeroPipelineFlow />
        </motion.div>

        {/* ================================================================ */}
        {/*  QUICK START                                                     */}
        {/* ================================================================ */}
        <section id="quick-start" className="mb-24 scroll-mt-24">
          <SectionDivider />
          <div className="mt-8">
            <SectionLabel>Quick Start</SectionLabel>
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white mb-3">
                Get running in 4 steps
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-sm text-white/45 leading-relaxed mb-8 max-w-xl">
                Clone, install, configure, and start generating infographics locally.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 border-2 border-[#D4A84B] flex items-center justify-center bg-[#0A0A0B] text-[#D4A84B] font-mono font-bold text-[10px]">1</span>
                  <span className="text-sm font-mono font-bold text-white">Clone the repository</span>
                </div>
                <CodeBlock
                  code={`git clone ${GITHUB_URL}.git\ncd zignal-infographic-lab`}
                  language="bash"
                />
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="space-y-2 mt-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 border-2 border-[#D4A84B] flex items-center justify-center bg-[#0A0A0B] text-[#D4A84B] font-mono font-bold text-[10px]">2</span>
                  <span className="text-sm font-mono font-bold text-white">Install dependencies</span>
                </div>
                <CodeBlock
                  code="npm install"
                  language="bash"
                />
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="space-y-2 mt-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 border-2 border-[#D4A84B] flex items-center justify-center bg-[#0A0A0B] text-[#D4A84B] font-mono font-bold text-[10px]">3</span>
                  <span className="text-sm font-mono font-bold text-white">Set up environment</span>
                </div>
                <CodeBlock
                  code={`cp .env.example .env.local\n# Add your Google API key\nGOOGLE_API_KEY=your_gemini_api_key_here`}
                  language="bash"
                />
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="space-y-2 mt-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 border-2 border-[#D4A84B] flex items-center justify-center bg-[#0A0A0B] text-[#D4A84B] font-mono font-bold text-[10px]">4</span>
                  <span className="text-sm font-mono font-bold text-white">Start development</span>
                </div>
                <CodeBlock
                  code={`npm run dev\n# Open http://localhost:3000`}
                  language="bash"
                />
              </div>
            </Reveal>

            <EditOnGithub section="Quick Start" />
          </div>
        </section>

        {/* ================================================================ */}
        {/*  INSTALLATION                                                    */}
        {/* ================================================================ */}
        <section id="installation" className="mb-24 scroll-mt-24">
          <SectionDivider />
          <div className="mt-8">
            <SectionLabel>Installation</SectionLabel>
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white mb-3">
                Prerequisites & Environment
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-sm text-white/45 leading-relaxed mb-6 max-w-xl">
                Requirements and environment variable configuration.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mb-8">
                <h3 className="text-base font-mono font-bold text-white mb-3">Prerequisites</h3>
                <ul className="space-y-2 text-sm text-white/45">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#D4A84B]" />
                    <span><strong className="text-white/70">Node.js 18+</strong> — Required runtime</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#D4A84B]" />
                    <span><strong className="text-white/70">npm</strong> or <strong className="text-white/70">bun</strong> — Package manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#D4A84B]" />
                    <span><strong className="text-white/70">Google API Key</strong> — For Gemini text + image generation</span>
                  </li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <h3 className="text-base font-mono font-bold text-white mb-3">Environment Variables</h3>
              <DocTable
                headers={['Variable', 'Required', 'Description']}
                rows={ENV_VARS.map((v) => [
                  <code key={v.name} className="text-[12px]">{v.name}</code>,
                  v.required ? (
                    <span key={`req-${v.name}`} className="text-[#D4A84B] font-mono font-bold text-[11px]">Yes</span>
                  ) : (
                    <span key={`req-${v.name}`} className="text-white/30 font-mono text-[11px]">No</span>
                  ),
                  v.description,
                ])}
              />
            </Reveal>

            <EditOnGithub section="Installation" />
          </div>
        </section>

        {/* ================================================================ */}
        {/*  PROJECT STRUCTURE                                               */}
        {/* ================================================================ */}
        <section id="project-structure" className="mb-24 scroll-mt-24">
          <SectionDivider />
          <div className="mt-8">
            <SectionLabel>Project Structure</SectionLabel>
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white mb-3">
                Codebase layout
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-sm text-white/45 leading-relaxed mb-6 max-w-xl">
                Key directories and files in the project.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <CodeBlock
                language="bash"
                title="File tree"
                code={`src/
  app/
    page.tsx                    # Landing page + generator
    chat/                       # Conversational interface
    dashboard/                  # User history
    (pages)/                    # Info pages (about, docs, pricing)
    api/
      generate/route.ts         # POST - main generation (SSE)
      improve-prompt/route.ts   # POST - enhance brief
      extract-file/route.ts     # POST - PDF/DOCX parsing
      extract-url/route.ts      # POST - web scraping
      extract-video/route.ts    # POST - YouTube transcripts
      catalog/route.ts          # GET  - presets/layouts/styles
      jobs/[id]/route.ts        # GET  - poll job status
      jobs/[id]/stream/route.ts # GET  - SSE progress stream
  components/
    generator/                  # ContentInput, OptionsPanel, ResultViewer
    chat/                       # Chat interface components
    ui/                         # Radix-based primitives (Button, Card, etc.)
  hooks/
    use-generate.ts             # Generation state machine
    use-chat.ts                 # Chat management
  lib/
    pipeline.ts                 # 7-stage Gemini pipeline (THE CORE)
    engine.ts                   # API client
    constants.ts                # Presets, ratios, limits
    references/                 # 41 prompt reference files
      base-prompt.md            # Text rendering rules (DO NOT MODIFY)
      layouts/                  # 20 layout definitions
      styles/                   # 20 style definitions`}
              />
            </Reveal>

            <EditOnGithub section="Project Structure" />
          </div>
        </section>

        {/* ================================================================ */}
        {/*  PIPELINE ARCHITECTURE                                           */}
        {/* ================================================================ */}
        <section id="pipeline" className="mb-24 scroll-mt-24">
          <SectionDivider />
          <div className="mt-8">
            <SectionLabel>Pipeline Architecture</SectionLabel>
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white mb-3">
                Seven stages. One pipeline.
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-sm text-white/45 leading-relaxed mb-6 max-w-xl">
                Each generation passes through seven sequential stages. Click any node to see the function name, model used, and input/output types.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-xs text-white/30 leading-relaxed mb-8 max-w-xl">
                All stages run inline on Vercel serverless functions. The full pipeline source is in{' '}
                <code className="text-white/50 font-mono text-[11px]">src/lib/pipeline.ts</code>.
              </p>
            </Reveal>
            <PipelineSection />
            <EditOnGithub section="Pipeline Architecture" />
          </div>
        </section>

        {/* ================================================================ */}
        {/*  API REFERENCE                                                   */}
        {/* ================================================================ */}
        <section id="api-reference" className="mb-24 scroll-mt-24">
          <SectionDivider />
          <div className="mt-8">
            <SectionLabel>API Reference</SectionLabel>
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white mb-3">
                Endpoints
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-sm text-white/45 leading-relaxed mb-4 max-w-xl">
                All API routes are Next.js Route Handlers. The main generation endpoint streams SSE events; all others return JSON.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-xs text-white/30 leading-relaxed mb-8 max-w-xl">
                Base URL: <code className="text-white/50 font-mono text-[11px]">https://zgnal.ai</code> (production) or{' '}
                <code className="text-white/50 font-mono text-[11px]">http://localhost:3000</code> (development)
              </p>
            </Reveal>

            {ENDPOINTS.map((ep) => (
              <ApiEndpoint key={`${ep.method}-${ep.path}`} endpoint={ep} />
            ))}

            <EditOnGithub section="API Reference" />
          </div>
        </section>

        {/* ================================================================ */}
        {/*  INPUT FORMATS                                                   */}
        {/* ================================================================ */}
        <section id="input-formats" className="mb-24 scroll-mt-24">
          <SectionDivider />
          <div className="mt-8">
            <SectionLabel>Input Formats</SectionLabel>
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white mb-3">
                Supported inputs
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-sm text-white/45 leading-relaxed mb-6 max-w-xl">
                The pipeline accepts multiple content formats. All inputs are normalized to plain text before entering the analysis stages.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <DocTable
                headers={['Format', 'Endpoint', 'Details']}
                rows={[
                  ['Raw Text', 'POST /api/generate', 'Paste directly into the content field. Max 15,000 characters.'],
                  ['Web URL', 'POST /api/extract-url', 'Extracts article content via Cheerio. Strips nav, ads, boilerplate.'],
                  ['YouTube Video', 'POST /api/extract-video', 'Fetches transcript from YouTube/Vimeo/Loom URLs.'],
                  ['PDF', 'POST /api/extract-file', 'Parses text from PDF documents. Max 10MB.'],
                  ['DOCX', 'POST /api/extract-file', 'Extracts text from Word documents. Max 10MB.'],
                  ['PPTX', 'POST /api/extract-file', 'Extracts slide text from PowerPoint files. Max 10MB.'],
                  ['TXT / MD / CSV / JSON', 'POST /api/extract-file', 'Plain text and structured formats. Max 10MB.'],
                ]}
              />
            </Reveal>

            <EditOnGithub section="Input Formats" />
          </div>
        </section>

        {/* ================================================================ */}
        {/*  STYLES & LAYOUTS                                                */}
        {/* ================================================================ */}
        <section id="styles-layouts" className="mb-24 scroll-mt-24">
          <SectionDivider />
          <div className="mt-8">
            <SectionLabel>Styles & Layouts</SectionLabel>
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white mb-3">
                20 styles x 20 layouts
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-sm text-white/45 leading-relaxed mb-4 max-w-xl">
                400+ unique combinations. Set <code className="text-white/60 font-mono text-[12px]">preset: &quot;auto&quot;</code> to let the pipeline choose the best pairing for your content, or specify both explicitly.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-xs text-white/30 leading-relaxed mb-8">
                See the <a href="/styles" className="text-[#D4A84B]/60 hover:text-[#D4A84B] underline underline-offset-2 transition-colors">visual gallery</a> for previews of each style.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <h3 className="text-base font-mono font-bold text-white mb-3">Styles</h3>
              <DocTable
                headers={['Style ID', 'Category', 'Best For']}
                rows={STYLES_TABLE.map((row) => [
                  <code key={row[0]} className="text-[12px]">{row[0]}</code>,
                  row[1],
                  row[2],
                ])}
              />
            </Reveal>

            <Reveal delay={0.2}>
              <h3 className="text-base font-mono font-bold text-white mb-3 mt-10">Layouts</h3>
              <DocTable
                headers={['Layout ID', 'Category', 'Best For']}
                rows={LAYOUTS_TABLE.map((row) => [
                  <code key={row[0]} className="text-[12px]">{row[0]}</code>,
                  row[1],
                  row[2],
                ])}
              />
            </Reveal>

            <EditOnGithub section="Styles & Layouts" />
          </div>
        </section>

        {/* ================================================================ */}
        {/*  EXPORT FORMATS                                                  */}
        {/* ================================================================ */}
        <section id="export-formats" className="mb-24 scroll-mt-24">
          <SectionDivider />
          <div className="mt-8">
            <SectionLabel>Export Formats</SectionLabel>
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white mb-3">
                Download & share
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-sm text-white/45 leading-relaxed mb-6 max-w-xl">
                Every generated infographic can be exported in four formats. Share directly to X, LinkedIn, or WhatsApp from the result viewer.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <DocTable
                headers={['Format', 'Type', 'Use Case']}
                rows={EXPORT_TABLE.map((row) => [
                  <strong key={row.format} className="text-white/70 font-mono">{row.format}</strong>,
                  row.type,
                  row.useCase,
                ])}
              />
            </Reveal>

            <EditOnGithub section="Export Formats" />
          </div>
        </section>

        {/* ================================================================ */}
        {/*  CONFIGURATION                                                   */}
        {/* ================================================================ */}
        <section id="configuration" className="mb-24 scroll-mt-24">
          <SectionDivider />
          <div className="mt-8">
            <SectionLabel>Configuration</SectionLabel>
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white mb-3">
                Project configuration
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <h3 className="text-base font-mono font-bold text-white mb-3 mt-6">next.config.ts</h3>
              <p className="text-sm text-white/45 leading-relaxed mb-3">
                Security headers and Content Security Policy are configured in the Next.js config. Image domains are whitelisted for Supabase and external sources.
              </p>
              <CodeBlock
                language="bash"
                code={`# Key settings in next.config.ts
# - Security headers (X-Frame-Options, CSP, etc.)
# - Image optimization domains
# - Serverless function timeout (60s for generation)
# - Output: standalone (for Docker) or default (Vercel)`}
              />
            </Reveal>

            <Reveal delay={0.15}>
              <h3 className="text-base font-mono font-bold text-white mb-3 mt-8">Tailwind CSS v4</h3>
              <p className="text-sm text-white/45 leading-relaxed mb-3">
                This project uses Tailwind CSS v4 with CSS-first configuration. Design tokens are defined in <code className="text-white/60 font-mono text-[12px]">globals.css</code> using <code className="text-white/60 font-mono text-[12px]">@theme {'{}'}</code>, not a JavaScript config file.
              </p>
              <CodeBlock
                language="bash"
                code={`# globals.css — design tokens
# @theme {
#   --color-gold: #D4A84B;
#   --color-bg: #0A0A0B;
#   --color-surface: #111113;
#   --font-mono: 'IBM Plex Mono', monospace;
#   --font-sans: 'IBM Plex Sans', sans-serif;
# }`}
              />
            </Reveal>

            <Reveal delay={0.2}>
              <h3 className="text-base font-mono font-bold text-white mb-3 mt-8">Fonts</h3>
              <p className="text-sm text-white/45 leading-relaxed mb-3">
                Two fonts loaded from Google Fonts via <code className="text-white/60 font-mono text-[12px]">next/font/google</code>:
              </p>
              <ul className="space-y-2 text-sm text-white/45 mb-3">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D4A84B]" />
                  <span><strong className="text-white/70 font-mono">IBM Plex Mono</strong> — Headings, labels, code, navigation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D4A84B]" />
                  <span><strong className="text-white/70 font-mono">IBM Plex Sans</strong> — Body text, descriptions, paragraphs</span>
                </li>
              </ul>
            </Reveal>

            <EditOnGithub section="Configuration" />
          </div>
        </section>

        {/* ================================================================ */}
        {/*  CONTRIBUTING                                                    */}
        {/* ================================================================ */}
        <section id="contributing" className="mb-24 scroll-mt-24">
          <SectionDivider />
          <div className="mt-8">
            <SectionLabel>Contributing</SectionLabel>
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white mb-3">
                How to contribute
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <h3 className="text-base font-mono font-bold text-white mb-3 mt-6">Workflow</h3>
              <CodeBlock
                language="bash"
                code={`# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/zignal-infographic-lab.git

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make changes and commit
git add .
git commit -m "feat: describe your change"

# 5. Push and open a Pull Request
git push origin feature/your-feature-name
# Open PR at ${GITHUB_URL}/pulls`}
              />
            </Reveal>

            <Reveal delay={0.15}>
              <h3 className="text-base font-mono font-bold text-white mb-3 mt-8">Code Conventions</h3>
              <ul className="space-y-2 text-sm text-white/45">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D4A84B] mt-1.5 shrink-0" />
                  <span>TypeScript strict mode everywhere — no <code className="text-white/60 font-mono text-[12px]">any</code> types</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D4A84B] mt-1.5 shrink-0" />
                  <span>Tailwind CSS v4 with CSS-first config — no <code className="text-white/60 font-mono text-[12px]">tailwind.config.js</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D4A84B] mt-1.5 shrink-0" />
                  <span>Server Components by default, <code className="text-white/60 font-mono text-[12px]">&quot;use client&quot;</code> only when necessary</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D4A84B] mt-1.5 shrink-0" />
                  <span>No barrel imports — import directly from the source file</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D4A84B] mt-1.5 shrink-0" />
                  <span>Framer Motion via <code className="text-white/60 font-mono text-[12px]">motion/react</code> for animations</span>
                </li>
              </ul>
            </Reveal>

            <Reveal delay={0.2}>
              <h3 className="text-base font-mono font-bold text-white mb-3 mt-8">Adding a New Style</h3>
              <CodeBlock
                language="bash"
                code={`# 1. Create the style reference file
# src/lib/references/styles/your-style-name.md

# 2. Follow the structure of existing style files:
#    - Color palette (primary, secondary, accent, bg, text)
#    - Typography specs (heading, body, caption fonts + sizes)
#    - Composition rules (spacing, alignment, density)
#    - Example visual description

# 3. Register in constants
# Add to STYLES array in src/lib/constants.ts

# 4. Test generation with the new style
npm run dev
# Generate an infographic with style: "your-style-name"`}
              />
            </Reveal>

            <Reveal delay={0.25}>
              <h3 className="text-base font-mono font-bold text-white mb-3 mt-8">Adding a New Layout</h3>
              <p className="text-sm text-white/45 leading-relaxed mb-3">
                Same process as styles: create <code className="text-white/60 font-mono text-[12px]">src/lib/references/layouts/your-layout.md</code>, register in <code className="text-white/60 font-mono text-[12px]">constants.ts</code>, test generation.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <h3 className="text-base font-mono font-bold text-white mb-3 mt-8">Quality Checks</h3>
              <CodeBlock
                language="bash"
                code={`# Run before opening a PR
npm run lint          # ESLint
npm run build         # TypeScript + Next.js build`}
              />
            </Reveal>

            <EditOnGithub section="Contributing" />
          </div>
        </section>

        {/* ================================================================ */}
        {/*  DEPLOYMENT                                                      */}
        {/* ================================================================ */}
        <section id="deployment" className="mb-8 scroll-mt-24">
          <SectionDivider />
          <div className="mt-8">
            <SectionLabel>Deployment</SectionLabel>
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white mb-3">
                Ship to production
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-sm text-white/45 leading-relaxed mb-6 max-w-xl">
                Recommended deployment target is Vercel. Push to GitHub and it auto-deploys.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <h3 className="text-base font-mono font-bold text-white mb-3">Vercel Deployment</h3>
              <CodeBlock
                language="bash"
                code={`# 1. Connect GitHub repo to Vercel
# 2. Set environment variables in Vercel dashboard:
#    GOOGLE_API_KEY (required)
#    NEXT_PUBLIC_SUPABASE_URL (optional)
#    NEXT_PUBLIC_SUPABASE_ANON_KEY (optional)

# 3. Push to deploy
npm run build         # Verify build passes locally
git push origin main  # Triggers auto-deploy on Vercel`}
              />
            </Reveal>

            <Reveal delay={0.15}>
              <h3 className="text-base font-mono font-bold text-white mb-3 mt-8">Post-Deploy Checklist</h3>
              <div className="space-y-2 text-sm text-white/45">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-mono text-white/30">1</span>
                  </span>
                  <span>Verify the live URL loads: <code className="text-white/60 font-mono text-[12px]">https://zgnal.ai</code></span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-mono text-white/30">2</span>
                  </span>
                  <span>Test one generation end-to-end on production</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-mono text-white/30">3</span>
                  </span>
                  <span>Check Vercel function logs for runtime errors</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-mono text-white/30">4</span>
                  </span>
                  <span>Verify all environment variables are set in Vercel dashboard</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-mono text-white/30">5</span>
                  </span>
                  <span>No console errors on page load (check browser DevTools)</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-10 p-6 border border-[#D4A84B]/20 bg-[#D4A84B]/[0.03]">
                <p className="text-sm text-white/50 leading-relaxed">
                  Need help? Open an issue on{' '}
                  <a
                    href={`${GITHUB_URL}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D4A84B] hover:underline underline-offset-2"
                  >
                    GitHub
                  </a>{' '}
                  or reach out to the maintainers.
                </p>
              </div>
            </Reveal>

            <EditOnGithub section="Deployment" />
          </div>
        </section>

      </div>
    </>
  );
}
