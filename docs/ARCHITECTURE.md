# Architecture Plan: Growth Engine — Phase 0 (Foundation Fix + MVP pSEO)

Task type: `new-feature` | Risk: `medium` | Estimated files: ~35 new, ~8 modified

## Context

Adding programmatic SEO pages and AEO infrastructure to zgnal.ai. Phase 0 ships 40 landing pages (20 styles + 20 layouts) from existing reference data, fixes 11 RED bugs from previous audit, and validates the approach before scaling to 400+. The existing styles page at `/(pages)/styles/page.tsx` already has a `STYLES` array with all 20 styles — we extract this to JSON, add Zod validation, and generate individual pages.

## Existing Landscape

```
src/app/
  (pages)/styles/page.tsx    ← STYLES array (20 items: id, name, category, accent, icon, bestFor, layouts[])
  layout.tsx                 ← Metadata, JSON-LD (SoftwareApplication), fonts
  sitemap.ts                 ← 10 hardcoded routes
  robots.ts                  ← Single wildcard rule
  globals.css                ← Neo Bauhaus tokens (--background: #0A0A0B, --primary: #D4A84B, 0px radius)
  page.tsx                   ← Home page with SHOWCASE + STYLES_SHOWCASE arrays

src/lib/
  references/styles/         ← 20 markdown files (color palette, typography, composition rules)
  references/layouts/        ← 20 markdown files (grid rules, cell structure, visual density)
  constants.ts               ← PRESETS, ASPECT_RATIOS, GUEST_CREDIT_LIMIT

src/components/
  layout/site-header.tsx     ← Nav with auth state, gold logo
  ui/                        ← Button, Card, Badge, Dialog, etc. (Radix + Tailwind)
```

