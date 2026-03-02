import type { GenerateInput, GenerateResponse, Job } from './types';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error?.message || body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function submitGeneration(input: GenerateInput): Promise<GenerateResponse> {
  return apiFetch<GenerateResponse>('/api/generate', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getJobStatus(jobId: string): Promise<Job> {
  return apiFetch<Job>(`/api/jobs/${jobId}`);
}

export function streamJobProgress(
  jobId: string,
  onProgress: (data: { status: string; progress: number; message: string }) => void,
  onComplete: (data: { image_url: string; download_url: string; metadata: Record<string, any> }) => void,
  onError: (error: string) => void,
): () => void {
  let aborted = false;
  const controller = new AbortController();

  async function connect() {
    try {
      const res = await fetch(`/api/jobs/${jobId}/stream`, {
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        onError('Failed to connect to progress stream');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!aborted) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (eventType === 'complete') {
                onComplete(data);
                return;
              } else if (eventType === 'error') {
                onError(data.error || 'Generation failed');
                return;
              } else {
                onProgress(data);
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      if (!aborted) {
        onError(err.message || 'Stream connection lost');
      }
    }
  }

  connect();

  return () => {
    aborted = true;
    controller.abort();
  };
}
