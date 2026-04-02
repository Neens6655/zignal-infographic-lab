import Link from 'next/link'

export default function StyleNotFound() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24 text-center">
      <h1 className="text-2xl font-mono font-bold text-white mb-4">Style not found</h1>
      <p className="text-sm text-white/40 mb-8">
        This infographic style doesn't exist. Browse all 20 styles below.
      </p>
      <Link
        href="/styles"
        className="inline-block px-6 py-3 font-mono text-sm font-semibold bg-[#D4A84B] text-[#0A0A0B]"
      >
        Browse all styles
      </Link>
    </div>
  )
}
