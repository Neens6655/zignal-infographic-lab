import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing — ZGNAL.AI',
  description: 'Start generating consulting-grade infographics for free.',
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">Pricing</p>
        <h1 className="text-4xl sm:text-5xl font-mono font-bold text-white leading-tight mb-4">
          Start free.
        </h1>
        <p className="text-base text-white/50 max-w-lg mx-auto">
          The full pipeline is available at no cost during our public preview. No credit card required.
        </p>
      </div>

      {/* Free Tier */}
      <div className="max-w-md mx-auto mb-16">
        <div className="border-2 border-[#D4A84B]/30 p-8 bg-[#D4A84B]/[0.02] relative">
          <div className="absolute -top-3 left-6">
            <span className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-[#0A0A0B] bg-[#D4A84B] px-3 py-1">
              Public Preview
            </span>
          </div>
          <h2 className="text-3xl font-mono font-bold text-white mb-1">Free</h2>
          <p className="text-xs text-white/40 font-mono mb-6">During public preview</p>
          <ul className="space-y-3 mb-8">
            {[
              'Full seven-stage pipeline',
              '20 layouts + 20 styles',
              '22 trusted sources',
              'PNG, JPEG, PDF, PPTX export',
              'Provenance certificates',
              'No watermarks',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-white/60 font-mono">
                <span className="h-1.5 w-1.5 bg-[#D4A84B] shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href="/"
            className="block w-full text-center bg-[#D4A84B] px-6 py-3 text-sm font-mono font-semibold text-[#0A0A0B] hover:bg-[#C49A3F] transition-colors"
          >
            Start generating
          </Link>
        </div>
      </div>

      {/* Future plans */}
      <div className="text-center">
        <p className="text-xs text-white/30 font-mono max-w-md mx-auto leading-relaxed">
          Pro and Enterprise plans with higher limits, API access, batch processing, and custom branding are coming soon. Join the preview today to get early access pricing.
        </p>
      </div>
    </div>
  );
}
