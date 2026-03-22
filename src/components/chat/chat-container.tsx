'use client';

import { useChat } from '@/hooks/use-chat';
import { ChatMessageList } from './chat-message-list';
import { ChatInput } from './chat-input';
import { X, Maximize2, Minimize2 } from 'lucide-react';

type Props = {
  onClose?: () => void;
  onToggleMaximize?: () => void;
  isMaximized?: boolean;
  isFullPage?: boolean;
};

export function ChatContainer({ onClose, onToggleMaximize, isMaximized, isFullPage }: Props) {
  const {
    messages,
    config,
    isGenerating,
    sendMessage,
    selectStyle,
    selectAspect,
    toggleSimplify,
    regenerate,
    approveResearch,
    editResearch,
    resetChat,
  } = useChat();

  return (
    <div className="flex flex-col h-full overflow-hidden chat-bg">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" fill="#D4A84B" />
            <path d="M6 7H22V11.5L13 22H22V27H6V22.5L15 12H6V7Z" fill="#0A0A0B" />
          </svg>
          <div className="flex flex-col leading-none">
            <span className="font-sans text-[13px] font-bold text-(--z-cream) tracking-tight">
              Infographic Builder
            </span>
            <span className="text-[9px] font-mono text-(--z-muted)/40 tracking-widest">
              ZGNAL.AI
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="p-1.5 text-(--z-muted)/40 hover:text-(--z-cream) transition-colors"
              aria-label={isMaximized ? 'Minimize' : 'Maximize'}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-(--z-muted)/40 hover:text-(--z-cream) transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <ChatMessageList
        messages={messages}
        config={config}
        onSelectStyle={selectStyle}
        onSelectAspect={selectAspect}
        onToggleSimplify={toggleSimplify}
        onRegenerate={regenerate}
        onApproveResearch={approveResearch}
        onEditResearch={editResearch}
      />

      {/* ── Input ── */}
      <ChatInput
        onSend={sendMessage}
        isGenerating={isGenerating}
      />
    </div>
  );
}
