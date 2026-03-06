'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useGenerate } from './use-generate';
import type { ChatMessage, ChatConfig, GenerationContext } from '@/lib/chat-types';
import type { GenerateInput } from '@/lib/types';

let msgCounter = 0;
function nextId() {
  return `msg-${Date.now()}-${++msgCounter}`;
}

const WELCOME: ChatMessage = {
  type: 'text',
  id: 'welcome',
  role: 'assistant',
  content: 'Paste any content below and I\'ll turn it into a publication-grade infographic. Pick a style or leave it on Auto.',
};

const STYLE_PICKER: ChatMessage = {
  type: 'style-picker',
  id: 'style-picker-init',
  role: 'assistant',
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME, STYLE_PICKER]);
  const [config, setConfig] = useState<ChatConfig>({
    preset: 'auto',
    style: '',
    aspectRatio: '16:9',
    simplify: true,
  });
  const { state: genState, generate, reset: resetGen } = useGenerate();
  const activeGenId = useRef<string | null>(null);
  const pendingContent = useRef<string | null>(null);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } as ChatMessage : m))
    );
  }, []);

  const replaceMessage = useCallback((id: string, msg: ChatMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? msg : m)));
  }, []);

  // Watch generation state → update the active generating message
  useEffect(() => {
    if (!activeGenId.current) return;
    const id = activeGenId.current;

    if (genState.phase === 'streaming') {
      updateMessage(id, {
        type: 'generating',
        progress: genState.progress,
        status: genState.status,
        message: genState.message,
      });
    } else if (genState.phase === 'complete') {
      const ctx: GenerationContext = {
        content: pendingContent.current || '',
        preset: config.preset,
        style: config.style,
        aspectRatio: config.aspectRatio,
        simplify: config.simplify,
      };
      replaceMessage(id, {
        type: 'image-result',
        id,
        role: 'assistant',
        imageUrl: genState.imageUrl,
        downloadUrl: genState.downloadUrl,
        metadata: genState.metadata,
        provenance: genState.provenance,
        context: ctx,
      });
      activeGenId.current = null;
      pendingContent.current = null;
    } else if (genState.phase === 'error') {
      replaceMessage(id, {
        type: 'error',
        id,
        role: 'assistant',
        error: genState.message,
      });
      activeGenId.current = null;
      pendingContent.current = null;
    }
  }, [genState, config, updateMessage, replaceMessage]);

  const sendMessage = useCallback(
    async (content: string) => {
      // Add user message
      const userMsg: ChatMessage = { type: 'text', id: nextId(), role: 'user', content };
      addMessage(userMsg);

      // Create generating placeholder
      const genId = nextId();
      activeGenId.current = genId;
      pendingContent.current = content;
      const genMsg: ChatMessage = {
        type: 'generating',
        id: genId,
        role: 'assistant',
        progress: 0,
        status: 'submitting',
        message: 'Starting generation...',
      };
      addMessage(genMsg);

      // Build input
      const isUrl = /^https?:\/\//i.test(content.trim());
      const input: GenerateInput = {
        ...(isUrl ? { content_url: content.trim() } : { content: content.trim() }),
        preset: config.preset === 'auto' ? undefined : config.preset,
        style: config.style || undefined,
        aspect_ratio: config.aspectRatio,
        simplify: config.simplify,
      };

      await generate(input);
    },
    [config, addMessage, generate]
  );

  const selectStyle = useCallback(
    (styleId: string) => {
      setConfig((prev) => ({ ...prev, style: styleId }));
      // Update the style-picker message to show selection
      setMessages((prev) =>
        prev.map((m) =>
          m.type === 'style-picker'
            ? { ...m, selectedStyle: styleId } as ChatMessage
            : m
        )
      );
    },
    []
  );

  const selectAspect = useCallback(
    (aspect: string) => {
      setConfig((prev) => ({ ...prev, aspectRatio: aspect }));
      setMessages((prev) =>
        prev.map((m) =>
          m.type === 'style-picker'
            ? { ...m, selectedAspect: aspect } as ChatMessage
            : m
        )
      );
    },
    []
  );

  const toggleSimplify = useCallback(() => {
    setConfig((prev) => ({ ...prev, simplify: !prev.simplify }));
  }, []);

  const regenerate = useCallback(
    (content: string, overrideStyle?: string) => {
      if (overrideStyle) {
        setConfig((prev) => ({ ...prev, style: overrideStyle }));
      }
      // Show new style picker then generate
      if (overrideStyle) {
        const pickerId = nextId();
        addMessage({
          type: 'style-picker',
          id: pickerId,
          role: 'assistant',
          selectedStyle: overrideStyle,
        });
      }
      sendMessage(content);
    },
    [addMessage, sendMessage]
  );

  const resetChat = useCallback(() => {
    resetGen();
    activeGenId.current = null;
    pendingContent.current = null;
    setMessages([WELCOME, STYLE_PICKER]);
    setConfig({ preset: 'auto', style: '', aspectRatio: '16:9', simplify: true });
  }, [resetGen]);

  return {
    messages,
    config,
    isGenerating: genState.phase === 'submitting' || genState.phase === 'streaming',
    sendMessage,
    selectStyle,
    selectAspect,
    toggleSimplify,
    regenerate,
    resetChat,
  };
}
