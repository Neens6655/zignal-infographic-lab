'use client';

import { Loader2 } from 'lucide-react';

type Props = {
  status: string;
  progress: number;
  message: string;
};

export function ProgressDisplay({ status, progress, message }: Props) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--z-surface) p-6 space-y-4 glow-gold-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-(--z-gold)/10 flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-(--z-gold) animate-spin" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{message}</p>
          <p className="text-xs text-(--z-muted) font-mono">{progress}% complete</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-(--z-bg) overflow-hidden">
        <div
          className="h-full rounded-full bg-(--z-gold) transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-1">
        {['Extract', 'Research', 'Analyze', 'Structure', 'Generate'].map((stage, i) => {
          const stageProgress = [10, 15, 25, 55, 65];
          const isActive = progress >= stageProgress[i];
          const isCurrent = progress >= stageProgress[i] && (i === 4 || progress < stageProgress[i + 1]);
          return (
            <div
              key={stage}
              className={`flex-1 text-center py-1 rounded text-[10px] font-mono transition-colors ${
                isCurrent
                  ? 'bg-(--z-gold)/15 text-(--z-gold) font-semibold'
                  : isActive
                    ? 'bg-(--z-olive)/10 text-(--z-olive)'
                    : 'bg-(--z-surface-2) text-(--z-muted)'
              }`}
            >
              {stage}
            </div>
          );
        })}
      </div>
    </div>
  );
}
