# TASKS: ZGNAL Infographic Lab — Growth Engine (pSEO + AEO)

> Generated from PRD on 2026-04-02 (revised after Plato audit)
> Source: docs/PRD.md

## Status

- **Current phase:** Phase 0
- **Completed:** 0 / 48
- **Blocked:** None

---

## Phase 0: Foundation Fix + MVP Validation (PARALLEL TRACKS)

> Checkpoint: 40 pages live + indexed, ≥8/11 RED bugs fixed, Lighthouse SEO ≥95

### Track A — Foundation Fixes

- [ ] Triage 11 RED findings from 2026-03-07 audit — classify by: security > accessibility > architecture
- [ ] Fix R3: Remove CSP `unsafe-inline` on script-src in `next.config.ts`
- [ ] Fix R11: Rate limiter must fail closed (deny) when Redis absent, not fail open
- [ ] Fix R10: Guard `dataUrlToBlob` against malformed data URLs
- [ ] Fix CS1: Add `prefers-reduced-motion` fallback to all 18 animations
- [ ] Fix R4: Increase chat button touch targets to ≥44px
- [ ] Fix R5: Replace muted text `/30` opacity with WCAG-compliant values
- [ ] Fix R6: Add focus trap to chat panel
- [ ] Fix R7: Pricing page — add clear CTA and path forward (not dead-end)
- [ ] Fix R8: Hero headline must mention "infographic" explicitly
- [ ] Gather 3-5 testimonials/trust signals — add to homepage + landing page template component
- [ ] Create `error.tsx` in /styles, /layouts, /create, /templates route segments

### Track B — MVP pSEO (40 Pages)

- [ ] Create `src/data/schemas.ts` — Zod schemas for Style and Layout data types
- [ ] Create `src/data/styles.json` — 20 entries extracted from `src/lib/references/styles/` (slug, name, description, category, bestFor, keywords, relatedLayouts)
- [ ] Create `src/data/layouts.json` — 20 entries extracted from `src/lib/references/layouts/` (slug, name, description, category, bestFor, keywords, relatedStyles)
- [ ] Add build-time Zod validation script — `scripts/validate-data.ts` — exits 1 on failure
- [ ] Create shared landing page components: `answer-block.tsx`, `related-content.tsx`, `cta-section.tsx`, `page-hero.tsx`
- [ ] Create `/styles/[slug]/page.tsx` + `generateStaticParams()` + `generateMetadata()` — 20 style pages, each with ≥200 words unique content
- [ ] Create `/layouts/[slug]/page.tsx` + `generateStaticParams()` + `generateMetadata()` — 20 layout pages, each with ≥200 words unique content
- [ ] Update `src/app/sitemap.ts` — dynamically load from data files, include 40 new URLs
- [ ] Create `public/llms.txt` — Markdown index of site capabilities and key pages
- [ ] Update `src/app/robots.ts` — add per-bot Allow rules for GPTBot, ClaudeBot, PerplexityBot, GoogleOther, Amazonbot
- [ ] Deploy and verify 40 new pages return 200 with correct meta tags
- [ ] Submit sitemap to Google Search Console + Bing Webmaster Tools
- [ ] **CHECKPOINT:** Run Lighthouse on 3 sample pages (SEO ≥95), verify sitemap has 51 URLs, confirm ≥8 RED bugs resolved

## Phase 1: Data Expansion + AEO Infrastructure

> Depends on: Phase 0 validated (pages indexing, kill condition not triggered)
> Checkpoint: All expanded data validates, schemas configured, next-seo integrated

- [ ] Create `src/data/industries.json` — 50+ industry entries with Zod schema
- [ ] Create `src/data/use-cases.json` — 30+ use-case entries with Zod schema
- [ ] Create `src/data/faq.json` — 30+ FAQ items with Zod schema
- [ ] Install `next-seo` — configure for FAQ, BreadcrumbList, Organization schema
- [ ] Add `WebSite` JSON-LD schema to `layout.tsx` (name, url, potentialAction with SearchAction)
- [ ] Add `Organization` JSON-LD schema to `layout.tsx` (name, url, logo, contactPoint)
- [ ] Create `src/components/seo/faq-schema.tsx` using next-seo
- [ ] **CHECKPOINT:** All data files pass Zod validation, Schema.org validates all schema types

## Phase 2: Scale to 400+ Programmatic Pages

> Depends on: Phase 0 + Phase 1
> Checkpoint: `next build` <30min, sitemap 400+ URLs, Lighthouse SEO ≥95

