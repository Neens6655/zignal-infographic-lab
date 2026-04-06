'use client';

import { useState, useCallback, useRef } from 'react';
import { track } from '@vercel/analytics';
import type { GenerateInput } from '@/lib/types';

type ProvenanceData = {
  seed: string;
  generatedAt: string;
  contentHash: string;
  models: { analysis: string; image: string };
  pipeline: { stage: string; agent: string; result: string }[];
  references: string[];
  topics: string[];
  contentSources: string[];
  compliance?: {
    score: number;
    corrections: number;
    riskWords: string[];
    factFlags: string[];
  };
};

type GeneratePhase =
  | { phase: 'idle' }
  | { phase: 'submitting' }
  | { phase: 'streaming'; jobId: string; status: string; progress: number; message: string }
  | { phase: 'complete'; jobId: string; imageUrl: string; downloadUrl: string; metadata: Record<string, any>; provenance?: ProvenanceData }
  | { phase: 'error'; message: string };

/** Maximum time to wait for a complete/error event before showing timeout error */
const STREAM_TIMEOUT_MS = 60_000;
/** If no SSE event (including heartbeat) arrives within this window, assume connection died */
const HEARTBEAT_TIMEOUT_MS = 15_000;

export function useGenerate() {
  const [state, setState] = useState<GeneratePhase>({ phase: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (input: GenerateInput) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ phase: 'submitting' });
    const startTime = Date.now();

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errBody = await res.json().catch(() => ({ error: 'Generation failed' }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      setState({
        phase: 'streaming',
        jobId: 'inline',
        status: 'processing',
        progress: 0,
        message: 'Starting generation...',
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let eventType = '';
      let lastEventTime = Date.now();

      // Stream timeout — abort if total time exceeds limit
      const streamTimer = setTimeout(() => {
        controller.abort();
        setState({ phase: 'error', message: 'Generation timed out. Please try again.' });
        track('generation_error', { message: 'stream_timeout_60s' });
      }, STREAM_TIMEOUT_MS);

      // Heartbeat watchdog — abort if no data arrives for too long
      let heartbeatTimer = setInterval(() => {
        if (Date.now() - lastEventTime > HEARTBEAT_TIMEOUT_MS) {
          controller.abort();
          clearTimeout(streamTimer);
          clearInterval(heartbeatTimer);
          setState({ phase: 'error', message: 'Connection lost. Please try again.' });
          track('generation_error', { message: 'heartbeat_timeout' });
        }
      }, 5_000);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          lastEventTime = Date.now();
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (eventType === 'complete') {
                  clearTimeout(streamTimer);
                  clearInterval(heartbeatTimer);
                  const durationMs = Date.now() - startTime;
                  setState({
                    phase: 'complete',
                    jobId: 'inline',
                    imageUrl: data.image_url,
                    downloadUrl: data.download_url,
                    metadata: data.metadata || {},
                    provenance: data.provenance,
                  });
                  track('generation_complete', {
                    preset: input.preset || 'auto',
                    style: input.style || 'auto',
                    aspect_ratio: input.aspect_ratio || '16:9',
                    duration_ms: durationMs,
                  });
                  return;
                } else if (eventType === 'error') {
                  clearTimeout(streamTimer);
                  clearInterval(heartbeatTimer);
                  track('generation_error', { message: data.error || 'Generation failed' });
                  setState({ phase: 'error', message: data.error || 'Generation failed' });
                  return;
                } else if (eventType === 'heartbeat') {
                  // Heartbeat received — connection alive, no state change needed
                } else {
                  setState({
                    phase: 'streaming',
                    jobId: 'inline',
                    status: data.status || 'processing',
                    progress: data.progress || 0,
                    message: data.message || 'Processing...',
                  });
                }
              } catch { /* skip malformed JSON */ }
            }
          }
        }

        // Stream ended without complete/error event — treat as error
        clearTimeout(streamTimer);
        clearInterval(heartbeatTimer);
        if (state.phase === 'streaming' || state.phase === 'submitting') {
          setState({ phase: 'error', message: 'Generation interrupted. Please try again.' });
          track('generation_error', { message: 'stream_ended_without_complete' });
        }
      } finally {
        clearTimeout(streamTimer);
        clearInterval(heartbeatTimer);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setState({ phase: 'error', message: err.message || 'Failed to start generation' });
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ phase: 'idle' });
  }, []);

  return { state, generate, reset };
}
