'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download, RotateCcw, ChevronDown, ChevronUp, Sparkles,
  Copy, Check, Share2, FileImage, FileText, Presentation, Loader2,
  ZoomIn, X,
} from 'lucide-react';

/* ── Social SVG icons (lightweight, no deps) ───────────────── */

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ── Full style catalog for regen ──────────────────────────── */

const STYLE_CATALOG = [
  { id: 'executive-institutional', label: 'Executive Institutional', desc: 'McKinsey-grade multi-panel dashboard. Bento grids, KPI tiles, corporate palette.', accent: '#D4A84B', icon: '▦' },
  { id: 'deconstruct', label: 'Deconstruct', desc: 'NYT-style exploded view with callout lines and numbered annotations.', accent: '#C04B3C', icon: '◎' },
  { id: 'aerial-explainer', label: 'Aerial Explainer', desc: 'Drone-view isometric cutaway with numbered architectural callouts.', accent: '#5B8DEF', icon: '◇' },
  { id: 'technical-schematic', label: 'Technical Schematic', desc: 'Blueprint grid with precise linework and step-by-step process flows.', accent: '#8BC34A', icon: '⬡' },
  { id: 'craft-handmade', label: 'Craft Handmade', desc: 'Watercolor textures, hand-drawn illustrations, winding narrative paths.', accent: '#A78BFA', icon: '✦' },
  { id: 'bold-graphic', label: 'Bold Graphic', desc: 'High-contrast Swiss poster aesthetic. Oversized type, flat shapes, maximum impact.', accent: '#FF6B6B', icon: '■' },
  { id: 'cyberpunk-neon', label: 'Cyberpunk Neon', desc: 'Glowing neon lines on dark backgrounds. Circuit patterns, holographic overlays.', accent: '#00F5FF', icon: '◈' },
  { id: 'claymation', label: 'Claymation', desc: 'Soft 3D clay-rendered objects. Playful, tactile, Saturday-morning aesthetic.', accent: '#FF9F43', icon: '●' },
  { id: 'kawaii', label: 'Kawaii', desc: 'Cute illustrated characters with pastel tones. Friendly and approachable.', accent: '#FF6B9D', icon: '♡' },
  { id: 'storybook-watercolor', label: 'Storybook Watercolor', desc: 'Delicate paint washes and whimsical illustrations. Children\'s book warmth.', accent: '#C4A882', icon: '✿' },
  { id: 'chalkboard', label: 'Chalkboard', desc: 'White chalk on dark green. Hand-lettered headers, sketch-note diagrams.', accent: '#7CB342', icon: '▤' },
  { id: 'aged-academia', label: 'Aged Academia', desc: 'Sepia tones, aged paper textures, classical engravings, scholarly elegance.', accent: '#8D6E63', icon: '⚜' },
  { id: 'corporate-memphis', label: 'Corporate Memphis', desc: 'Flat geometric characters with minimal detail. Silicon Valley deck aesthetic.', accent: '#9C27B0', icon: '△' },
  { id: 'origami', label: 'Origami', desc: 'Paper-folded 3D forms with crisp edges and subtle shadows. Geometric elegance.', accent: '#E91E63', icon: '◆' },
  { id: 'pixel-art', label: 'Pixel Art', desc: 'Retro 8-bit sprites and low-resolution charm. Nostalgic gaming aesthetic.', accent: '#4CAF50', icon: '▪' },
  { id: 'ikea-manual', label: 'IKEA Manual', desc: 'Minimal line drawings, numbered assembly steps, no text needed.', accent: '#2196F3', icon: '⊞' },
  { id: 'knolling', label: 'Knolling', desc: 'Top-down flat-lay arrangement. Every object orthogonal, perfectly organized.', accent: '#607D8B', icon: '⊡' },
  { id: 'lego-brick', label: 'LEGO Brick', desc: 'Everything built from plastic bricks. Colorful, modular, endlessly playful.', accent: '#F44336', icon: '▧' },
];

/* ── Types ─────────────────────────────────────────────────── */

type GenerationContext = {
  content: string;
  preset: string;
  style: string;
  aspectRatio: string;
  simplify: boolean;
};

type Props = {
  imageUrl: string;
  downloadUrl: string;
  metadata: Record<string, any>;
  onRegenerate: () => void;
  onRegenerateWithStyle?: (style: string) => void;
  generationContext?: GenerationContext;
};

/* ── Export helpers ─────────────────────────────────────────── */

async function loadImageAsBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  return res.blob();
}

async function loadImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 1920, height: 1080 });
    img.src = url;
  });
}

