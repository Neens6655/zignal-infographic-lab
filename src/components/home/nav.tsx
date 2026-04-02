'use client';

function ZignalLogo({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 3H18V7L10 17H18V21H3V17L11 7H3V3Z" fill="currentColor" />
      <rect x="19.5" y="18" width="3.5" height="3.5" fill="currentColor" />
    </svg>
  );
}

export { ZignalLogo };

export function Nav() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-[#0A0A0B]/60 backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="h-8 w-8 bg-gradient-to-br from-[#E8C96A] to-[#D4A84B] flex items-center justify-center shadow-[0_0_12px_rgba(212,168,75,0.25)]" style={{ borderRadius: '3px' }}>
            <ZignalLogo size={17} className="text-[#0A0A0B]" />
          </div>
          <div className="flex items-baseline gap-0">
            <span className="font-mono text-[15px] font-black tracking-tight text-white">ZGNAL</span>
            <span className="font-mono text-[15px] font-black tracking-tight text-white/25">.AI</span>
          </div>
          <span className="hidden sm:inline text-[9px] text-white/50 font-mono tracking-[0.15em] uppercase border-l border-white/[0.08] pl-3 ml-1">
            Infographic Lab
          </span>
        </a>

        <div className="flex items-center gap-6">
          {[
            { label: 'Engine', href: '#pipeline' },
            { label: 'Gallery', href: '#gallery' },
            { label: 'Examples', href: '#examples' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hidden md:inline-flex text-xs text-white/60 hover:text-white transition-colors font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => { document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="bg-(--z-gold) px-5 py-2 text-xs font-mono font-semibold text-(--z-bg) hover:bg-(--z-gold-dim) active:scale-[0.97] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--z-gold)"
          >
            Try it free
          </button>
        </div>
      </div>
    </nav>
  );
}
