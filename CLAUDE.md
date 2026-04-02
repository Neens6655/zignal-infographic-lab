# ZGNAL Infographic Lab

AI-powered infographic generator. 7-stage Gemini pipeline, 20 layouts x 20 styles = 400+ combinations. Live at https://zgnal.ai

## Architecture

Next.js 16.1 + React 19 + TypeScript 5 + Tailwind CSS 4 + Framer Motion. Deployed on Vercel.

```
src/
  app/
    page.tsx                    # Landing page + generator UI (main entry)
    layout.tsx                  # Root layout + IBM Plex fonts
    globals.css                 # Neo Bauhaus design tokens (dark theme)
    chat/                       # Conversational generation interface
    dashboard/                  # User history + downloads
    (pages)/                    # Info pages (about, docs, pricing, etc.)
    api/
      generate/route.ts         # POST — main generation endpoint (SSE streaming)
      improve-prompt/route.ts   # POST — enhance brief with Gemini
      extract-file/route.ts     # POST — PDF/DOCX/PPTX/TXT parsing
      extract-url/route.ts      # POST — web page scraping (cheerio)
      extract-video/route.ts    # POST — YouTube/Vimeo transcripts
      catalog/route.ts          # GET  — presets/layouts/styles
      jobs/[id]/route.ts        # GET  — poll job status
      jobs/[id]/stream/route.ts # GET  — SSE progress stream
  components/
    generator/                  # ContentInput, OptionsPanel, ResultViewer, PresetPicker
    chat/                       # ChatContainer, ChatMessage, ChatFAB, voice
    layout/                     # SiteHeader
    ui/                         # Radix-based primitives (Button, Card, Dialog, etc.)
  hooks/
    use-generate.ts             # Generation state machine (idle→streaming→complete)
    use-chat.ts                 # Chat message management
    use-auth.ts                 # Supabase auth (stubbed in dev)
    use-voice-input.ts          # Web Speech API
  lib/
    pipeline.ts                 # THE CORE — 7-stage inline Gemini pipeline
    engine.ts                   # API client (fetch/poll/stream)
    constants.ts                # Presets, aspect ratios, limits
    credits.ts                  # Guest credit tracking
    types.ts                    # TypeScript interfaces
    export-utils.ts             # PNG/PDF/PPTX export
    references/                 # 41 markdown files that define generation behavior
      base-prompt.md            # MANDATORY text rendering rules (DO NOT MODIFY)
      layouts/                  # 20 layout guides (dashboard, hub-spoke, etc.)
      styles/                   # 20 style guides (executive-institutional, etc.)
```

## Key Concepts

- **7-Stage Pipeline** (`pipeline.ts`): Sentinel (analyze) → Oracle (research) → Architect (structure) → Compliance (validate) → Assembler (prompt) → Renderer (generate image) → Provenance (trace). All run inline on Vercel serverless.
- **Reference Files** (`lib/references/`): 41 markdown files that get injected into the Gemini prompt. These define layout structure, style aesthetics, and text rendering rules. They are the "DNA" of generation quality.
- **Provenance Tracking**: Every generation returns a full trace — seed, content hash, pipeline stages, research sources, compliance score, reference files used.
- **SSE Streaming**: Generation progress is streamed via Server-Sent Events. The `useGenerate` hook manages the state machine (idle → submitting → streaming → complete/error).
- **Neo Bauhaus Design**: Dark theme (#0A0A0B), gold accent (#D4A84B), zero border-radius, IBM Plex fonts, terminal-style shadows.

## Development

- **Install:** `npm install`
- **Dev server:** `npm run dev` (use a non-default port — machine has many services on 3000/3001/4000)
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Deploy:** Push to GitHub → Vercel auto-deploys

## Environment Variables

Required on Vercel AND locally:
- `GOOGLE_API_KEY` — Gemini API (text + image generation)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key

Optional:
- `EXA_API_KEY` — Web search for research stage
- `APIFY_TOKEN` — Reference image fetching

## Conventions

- TypeScript strict mode everywhere — no `any` types
- Server Components by default, `"use client"` only when needed (hooks, interactivity)
- Radix UI for headless primitives, styled with Tailwind
- Framer Motion (`motion/react`) for all animations
- Lucide React for icons
- All API routes return JSON (except generate which returns SSE)
- File extraction capped at 15,000 characters
- Use `npm` (not bun) for this project

## When Adding a New Layout or Style

1. Create `src/lib/references/layouts/{name}.md` or `styles/{name}.md`
2. Follow the structure of existing reference files (sections, color palette, typography, composition rules)
3. Add the new option to `src/lib/constants.ts` in the appropriate array
4. If it's a preset combo, add to the `PRESETS` array with layout + style pairing
5. Test generation with the new layout/style — verify text legibility first

## When Adding a New API Route

1. Create `src/app/api/{name}/route.ts`
2. Export named functions: `GET`, `POST`, etc.
3. Return `NextResponse.json()` for standard responses
4. For streaming: use `ReadableStream` with SSE format
5. Handle errors with try/catch and return proper status codes

## When Adding a New Page

1. Create `src/app/(pages)/{name}/page.tsx` for info pages
2. Or `src/app/{name}/page.tsx` for main app pages
3. Use the Neo Bauhaus tokens from `globals.css`
4. IBM Plex Sans for body, IBM Plex Mono for labels/code

## Do Not

- **DO NOT modify `base-prompt.md`** — it contains mandatory text rendering rules that keep generated infographics legible. Changes here break output quality.
- **DO NOT change the pipeline stage order** in `pipeline.ts` — stages depend on previous stage outputs.
- **DO NOT use default ports** (3000, 3001, 4000) for dev server — scan for a free port first.
- **DO NOT commit `.env.local`** — contains live API keys.
- **DO NOT skip smoke tests before deploying** — always verify env vars, hit endpoints, test UI on the live URL.
- **DO NOT add dependencies without checking bundle size** — this is a Vercel serverless app with cold start constraints.
- **DO NOT touch the 41 reference files** without testing generation output — they directly control image quality.

## Deployment Checklist

1. `npm run build` passes locally
2. All env vars set on Vercel dashboard
3. Push to GitHub (auto-deploys)
4. Verify https://zgnal.ai loads
5. Test one generation end-to-end on production
6. Check Vercel function logs for errors
