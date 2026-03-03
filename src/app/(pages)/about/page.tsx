import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — ZGNAL.AI',
  description: 'We transform complex information into publication-ready visual intelligence.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
      {/* Hero */}
      <div className="mb-20">
        <p className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">About</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-mono font-bold text-white leading-tight mb-6">
          The signal<br />is truth.
        </h1>
        <p className="text-lg text-white/50 leading-relaxed max-w-2xl">
          ZGNAL.AI transforms complex information into publication-ready visual intelligence. We build systems that turn data, research, and ideas into infographics that meet the visual standard of top-tier consulting firms.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-16">
        <div className="h-px bg-gradient-to-r from-[#D4A84B]/30 via-[#D4A84B]/10 to-transparent mb-8" />
        <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">Mission</p>
        <p className="text-white/60 leading-relaxed max-w-2xl">
          We believe every idea deserves to be understood. Complex data shouldn&apos;t stay locked in spreadsheets. Research shouldn&apos;t be limited by design skills. Our seven-stage AI pipeline handles the research, design, and rendering — so you can focus on the insight.
        </p>
      </section>

      {/* Values */}
      <section className="mb-16">
        <div className="h-px bg-gradient-to-r from-[#D4A84B]/30 via-[#D4A84B]/10 to-transparent mb-8" />
        <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-6">Principles</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { name: 'Simplicity', desc: 'Complex systems fail. We remove, we don\'t add. Every visual element must justify its existence.' },
            { name: 'Discipline', desc: 'Systematic pipelines beat ad-hoc design. We build repeatable processes, not one-off templates.' },
            { name: 'Transparency', desc: 'Every infographic comes with a provenance certificate — full pipeline trace, sources, and methodology.' },
            { name: 'Quality', desc: 'Output meets the visual standard of McKinsey, BCG, and Bloomberg. Consulting-grade is the baseline.' },
            { name: 'Survival', desc: 'We build for longevity. Clean architecture, responsible AI, and honest representations of data.' },
          ].map((value) => (
            <div key={value.name} className="border border-white/[0.06] p-6 bg-white/[0.01]">
              <h3 className="text-sm font-mono font-bold text-white mb-2">{value.name}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="mb-16">
        <div className="h-px bg-gradient-to-r from-[#D4A84B]/30 via-[#D4A84B]/10 to-transparent mb-8" />
        <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-6">By the numbers</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: '20', label: 'Layouts' },
            { value: '20', label: 'Styles' },
            { value: '22', label: 'Trusted Sources' },
            { value: '60s', label: 'Generation Time' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 border border-white/[0.06] bg-white/[0.01]">
              <p className="text-3xl font-mono font-bold text-[#D4A84B] mb-1">{stat.value}</p>
              <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section>
        <div className="h-px bg-gradient-to-r from-[#D4A84B]/30 via-[#D4A84B]/10 to-transparent mb-8" />
        <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">Philosophy</p>
        <blockquote className="border-l-2 border-[#D4A84B]/30 pl-6">
          <p className="text-white/50 leading-relaxed italic">
            &ldquo;Proven. Clear. Executable. We don&apos;t add complexity — we extract signal from noise. Every infographic is a distillation: the minimum visual structure needed to communicate maximum insight.&rdquo;
          </p>
        </blockquote>
      </section>
    </div>
  );
}
