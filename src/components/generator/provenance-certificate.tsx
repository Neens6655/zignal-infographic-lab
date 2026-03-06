'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Shield, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import type { ProvenanceData, VerifiedClaim, SourceCitation } from '@/lib/types';

type Props = {
  provenance: ProvenanceData;
  open: boolean;
  onClose: () => void;
};

function CredibilityGauge({ score }: { score: number }) {
  const color = score >= 80 ? '#8BC34A' : score >= 60 ? '#D4A84B' : '#C04B3C';
  const label = score >= 80 ? 'HIGH' : score >= 60 ? 'MODERATE' : 'LOW';
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-mono font-bold text-white">{score}</span>
          <span className="text-[8px] font-mono text-white/40">/100</span>
        </div>
      </div>
      <span className="text-[9px] font-mono font-semibold tracking-[0.2em]" style={{ color }}>
        {label} CREDIBILITY
      </span>
    </div>
  );
}

function ClaimRow({ claim, index }: { claim: VerifiedClaim; index: number }) {
  const confidenceColor = claim.confidence === 'high' ? '#8BC34A'
    : claim.confidence === 'medium' ? '#D4A84B' : '#C04B3C';

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] p-3 space-y-2">
      <div className="flex items-start gap-2">
        <span className="text-[9px] font-mono text-[#D4A84B] font-bold shrink-0 mt-0.5">
          [{index + 1}]
        </span>
        <p className="text-[11px] font-mono text-white/70 leading-relaxed">{claim.claim}</p>
      </div>
      <div className="flex items-center gap-3 pl-5">
        <span
          className="text-[8px] font-mono font-semibold tracking-wider uppercase px-1.5 py-0.5 border"
          style={{
            color: confidenceColor,
            borderColor: `${confidenceColor}33`,
            backgroundColor: `${confidenceColor}0D`,
          }}
        >
          {claim.confidence}
        </span>
        <span className="text-[9px] font-mono text-white/30">
          {claim.sources.length} source{claim.sources.length !== 1 ? 's' : ''}
        </span>
        {claim.sources.length > 0 && (
          <div className="flex gap-1">
            {[...new Set(claim.sources.map(s => s.provider))].map(provider => (
              <span
                key={provider}
                className="text-[8px] font-mono text-white/40 bg-white/[0.04] px-1 py-0.5"
              >
                {provider}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CitationRow({ citation, index }: { citation: SourceCitation; index: number }) {
  const providerColor = citation.provider === 'exa' ? '#5B8DEF' : citation.provider === 'perplexity' ? '#8BC34A' : '#D4A84B';

  return (
    <div className="flex items-start gap-2 text-[10px] font-mono">
      <span className="text-white/25 shrink-0">[{index + 1}]</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5B8DEF]/70 hover:text-[#5B8DEF] truncate transition-colors"
          >
            {citation.title || citation.url}
          </a>
          <ExternalLink className="h-2.5 w-2.5 text-white/20 shrink-0" />
          <span
            className="text-[7px] font-semibold tracking-wider uppercase px-1 py-0.5 shrink-0"
            style={{ color: providerColor, backgroundColor: `${providerColor}15` }}
          >
            {citation.provider}
          </span>
        </div>
        {citation.snippet && (
          <p className="text-white/30 mt-0.5 line-clamp-1">{citation.snippet}</p>
        )}
      </div>
    </div>
  );
}

export function ProvenanceCertificate({ provenance, open, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState(false);

  const credibility = provenance.credibility;
  const score = credibility?.overall ?? provenance.compliance?.score ?? 0;
  const claims = provenance.research?.sourcedClaims || [];
  const citations = provenance.research?.citations || [];

  const downloadCertificate = useCallback(async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const w = 800;
      const h = 1400;
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

      const cx = w / 2;

      // Title
      ctx.fillStyle = '#D4A84B';
      ctx.font = '600 14px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ZGNAL VERIFICATION REPORT', cx, 80);

      // Seed + timestamp
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '700 22px "IBM Plex Mono", monospace';
      ctx.fillText(provenance.seed, cx, 115);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '400 11px "IBM Plex Mono", monospace';
      ctx.fillText(new Date(provenance.generatedAt).toLocaleString(), cx, 135);

      // Credibility score
      const scoreColor = score >= 80 ? '#8BC34A' : score >= 60 ? '#D4A84B' : '#C04B3C';
      ctx.fillStyle = scoreColor;
      ctx.font = '700 48px "IBM Plex Mono", monospace';
      ctx.fillText(`${score}`, cx, 195);
      ctx.font = '400 12px "IBM Plex Mono", monospace';
      ctx.fillText('/100 CREDIBILITY SCORE', cx, 215);

      let y = 250;

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

      // Sourced Claims
      if (claims.length > 0) {
        drawSection(`SOURCED CLAIMS (${credibility?.claimsCrossVerified || 0}/${claims.length} VERIFIED)`);
        for (const claim of claims.slice(0, 8)) {
          const claimColor = claim.confidence === 'high' ? '#8BC34A'
            : claim.confidence === 'medium' ? '#D4A84B' : '#C04B3C';
          ctx.fillStyle = claimColor;
          ctx.font = '700 9px "IBM Plex Mono", monospace';
          ctx.fillText(`[${claim.confidence.toUpperCase()}]`, 70, y);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '400 10px "IBM Plex Mono", monospace';
          const claimText = claim.claim.length > 70 ? claim.claim.slice(0, 67) + '...' : claim.claim;
          ctx.fillText(claimText, 140, y);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.font = '400 9px "IBM Plex Mono", monospace';
          ctx.fillText(`${claim.sources.length} src`, w - 110, y);
          y += 20;
        }
        y += 10;
      }

      // Citations
      if (citations.length > 0) {
        drawSection(`CITATIONS (${citations.length})`);
        for (const cit of citations.slice(0, 10)) {
          ctx.fillStyle = cit.provider === 'exa' ? '#5B8DEF' : '#8BC34A';
          ctx.font = '600 8px "IBM Plex Mono", monospace';
          ctx.fillText(cit.provider.toUpperCase(), 70, y);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '400 9px "IBM Plex Mono", monospace';
          const title = (cit.title || cit.url).slice(0, 65);
          ctx.fillText(title, 130, y);
          y += 16;
        }
        y += 10;
      }

      // Content fingerprint
      drawSection('CONTENT FINGERPRINT');
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '400 10px "IBM Plex Mono", monospace';
      ctx.fillText(`SHA-256: ${provenance.contentHash}`, 70, y);
      y += 25;

      // Pipeline trace
      drawSection('DATA LINEAGE');
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
      y += 20;

      // Footer
      ctx.strokeStyle = 'rgba(212, 168, 75, 0.3)';
      ctx.beginPath(); ctx.moveTo(100, y); ctx.lineTo(w - 100, y); ctx.stroke();
      y += 25;

      ctx.fillStyle = '#D4A84B';
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VERIFIED BY ZGNAL  \u2022  C2PA-INSPIRED  \u2022  zgnal.ai', cx, y);
      y += 16;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = '400 8px "IBM Plex Mono", monospace';
      ctx.fillText('Multi-source verification  \u2022  Deterministic scoring  \u2022  Full provenance chain', cx, y);

      // Trim canvas to content
      const finalHeight = Math.min(y + 60, h);
      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = w;
      trimmedCanvas.height = finalHeight;
      const trimCtx = trimmedCanvas.getContext('2d')!;
      trimCtx.drawImage(canvas, 0, 0);

      trimmedCanvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zgnal-verification-${provenance.seed}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } finally {
      setDownloading(false);
    }
  }, [provenance, score, claims, citations, credibility]);

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
                  ZGNAL Verification Report
                </p>
                <p className="text-2xl font-mono font-bold text-white tracking-tight">{provenance.seed}</p>
                <p className="text-[10px] font-mono text-white/30">
                  {new Date(provenance.generatedAt).toLocaleString()}
                </p>
              </div>

              {/* Credibility Score */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#D4A84B]/30 to-transparent" />
              <div className="flex justify-center">
                <CredibilityGauge score={score} />
              </div>

              {/* Score Breakdown */}
              {credibility && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-center">
                    <p className="text-[8px] font-mono text-white/30 mb-0.5">Sources</p>
                    <p className="text-sm font-mono font-bold text-white/70">{credibility.breakdown.sourceCount}%</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-center">
                    <p className="text-[8px] font-mono text-white/30 mb-0.5">Verified</p>
                    <p className="text-sm font-mono font-bold text-white/70">{credibility.breakdown.crossVerified}%</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-center">
                    <p className="text-[8px] font-mono text-white/30 mb-0.5">Recency</p>
                    <p className="text-sm font-mono font-bold text-white/70">{credibility.breakdown.recency}%</p>
                  </div>
                </div>
              )}

              {/* Sourced Claims */}
              {claims.length > 0 && (
                <div>
                  <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-3">
                    Sourced Claims ({credibility?.claimsCrossVerified || 0}/{claims.length} verified)
                  </p>
                  <div className="space-y-2">
                    {claims.map((claim, i) => (
                      <ClaimRow key={i} claim={claim} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Citations */}
              {citations.length > 0 && (
                <div>
                  <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-3">
                    Citations ({citations.length})
                  </p>
                  <div className="space-y-2 bg-white/[0.02] border border-white/[0.04] p-3">
                    {citations.map((cit, i) => (
                      <CitationRow key={i} citation={cit} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Content Fingerprint */}
              <div>
                <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-2">Content Fingerprint</p>
                <p className="text-[10px] font-mono text-white/50 bg-white/[0.03] border border-white/[0.06] px-3 py-2 break-all">
                  SHA-256: {provenance.contentHash}
                </p>
              </div>

              {/* Data Lineage */}
              <div>
                <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-3">Data Lineage</p>
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

              {/* Compliance */}
              {provenance.compliance && (
                <div>
                  <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-2">Text Compliance</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                      <p className="text-[9px] font-mono text-white/30 mb-0.5">Corrections</p>
                      <p className="text-[14px] font-mono font-bold text-white/60">{provenance.compliance.corrections}</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                      <p className="text-[9px] font-mono text-white/30 mb-0.5">Risk Words</p>
                      <p className="text-[14px] font-mono font-bold text-white/60">{provenance.compliance.riskWords.length}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#D4A84B]/30 to-transparent" />
              <div className="text-center space-y-1">
                <p className="text-[10px] font-mono font-semibold text-[#D4A84B]/60">
                  Verified by ZGNAL &bull; C2PA-Inspired &bull; zgnal.ai
                </p>
                <p className="text-[8px] font-mono text-white/20">
                  Multi-source verification &bull; Deterministic scoring &bull; Full provenance chain
                </p>
                <p className="text-[7px] font-mono text-white/15 mt-2">
                  Credibility score measures source corroboration, not absolute truth.
                </p>
              </div>

              {/* Download button */}
              <button
                onClick={downloadCertificate}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 border border-[#D4A84B]/30 bg-[#D4A84B]/[0.06] px-4 py-3 text-xs font-mono font-semibold text-[#D4A84B] hover:bg-[#D4A84B]/10 transition-colors disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                {downloading ? 'Generating...' : 'Download Verification Report'}
              </button>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
