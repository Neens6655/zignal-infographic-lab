import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import layouts from '@/data/layouts.json'
import styles from '@/data/styles.json'
import { BASE_URL } from '@/lib/config'
import { PageHero } from '@/components/landing/page-hero'
import { FeatureGrid } from '@/components/landing/feature-grid'
import { RelatedContent } from '@/components/landing/related-content'
import { CTASection } from '@/components/landing/cta-section'
import { Breadcrumbs } from '@/components/landing/breadcrumbs'

export function generateStaticParams() {
  return layouts.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const layout = layouts.find((l) => l.slug === slug)
  if (!layout) return {}

  return {
    title: `${layout.name} Infographic Layout — ${layout.category} Infographics`,
    description: layout.description,
    keywords: layout.keywords,
    alternates: { canonical: `${BASE_URL}/layouts/${layout.slug}` },
    openGraph: {
      title: `${layout.name} Infographic Layout`,
      description: layout.description,
      url: `${BASE_URL}/layouts/${layout.slug}`,
      type: 'website',
      images: ['/og-image.png'],
    },
  }
}

export default async function LayoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const layout = layouts.find((l) => l.slug === slug)
  if (!layout) notFound()

  const relatedStyleItems = layout.relatedStyles
    .map((styleSlug) => styles.find((s) => s.slug === styleSlug))
    .filter(Boolean) as typeof styles

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Layouts', href: '/layouts' },
          { label: layout.name },
        ]}
      />

      <PageHero
        label="Infographic Layout"
        title={layout.name}
        category={layout.category}
        answerBlock={layout.answerBlock}
      />

      {/* Long description — unique content */}
      <section className="mb-16">
        <h2 className="text-sm font-mono font-bold text-white mb-4">About this layout</h2>
        <div className="text-sm text-white/50 leading-relaxed space-y-4">
          {layout.longDescription.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>

      <FeatureGrid
        title="Best for"
        features={layout.bestFor}
      />

      {/* Keywords */}
      <section className="mb-16">
        <h2 className="text-sm font-mono font-bold text-white mb-4">Related topics</h2>
        <div className="flex flex-wrap gap-2">
          {layout.keywords.map((kw) => (
            <span
              key={kw}
              className="text-[10px] font-mono text-white/30 bg-white/[0.03] border border-white/[0.06] px-3 py-1"
            >
              {kw}
            </span>
          ))}
        </div>
      </section>

      <RelatedContent
        title="Recommended styles"
        items={relatedStyleItems.map((s) => ({
          slug: s.slug,
          name: s.name,
          description: s.description,
          category: s.category,
        }))}
        basePath="/styles"
      />

      <CTASection
        text={`Generate a ${layout.name} infographic in 60 seconds. Pair with any of 20 visual styles and 22 research sources.`}
        href={`/chat?layout=${layout.slug}`}
      />

      {/* JSON-LD for this page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: `${layout.name} Infographic Layout`,
            description: layout.description,
            url: `${BASE_URL}/layouts/${layout.slug}`,
            isPartOf: {
              '@type': 'WebSite',
              name: 'ZGNAL Infographic Lab',
              url: BASE_URL,
            },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
                { '@type': 'ListItem', position: 2, name: 'Layouts', item: `${BASE_URL}/layouts` },
                { '@type': 'ListItem', position: 3, name: layout.name },
              ],
            },
          }),
        }}
      />
    </main>
  )
}