**Key conventions:**
- Dark theme only (#0A0A0B bg, #E8E5E0 fg, #D4A84B gold accent)
- 0px border-radius everywhere
- IBM Plex Mono for labels/headings, IBM Plex Sans for body
- Font variables: `--font-ibm-plex-sans`, `--font-ibm-plex-mono`
- Tailwind v4: `@theme inline` in globals.css, NOT tailwind.config.js
- Package manager: npm (not bun — per project CLAUDE.md)

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data source | Extract from existing STYLES array in `(pages)/styles/page.tsx` + reference markdowns | Data already exists — don't reinvent |
| Validation | Zod schemas in `src/data/schemas.ts` | Build-time safety, TypeScript integration |
| Schema generation | `next-seo` for FAQ, BreadcrumbList, Organization | Battle-tested, avoid custom JSON-LD components |
| Page structure | Server Components only (no `"use client"`) | SEO pages don't need interactivity |
| OG images | Static `/og-image.png` shared (Phase 0), per-page via `/api/og` (Phase 2) | Ship fast, improve later |
| Internal links | Explicit `relatedLayouts`/`relatedStyles` from data | No auto-linking — prevents spam patterns |
| Content uniqueness | ≥200 words per page from reference file data + handwritten descriptions | Avoid thin content penalty |
| URL pattern | `/styles/[slug]` and `/layouts/[slug]` (NOT under `/(pages)/`) | Clean URLs, permanent slugs |
| Existing styles page | Keep `/(pages)/styles/page.tsx` as gallery, new `/styles/[slug]` for individual pages | No breaking changes |

## Data Flow

```
Reference Markdowns (20 styles + 20 layouts)
    ↓ (extracted once, manually curated)
src/data/styles.json + src/data/layouts.json
    ↓ (validated at build time)
src/data/schemas.ts (Zod)
    ↓ (consumed by)
/styles/[slug]/page.tsx ← generateStaticParams() reads styles.json
/layouts/[slug]/page.tsx ← generateStaticParams() reads layouts.json
    ↓ (generates)
generateMetadata() → unique title, description, OG, canonical
    ↓ (renders)
Server Component → AnswerBlock + Hero + Features + RelatedContent + CTA
    ↓ (indexed by)
sitemap.ts → dynamically loads data files → 51 URLs
robots.ts → whitelists AI crawlers
llms.txt → Markdown index for AI agents
```

## File Map

### New Files

**Data Layer:**
- `src/data/styles.json` — 20 style entries (slug, name, description, category, bestFor, keywords, accent, icon, relatedLayouts, longDescription)
- `src/data/layouts.json` — 20 layout entries (slug, name, description, category, bestFor, keywords, relatedStyles, longDescription)
- `src/data/schemas.ts` — Zod schemas for Style and Layout types + validation functions
- `scripts/validate-data.ts` — Build-time script: loads all JSON, runs Zod, exits 1 on failure

**Landing Page Components (Server Components — no `"use client"`):**
- `src/components/landing/answer-block.tsx` — 40-word answer paragraph in semantic `<p>`, large type
- `src/components/landing/page-hero.tsx` — Hero section: title + answer block + preview area
- `src/components/landing/feature-grid.tsx` — Grid of features/use-cases with icons
- `src/components/landing/related-content.tsx` — Grid of related page cards (styles↔layouts)
- `src/components/landing/cta-section.tsx` — CTA block linking to `/chat?style=[slug]` or `/chat?layout=[slug]`
- `src/components/landing/social-proof.tsx` — Testimonials/trust signals section (placeholder for Phase 0, populated when testimonials gathered)
- `src/components/landing/breadcrumbs.tsx` — Breadcrumb nav with aria-label

**Dynamic Route Pages:**
- `src/app/styles/[slug]/page.tsx` — Style landing page (SSG via generateStaticParams)
- `src/app/styles/[slug]/not-found.tsx` — 404 for invalid style slugs
- `src/app/styles/error.tsx` — Error boundary for /styles route segment
- `src/app/layouts/[slug]/page.tsx` — Layout landing page (SSG via generateStaticParams)
- `src/app/layouts/[slug]/not-found.tsx` — 404 for invalid layout slugs
- `src/app/layouts/error.tsx` — Error boundary for /layouts route segment

**AEO:**
- `public/llms.txt` — Markdown index of site capabilities, features, key pages

**SEO Components:**
- `src/components/seo/json-ld.tsx` — Reusable JSON-LD script renderer (thin wrapper)

### Modified Files

- `src/app/sitemap.ts` — Import styles.json + layouts.json, generate 40 additional URLs dynamically
- `src/app/robots.ts` — Add per-bot Allow rules for 5 AI crawlers
- `src/app/layout.tsx` — Add Organization + WebSite JSON-LD schemas alongside existing SoftwareApplication
- `src/components/layout/site-header.tsx` — Add "Styles" and "Layouts" links to navigation
- `next.config.ts` — Remove `unsafe-inline` from CSP script-src (RED fix R3), add `staticGenerationTimeout: 120`
- `package.json` — Add `zod`, `next-seo` dependencies + `validate` script
- `src/app/(pages)/styles/page.tsx` — Add links to individual `/styles/[slug]` pages from each card

### Foundation Fix Files (Track A — existing files to modify)

- `next.config.ts` — CSP fix (R3): replace `'unsafe-inline'` with nonce-based or hash-based CSP
- `src/app/page.tsx` — Hero headline fix (R8): add "infographic" to headline text
- `src/app/globals.css` — Add `@media (prefers-reduced-motion: reduce)` rules (CS1)
- Various animation components — Add reduced-motion checks (CS1)
- Chat components — Touch target increase to ≥44px (R4), focus trap (R6), contrast fix (R5)
- `src/app/(pages)/pricing/page.tsx` — Add CTA path, not dead-end (R7)

## Component Architecture

```tsx
// src/app/styles/[slug]/page.tsx (Server Component)

import { styles } from '@/data/styles.json'  // or dynamic import
import { AnswerBlock } from '@/components/landing/answer-block'
import { PageHero } from '@/components/landing/page-hero'
import { FeatureGrid } from '@/components/landing/feature-grid'
import { RelatedContent } from '@/components/landing/related-content'
import { CTASection } from '@/components/landing/cta-section'
import { SocialProof } from '@/components/landing/social-proof'
import { Breadcrumbs } from '@/components/landing/breadcrumbs'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return styles.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }) {
  const style = styles.find(s => s.slug === params.slug)
  if (!style) return {}
  return {
    title: `${style.name} Infographic Style — Create ${style.category} Infographics`,
    description: style.description,  // ≤155 chars
    alternates: { canonical: `https://zgnal.ai/styles/${style.slug}` },
    openGraph: { title: ..., description: ..., images: '/og-image.png' }
  }
}

export default function StylePage({ params }) {
  const style = styles.find(s => s.slug === params.slug)
  if (!style) notFound()

  return (
    <main>
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Styles', href: '/styles' },
        { label: style.name }
      ]} />
      <PageHero title={style.name} category={style.category} accent={style.accent}>
        <AnswerBlock text={style.answerBlock} />
      </PageHero>
      <FeatureGrid features={style.bestFor} />
      <SocialProof />
      <RelatedContent
        title="Recommended Layouts"
        items={style.relatedLayouts.map(slug => layouts.find(l => l.slug === slug))}
        basePath="/layouts"
      />
      <CTASection
        text={`Create a ${style.name} infographic`}
        href={`/chat?style=${style.slug}`}
      />
    </main>
  )
}
```

## Data Schema

```typescript
// src/data/schemas.ts
import { z } from 'zod'

