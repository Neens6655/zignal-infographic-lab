'use client';

import { useRef, useEffect } from 'react';
import { ChatMessageView } from './chat-message';
import type { ChatMessage, ChatConfig } from '@/lib/chat-types';

type Props = {
  messages: ChatMessage[];
  config: ChatConfig;
  onSelectStyle: (styleId: string) => void;
  onSelectAspect: (aspect: string) => void;
  onToggleSimplify: () => void;
  onRegenerate: (content: string, style?: string) => void;
  onApproveResearch?: () => void;
  onEditResearch?: () => void;
};

export function ChatMessageList({
  messages,
  config,
  onSelectStyle,
  onSelectAspect,
  onToggleSimplify,
  onRegenerate,
  onApproveResearch,
  onEditResearch,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto z-scroll px-3 sm:px-4 py-4 space-y-3"
    >
      {messages.map((msg) => (
        <ChatMessageView
          key={msg.id}
          message={msg}
          config={config}
          onSelectStyle={onSelectStyle}
          onSelectAspect={onSelectAspect}
          onToggleSimplify={onToggleSimplify}
          onRegenerate={onRegenerate}
          onApproveResearch={onApproveResearch}
          onEditResearch={onEditResearch}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
