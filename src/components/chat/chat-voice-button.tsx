'use client';

import { Mic, MicOff } from 'lucide-react';

type Props = {
  isListening: boolean;
  supported: boolean;
  onToggle: () => void;
};

export function ChatVoiceButton({ isListening, supported, onToggle }: Props) {
  if (!supported) return null;

  return (
    <button
      onClick={onToggle}
      className={`shrink-0 p-2 transition-colors ${
        isListening
          ? 'text-(--z-brick) voice-recording'
          : 'text-(--z-muted) hover:text-(--z-cream)'
      }`}
      aria-label={isListening ? 'Stop recording' : 'Start recording'}
    >
      {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
    </button>
  );
}
