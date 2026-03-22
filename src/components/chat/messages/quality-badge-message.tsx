'use client';

import type { QualityBadgeData } from '@/lib/chat-types';

type Props = {
  badge: QualityBadgeData;
};

const LEVEL_STYLES = {
  green: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  yellow: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
} as const;

export function QualityBadge({ badge }: Props) {
  const s = LEVEL_STYLES[badge.level];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 border ${s.bg} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      <span className={`text-[11px] font-mono tracking-wider uppercase ${s.text}`}>
        {badge.label}
      </span>
      <span className="text-[10px] font-mono text-(--z-cream)/40">
        {badge.overall}/100
      </span>
      {badge.retryCount > 0 && (
        <span className="text-[9px] font-mono text-(--z-cream)/30">
          ({badge.retryCount} {badge.retryCount === 1 ? 'retry' : 'retries'})
        </span>
      )}
    </div>
  );
}
