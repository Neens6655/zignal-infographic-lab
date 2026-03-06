'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[error-boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-(--z-bg) flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-(--z-gold)/10 flex items-center justify-center">
          <span className="font-mono text-2xl text-(--z-gold)">!</span>
        </div>
        <h1 className="font-mono text-xl font-bold text-(--z-text) tracking-tight">
          Something went wrong
        </h1>
        <p className="font-sans text-sm text-(--z-text-secondary) leading-relaxed">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="font-mono text-xs font-semibold tracking-widest uppercase px-6 py-3 bg-(--z-gold) text-(--z-bg) hover:opacity-90 transition-opacity cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
