import Link from 'next/link';

function ZignalLogo({ size = 17, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 4h16v3H9.5L20 18v2H4v-3h10.5L4 6V4z" fill="currentColor" />
    </svg>
  );
}

function GitHubIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function XIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const NAV_LINKS = [
  { label: 'Docs', href: '/docs' },
  { label: 'Styles', href: '/styles' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
];

const FOOTER_RESOURCES = [
  { label: 'Docs', href: '/docs' },
  { label: 'Styles', href: '/styles' },
  { label: 'Changelog', href: '/changelog' },
];

const FOOTER_COMPANY = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'GitHub', href: 'https://github.com/Neens6655', external: true },
];

const FOOTER_LEGAL = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile menu styles — CSS-only, no client JS */}
      <style>{`
        .mobile-menu-toggle[open] > summary {
          position: fixed;
          z-index: 70;
        }
        .mobile-menu-toggle[open] > summary .hamburger-top {
          transform: translateY(6px) rotate(45deg);
        }
        .mobile-menu-toggle[open] > summary .hamburger-mid {
          opacity: 0;
        }
        .mobile-menu-toggle[open] > summary .hamburger-bot {
          transform: translateY(-6px) rotate(-45deg);
        }
        .mobile-menu-toggle[open] .mobile-overlay {
          opacity: 1;
          visibility: visible;
        }
        .mobile-menu-toggle[open] .mobile-nav-inner {
          transform: translateY(0);
          opacity: 1;
        }
        .mobile-menu-toggle summary::-webkit-details-marker {
          display: none;
        }
        .mobile-menu-toggle summary::marker {
          display: none;
          content: '';
        }
        .mobile-menu-toggle summary {
          list-style: none;
        }

        /* Gold underline animation for nav links */
        .nav-link {
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: #D4A84B;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-link:hover::after {
          width: 100%;
        }

        /* Footer link hover */
        .footer-link {
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: #D4A84B;
        }

        /* Newsletter input focus glow */
        .newsletter-input:focus {
          border-color: #D4A84B;
          box-shadow: 0 0 0 1px rgba(212, 168, 75, 0.2);
          outline: none;
        }

        /* Gold gradient divider */
        .gold-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #D4A84B 30%, #E8C96A 50%, #D4A84B 70%, transparent 100%);
          opacity: 0.4;
        }

        /* Subtle entrance for footer sections */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .footer-section {
          animation: fadeInUp 0.6s ease forwards;
        }
        .footer-section:nth-child(2) {
          animation-delay: 0.1s;
        }
        .footer-section:nth-child(3) {
          animation-delay: 0.2s;
        }
      `}</style>

      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full bg-[#0A0A0B]/60 backdrop-blur-2xl border-b border-white/4">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="h-8 w-8 bg-linear-to-br from-[#E8C96A] to-[#D4A84B] flex items-center justify-center shadow-[0_0_12px_rgba(212,168,75,0.25)]" style={{ borderRadius: '3px' }}>
              <ZignalLogo size={17} className="text-[#0A0A0B]" />
            </div>
            <div className="flex items-baseline gap-0">
              <span className="font-mono text-[15px] font-black tracking-tight text-white">ZGNAL</span>
              <span className="font-mono text-[15px] font-black tracking-tight text-white/25">.AI</span>
            </div>
            <span className="hidden sm:inline text-[9px] text-white/30 font-mono tracking-[0.15em] uppercase border-l border-white/8 pl-3 ml-1">
              Infographic Lab
            </span>
          </Link>

          {/* Desktop nav links + CTA */}
          <div className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="nav-link hidden md:inline-flex text-xs text-white/60 hover:text-white transition-colors font-mono"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/"
              className="hidden sm:inline-flex bg-[#D4A84B] px-5 py-2 text-xs font-mono font-semibold text-[#0A0A0B] hover:bg-[#C49A3F] active:scale-[0.97] transition-all"
            >
              Try it free
            </Link>

            {/* Mobile hamburger — CSS-only via details/summary */}
            <details className="mobile-menu-toggle md:hidden relative">
              <summary className="flex flex-col items-center justify-center w-10 h-10 cursor-pointer gap-1.25 relative z-60">
                <span className="hamburger-top block w-5 h-0.5 bg-white/80 transition-all duration-300 origin-center" />
                <span className="hamburger-mid block w-5 h-0.5 bg-white/80 transition-all duration-300" />
                <span className="hamburger-bot block w-5 h-0.5 bg-white/80 transition-all duration-300 origin-center" />
              </summary>

              {/* Full-screen overlay */}
              <div className="mobile-overlay fixed inset-0 z-50 bg-[#0A0A0B]/98 backdrop-blur-xl opacity-0 invisible transition-all duration-300">
                <div className="mobile-nav-inner flex flex-col items-center justify-center h-full gap-8 transform translate-y-4 opacity-0 transition-all duration-500 delay-100">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-2xl font-mono text-white/80 hover:text-[#D4A84B] transition-colors tracking-wide"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="w-12 h-px bg-white/10 my-2" />
                  <Link
                    href="/"
                    className="bg-[#D4A84B] px-8 py-3 text-sm font-mono font-semibold text-[#0A0A0B] hover:bg-[#C49A3F] transition-colors"
                  >
                    Try it free
                  </Link>
                </div>
              </div>
            </details>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="min-h-screen bg-[#0A0A0B] pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#060606] relative">
        {/* Gold gradient divider */}
        <div className="gold-divider" />

        {/* Main footer content */}
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

            {/* Column 1 — Product */}
            <div className="footer-section">
              <Link href="/" className="flex items-center gap-2.5 mb-5 hover:opacity-90 transition-opacity">
                <div className="h-7 w-7 bg-linear-to-br from-[#E8C96A] to-[#D4A84B] flex items-center justify-center shadow-[0_0_10px_rgba(212,168,75,0.15)]" style={{ borderRadius: '3px' }}>
                  <ZignalLogo size={14} className="text-[#0A0A0B]" />
                </div>
                <div className="flex items-baseline gap-0">
                  <span className="font-mono text-sm font-black tracking-tight text-white">ZGNAL</span>
                  <span className="font-mono text-sm font-black tracking-tight text-white/25">.AI</span>
                </div>
              </Link>
              <p className="text-[13px] text-white/50 font-sans leading-relaxed mb-4 max-w-65">
                Visual Intelligence Engine.
                <br />
                Turn any content into publication-ready infographics in seconds.
              </p>
              <p className="text-[10px] text-white/25 font-mono tracking-wide">
                Built with Gemini. Deployed on Vercel.
              </p>
            </div>

            {/* Column 2 — Navigation */}
            <div className="footer-section grid grid-cols-2 gap-8">
              {/* Resources */}
              <div>
                <h4 className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-5">
                  Resources
                </h4>
                <ul className="flex flex-col gap-3">
                  {FOOTER_RESOURCES.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="footer-link text-[13px] text-white/40 font-mono"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-5">
                  Company
                </h4>
                <ul className="flex flex-col gap-3">
                  {FOOTER_COMPANY.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="footer-link text-[13px] text-white/40 font-mono"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="footer-link text-[13px] text-white/40 font-mono"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 3 — Legal + Newsletter */}
            <div className="footer-section">
              <h4 className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-5">
                Legal
              </h4>
              <ul className="flex flex-col gap-3 mb-8">
                {FOOTER_LEGAL.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="footer-link text-[13px] text-white/40 font-mono"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Newsletter / Waitlist */}
              <h4 className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-3">
                Stay in the loop
              </h4>
              <p className="text-[11px] text-white/30 font-sans mb-3">
                Get product updates and early access.
              </p>
              <form
                className="flex gap-0"
                onSubmit={undefined}
              >
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="newsletter-input flex-1 bg-white/4 border border-white/8 px-3 py-2.5 text-[12px] font-mono text-white/80 placeholder:text-white/20 transition-all"
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="bg-[#D4A84B] px-4 py-2.5 text-[11px] font-mono font-semibold text-[#0A0A0B] hover:bg-[#C49A3F] active:scale-[0.97] transition-all border border-[#D4A84B] whitespace-nowrap"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/4">
          <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-white/30 font-mono">
              &copy; {new Date().getFullYear()} ZGNAL.AI &mdash; All rights reserved.
            </span>

            <div className="flex items-center gap-4">
              <span className="text-[10px] text-white/20 font-mono tracking-wide">
                Made in Dubai
              </span>
              <span className="text-white/10">|</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/Neens6655"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-[#D4A84B] transition-colors"
                  aria-label="GitHub"
                >
                  <GitHubIcon size={15} />
                </a>
                <a
                  href="https://x.com/zgnal_ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-[#D4A84B] transition-colors"
                  aria-label="X (Twitter)"
                >
                  <XIcon size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
