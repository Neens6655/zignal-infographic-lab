import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import styles from '@/data/styles.json'
import layouts from '@/data/layouts.json'
import { BASE_URL } from '@/lib/config'
import { PageHero } from '@/components/landing/page-hero'
import { FeatureGrid } from '@/components/landing/feature-grid'
import { RelatedContent } from '@/components/landing/related-content'
import { CTASection } from '@/components/landing/cta-section'
import { Breadcrumbs } from '@/components/landing/breadcrumbs'

export function generateStaticParams() {
  return styles.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const style = styles.find((s) => s.slug === slug)
  if (!style) return {}

  return {
    title: `${style.name} Infographic Style — Create ${style.category} Infographics`,
    description: style.description,
    keywords: style.keywords,
    alternates: { canonical: `${BASE_URL}/styles/${style.slug}` },
    openGraph: {
      title: `${style.name} Infographic Style`,
      description: style.description,
      url: `${BASE_URL}/styles/${style.slug}`,
      type: 'website',
      images: ['/og-image.png'],
    },
  }
}

export default async function StylePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const style = styles.find((s) => s.slug === slug)
  if (!style) notFound()

  const relatedLayoutItems = style.relatedLayouts
    .map((layoutSlug) => layouts.find((l) => l.slug === layoutSlug))
    .filter(Boolean) as typeof layouts

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles' },
          { label: style.name },
        ]}
      />

      <PageHero
        label="Infographic Style"
        title={style.name}
        category={style.category}
        accent={style.accent}
        answerBlock={style.answerBlock}
      />

      {/* Icon + accent display */}
      <div className="mb-12 flex items-center gap-4">
        <span
          className="flex items-center justify-center h-12 w-12 border border-white/[0.06] text-2xl"
          style={{ color: style.accent }}
        >
          {style.icon}
        </span>
        <div>
          <span
            className="inline-block h-3 w-24 border border-white/[0.06]"
            style={{ backgroundColor: style.accent }}
          />
          <p className="text-[9px] font-mono tracking-widest uppercase text-white/30 mt-1">
            Accent color {style.accent}
          </p>
        </div>
      </div>

      {/* Long description — unique content */}
      <section className="mb-16">
        <h2 className="text-sm font-mono font-bold text-white mb-4">About this style</h2>
        <div className="text-sm text-white/50 leading-relaxed space-y-4">
          {style.longDescription.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>

      <FeatureGrid
        title="Best for"
        features={style.bestFor}
        accent={style.accent}
      />

      {/* Keywords */}
      <section className="mb-16">
        <h2 className="text-sm font-mono font-bold text-white mb-4">Related topics</h2>
        <div className="flex flex-wrap gap-2">
          {style.keywords.map((kw) => (
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
        title="Recommended layouts"
        items={relatedLayoutItems}
        basePath="/layouts"
        accent={style.accent}
      />

      <CTASection
        text={`Generate a ${style.name} infographic in 60 seconds. Choose from 20 layouts, 22 research sources, and a 7-stage AI pipeline.`}
        href={`/chat?style=${style.slug}`}
        accent={style.accent}
      />

      {/* JSON-LD for this page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: `${style.name} Infographic Style`,
            description: style.description,
            url: `${BASE_URL}/styles/${style.slug}`,
            isPartOf: {
              '@type': 'WebSite',
              name: 'ZGNAL Infographic Lab',
              url: BASE_URL,
            },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
                { '@type': 'ListItem', position: 2, name: 'Styles', item: `${BASE_URL}/styles` },
                { '@type': 'ListItem', position: 3, name: style.name },
              ],
            },
          }),
        }}
      />
    </main>
  )
}
