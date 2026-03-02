# ZGNAL Infographic Lab

**Turn complexity into clarity.** Research-backed, consulting-grade infographics in 60 seconds.

20 layouts. 18 visual styles. 22 trusted sources. Powered by a seven-stage AI pipeline.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-D4A84B)

---

## What It Does

Paste any content — an article, a URL, a PDF, a YouTube video — and the engine produces a publication-ready infographic. No design skills required.

**The 7-stage pipeline:**

| Stage | Agent | What It Does |
|-------|-------|-------------|
| 01 | **Sentinel** | Extracts content from text, URLs, PDFs, DOCX, PPTX, and video transcripts |
| 02 | **Oracle** | Researches references and verifies facts against 22 trusted sources |
| 03 | **Scribe** | Rewrites at 8th-grade reading level for maximum clarity |
| 04 | **Strategist** | Selects optimal layout + style combination from 400+ pairings |
| 05 | **Architect** | Builds the information architecture and visual hierarchy |
| 06 | **Forge** | Assembles the multimodal generation prompt with references |
| 07 | **Renderer** | Renders with Gemini 3 Pro at print resolution (2K+) |

## Visual Styles

18 distinct visual styles to match any use case:

| Style | Description |
|-------|-------------|
| Executive Institutional | McKinsey-grade bento grids and KPI dashboards |
| Deconstruct | NYT-style exploded views with callout annotations |
| Aerial Explainer | Drone-view isometric cutaways |
| Technical Schematic | Blueprint grids with precise linework |
| Craft Handmade | Watercolor textures and hand-drawn paths |
| Bold Graphic | Swiss poster aesthetic, maximum impact |
| Cyberpunk Neon | Glowing neon lines, circuit patterns |
| Claymation | Soft 3D clay objects, playful and tactile |
| Kawaii | Cute illustrated characters, pastel tones |
| Storybook Watercolor | Delicate paint washes, children's book warmth |
| Chalkboard | White chalk on dark green, sketch-note diagrams |
| Aged Academia | Sepia tones, classical engravings |
| Corporate Memphis | Flat geometric characters, Silicon Valley decks |
| Origami | Paper-folded 3D forms with crisp edges |
| Pixel Art | Retro 8-bit sprites, nostalgic gaming |
| IKEA Manual | Minimal line drawings, numbered assembly steps |
| Knolling | Top-down flat-lay, perfectly organized |
| LEGO Brick | Everything built from plastic bricks |

---

## Quick Start

### Prerequisites

