'use client';

import { useState } from 'react';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className="text-sm font-mono text-[#D4A84B]">
        You&apos;re on the list. We&apos;ll email you when Pro launches.
      </p>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@company.com"
          className="flex-1 bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#D4A84B]/50 font-mono"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="shrink-0 bg-white/[0.06] border border-white/[0.08] px-5 py-3 text-sm font-mono font-semibold text-[#D4A84B] hover:bg-white/[0.1] transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Notify me'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs font-mono text-red-400 mt-2">Something went wrong. Try again.</p>
      )}
    </>
  );
}
