'use client';

import type { ChatMessage } from '@/lib/chat-types';

type Props = {
  message: Extract<ChatMessage, { type: 'text' }>;
};

export function TextMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-msg-enter flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] text-[13px] leading-relaxed ${
          isUser
            ? 'bg-(--z-gold)/[0.07] px-3 py-2 text-(--z-cream)'
            : 'text-(--z-cream)/90'
        }`}
      >
        {!isUser && (
          <span className="text-[10px] font-mono font-bold tracking-[0.12em] text-(--z-gold)/60 mr-1.5">Z</span>
        )}
        <span className="whitespace-pre-wrap">{message.content}</span>
      </div>
    </div>
  );
}
