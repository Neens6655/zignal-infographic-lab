'use client'

export default function LayoutsError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24 text-center">
      <h1 className="text-2xl font-mono font-bold text-white mb-4">Something went wrong</h1>
      <p className="text-sm text-white/40 mb-8">Failed to load this layout page.</p>
      <button
        onClick={reset}
        className="px-6 py-3 font-mono text-sm font-semibold bg-[#D4A84B] text-[#0A0A0B]"
      >
        Try again
      </button>
    </div>
  )
}
