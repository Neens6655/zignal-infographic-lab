import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — ZGNAL.AI',
  description: 'How ZGNAL.AI handles your data.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
      <p className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-[#D4A84B] mb-4">Legal</p>
      <h1 className="text-3xl sm:text-4xl font-mono font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-xs font-mono text-white/30 mb-12">Last updated: March 2026</p>

      <div className="space-y-8 text-sm text-white/50 leading-relaxed">
        <section>
          <h2 className="text-sm font-mono font-bold text-white mb-3">1. Information We Collect</h2>
          <p>When you use ZGNAL.AI, we process the content you submit (text, URLs, files) solely to generate your infographic. This content is sent to Google Gemini for AI processing and is not stored after generation completes.</p>
        </section>

        <section>
          <h2 className="text-sm font-mono font-bold text-white mb-3">2. How We Use Your Data</h2>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Generate infographics from your submitted content</li>
            <li>Improve our pipeline and service quality</li>
            <li>Provide provenance certificates for generated content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-mono font-bold text-white mb-3">3. Data Retention</h2>
          <p>Generated images are returned directly to your browser as base64 data. We do not store your generated infographics on our servers. Content submitted for generation is processed in-memory and discarded after the pipeline completes.</p>
        </section>

        <section>
          <h2 className="text-sm font-mono font-bold text-white mb-3">4. Third-Party Services</h2>
          <p>We use Google Gemini API for content analysis and image generation. Your submitted content is processed according to Google&apos;s API terms. We use Vercel for hosting. Analytics may be collected via standard web server logs.</p>
        </section>

        <section>
          <h2 className="text-sm font-mono font-bold text-white mb-3">5. Cookies</h2>
          <p>We use minimal, essential cookies for site functionality. No third-party tracking cookies are used.</p>
        </section>

        <section>
          <h2 className="text-sm font-mono font-bold text-white mb-3">6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. Since we don&apos;t persistently store user content, most data is already ephemeral by design.</p>
        </section>

        <section>
          <h2 className="text-sm font-mono font-bold text-white mb-3">7. Contact</h2>
          <p>For privacy inquiries, contact us at <a href="mailto:privacy@zgnal.ai" className="text-[#D4A84B] hover:underline">privacy@zgnal.ai</a>.</p>
        </section>
      </div>
    </div>
  );
}
