# Contributing to ZGNAL Infographic Lab

Thanks for your interest in contributing. This guide covers everything you need to get started.

## Development Setup

```bash
git clone https://github.com/AIMeMedia/zignal-infographic-lab.git
cd zignal-infographic-lab
npm install
cp .env.example .env.local
# Edit .env.local with your API keys
npm run dev
```

## Code Standards

### TypeScript
- Strict mode enabled
- Explicit types for function parameters and return values
- Use `type` over `interface` for consistency

### Styling
- **Tailwind CSS 4** with custom design tokens defined in `globals.css`
- Use design tokens (`--z-gold`, `--z-cream`, etc.) instead of hardcoded colors
- **0px border-radius everywhere** — this is the Bauhaus design rule
- IBM Plex Mono for labels and code, IBM Plex Sans for body text

### Components
- One component per file
- `'use client'` directive only where needed (hooks, interactivity)
- Framer Motion for animations via `motion/react`
- Lucide React for icons

### File Organization
```
src/
  app/         # Pages and API routes (Next.js App Router)
  components/  # Reusable UI components
  hooks/       # Custom React hooks
  lib/         # Utilities, types, constants, API client
```

## Git Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run build` to verify no TypeScript or build errors
4. Run `npm run lint` to check for linting issues
5. Commit with a clear message
6. Open a pull request

### Commit Messages

Use conventional format:
```
feat: add new visual style for timeline layouts
fix: resolve SSE stream disconnect on slow networks
docs: update API reference for extract-video endpoint
refactor: simplify job polling logic in use-generate hook
```

## Adding a New Visual Style

1. Add the style entry to `STYLE_CATALOG` in `src/components/generator/result-viewer.tsx`
2. Add it to `ALL_STYLES` in `src/app/page.tsx`
3. Ensure the backend engine supports the new style ID

## Adding a New Content Preset

1. Add to `PRESETS` in `src/lib/constants.ts`
2. Map the icon import in `src/app/page.tsx`

## Adding a New API Route

1. Create `src/app/api/your-route/route.ts`
2. Export `GET` or `POST` handler functions
3. Add TypeScript types to `src/lib/types.ts`
4. Document in README.md API Reference section

## Design Tokens

All custom tokens live in `src/app/globals.css` under `:root`:

| Token | Value | When to Use |
|-------|-------|------------|
| `--z-bg` | `#0A0A0B` | Page backgrounds |
| `--z-surface` | `#141416` | Card/panel backgrounds |
| `--z-gold` | `#D4A84B` | Primary accent, CTAs |
| `--z-cream` | `#E8E5E0` | Primary text |
| `--z-muted` | `#6B6B73` | Secondary/hint text |
| `--z-blue` | `#5B8DEF` | Info, charts |
| `--z-olive` | `#8BC34A` | Success states |
| `--z-brick` | `#C04B3C` | Error states |
| `--border` | `#2A2A2E` | All borders |

## Questions?

Open an issue on GitHub or reach out to the maintainers.
