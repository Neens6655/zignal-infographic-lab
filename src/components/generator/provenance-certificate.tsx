'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Shield } from 'lucide-react';

type ProvenanceData = {
  seed: string;
  generatedAt: string;
  contentHash: string;
  models: { analysis: string; image: string };
  pipeline: { stage: string; agent: string; result: string }[];
  references: string[];
  topics: string[];
};

type Props = {
  provenance: ProvenanceData;
  open: boolean;
  onClose: () => void;
};

export function ProvenanceCertificate({ provenance, open, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadCertificate = useCallback(async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const w = 800;
      const h = 1000;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // Background
      ctx.fillStyle = '#0A0A0B';
      ctx.fillRect(0, 0, w, h);

      // Subtle grid
      ctx.strokeStyle = 'rgba(212, 168, 75, 0.05)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Gold border
      ctx.strokeStyle = '#D4A84B';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, w - 60, h - 60);

      // Inner border
      ctx.strokeStyle = 'rgba(212, 168, 75, 0.2)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(40, 40, w - 80, h - 80);

      // Diamond icon
      const cx = w / 2;
      ctx.fillStyle = '#D4A84B';
      ctx.beginPath();
      ctx.moveTo(cx, 70); ctx.lineTo(cx + 12, 85); ctx.lineTo(cx, 100); ctx.lineTo(cx - 12, 85);
      ctx.closePath(); ctx.fill();

      // Title
      ctx.fillStyle = '#D4A84B';
      ctx.font = '600 14px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE OF INFOGRAPHIC LINEAGE', cx, 130);

      // Divider
      ctx.strokeStyle = 'rgba(212, 168, 75, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(100, 145); ctx.lineTo(w - 100, 145); ctx.stroke();

      // Seed + timestamp
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '700 22px "IBM Plex Mono", monospace';
      ctx.fillText(provenance.seed, cx, 180);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '400 11px "IBM Plex Mono", monospace';
      ctx.fillText(new Date(provenance.generatedAt).toLocaleString(), cx, 200);

      // Section helper
      let y = 240;
      const drawSection = (title: string) => {
        ctx.fillStyle = '#D4A84B';
        ctx.font = '600 10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(title, 70, y);
        y += 5;
        ctx.strokeStyle = 'rgba(212, 168, 75, 0.15)';
        ctx.beginPath(); ctx.moveTo(70, y); ctx.lineTo(w - 70, y); ctx.stroke();
        y += 18;
      };

      const drawField = (label: string, value: string) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = '400 10px "IBM Plex Mono", monospace';
        ctx.fillText(label, 70, y);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '500 12px "IBM Plex Mono", monospace';
        ctx.fillText(value, 220, y);
        y += 22;
      };

      // Content fingerprint
      drawSection('CONTENT FINGERPRINT');
      drawField('SHA-256', provenance.contentHash);
      y += 10;

      // Pipeline trace
      drawSection('PIPELINE TRACE');
      for (const step of provenance.pipeline) {
        ctx.fillStyle = '#D4A84B';
        ctx.font = '700 11px "IBM Plex Mono", monospace';
        ctx.fillText(step.stage, 70, y);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '500 11px "IBM Plex Mono", monospace';
        ctx.fillText(step.agent, 110, y);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '400 10px "IBM Plex Mono", monospace';
        const truncated = step.result.length > 50 ? step.result.slice(0, 50) + '...' : step.result;
        ctx.fillText(`\u2192 ${truncated}`, 220, y);
        y += 22;
      }
      y += 10;

      // References
      drawSection('REFERENCES USED');
      for (const ref of provenance.references) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '400 10px "IBM Plex Mono", monospace';
        ctx.fillText(`\u2022  ${ref}`, 80, y);
        y += 18;
      }
      y += 10;

      // Topics
      if (provenance.topics.length > 0) {
        drawSection('TOPICS');
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '400 10px "IBM Plex Mono", monospace';
        ctx.fillText(provenance.topics.join('  \u2022  '), 80, y);
        y += 28;
      }

      // Models
      drawSection('MODELS');
      drawField('Analysis', provenance.models.analysis);
      drawField('Rendering', provenance.models.image);
      y += 20;

      // Footer divider
      ctx.strokeStyle = 'rgba(212, 168, 75, 0.3)';
      ctx.beginPath(); ctx.moveTo(100, y); ctx.lineTo(w - 100, y); ctx.stroke();
      y += 30;

      ctx.fillStyle = '#D4A84B';
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('\u2500\u2500\u2500  ZGNAL.AI  \u2500\u2500\u2500  Algorithmic Art  \u2500\u2500\u2500', cx, y);
      y += 18;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '400 9px "IBM Plex Mono", monospace';
      ctx.fillText('Responsible AI  \u2022  Transparent Pipeline  \u2022  Verifiable Provenance', cx, y);

      // Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zgnal-certificate-${provenance.seed}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } finally {
      setDownloading(false);
    }
  }, [provenance]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0A0A0B] border border-[#D4A84B]/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 h-7 w-7 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Subtle grid background */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(212,168,75,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,75,1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />

            <div className="relative p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center h-10 w-10 bg-[#D4A84B]/10 border border-[#D4A84B]/20 mx-auto">
                  <Shield className="h-5 w-5 text-[#D4A84B]" />
                </div>
                <p className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B]">
                  Certificate of Infographic Lineage
                </p>
                <p className="text-2xl font-mono font-bold text-white tracking-tight">{provenance.seed}</p>
                <p className="text-[10px] font-mono text-white/30">
                  {new Date(provenance.generatedAt).toLocaleString()}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#D4A84B]/30 to-transparent" />

              {/* Content Fingerprint */}
              <div>
                <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-2">Content Fingerprint</p>
                <p className="text-xs font-mono text-white/60 bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                  SHA-256: {provenance.contentHash}
                </p>
              </div>

              {/* Pipeline Trace */}
              <div>
                <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-3">Pipeline Trace</p>
                <div className="space-y-2">
                  {provenance.pipeline.map((step) => (
                    <div key={step.stage} className="flex items-start gap-3 text-xs font-mono">
                      <span className="text-[#D4A84B] font-bold shrink-0">{step.stage}</span>
                      <span className="text-white/70 font-medium shrink-0 w-20">{step.agent}</span>
                      <span className="text-white/40">{step.result}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* References */}
              <div>
                <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-2">References Used</p>
                <div className="space-y-1">
                  {provenance.references.map((ref) => (
                    <p key={ref} className="text-[11px] font-mono text-white/40 pl-3 border-l border-white/[0.06]">
                      {ref}
                    </p>
                  ))}
                </div>
              </div>

              {/* Topics */}
              {provenance.topics.length > 0 && (
                <div>
                  <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-2">Topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {provenance.topics.map((topic) => (
                      <span key={topic} className="text-[10px] font-mono text-white/50 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Models */}
              <div>
                <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-2">Models</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                    <p className="text-[9px] font-mono text-white/30 mb-0.5">Analysis</p>
                    <p className="text-[11px] font-mono text-white/60">{provenance.models.analysis}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                    <p className="text-[9px] font-mono text-white/30 mb-0.5">Rendering</p>
                    <p className="text-[11px] font-mono text-white/60">{provenance.models.image}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#D4A84B]/30 to-transparent" />
              <div className="text-center space-y-1">
                <p className="text-[10px] font-mono font-semibold text-[#D4A84B]/60">
                  ZGNAL.AI — Algorithmic Art
                </p>
                <p className="text-[9px] font-mono text-white/25">
                  Responsible AI &bull; Transparent Pipeline &bull; Verifiable Provenance
                </p>
              </div>

              {/* Download button */}
              <button
                onClick={downloadCertificate}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 border border-[#D4A84B]/30 bg-[#D4A84B]/[0.06] px-4 py-3 text-xs font-mono font-semibold text-[#D4A84B] hover:bg-[#D4A84B]/10 transition-colors disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                {downloading ? 'Generating...' : 'Download Certificate PNG'}
              </button>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
