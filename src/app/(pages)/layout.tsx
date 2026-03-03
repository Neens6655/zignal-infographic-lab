import Link from 'next/link';

function ZignalLogo({ size = 17, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 4h16v3H9.5L20 18v2H4v-3h10.5L4 6V4z" fill="currentColor" />
    </svg>
  );
}

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full bg-[#0A0A0B]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="h-8 w-8 bg-gradient-to-br from-[#E8C96A] to-[#D4A84B] flex items-center justify-center shadow-[0_0_12px_rgba(212,168,75,0.25)]" style={{ borderRadius: '3px' }}>
              <ZignalLogo size={17} className="text-[#0A0A0B]" />
            </div>
            <div className="flex items-baseline gap-0">
              <span className="font-mono text-[15px] font-black tracking-tight text-white">ZGNAL</span>
              <span className="font-mono text-[15px] font-black tracking-tight text-white/25">.AI</span>
            </div>
            <span className="hidden sm:inline text-[9px] text-white/30 font-mono tracking-[0.15em] uppercase border-l border-white/[0.08] pl-3 ml-1">
              Infographic Lab
            </span>
          </Link>
          <div className="flex items-center gap-6">
            {[
              { label: 'Docs', href: '/docs' },
              { label: 'Styles', href: '/styles' },
              { label: 'About', href: '/about' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hidden md:inline-flex text-xs text-white/60 hover:text-white transition-colors font-mono"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/"
              className="bg-[#D4A84B] px-5 py-2 text-xs font-mono font-semibold text-[#0A0A0B] hover:bg-[#C49A3F] active:scale-[0.97] transition-all"
            >
              Try it free
            </Link>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="min-h-screen bg-[#0A0A0B] pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#080808] border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-white/40 font-mono">
              &copy; {new Date().getFullYear()} ZGNAL.AI — All rights reserved.
            </span>
            <div className="flex items-center gap-5 text-[11px] text-white/40 font-mono">
              <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
              <Link href="/about" className="hover:text-white/50 transition-colors">About</Link>
              <a href="https://github.com/ziadmustafa1" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
