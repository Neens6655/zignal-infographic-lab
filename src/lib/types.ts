export type JobStatus = 'queued' | 'processing' | 'researching' | 'analyzing' | 'generating' | 'complete' | 'failed';

export type Job = {
  job_id: string;
  status: JobStatus;
  progress: number;
  result: {
    image_url: string;
    download_url: string;
    metadata: {
      layout: string;
      style: string;
      preset: string;
      aspect_ratio: string;
      simplified: boolean;
      generated_at: string;
    };
  } | null;
  error: string | null;
  created_at: string;
};

export type GenerateInput = {
  content?: string;
  content_url?: string;
  preset?: string;
  layout?: string;
  style?: string;
  aspect_ratio?: string;
  quality?: string;
  language?: string;
  simplify?: boolean;
  reference_query?: string;
};

export type GenerateResponse = {
  job_id: string;
  status: string;
  estimated_seconds: number;
  status_url: string;
  mode: 'async' | 'sync';
};

export type Preset = {
  id: string;
  name: string;
  description: string;
  layout: string;
  style: string;
  tone: string;
  bestFor: string;
};

export type SSEEvent = {
  type: 'progress' | 'complete' | 'error';
  data: {
    status?: string;
    progress?: number;
    message?: string;
    image_url?: string;
    download_url?: string;
    error?: string;
    metadata?: Record<string, any>;
  };
};
