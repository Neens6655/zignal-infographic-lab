'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { STYLE_CATALOG } from '@/lib/chat-types';
import type { ChatMessage, ChatConfig } from '@/lib/chat-types';

type Props = {
  message: Extract<ChatMessage, { type: 'style-picker' }>;
  config: ChatConfig;
  onSelectStyle: (styleId: string) => void;
  onSelectAspect: (aspect: string) => void;
  onToggleSimplify: () => void;
};

const ASPECTS = ['16:9', '9:16', '1:1'] as const;

export function StylePickerMessage({
  message,
  config,
  onSelectStyle,
  onSelectAspect,
  onToggleSimplify,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const selectedStyle = message.selectedStyle || config.style;
  const selectedEntry = STYLE_CATALOG.find((s) => s.id === selectedStyle);

  return (
    <div className="chat-msg-enter">
      {/* Current selection + toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 w-full text-left py-1 group"
      >
        <span
          className="w-2.5 h-2.5 shrink-0"
          style={{ background: selectedEntry?.accent || '#D4A84B', borderStyle: selectedEntry ? 'solid' : 'dashed', borderWidth: selectedEntry ? 0 : 1, borderColor: '#D4A84B' }}
        />
        <span className="text-[12px] font-mono font-semibold text-(--z-cream)">
          {selectedEntry?.label || 'Auto'}
        </span>
        <span className="text-[10px] text-(--z-muted)/50 ml-auto font-mono">
          {config.aspectRatio}
        </span>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-(--z-muted)/40" />
          : <ChevronDown className="w-3.5 h-3.5 text-(--z-muted)/40" />
        }
      </button>

      {/* Expandable grid of styles */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Options row FIRST — always visible above styles */}
            <div className="flex items-center gap-1 py-1.5 flex-wrap">
              {ASPECTS.map((a) => (
                <button
                  key={a}
                  onClick={() => onSelectAspect(a)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold transition-colors ${
                    config.aspectRatio === a
                      ? 'bg-(--z-gold)/12 text-(--z-gold)'
                      : 'text-(--z-muted)/50 active:text-(--z-cream)'
                  }`}
                >
                  {a}
                </button>
              ))}
              <span className="text-(--z-muted)/15 mx-0.5">|</span>
              <button
                onClick={onToggleSimplify}
                className={`px-2 py-1 text-[10px] font-mono font-bold transition-colors ${
                  config.simplify
                    ? 'text-(--z-gold)'
                    : 'text-(--z-muted)/50 active:text-(--z-cream)'
                }`}
              >
                Simplify {config.simplify ? 'on' : 'off'}
              </button>
            </div>

            {/* Style grid — 2 cols mobile, 3 cols desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 pb-1.5 max-h-[45vh] overflow-y-auto hide-scrollbar">
              {/* Auto */}
              <button
                onClick={() => { onSelectStyle(''); setExpanded(false); }}
                className={`flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-mono font-medium transition-all ${
                  !selectedStyle
                    ? 'bg-(--z-gold)/12 text-(--z-gold)'
                    : 'bg-white/[0.03] text-(--z-muted) active:bg-white/[0.06]'
                }`}
              >
                <span className="w-2 h-2 border border-dashed border-(--z-gold)/50 shrink-0" />
                Auto
              </button>

              {STYLE_CATALOG.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { onSelectStyle(s.id); setExpanded(false); }}
                  className={`flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-mono font-medium transition-all truncate ${
                    selectedStyle === s.id
                      ? 'bg-current/12'
                      : 'bg-white/[0.03] text-(--z-cream)/60 active:bg-white/[0.06]'
                  }`}
                  style={selectedStyle === s.id ? { color: s.accent } : undefined}
                >
                  <span className="w-2 h-2 shrink-0" style={{ background: s.accent }} />
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
