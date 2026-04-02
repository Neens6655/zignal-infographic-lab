'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';

const sections = [
  {
    id: 'information-we-collect',
    number: '01',
    title: 'Information We Collect',
    content: (
      <p>
        When you use ZGNAL.AI, we process the content you submit (text, URLs, files) solely to
        generate your infographic. This content is sent to Google Gemini for AI processing and is not
        stored after generation completes.
      </p>
    ),
  },
  {
    id: 'how-we-use-your-data',
    number: '02',
    title: 'How We Use Your Data',
    content: (
      <ul className="list-disc list-inside space-y-2 pl-2">
        <li>Generate infographics from your submitted content</li>
        <li>Improve our pipeline and service quality</li>
        <li>Provide provenance certificates for generated content</li>
      </ul>
    ),
  },
  {
    id: 'data-retention',
    number: '03',
    title: 'Data Retention',
    content: (
      <p>
        Generated images are returned directly to your browser as base64 data. We do not store your
        generated infographics on our servers. Content submitted for generation is processed
        in-memory and discarded after the pipeline completes.
      </p>
    ),
  },
  {
    id: 'third-party-services',
    number: '04',
    title: 'Third-Party Services',
    content: (
      <p>
        We use Google Gemini API for content analysis and image generation. Your submitted content is
        processed according to Google&apos;s API terms. We use Vercel for hosting. Analytics may be
        collected via standard web server logs.
      </p>
    ),
  },
  {
    id: 'cookies',
    number: '05',
    title: 'Cookies',
    content: (
      <p>
        We use minimal, essential cookies for site functionality. No third-party tracking cookies are
        used.
      </p>
    ),
  },
  {
    id: 'your-rights',
    number: '06',
    title: 'Your Rights',
    content: (
      <p>
        You have the right to access, correct, or delete your personal data. Since we don&apos;t
        persistently store user content, most data is already ephemeral by design.
      </p>
    ),
  },
  {
    id: 'contact',
    number: '07',
    title: 'Contact',
    content: (
      <p>
        For privacy inquiries, contact us at{' '}
        <a href="mailto:privacy@zgnal.ai" className="text-[#D4A84B] hover:underline">
          privacy@zgnal.ai
        </a>
        .
      </p>
    ),
  },
];

function Section({
  section,
  onVisible,
}: {
  section: (typeof sections)[number];
  onVisible: (id: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isActive = useInView(ref, { margin: '-50% 0px -50% 0px' });

  useEffect(() => {
    if (isActive) onVisible(section.id);
  }, [isActive, section.id, onVisible]);

  return (
    <motion.section
      ref={ref}
      id={section.id}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="scroll-mt-28"
    >
      <div className="flex items-baseline gap-4 mb-4">
        <span className="text-[#D4A84B] font-mono text-xs font-bold tracking-wider">
          {section.number}
        </span>
        <h2 className="text-base font-mono font-bold text-white">{section.title}</h2>
      </div>
      <div className="text-sm text-white/50 leading-relaxed pl-10">{section.content}</div>
    </motion.section>
  );
}

export default function PrivacyPage() {
  const [activeId, setActiveId] = useState(sections[0].id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="max-w-3xl mb-10"
      >
        <p className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-white/30 mb-8">Last updated: March 2026</p>
      </motion.div>

      {/* TL;DR Box */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        className="max-w-3xl border-2 border-[#D4A84B]/30 bg-[#D4A84B]/4 p-6 mb-16"
      >
        <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-2">
          TL;DR
        </p>
        <p className="text-sm text-white/70 leading-relaxed">
          We process your content to generate infographics.{' '}
          <span className="font-semibold text-white">We don&apos;t store it.</span>{' '}
          <span className="font-semibold text-white">We don&apos;t sell it.</span>
        </p>
      </motion.div>

      {/* Divider */}
      <div className="h-px bg-linear-to-r from-[#D4A84B]/30 via-[#D4A84B]/10 to-transparent mb-16" />

      {/* Content + Sidebar */}
      <div className="flex gap-16">
        {/* Main content */}
        <div className="flex-1 max-w-3xl space-y-12">
          {sections.map((section, i) => (
            <div key={section.id}>
              <Section section={section} onVisible={setActiveId} />
              {i < sections.length - 1 && (
                <div className="h-px bg-linear-to-r from-[#D4A84B]/20 via-[#D4A84B]/5 to-transparent mt-12" />
              )}
            </div>
          ))}

          {/* Contact callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="border-2 border-[#D4A84B]/30 p-8 mt-16"
          >
            <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-3">
              Questions?
            </p>
            <p className="text-sm text-white/60 leading-relaxed">
              For privacy-related inquiries, reach out to{' '}
              <a href="mailto:privacy@zgnal.ai" className="text-[#D4A84B] hover:underline font-mono">
                privacy@zgnal.ai
              </a>
            </p>
          </motion.div>
        </div>

        {/* Sidebar TOC — desktop only */}
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="sticky top-28">
            <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-white/30 mb-4">
              On this page
            </p>
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className={`flex items-center gap-2 text-xs font-mono transition-colors duration-200 ${
                      activeId === section.id
                        ? 'text-[#D4A84B]'
                        : 'text-white/25 hover:text-white/50'
                    }`}
                  >
                    <span className="w-5 text-right shrink-0">{section.number}</span>
                    <span className="truncate">{section.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}
