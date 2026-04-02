import Link from 'next/link'
import { Sparkles } from 'lucide-react'

interface CTASectionProps {
  text: string
  href: string
  accent?: string
}

export function CTASection({ text, href, accent }: CTASectionProps) {
  return (
    <section className="py-16 border-t border-white/[0.06]">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-mono font-bold text-white mb-4">
          Ready to create?
        </h2>
        <p className="text-sm text-white/40 mb-8 max-w-md mx-auto">
          {text}
        </p>
        <Link
          href={href}
          className="inline-flex items-center gap-2 px-6 py-3 font-mono text-sm font-semibold transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white focus-visible:ring-offset-[#0A0A0B] outline-none"
          style={{
            backgroundColor: accent ?? '#D4A84B',
            color: '#0A0A0B',
          }}
        >
          <Sparkles className="h-4 w-4" />
          Generate Infographic
        </Link>
      </div>
    </section>
  )
}
