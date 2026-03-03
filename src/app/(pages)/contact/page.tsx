import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — ZGNAL.AI',
  description: 'Get in touch with the ZGNAL.AI team.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
      <div className="mb-16">
        <p className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">Contact</p>
        <h1 className="text-4xl sm:text-5xl font-mono font-bold text-white leading-tight mb-6">
          Get in touch.
        </h1>
        <p className="text-base text-white/50 max-w-lg">
          Questions, feedback, or partnership inquiries — we&apos;d like to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 border border-white/[0.06] bg-white/[0.01]">
          <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-3">General</p>
          <a href="mailto:hello@zgnal.ai" className="text-sm font-mono text-white/70 hover:text-[#D4A84B] transition-colors">
            hello@zgnal.ai
          </a>
        </div>
        <div className="p-6 border border-white/[0.06] bg-white/[0.01]">
          <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-3">Technical Support</p>
          <a href="mailto:support@zgnal.ai" className="text-sm font-mono text-white/70 hover:text-[#D4A84B] transition-colors">
            support@zgnal.ai
          </a>
        </div>
        <div className="p-6 border border-white/[0.06] bg-white/[0.01]">
          <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-3">GitHub</p>
          <a href="https://github.com/ziadmustafa1" target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-white/70 hover:text-[#D4A84B] transition-colors">
            github.com/ziadmustafa1
          </a>
        </div>
        <div className="p-6 border border-white/[0.06] bg-white/[0.01]">
          <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-3">Privacy</p>
          <a href="mailto:privacy@zgnal.ai" className="text-sm font-mono text-white/70 hover:text-[#D4A84B] transition-colors">
            privacy@zgnal.ai
          </a>
        </div>
      </div>
    </div>
  );
}