- **Node.js** 18+ (or Bun)
- **Google Gemini API key** — get one at [ai.google.dev](https://ai.google.dev/)
- **Supabase project** (optional — auth is stubbed for local dev)

### 1. Clone and install

```bash
git clone https://github.com/AIMeMedia/zignal-infographic-lab.git
cd zignal-infographic-lab
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your keys:

```env
# Required — Google Gemini for prompt improvement
GOOGLE_API_KEY=your_google_api_key_here

# Required — Backend engine URL (default: localhost for dev)
ENGINE_API_URL=http://localhost:3000

# Optional — Supabase (auth disabled by default in dev)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

---

## Project Structure

```
zignal-infographic-lab/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page + generator UI
│   │   ├── layout.tsx                  # Root layout (IBM Plex fonts)
│   │   ├── globals.css                 # Neo Bauhaus design tokens
│   │   ├── dashboard/                  # Dashboard page
│   │   ├── auth/callback/              # OAuth callback
│   │   └── api/
│   │       ├── catalog/route.ts        # GET  — fetch presets/layouts/styles
│   │       ├── extract-file/route.ts   # POST — parse PDF/DOCX/PPTX/TXT
│   │       ├── extract-url/route.ts    # POST — scrape web pages
│   │       ├── extract-video/route.ts  # POST — YouTube/Vimeo transcripts
│   │       ├── generate/route.ts       # POST — submit generation job
│   │       ├── improve-prompt/route.ts # POST — enhance brief with Gemini
│   │       └── jobs/
│   │           └── [id]/
│   │               ├── route.ts        # GET  — poll job status
│   │               └── stream/route.ts # GET  — SSE progress stream
│   ├── components/
│   │   └── generator/
│   │       ├── generating-experience.tsx  # Progress animation
│   │       └── result-viewer.tsx          # Result display + export + style gallery
│   ├── hooks/
│   │   ├── use-auth.ts                # Auth hook (stubbed for dev)
│   │   └── use-generate.ts            # Generation state machine
│   ├── lib/
│   │   ├── constants.ts               # Presets, aspect ratios, limits
│   │   ├── credits.ts                 # Guest credit tracking
│   │   ├── engine.ts                  # API client (submit, poll, stream)
│   │   ├── types.ts                   # TypeScript types
│   │   └── utils.ts                   # Utility functions
│   └── middleware.ts                   # Auth middleware (disabled in dev)
├── public/
│   └── showcase/                       # Sample infographic images
├── .env.example                        # Environment template
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## API Reference

All API routes are Next.js Route Handlers under `/src/app/api/`.

### `POST /api/generate`

Submit content for infographic generation.

```json
{
  "content": "Your text content here...",
  "content_url": "https://example.com/article",
  "preset": "executive-summary",
  "style": "executive-institutional",
  "aspect_ratio": "16:9",
  "quality": "high",
  "simplify": true
}
```

**Response:**
```json
{
  "job_id": "abc-123",
  "status": "queued",
  "estimated_seconds": 60,
  "status_url": "/api/jobs/abc-123",
  "mode": "async"
}
```

### `GET /api/jobs/:id`

Poll job status.

**Response:**
```json
{
  "job_id": "abc-123",
  "status": "complete",
  "progress": 100,
  "result": {
    "image_url": "https://...",
    "download_url": "https://...",
    "metadata": {
      "layout": "Dashboard",
      "style": "Executive Institutional",
      "preset": "executive-summary",
      "aspect_ratio": "16:9"
    }
  }
}
```

### `GET /api/jobs/:id/stream`

Server-Sent Events stream for real-time progress.

```
event: progress
data: {"status":"generating","progress":75,"message":"Rendering your infographic..."}

event: complete
data: {"image_url":"...","download_url":"...","metadata":{...}}
```

### `POST /api/extract-file`

Extract text from uploaded files. Accepts `multipart/form-data`.

- **Supported formats:** PDF, DOCX, PPTX, TXT, MD, CSV, JSON
- **Max size:** 10 MB
- **Returns:** `{ text, charCount }`

### `POST /api/extract-url`

Extract content from a web page.

```json
{ "url": "https://example.com/article" }
```

**Returns:** `{ text, title, source }`

### `POST /api/extract-video`

Extract transcripts from video URLs.

- **Supported:** YouTube (captions), Vimeo (API), Loom (OG metadata)
- **Returns:** `{ text, title, source }`

### `POST /api/improve-prompt`

Enhance a content brief using Gemini 2.5 Flash.

```json
{ "content": "Brief description of your topic..." }
```

**Returns:** `{ improved: "Enhanced 4-6 section brief..." }`

### `GET /api/catalog`

Fetch available presets, layouts, and styles from the engine.

**Returns:** `{ presets, layouts, styles }`

---

## Design System

The UI follows the **ZGNAL Neo Bauhaus** design language:

| Token | Value | Usage |
|-------|-------|-------|
| `--z-bg` | `#0A0A0B` | Deep charcoal background |
| `--z-gold` | `#D4A84B` | Primary accent (gold) |
| `--z-cream` | `#E8E5E0` | Primary text |
| `--z-muted` | `#6B6B73` | Secondary text |
| `--z-blue` | `#5B8DEF` | Chart / info accent |
| `--z-olive` | `#8BC34A` | Success / positive |
| `--z-brick` | `#C04B3C` | Error / destructive |

**Typography:** IBM Plex Sans (body) + IBM Plex Mono (labels, code)
**Border radius:** 0px everywhere (Bauhaus DNA)
**Shadows:** Terminal-style offset shadows (`6px 6px 0`)

---

## Features

- **Multi-format input** — paste text, drop a URL, upload PDF/DOCX/PPTX, or link a YouTube video
- **AI prompt enhancement** — Gemini rewrites your brief into an optimized infographic prompt
- **Real-time progress** — SSE streaming shows each pipeline stage as it runs
- **18 visual styles** — from corporate dashboards to pixel art
- **9 content presets** — executive summary, strategy framework, market analysis, and more
- **3 aspect ratios** — landscape (16:9), portrait (9:16), square (1:1)
- **Export formats** — PNG (native), JPEG, PDF, PowerPoint (PPTX)
- **Social sharing** — one-click share to X, LinkedIn, WhatsApp
- **Lightbox zoom** — click any generated image for full-screen detail view
- **Style gallery** — browse all 18 styles with descriptions, regenerate in one click
- **Guest credits** — 2 free generations without signup
- **Responsive** — works on desktop, tablet, and mobile

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | Yes | Google Gemini API key for prompt improvement |
| `ENGINE_API_URL` | No | Backend engine URL (defaults to `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL (auth disabled in dev) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1 (App Router) |
| UI | React 19 + TypeScript 5 |
| Styling | Tailwind CSS 4 + custom design tokens |
| Animation | Framer Motion (motion/react) |
| Icons | Lucide React |
| AI | Google Gemini 2.5 Flash (prompt enhancement) |
| Export | jsPDF, PptxGenJS |
| File parsing | pdf-parse, mammoth, JSZip, cheerio |
| Auth | Supabase (optional) |
| Deployment | Vercel |

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Built by [ZGNAL.AI](https://zgnal.ai)
