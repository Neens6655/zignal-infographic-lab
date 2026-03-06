'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare } from 'lucide-react';
import { ChatContainer } from './chat-container';

export function ChatFAB() {
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Lock body scroll when chat is open (mobile or maximized)
  useEffect(() => {
    if (open && (isMobile || maximized)) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open, isMobile, maximized]);

  const toggle = useCallback(() => {
    setOpen((v) => !v);
    setMaximized(false);
  }, []);

  const toggleMaximize = useCallback(() => {
    setMaximized((v) => !v);
  }, []);

  // Full-screen: mobile OR maximized desktop
  const isFullScreen = isMobile || maximized;

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={toggle}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-(--z-gold) text-(--z-bg) flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Open chat"
            style={{ borderRadius: '50%' }}
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 z-50 ${maximized ? 'bg-black/60' : ''}`}
                onClick={maximized ? undefined : toggle}
              />
            )}

            <motion.div
              initial={isFullScreen ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
              animate={isFullScreen ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
              exit={isFullScreen ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              layout
              className={
                isFullScreen
                  ? 'fixed inset-0 z-[60]'
                  : 'fixed bottom-6 right-6 z-[60] w-[420px] h-[660px] max-h-[calc(100vh-48px)] border border-white/[0.08] shadow-2xl overflow-hidden'
              }
              style={isFullScreen ? { height: '100dvh' } : undefined}
            >
              <ChatContainer
                onClose={toggle}
                onToggleMaximize={isMobile ? undefined : toggleMaximize}
                isMaximized={maximized}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
