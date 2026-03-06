'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download, ZoomIn, X, RotateCcw, Palette, Loader2,
} from 'lucide-react';
import { exportAsJpeg, exportAsPdf, exportAsPptx, exportAsPng } from '@/lib/export-utils';
import type { ChatMessage } from '@/lib/chat-types';

type Props = {
  message: Extract<ChatMessage, { type: 'image-result' }>;
  onRegenerate: (content: string, style?: string) => void;
};

export function ImageResultMessage({ message, onRegenerate }: Props) {
  const [zoomed, setZoomed] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const displayUrl = message.imageUrl.startsWith('http') || message.imageUrl.startsWith('data:')
    ? message.imageUrl
    : `${process.env.NEXT_PUBLIC_ENGINE_URL || ''}/tmp/${message.imageUrl.split(/[/\\]/).pop()}`;

  const handleExport = async (format: string) => {
    setExporting(format);
    try {
      if (format === 'png') await exportAsPng(displayUrl);
      else if (format === 'jpeg') await exportAsJpeg(displayUrl);
      else if (format === 'pdf') await exportAsPdf(displayUrl);
      else if (format === 'pptx') await exportAsPptx(displayUrl);
    } finally {
      setExporting(null);
      setShowExport(false);
    }
  };

  return (
    <>
      <div className="chat-msg-enter">
        {/* Image — contained within chat, not edge-to-edge */}
        <div
          className="relative cursor-pointer active:opacity-90 overflow-hidden max-h-[50vh]"
          onClick={() => setZoomed(true)}
        >
          <img
            src={displayUrl}
            alt="Generated infographic"
            className={`w-full h-auto object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="aspect-video bg-white/[0.02] flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-(--z-gold) animate-spin" />
            </div>
          )}
          {/* Subtle zoom hint */}
          <div className="absolute bottom-2 right-2 p-1 bg-black/40 backdrop-blur-sm">
            <ZoomIn className="w-3.5 h-3.5 text-white/70" />
          </div>
        </div>

        {/* Actions — simple text row */}
        <div className="flex items-center gap-4 pt-2">
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="flex items-center gap-1 text-[11px] font-mono font-medium text-(--z-cream)/70 active:text-(--z-gold) transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Save
            </button>
            <AnimatePresence>
              {showExport && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute bottom-full left-0 mb-1.5 bg-(--z-surface) border border-white/[0.08] z-50"
                >
                  {(['png', 'jpeg', 'pdf', 'pptx'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleExport(fmt)}
                      disabled={!!exporting}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] font-mono text-(--z-cream) hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors disabled:opacity-40"
                    >
                      {exporting === fmt && <Loader2 className="w-3 h-3 animate-spin" />}
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => onRegenerate(message.context.content)}
            className="flex items-center gap-1 text-[11px] font-mono font-medium text-(--z-cream)/70 active:text-(--z-gold) transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Redo
          </button>

          <button
            onClick={() => onRegenerate(message.context.content, '')}
            className="flex items-center gap-1 text-[11px] font-mono font-medium text-(--z-cream)/70 active:text-(--z-gold) transition-colors"
          >
            <Palette className="w-3.5 h-3.5" />
            Restyle
          </button>

          {message.metadata?.style && (
            <span className="ml-auto text-[9px] font-mono text-(--z-muted)/40">
              {message.metadata.style}
            </span>
          )}
        </div>
      </div>

      {/* Zoom lightbox */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center cursor-zoom-out"
            onClick={() => setZoomed(false)}
          >
            <button
              onClick={() => setZoomed(false)}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              src={displayUrl}
              alt="Zoomed infographic"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
