'use client';

import type { ChatMessage } from '@/lib/chat-types';

type Props = {
  message: Extract<ChatMessage, { type: 'research-preview' }>;
  onApprove: () => void;
  onEdit: () => void;
};

export function ResearchPreviewMessage({ message, onApprove, onEdit }: Props) {
  const { data, approved } = message;

  return (
    <div className="chat-msg-enter flex justify-start">
      <div className="max-w-[95%] w-full">
        <span className="text-[10px] font-mono font-bold tracking-[0.12em] text-(--z-gold)/60 mr-1.5">Z</span>
        <span className="text-[10px] font-mono tracking-wider text-(--z-cream)/50 uppercase">Research Complete</span>

        {/* Summary bar */}
        <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-(--z-cream)/60">
          <span className="text-(--z-gold)">{data.verified.length + data.corroborated.length} facts</span>
          <span>|</span>
          <span>{data.sourceNames.length} sources</span>
          <span>|</span>
          <span>Confidence: {data.overallConfidence}/100</span>
          <span>|</span>
          <span>{data.dataFreshness}</span>
        </div>

        {/* Verified facts */}
        {data.verified.length > 0 && (
          <div className="mt-3">
            <div className="text-[10px] font-mono tracking-wider text-emerald-400/80 uppercase mb-1">
              Verified (2+ sources)
            </div>
            <div className="space-y-1">
              {data.verified.map((fact, i) => (
                <div key={i} className="text-[12px] text-(--z-cream)/80 flex gap-2">
                  <span className="text-emerald-400 shrink-0">&#10003;</span>
                  <span>
                    {fact.text}
                    {fact.year && <span className="text-(--z-cream)/40 ml-1">({fact.year})</span>}
                    {fact.sources.length > 0 && (
                      <span className="text-(--z-cream)/30 ml-1"> — {fact.sources.join(', ')}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Corroborated */}
        {data.corroborated.length > 0 && (
          <div className="mt-2">
            <div className="text-[10px] font-mono tracking-wider text-amber-400/80 uppercase mb-1">
              Single Source
            </div>
            <div className="space-y-1">
              {data.corroborated.map((fact, i) => (
                <div key={i} className="text-[12px] text-(--z-cream)/60 flex gap-2">
                  <span className="text-amber-400 shrink-0">~</span>
                  <span>{fact.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Excluded */}
        {data.excluded.length > 0 && (
          <div className="mt-2">
            <div className="text-[10px] font-mono tracking-wider text-red-400/80 uppercase mb-1">
              Excluded (unverified)
            </div>
            <div className="space-y-1">
              {data.excluded.map((item, i) => (
                <div key={i} className="text-[12px] text-(--z-cream)/40 flex gap-2">
                  <span className="text-red-400 shrink-0">&#10007;</span>
                  <span>{item.text} — {item.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        <div className="mt-2 text-[10px] text-(--z-cream)/30 font-mono">
          Sources: {data.sourceNames.join(', ')}
        </div>

        {/* Approval buttons */}
        {!approved && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={onApprove}
              className="px-4 py-1.5 text-[11px] font-mono tracking-wider uppercase bg-(--z-gold) text-(--z-bg) hover:bg-(--z-gold)/80 transition-colors"
            >
              Approve &amp; Generate
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-1.5 text-[11px] font-mono tracking-wider uppercase border border-(--z-cream)/20 text-(--z-cream)/60 hover:border-(--z-cream)/40 transition-colors"
            >
              Edit Facts
            </button>
          </div>
        )}

        {approved && (
          <div className="mt-2 text-[10px] font-mono text-emerald-400/60 uppercase tracking-wider">
            &#10003; Approved — generating infographic
          </div>
        )}
      </div>
    </div>
  );
}
