'use client';

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react';
import { Send, Paperclip, Link2, Upload, Video, Loader2, Mic, MicOff, Square } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useVoiceInput } from '@/hooks/use-voice-input';

type Props = {
  onSend: (content: string) => void;
  isGenerating: boolean;
};

export function ChatInput({ onSend, isGenerating }: Props) {
  const [value, setValue] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { voiceState, transcript, interimTranscript, supported, toggleListening, stopListening, clearTranscript } =
    useVoiceInput();

  useEffect(() => {
    if (transcript) {
      setValue((prev) => prev + transcript);
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isGenerating) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [value, isGenerating, onSend]);

  // Stop recording and send whatever we have
  const handleStopAndSend = useCallback(() => {
    stopListening();
    // Small delay to let final transcript flush
    setTimeout(() => {
      const trimmed = value.trim();
      if (trimmed) {
        onSend(trimmed);
        setValue('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      }
    }, 300);
  }, [stopListening, value, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePasteUrl = async () => {
    setShowAttach(false);
    const url = prompt('Paste a URL:');
    if (!url) return;
    setExtracting(true);
    try {
      const res = await fetch('/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.content) { setValue((prev) => (prev ? prev + '\n\n' : '') + data.content); autoGrow(); }
    } catch { /* ignore */ } finally { setExtracting(false); }
  };

  const handleFileUpload = async () => {
    setShowAttach(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.pdf,.docx,.csv';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setExtracting(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/extract-file', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.content) { setValue((prev) => (prev ? prev + '\n\n' : '') + data.content); autoGrow(); }
      } catch { /* ignore */ } finally { setExtracting(false); }
    };
    input.click();
  };

  const handleVideoLink = async () => {
    setShowAttach(false);
    const url = prompt('Paste a video URL (YouTube, etc.):');
    if (!url) return;
    setExtracting(true);
    try {
      const res = await fetch('/api/extract-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.content) { setValue((prev) => (prev ? prev + '\n\n' : '') + data.content); autoGrow(); }
    } catch { /* ignore */ } finally { setExtracting(false); }
  };

  const hasContent = value.trim().length > 0;
  const isListening = voiceState === 'listening';

  return (
    <div
      className="shrink-0 px-3 py-2.5"
      style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
    >
      {/* Extracting */}
      <AnimatePresence>
        {extracting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 pb-1.5 text-[10px] font-mono text-(--z-gold)/70"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            Extracting...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice interim transcript */}
      <AnimatePresence>
        {isListening && interimTranscript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pb-1.5 text-[11px] text-(--z-gold)/50 font-mono italic truncate"
          >
            {interimTranscript}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row with subtle bg */}
      <div className="flex items-end gap-1.5 bg-white/[0.04] border border-white/[0.06] px-1.5 py-1">
        {/* Attach */}
        <div className="relative">
          <button
            onClick={() => setShowAttach(!showAttach)}
            className="shrink-0 p-2 text-(--z-muted)/50 hover:text-(--z-cream) active:text-(--z-cream) transition-colors"
            aria-label="Attach"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {showAttach && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute bottom-full left-0 mb-1 bg-(--z-surface) border border-white/[0.08] z-50"
              >
                {[
                  { fn: handlePasteUrl, icon: Link2, label: 'URL' },
                  { fn: handleFileUpload, icon: Upload, label: 'File' },
                  { fn: handleVideoLink, icon: Video, label: 'Video' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.fn}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] font-mono text-(--z-cream)/80 hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors"
                  >
                    <item.icon className="w-3.5 h-3.5" /> {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); autoGrow(); }}
          onKeyDown={handleKeyDown}
          placeholder={isGenerating ? 'Generating...' : 'Paste content or type a topic...'}
          disabled={isGenerating}
          rows={1}
          className="flex-1 bg-transparent text-[13px] text-(--z-cream) placeholder:text-(--z-muted)/30 resize-none focus:outline-none font-sans leading-relaxed min-h-[36px] max-h-[160px] py-2"
        />

        {/* Voice toggle */}
        {supported && !isListening && (
          <button
            onClick={toggleListening}
            className="shrink-0 p-2 text-(--z-muted)/40 hover:text-(--z-cream) transition-colors"
            aria-label="Start recording"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}

        {/* Send / Stop-and-Send */}
        {isListening ? (
          <button
            onClick={handleStopAndSend}
            className="shrink-0 p-2 bg-(--z-brick) text-white chat-send-pulse transition-all"
            aria-label="Stop recording and send"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!hasContent || isGenerating}
            className={`shrink-0 p-2 transition-all ${
              hasContent && !isGenerating
                ? 'bg-(--z-gold) text-(--z-bg)'
                : 'text-(--z-muted)/20'
            }`}
            aria-label="Send"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