async function exportAsJpeg(url: string) {
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92)
  );
  triggerDownload(blob, 'zignal-infographic.jpg');
}

async function exportAsPdf(url: string) {
  const { jsPDF } = await import('jspdf');
  const { width, height } = await loadImageDimensions(url);
  const isLandscape = width > height;
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
  });
  const blob = await loadImageAsBlob(url);
  const dataUrl = await blobToDataUrl(blob);
  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
  pdf.save('zignal-infographic.pdf');
}

async function exportAsPptx(url: string) {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const { width, height } = await loadImageDimensions(url);
  const pptx = new PptxGenJS();
  const isLandscape = width > height;
  pptx.defineLayout({ name: 'CUSTOM', width: isLandscape ? 13.33 : 7.5, height: isLandscape ? 7.5 : 13.33 });
  pptx.layout = 'CUSTOM';
  const slide = pptx.addSlide();
  slide.background = { color: '0A0A0B' };
  const blob = await loadImageAsBlob(url);
  const dataUrl = await blobToDataUrl(blob);
  const base64 = dataUrl.split(',')[1];
  const slideW = isLandscape ? 13.33 : 7.5;
  const slideH = isLandscape ? 7.5 : 13.33;
  const imgAspect = width / height;
  let imgW = slideW;
  let imgH = imgW / imgAspect;
  if (imgH > slideH) { imgH = slideH; imgW = imgH * imgAspect; }
  const x = (slideW - imgW) / 2;
  const y = (slideH - imgH) / 2;
  slide.addImage({ data: `image/png;base64,${base64}`, x, y, w: imgW, h: imgH });
  await pptx.writeFile({ fileName: 'zignal-infographic.pptx' });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── Particle burst ────────────────────────────────────────── */

function CelebrationParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 80 + Math.random() * 60;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const size = 3 + Math.random() * 4;
    return { x, y, size, delay: Math.random() * 0.2 };
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
          transition={{ duration: 1.2, delay: 0.3 + p.delay, ease: 'easeOut' }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            background: i % 3 === 0 ? '#D4A84B' : i % 3 === 1 ? '#E8C96A' : '#5B8DEF',
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RESULT VIEWER
   ═══════════════════════════════════════════════════════════════ */

export function ResultViewer({
  imageUrl, metadata, onRegenerate, onRegenerateWithStyle, generationContext,
}: Props) {
  const [showContext, setShowContext] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const displayUrl = imageUrl.startsWith('http')
    ? imageUrl
    : `${process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:3000'}/tmp/${imageUrl.split(/[/\\]/).pop()}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(displayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard may not be available */ }
  };

  const handleExport = useCallback(async (format: 'jpeg' | 'pdf' | 'pptx') => {
    setExporting(format);
    try {
      if (format === 'jpeg') await exportAsJpeg(displayUrl);
      else if (format === 'pdf') await exportAsPdf(displayUrl);
      else if (format === 'pptx') await exportAsPptx(displayUrl);
    } catch (err) {
      console.error(`Export ${format} failed:`, err);
    }
    setExporting(null);
    setShowExport(false);
  }, [displayUrl]);

  /* Share URLs */
  const shareText = 'Check out this AI-generated infographic from ZGNAL.AI';
  const encodedUrl = encodeURIComponent(displayUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = {
    x: `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
  };

  /* Metadata badges */
  const badges = [
    metadata?.layout && { label: metadata.layout, bg: 'bg-(--z-blue)/10', text: 'text-(--z-blue)', border: 'border-(--z-blue)/20' },
    metadata?.style && { label: metadata.style, bg: 'bg-(--z-olive)/10', text: 'text-(--z-olive)', border: 'border-(--z-olive)/20' },
    metadata?.preset && { label: metadata.preset, bg: 'bg-(--z-gold)/10', text: 'text-(--z-gold)', border: 'border-(--z-gold)/20' },
  ].filter(Boolean) as { label: string; bg: string; text: string; border: string }[];

  /* Current style for highlighting */
  const currentStyle = metadata?.style || generationContext?.style || '';

  return (
    <div className="space-y-5">
      {/* ── Zoom Lightbox ── */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-[95vw] max-h-[95vh]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt="Generated infographic — zoomed"
                className="max-w-full max-h-[95vh] object-contain"
              />
              <button
                onClick={(e) => { e.stopPropagation(); setZoomed(false); }}
                className="absolute -top-3 -right-3 h-8 w-8 bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Celebration header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 text-sm font-mono text-(--z-gold)">
          <Sparkles className="h-4 w-4" />
          Your infographic is ready
        </div>
      </motion.div>

      {/* ── Main image (click to zoom) ── */}
      <div className="relative group">
        <CelebrationParticles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 1.8, delay: 0.4 }}
          className="absolute inset-0 pointer-events-none z-10"
          style={{ boxShadow: 'inset 0 0 80px rgba(212, 168, 75, 0.35), 0 0 40px rgba(212, 168, 75, 0.15)' }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: imageLoaded ? 1 : 0.3, scale: imageLoaded ? 1 : 0.9 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden border border-(--border) glow-gold cursor-zoom-in"
          onClick={() => imageLoaded && setZoomed(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt="Generated infographic"
            className="w-full h-auto"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '';
              (e.target as HTMLImageElement).alt = 'Image generated — open from local path';
              setImageLoaded(true);
            }}
          />
          {/* Zoom hint overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-mono text-white/80">
              <ZoomIn className="h-3 w-3" />
              Click to zoom
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Metadata badges ── */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {badges.map((badge, i) => (
            <motion.span
              key={badge.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.12 }}
              className={`inline-flex items-center px-3 py-1 text-[10px] font-mono border ${badge.bg} ${badge.text} ${badge.border}`}
            >
              {badge.label}
            </motion.span>
          ))}
        </div>
      )}

      {/* ── Download + Export ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="space-y-3"
      >
        {/* Primary download with format dropdown */}
        <div className="relative">
          <div className="flex">
            <a
              href={displayUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="group flex-1 flex items-center justify-center gap-3 bg-(--z-gold) px-6 py-3.5 text-sm font-semibold text-(--z-bg) hover:bg-(--z-gold-dim) transition-all"
            >
              <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              Download PNG
            </a>
            <button
              onClick={() => setShowExport(!showExport)}
              className="flex items-center justify-center bg-(--z-gold) px-3 border-l border-(--z-bg)/20 hover:bg-(--z-gold-dim) transition-colors"
              title="More export formats"
            >
              <ChevronDown className={`h-4 w-4 text-(--z-bg) transition-transform ${showExport ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Export dropdown */}
          <AnimatePresence>
            {showExport && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 z-20 mt-1 border border-(--border) bg-(--z-surface) divide-y divide-white/[0.04]"
              >
                <button
                  onClick={() => handleExport('jpeg')}
                  disabled={!!exporting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-mono text-(--z-cream)/80 hover:bg-white/[0.04] transition-colors disabled:opacity-50"
                >
                  {exporting === 'jpeg' ? <Loader2 className="h-4 w-4 text-(--z-gold)/60 animate-spin" /> : <FileImage className="h-4 w-4 text-(--z-gold)/60" />}
                  <div className="text-left">
                    <div className="font-medium">JPEG — Compressed</div>
                    <div className="text-[10px] text-(--z-muted)">Smaller file, great for web & social</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={!!exporting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-mono text-(--z-cream)/80 hover:bg-white/[0.04] transition-colors disabled:opacity-50"
                >
                  {exporting === 'pdf' ? <Loader2 className="h-4 w-4 text-(--z-blue)/60 animate-spin" /> : <FileText className="h-4 w-4 text-(--z-blue)/60" />}
                  <div className="text-left">
                    <div className="font-medium">PDF — Document</div>
                    <div className="text-[10px] text-(--z-muted)">Ready for reports and presentations</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('pptx')}
                  disabled={!!exporting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-mono text-(--z-cream)/80 hover:bg-white/[0.04] transition-colors disabled:opacity-50"
                >
                  {exporting === 'pptx' ? <Loader2 className="h-4 w-4 text-(--z-olive)/60 animate-spin" /> : <Presentation className="h-4 w-4 text-(--z-olive)/60" />}
                  <div className="text-left">
                    <div className="font-medium">PPTX — Slide Deck</div>
                    <div className="text-[10px] text-(--z-muted)">Editable PowerPoint slide</div>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Secondary: Regenerate + Copy Link */}
        <div className="flex gap-2">
          <button
            onClick={onRegenerate}
            className="flex-1 flex items-center justify-center gap-2 border border-(--border) px-4 py-2.5 text-xs font-mono text-(--z-muted) hover:text-(--z-cream) hover:border-(--z-gold)/30 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Regenerate
          </button>
          <button
            onClick={copyLink}
            className="flex-1 flex items-center justify-center gap-2 border border-(--border) px-4 py-2.5 text-xs font-mono text-(--z-muted) hover:text-(--z-cream) hover:border-(--z-gold)/30 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-(--z-olive)" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
        </div>
      </motion.div>

      {/* ── Share bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono tracking-widest uppercase text-(--z-muted)/50">Share</span>
          <div className="flex-1 h-px bg-(--border)" />
          <div className="flex items-center gap-1">
            <a
              href={shareLinks.x}
              target="_blank"
              rel="noopener noreferrer"
              title="Share on X"
              className="flex items-center justify-center h-9 w-9 border border-(--border) text-(--z-muted) hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all"
            >
              <XIcon className="h-3.5 w-3.5" />
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              title="Share on LinkedIn"
              className="flex items-center justify-center h-9 w-9 border border-(--border) text-(--z-muted) hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/[0.04] transition-all"
            >
              <LinkedInIcon className="h-3.5 w-3.5" />
            </a>
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              title="Share on WhatsApp"
              className="flex items-center justify-center h-9 w-9 border border-(--border) text-(--z-muted) hover:text-[#25D366] hover:border-[#25D366]/30 hover:bg-[#25D366]/[0.04] transition-all"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={copyLink}
              title="Copy share link"
              className="flex items-center justify-center h-9 w-9 border border-(--border) text-(--z-muted) hover:text-(--z-cream) hover:border-(--z-gold)/30 hover:bg-white/[0.04] transition-all"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Style Gallery ── */}
      {onRegenerateWithStyle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono tracking-widest uppercase text-(--z-muted)/50">Regenerate in a new style</span>
            <div className="flex-1 h-px bg-(--border)" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STYLE_CATALOG.map((s, i) => {
              const isActive = currentStyle.toLowerCase().includes(s.id.replace(/-/g, ' ').toLowerCase()) ||
                currentStyle.toLowerCase().includes(s.label.toLowerCase());
              return (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.15 + i * 0.03 }}
                  onClick={() => onRegenerateWithStyle(s.id)}
                  className={`group relative text-left p-3 border transition-all ${
                    isActive
                      ? 'border-[color:var(--z-gold)]/40 bg-(--z-gold)/[0.06]'
                      : 'border-(--border) hover:border-white/15 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className="flex-shrink-0 h-9 w-9 flex items-center justify-center text-base border border-white/[0.06] bg-white/[0.03]"
                      style={{ color: s.accent }}
                    >
                      {s.icon}
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-mono font-semibold tracking-wide ${
                          isActive ? 'text-(--z-gold)' : 'text-(--z-cream)/90 group-hover:text-(--z-cream)'
                        }`}>
                          {s.label}
                        </span>
                        {isActive && (
                          <span className="text-[8px] font-mono tracking-widest uppercase text-(--z-gold)/60 bg-(--z-gold)/10 px-1.5 py-0.5">current</span>
                        )}
                      </div>
                      <p className="text-[10px] leading-relaxed text-(--z-muted)/70 mt-0.5 line-clamp-2">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                  {/* Accent line on hover */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: s.accent }}
                  />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Generation context ── */}
      {generationContext && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <button
            onClick={() => setShowContext(!showContext)}
            className="w-full flex items-center justify-between px-4 py-2.5 border border-(--border) text-xs font-mono text-(--z-muted) hover:text-(--z-cream) hover:border-(--z-gold)/30 transition-colors"
          >
            <span className="tracking-widest uppercase text-[10px]">Generation Context</span>
            {showContext ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <AnimatePresence>
            {showContext && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="border border-t-0 border-(--border) p-4 space-y-3 bg-(--z-surface)">
                  <div>
                    <div className="text-[9px] font-mono tracking-widest uppercase text-(--z-muted)/60 mb-1">Content</div>
                    <p className="text-xs text-(--z-cream)/80 leading-relaxed line-clamp-3">{generationContext.content}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {generationContext.preset && generationContext.preset !== 'auto' && (
                      <div>
                        <div className="text-[9px] font-mono tracking-widest uppercase text-(--z-muted)/60 mb-0.5">Preset</div>
                        <span className="text-xs text-(--z-cream)/80 font-mono">{generationContext.preset}</span>
                      </div>
                    )}
                    {generationContext.style && (
                      <div>
                        <div className="text-[9px] font-mono tracking-widest uppercase text-(--z-muted)/60 mb-0.5">Style</div>
                        <span className="text-xs text-(--z-cream)/80 font-mono">{generationContext.style}</span>
                      </div>
                    )}
                    <div>
                      <div className="text-[9px] font-mono tracking-widest uppercase text-(--z-muted)/60 mb-0.5">Size</div>
                      <span className="text-xs text-(--z-cream)/80 font-mono">{generationContext.aspectRatio}</span>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono tracking-widest uppercase text-(--z-muted)/60 mb-0.5">Simplified</div>
                      <span className="text-xs text-(--z-cream)/80 font-mono">{generationContext.simplify ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
