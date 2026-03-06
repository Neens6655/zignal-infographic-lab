'use client';

import { AlertCircle } from 'lucide-react';
import type { ChatMessage } from '@/lib/chat-types';

type Props = {
  message: Extract<ChatMessage, { type: 'error' }>;
};

export function ErrorMessage({ message }: Props) {
  return (
    <div className="chat-msg-enter flex justify-start">
      <div className="max-w-[85%] bg-(--z-brick)/[0.08] border border-(--z-brick)/20 px-3.5 py-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <AlertCircle className="w-3.5 h-3.5 text-(--z-brick)" />
          <span className="text-[10px] font-mono font-bold tracking-[0.15em] text-(--z-brick)">
            ERROR
          </span>
        </div>
        <p className="text-[12px] text-(--z-cream)/80">{message.error}</p>
        <p className="text-[10px] text-(--z-muted) mt-1.5">Try again with different content or check your connection.</p>
      </div>
    </div>
  );
}
