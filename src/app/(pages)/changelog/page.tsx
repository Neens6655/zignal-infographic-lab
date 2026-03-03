import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog — ZGNAL.AI',
  description: 'Version history and updates for ZGNAL.AI Infographic Lab.',
};

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
      <div className="mb-16">
        <p className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">Changelog</p>
        <h1 className="text-4xl sm:text-5xl font-mono font-bold text-white leading-tight mb-6">
          What&apos;s new.
        </h1>
        <p className="text-base text-white/50 max-w-lg">
          Release history for the ZGNAL.AI Infographic Lab.
        </p>
      </div>

      <div className="space-y-12">
        {/* v2.0 */}
        <div className="relative pl-8 border-l border-white/[0.06]">
          <div className="absolute left-0 top-0 -translate-x-1/2 h-3 w-3 bg-[#D4A84B]" />
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-mono font-bold text-white">v2.0</h2>
              <span className="text-[9px] font-mono tracking-widest uppercase text-[#D4A84B] bg-[#D4A84B]/10 px-2 py-0.5">Latest</span>
            </div>
            <p className="text-xs font-mono text-white/30">March 3, 2026</p>
          </div>
          <ul className="space-y-2">
            {[
              'Provenance certificate system — full pipeline trace, content hash, unique seed IDs',
              'Topic extraction and tagging for generated infographics',
              'Capabilities section redesigned — 3 cards with gold schematic illustration',
              'Footer pages — About, Docs, Pricing, Privacy, Terms, Contact, Changelog',
              'Style Guide page with all 20 visual styles',
              'Logo navigation — click to return home from any view',
              'All footer links now point to real pages',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-white/50">
                <span className="h-1 w-1 bg-[#D4A84B]/60 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* v1.1 */}
        <div className="relative pl-8 border-l border-white/[0.06]">
          <div className="absolute left-0 top-0 -translate-x-1/2 h-3 w-3 bg-white/20" />
          <div className="mb-4">
            <h2 className="text-lg font-mono font-bold text-white mb-1">v1.1</h2>
            <p className="text-xs font-mono text-white/30">March 3, 2026</p>
          </div>
          <ul className="space-y-2">
            {[
              'Inlined backend pipeline into Next.js API routes — eliminated external engine dependency',
              'Fixed share/download links using localhost in production',
              'Added data: URL handling for Gemini image generation',
              'Environment variables configured on Vercel',
              'Full Playwright E2E testing suite run against production',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-white/50">
                <span className="h-1 w-1 bg-white/20 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* v1.0 */}
        <div className="relative pl-8 border-l border-white/[0.06]">
          <div className="absolute left-0 top-0 -translate-x-1/2 h-3 w-3 bg-white/20" />
          <div className="mb-4">
            <h2 className="text-lg font-mono font-bold text-white mb-1">v1.0</h2>
            <p className="text-xs font-mono text-white/30">March 2, 2026</p>
          </div>
          <ul className="space-y-2">
            {[
              'Initial release of ZGNAL.AI Infographic Lab',
              'Seven-stage AI pipeline with Gemini integration',
              '20 layouts, 20 styles, 8 presets, 3 aspect ratios',
              'Content input via text, URL, video, and file upload',
              'Export as PNG, JPEG, PDF, PPTX',
              'Social sharing to X, LinkedIn, WhatsApp',
              'Responsive landing page with interactive pipeline section',
              'Gallery showcase with real generated examples',
              'Style gallery with one-click regeneration',
              'Deployed to Vercel with custom domain zgnal.ai',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-white/50">
                <span className="h-1 w-1 bg-white/20 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
