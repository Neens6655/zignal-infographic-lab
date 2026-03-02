'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/site-header';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, ExternalLink, Clock, ArrowLeft } from 'lucide-react';
import type { Job } from '@/lib/types';

export default function DashboardPage() {
  const { user, isAnonymous, isLoading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user || isAnonymous) return;

    async function fetchJobs() {
      try {
        const res = await fetch('/api/jobs');
        if (res.ok) {
          const data = await res.json();
          setJobs(Array.isArray(data) ? data : data.jobs || []);
        }
      } catch {} finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [user, isAnonymous, authLoading]);

  // Redirect anonymous users
  if (!authLoading && (isAnonymous || !user)) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="font-mono text-xl font-bold mb-2">Sign in to see your history</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your generated infographics will appear here after you sign in.
          </p>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to generator
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-mono text-xl font-bold">Generation History</h1>
          <Button asChild size="sm" variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              New
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-4 flex gap-4">
                <Skeleton className="h-20 w-28 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground mb-4">No infographics generated yet.</p>
            <Button asChild>
              <Link href="/">Create your first infographic</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.job_id} className="rounded-xl border bg-card p-4 flex gap-4 shadow-terminal">
                {/* Thumbnail */}
                {job.result?.image_url && (
                  <div className="h-20 w-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={job.result.image_url}
                      alt="Generated infographic"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {job.result?.metadata?.preset && (
                      <span className="inline-flex items-center rounded-full bg-(--z-gold)/10 px-2 py-0.5 text-[10px] font-mono text-(--z-gold)">
                        {job.result.metadata.preset}
                      </span>
                    )}
                    {job.result?.metadata?.layout && (
                      <span className="inline-flex items-center rounded-full bg-(--z-blue)/10 px-2 py-0.5 text-[10px] font-mono text-(--z-blue)">
                        {job.result.metadata.layout}
                      </span>
                    )}
                    {job.result?.metadata?.style && (
                      <span className="inline-flex items-center rounded-full bg-(--z-olive)/10 px-2 py-0.5 text-[10px] font-mono text-(--z-olive)">
                        {job.result.metadata.style}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(job.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Actions */}
                {job.result?.download_url && (
                  <div className="flex items-center">
                    <Button size="sm" variant="ghost" asChild>
                      <a href={job.result.download_url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