export const StyleSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(3).max(50),
  description: z.string().min(50).max(300),
  longDescription: z.string().min(200),  // ≥200 words unique content
  answerBlock: z.string().max(250),       // ≤40 words for AI extraction
  category: z.string(),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string().max(4),
  bestFor: z.array(z.string()).min(2).max(8),
  keywords: z.array(z.string()).min(3).max(15),
  relatedLayouts: z.array(z.string()).min(1).max(5),
})

export const LayoutSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(3).max(50),
  description: z.string().min(50).max(300),
  longDescription: z.string().min(200),
  answerBlock: z.string().max(250),
  category: z.string(),
  bestFor: z.array(z.string()).min(2).max(8),
  keywords: z.array(z.string()).min(3).max(15),
  relatedStyles: z.array(z.string()).min(1).max(5),
})

export const StylesFileSchema = z.array(StyleSchema).length(20)
export const LayoutsFileSchema = z.array(LayoutSchema).length(20)
```

## Build Sequence

### Phase 0A: Foundation Fixes (can run in parallel with 0B)

- [ ] Fix CSP `unsafe-inline` in `next.config.ts` — use nonce or hash for inline scripts
- [ ] Add `@media (prefers-reduced-motion: reduce)` to `globals.css` + animation components
- [ ] Fix chat touch targets (≥44px), focus trap, contrast
- [ ] Fix pricing page dead-end
- [ ] Fix hero headline (mention "infographic")
- [ ] Add social proof placeholder component
- [ ] Checkpoint: All 8+ RED bugs fixed, `npm run build` passes

### Phase 0B: Data + Pages (can run in parallel with 0A)

- [ ] Install `zod` and `next-seo`: `npm install zod next-seo`
- [ ] Create `src/data/schemas.ts` with Zod types
- [ ] Create `src/data/styles.json` — extract from STYLES array in `(pages)/styles/page.tsx` + enrich with longDescription and answerBlock from reference markdowns
- [ ] Create `src/data/layouts.json` — extract from reference markdown files, match structure
- [ ] Create `scripts/validate-data.ts` — validate all JSON at build time
- [ ] Add `"validate": "npx tsx scripts/validate-data.ts"` to package.json scripts
- [ ] Checkpoint: `npm run validate` passes for all data files

### Phase 0C: Landing Pages

- [ ] Create landing page components (answer-block, page-hero, feature-grid, related-content, cta-section, breadcrumbs, social-proof)
- [ ] Create `/styles/[slug]/page.tsx` with generateStaticParams + generateMetadata
- [ ] Create `/layouts/[slug]/page.tsx` with generateStaticParams + generateMetadata
- [ ] Create error.tsx + not-found.tsx for both route segments
- [ ] Checkpoint: `npm run build` generates 40 new pages, each with ≥200 words unique content

### Phase 0D: AEO + Sitemap

- [ ] Update `sitemap.ts` — dynamically import data files, add 40 URLs
- [ ] Update `robots.ts` — add AI crawler rules
- [ ] Create `public/llms.txt`
- [ ] Add Organization + WebSite JSON-LD to `layout.tsx`
- [ ] Update site-header.tsx navigation
- [ ] Add `staticGenerationTimeout: 120` to `next.config.ts`
- [ ] Checkpoint: Sitemap has 51 URLs, robots.txt shows AI bots, llms.txt accessible, Lighthouse SEO ≥95

### Final Gate

- [ ] `npm run build` passes in <5 minutes
- [ ] Playwright screenshots at 375px + 1440px on 2 style pages + 2 layout pages
- [ ] Deploy to Vercel, verify pages return 200
- [ ] Submit sitemap to Google Search Console + Bing Webmaster Tools

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| CSP nonce breaks existing inline scripts | Test build + runtime after CSP change. Fallback: use `'sha256-[hash]'` for specific inline scripts |
| `generateStaticParams` fails on malformed data | Zod validation runs BEFORE build via `scripts/validate-data.ts` |
| 40 new pages slow down Vercel build | `staticGenerationTimeout: 120` + measure actual build time |
| New `/styles/[slug]` conflicts with existing `/(pages)/styles` | No conflict — Next.js route groups `(pages)` don't create URL segments. `/styles` = gallery, `/styles/[slug]` = individual |
| `next-seo` incompatible with Next.js 16 | Check npm page for Next.js 16 support. Fallback: use native Next.js Metadata API for all schemas (no extra dep) |

## Out of Scope (Phase 0)

- Industry/use-case pages (/create/[slug]) — Phase 2
- FAQ hub (/faq) — Phase 2
- Blog/MDX system — Phase 3
- IndexNow integration — Phase 4
- Gemini API at build time — removed permanently
- OG image generation API — Phase 2
- Competitor comparison pages — v2
- Directory submission automation — manual process