- [ ] Create `/create/[slug]/page.tsx` + `generateStaticParams()` + `generateMetadata()` — 80+ industry/use-case pages with ≥200 words unique content each
- [ ] Create `/templates/[slug]/page.tsx` — top 20 style-layout combos with static preview images (NO Gemini API at build time)
- [ ] Create `/faq/page.tsx` — FAQ hub with 30+ questions, FAQPage JSON-LD via next-seo, category filtering
- [ ] Add social proof section to all landing page templates (reuse component from Phase 0)
- [ ] Implement internal link mesh from explicit data relationships (relatedStyles, relatedLayouts, recommendedStyles)
- [ ] Create `/api/og/route.tsx` — OG image endpoint using static template + dynamic text overlay
- [ ] Add `staticGenerationTimeout: 120` to `next.config.ts`
- [ ] Update sitemap to include all 400+ programmatic pages
- [ ] Measure build time — if >30min, switch /create and /templates to ISR
- [ ] **CHECKPOINT:** `next build` <30min, sitemap shows 400+ URLs, spot-check 5 pages for 200 + ≥200 words + correct meta

## Phase 3: Blog System + Content Seeding

> Depends on: Phase 0, 1, 2
> Checkpoint: Blog index + 5 posts render, BlogPosting schema validates

- [ ] Test `@next/mdx` compatibility with Next.js 16.1.6 — if issues, use Keystatic or static HTML
- [ ] Install and configure MDX (or fallback) in `next.config.ts`
- [ ] Create `src/app/blog/page.tsx` — Blog index with article cards sorted by date
- [ ] Create `src/app/blog/[slug]/page.tsx` — Post template with reading time, ToC, related articles, BlogPosting JSON-LD
- [ ] Create `src/content/blog/` directory
- [ ] Write MDX: `what-makes-a-great-infographic-2026.mdx` (~1500 words, pillar content)
- [ ] Write MDX: `how-to-create-marketing-infographic-60-seconds.mdx` (~1000 words, tutorial)
- [ ] Write MDX: `20-infographic-styles-explained.mdx` (~2000 words, links to /styles/[slug] pages)
- [ ] Write MDX: `ai-pipeline-behind-zgnal.mdx` (~1200 words, technical authority)
- [ ] Write MDX: `free-vs-paid-infographic-makers.mdx` (~1500 words, comparison)
- [ ] Add blog to site navigation
- [ ] Update sitemap to include blog posts
- [ ] **CHECKPOINT:** Blog renders, individual posts have metadata, Schema.org validates, sitemap includes /blog/*

## Phase 4: IndexNow + Polish

> Depends on: Phase 0, 1, 2, 3
> Checkpoint: All PRD success criteria pass

- [ ] Generate IndexNow API key, place at `public/[key].txt`
- [ ] Create `src/lib/indexnow.ts` — POST URLs to IndexNow API
- [ ] Create `src/app/api/indexnow/route.ts` — accepts URL array, submits to IndexNow
- [ ] Add breadcrumb navigation component with BreadcrumbList JSON-LD (via next-seo)
- [ ] Add breadcrumbs to all programmatic page templates
- [ ] Audit internal links with Screaming Frog (free tier) — fix pages below 3-link threshold
- [ ] Run Playwright screenshots at 375px + 1440px on 5 representative pages
- [ ] Run Lighthouse on 10 random programmatic pages — all must score SEO ≥95
- [ ] Verify all structured data passes Google Rich Results Test
- [ ] Set up AI crawler traffic segment in Vercel Analytics (filter by GPTBot|ClaudeBot|PerplexityBot user-agents)
- [ ] Manual AEO check: query ChatGPT "best infographic tools" 3x, log results
- [ ] **CHECKPOINT:** ALL success criteria from PRD verified and passing

---

## Notes for AI Agent

- Execute Phase 0 Track A and Track B in parallel
- Use existing ZGNAL design system tokens (`--zs-*`) for all styling
- All pages must be mobile-first (375px baseline)
- Data files are the single source of truth — Zod validates at build time
- CTA links point to `/chat` with query params (e.g., `/chat?style=executive-institutional`)
- Blog posts must be genuinely useful content, not thin SEO bait
- Every 40-word answer block must directly answer the page's target search query
- Do NOT call Gemini API at build time — use static images/previews only
- next-seo for schema generation — do NOT write custom JSON-LD components from scratch

## Learnings & Surprises

> Update this section during execution with anything unexpected

- (none yet)
