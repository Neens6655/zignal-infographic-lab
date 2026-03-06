'use client';

import type { ChatMessage } from '@/lib/chat-types';

type Props = {
  message: Extract<ChatMessage, { type: 'generating' }>;
};

const AGENTS = ['S', 'O', 'Sc', 'St', 'A', 'F', 'R'];

function getActiveAgent(progress: number): number {
  if (progress < 10) return 0;
  if (progress < 25) return 1;
  if (progress < 40) return 2;
  if (progress < 55) return 3;
  if (progress < 70) return 4;
  if (progress < 85) return 5;
  return 6;
}

export function GeneratingMessage({ message }: Props) {
  const activeIdx = getActiveAgent(message.progress);

  return (
    <div className="chat-msg-enter">
      {/* Inline progress — no wrapping box */}
      <div className="flex items-center gap-1 mb-1.5">
        {AGENTS.map((a, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 transition-all duration-300 ${
              i < activeIdx
                ? 'bg-(--z-gold)'
                : i === activeIdx
                ? 'bg-(--z-gold) animate-pulse-gold scale-125'
                : 'bg-white/10'
            }`}
          />
        ))}
        <span className="text-[10px] font-mono text-(--z-muted)/60 ml-1">
          {message.progress}%
        </span>
      </div>

      {/* Thin progress bar */}
      <div className="h-px bg-white/[0.06] mb-1.5 overflow-hidden">
        <div
          className="h-full bg-(--z-gold)/60 transition-all duration-500 ease-out"
          style={{ width: `${message.progress}%` }}
        />
      </div>

      <p className="text-[11px] text-(--z-muted)/70 font-mono">
        {message.message}
        <span className="chat-cursor" />
      </p>
    </div>
  );
}
