import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation — ZGNAL.AI',
  description: 'Getting started with the ZGNAL.AI Infographic Lab — pipeline architecture, input formats, and API reference.',
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">Documentation</p>
        <h1 className="text-4xl sm:text-5xl font-mono font-bold text-white leading-tight mb-6">
          Build with ZGNAL.AI
        </h1>
        <p className="text-base text-white/50 leading-relaxed max-w-2xl">
          Learn how the seven-stage pipeline transforms raw content into publication-ready infographics. From input formats to export options.
        </p>
      </div>

      {/* Quick Start */}
      <section className="mb-16">
        <div className="h-px bg-gradient-to-r from-[#D4A84B]/30 via-[#D4A84B]/10 to-transparent mb-8" />
        <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">Quick Start</p>
        <div className="space-y-4">
          {[
            { step: '01', title: 'Paste your content', desc: 'Text, URL, or upload a document. The pipeline accepts any content format — articles, reports, meeting notes, research papers.' },
            { step: '02', title: 'Choose your style', desc: 'Select from 20 visual styles and 20 layouts, or let the AI classifier pick the optimal combination for your content type.' },
            { step: '03', title: 'Generate', desc: 'The seven-stage pipeline analyzes, structures, and renders your infographic in approximately 60 seconds.' },
            { step: '04', title: 'Export', desc: 'Download as PNG, JPEG, PDF, or PPTX. Share directly to X, LinkedIn, or WhatsApp.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 p-5 border border-white/[0.06] bg-white/[0.01]">
              <span className="text-[#D4A84B] font-mono font-bold text-sm shrink-0">{item.step}</span>
              <div>
                <h3 className="text-sm font-mono font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline Architecture */}
      <section className="mb-16">
        <div className="h-px bg-gradient-to-r from-[#D4A84B]/30 via-[#D4A84B]/10 to-transparent mb-8" />
        <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">Pipeline Architecture</p>
        <p className="text-sm text-white/50 leading-relaxed mb-6">
          The engine runs a seven-stage pipeline, each handled by a specialized AI agent:
        </p>
        <div className="space-y-3">
          {[
            { agent: 'Sentinel', stage: 'Extract', desc: 'Validates and extracts raw content from input (text, URL, file).' },
            { agent: 'Scout', stage: 'Research', desc: 'Routes content to 22 trusted sources for fact verification and enrichment.' },
            { agent: 'Oracle', stage: 'Analyze', desc: 'Classifies content type, tone, and density to determine optimal layout and style.' },
            { agent: 'Strategist', stage: 'Decide', desc: 'Selects the layout × style pairing from 400+ combinations.' },
            { agent: 'Architect', stage: 'Structure', desc: 'Builds the information architecture — sections, hierarchy, visual flow.' },
            { agent: 'Forge', stage: 'Prompt', desc: 'Assembles the multimodal generation prompt with style tokens and layout grids.' },
            { agent: 'Renderer', stage: 'Generate', desc: 'Renders the final infographic at print resolution using Gemini.' },
          ].map((item, i) => (
            <div key={item.agent} className="flex items-start gap-4 p-4 border border-white/[0.04] bg-white/[0.01]">
              <div className="text-center shrink-0 w-8">
                <span className="text-[10px] font-mono text-[#D4A84B] font-bold">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-white">{item.agent}</span>
                  <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">{item.stage}</span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Input Formats */}
      <section className="mb-16">
        <div className="h-px bg-gradient-to-r from-[#D4A84B]/30 via-[#D4A84B]/10 to-transparent mb-8" />
        <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">Input Formats</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { format: 'Text', desc: 'Paste any text — articles, notes, meeting minutes, research findings.' },
            { format: 'URL', desc: 'Share a web page URL. The pipeline extracts and processes the content automatically.' },
            { format: 'Video', desc: 'YouTube, Vimeo, or Loom links. Transcripts are extracted and visualized.' },
            { format: 'File', desc: 'Upload documents, PDFs, or slide decks for conversion.' },
          ].map((item) => (
            <div key={item.format} className="p-5 border border-white/[0.06] bg-white/[0.01]">
              <h3 className="text-sm font-mono font-bold text-white mb-2">{item.format}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* API Reference */}
      <section className="mb-16" id="api">
        <div className="h-px bg-gradient-to-r from-[#D4A84B]/30 via-[#D4A84B]/10 to-transparent mb-8" />
        <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">API Reference</p>
        <div className="p-6 border border-white/[0.06] bg-white/[0.01] space-y-4">
          <div>
            <p className="text-xs font-mono text-white/30 mb-1">Endpoint</p>
            <code className="text-sm font-mono text-[#D4A84B]">POST /api/generate</code>
          </div>
          <div>
            <p className="text-xs font-mono text-white/30 mb-2">Request Body</p>
            <pre className="text-xs font-mono text-white/50 bg-white/[0.02] p-4 overflow-x-auto border border-white/[0.04]">
{`{
  "content": "Your text content here",
  "preset": "auto | executive-summary | strategy-framework | ...",
  "style": "bold-graphic | executive-institutional | ...",
  "layout": "bento-grid | hub-spoke | ...",
  "aspect_ratio": "16:9 | 9:16 | 1:1",
  "quality": "normal",
  "language": "en"
}`}
            </pre>
          </div>
          <div>
            <p className="text-xs font-mono text-white/30 mb-2">Response</p>
            <p className="text-xs text-white/40 leading-relaxed">
              Server-Sent Events (SSE) stream with <code className="text-white/60">progress</code>, <code className="text-white/60">complete</code>, and <code className="text-white/60">error</code> events. The <code className="text-white/60">complete</code> event includes the image as a base64 data URL, metadata, and provenance certificate.
            </p>
          </div>
        </div>
      </section>

      {/* Export Formats */}
      <section>
        <div className="h-px bg-gradient-to-r from-[#D4A84B]/30 via-[#D4A84B]/10 to-transparent mb-8" />
        <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">Export Formats</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { format: 'PNG', desc: 'Full resolution, lossless' },
            { format: 'JPEG', desc: 'Compressed, web-optimized' },
            { format: 'PDF', desc: 'Print-ready document' },
            { format: 'PPTX', desc: 'Editable slide deck' },
          ].map((item) => (
            <div key={item.format} className="text-center p-5 border border-white/[0.06] bg-white/[0.01]">
              <p className="text-lg font-mono font-bold text-white mb-1">{item.format}</p>
              <p className="text-[10px] font-mono text-white/40">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
