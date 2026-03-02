'use client';

import { useState, useCallback, useRef } from 'react';
import { submitGeneration, streamJobProgress, getJobStatus } from '@/lib/engine';
import type { GenerateInput } from '@/lib/types';

type GeneratePhase =
  | { phase: 'idle' }
  | { phase: 'submitting' }
  | { phase: 'streaming'; jobId: string; status: string; progress: number; message: string }
  | { phase: 'complete'; jobId: string; imageUrl: string; downloadUrl: string; metadata: Record<string, any> }
  | { phase: 'error'; message: string };

export function useGenerate() {
  const [state, setState] = useState<GeneratePhase>({ phase: 'idle' });
  const cleanupRef = useRef<(() => void) | null>(null);

  const generate = useCallback(async (input: GenerateInput) => {
    // Cleanup previous stream
    cleanupRef.current?.();
    cleanupRef.current = null;

    setState({ phase: 'submitting' });

    try {
      const response = await submitGeneration(input);
      const jobId = response.job_id;

      setState({
        phase: 'streaming',
        jobId,
        status: 'queued',
        progress: 0,
        message: 'Starting generation...',
      });

      // Try SSE streaming first
      const cleanup = streamJobProgress(
        jobId,
        (data) => {
          setState({
            phase: 'streaming',
            jobId,
            status: data.status || 'processing',
            progress: data.progress || 0,
            message: data.message || getStatusMessage(data.status),
          });
        },
        (data) => {
          setState({
            phase: 'complete',
            jobId,
            imageUrl: data.image_url,
            downloadUrl: data.download_url,
            metadata: data.metadata || {},
          });
        },
        (error) => {
          // SSE failed — fall back to polling
          pollForCompletion(jobId, setState);
        },
      );

      cleanupRef.current = cleanup;
    } catch (err: any) {
      setState({ phase: 'error', message: err.message || 'Failed to start generation' });
    }
  }, []);

  const reset = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setState({ phase: 'idle' });
  }, []);

  return { state, generate, reset };
}

function getStatusMessage(status?: string): string {
  switch (status) {
    case 'queued': return 'In queue...';
    case 'processing': return 'Extracting content...';
    case 'researching': return 'Researching references & verifying facts...';
    case 'analyzing': return 'Analyzing structure & selecting layout...';
    case 'generating': return 'Rendering your infographic...';
    case 'complete': return 'Done!';
    case 'failed': return 'Generation failed';
    default: return 'Processing...';
  }
}

async function pollForCompletion(
  jobId: string,
  setState: (s: GeneratePhase) => void,
) {
  const maxAttempts = 120; // 2 minutes at 1s intervals
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const job = await getJobStatus(jobId);

      if (job.status === 'complete' && job.result) {
        setState({
          phase: 'complete',
          jobId,
          imageUrl: job.result.image_url,
          downloadUrl: job.result.download_url,
          metadata: job.result.metadata || {},
        });
        return;
      }

      if (job.status === 'failed') {
        setState({ phase: 'error', message: job.error || 'Generation failed' });
        return;
      }

      setState({
        phase: 'streaming',
        jobId,
        status: job.status,
        progress: job.progress,
        message: getStatusMessage(job.status),
      });
    } catch {}

    await new Promise((r) => setTimeout(r, 1000));
  }

  setState({ phase: 'error', message: 'Generation timed out' });
}
