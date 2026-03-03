/**
 * Inline infographic generation pipeline.
 * Runs entirely within Vercel serverless functions — no external engine needed.
 * Uses Google Gemini for all AI stages (analysis, structuring, image generation).
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// ── Types ──────────────────────────────────────────────────────

type ProgressCallback = (data: {
  status: string;
  progress: number;
  message: string;
}) => void;

type PipelineInput = {
  content: string;
  preset?: string;
  style?: string;
  layout?: string;
  aspect_ratio?: string;
  quality?: string;
  language?: string;
  simplify?: boolean;
};

type ProvenanceData = {
  seed: string;
  generatedAt: string;
  contentHash: string;
  models: {
    analysis: string;
    image: string;
  };
  pipeline: {
    stage: string;
    agent: string;
    result: string;
  }[];
  references: string[];
  topics: string[];
  contentSources: string[];
  compliance?: {
    score: number;
    corrections: number;
    riskWords: string[];
    factFlags: string[];
  };
  research?: {
    queriesRun: number;
    findingsCount: number;
    verifiedFacts: string[];
    sourceUrls: string[];
    referenceImages: number;
  };
};

type PipelineResult = {
  imageBase64: string;
  metadata: {
    layout: string;
    style: string;
    preset: string;
    aspect_ratio: string;
  };
  provenance: ProvenanceData;
};

type ContentAnalysis = {
  contentType: string;
  layout: string;
  style: string;
  tone: string;
  sectionCount: number;
  topics: string[];
  contentSources: string[];
};

type StructuredContent = {
  title: string;
  subtitle: string;
  sections: {
    heading: string;
    keyConcept: string;
    content: string[];
    visualElement: string;
    labels: string[];
  }[];
  statsBar: { label: string; value: string }[];
  designNotes: string;
};

type ComplianceReport = {
  corrections: {
    field: string;
    original: string;
    corrected: string;
    reason: 'spelling' | 'simplification' | 'fact_check' | 'length_risk';
  }[];
  riskWords: string[];
  factFlags: string[];
  score: number;
};

type ResearchResult = {
  findings: string[];
  verifiedFacts: string[];
  sourceUrls: string[];
  searchQueries: string[];
};

type ReferenceImage = {
  base64: string;
  mimeType: string;
  sourceUrl: string;
  description: string;
};

// ── Presets (from engine) ──────────────────────────────────────

const PRESETS: Record<string, { layout: string; style: string; tone: string }> = {
  'executive-summary': { layout: 'bento-grid', style: 'corporate-memphis', tone: 'professional' },
  'strategy-framework': { layout: 'hub-spoke', style: 'technical-schematic', tone: 'analytical' },
  'market-analysis': { layout: 'comparison-matrix', style: 'corporate-memphis', tone: 'data-rich' },
  'process-flow': { layout: 'linear-progression', style: 'ikea-manual', tone: 'clear' },
  'competitive-landscape': { layout: 'binary-comparison', style: 'bold-graphic', tone: 'bold' },
  'institutional-brief': { layout: 'dashboard', style: 'executive-institutional', tone: 'authoritative' },
  'deconstruct': { layout: 'structural-breakdown', style: 'deconstruct', tone: 'editorial' },
  'aerial-explainer': { layout: 'structural-breakdown', style: 'aerial-explainer', tone: 'architectural' },
};

const LAYOUT_IDS = [
  'linear-progression', 'binary-comparison', 'comparison-matrix', 'hierarchical-layers',
  'tree-branching', 'hub-spoke', 'structural-breakdown', 'bento-grid', 'iceberg', 'bridge',
  'funnel', 'isometric-map', 'dashboard', 'periodic-table', 'comic-strip', 'story-mountain',
  'jigsaw', 'venn-diagram', 'winding-roadmap', 'circular-flow',
];

const STYLE_IDS = [
  'craft-handmade', 'claymation', 'kawaii', 'storybook-watercolor', 'chalkboard',
  'cyberpunk-neon', 'bold-graphic', 'aged-academia', 'corporate-memphis', 'technical-schematic',
  'origami', 'pixel-art', 'ui-wireframe', 'subway-map', 'ikea-manual', 'knolling', 'lego-brick',
  'executive-institutional', 'deconstruct', 'aerial-explainer',
];

// ── Gemini API helpers ─────────────────────────────────────────

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function getApiKey(): string {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY is not configured');
  return key;
}

const TEXT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'gemini-3.1-flash-image-preview';

async function geminiGenerate(model: string, prompt: string, responseModalities?: string[]): Promise<string> {
  const url = `${GEMINI_BASE}/models/${model}:generateContent`;
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: responseModalities
      ? { responseModalities }
      : { maxOutputTokens: 8192 },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': getApiKey(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  // Skip thinking/thought parts — gemini-2.5-flash returns thought parts before the actual output
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textPart = parts.find((p: any) => p.text && !p.thought) || parts.find((p: any) => p.text);
  return textPart?.text || '';
}

async function geminiGenerateImage(
  prompt: string,
  aspectRatio: string,
  referenceImages?: ReferenceImage[],
): Promise<string> {
  const url = `${GEMINI_BASE}/models/${IMAGE_MODEL}:generateContent`;

  // Append mandatory text-quality enforcement as the final instruction
  const textEnforcement = `

FINAL INSTRUCTION — TEXT QUALITY IS THE #1 PRIORITY:
- Every character must be PERFECTLY LEGIBLE — no garbled, distorted, or made-up text
- Use ONLY clean sans-serif fonts (Helvetica, Inter, Roboto, Arial)
- Copy all text EXACTLY as provided above — do not invent or hallucinate any text
- If text doesn't fit readably, REMOVE content rather than shrink font size
- Minimum font size: 14pt equivalent
- All text must have high contrast against its background
- Every word must be a real, correctly-spelled English word`;

  const fullPrompt = `${prompt}\n${textEnforcement}\n\nAspect ratio: ${aspectRatio}.`;

  // Build multimodal parts array — reference images + text prompt
  const parts: any[] = [];

  if (referenceImages && referenceImages.length > 0) {
    parts.push({ text: 'REFERENCE IMAGES — Use these for visual context about what the topic looks like. Do NOT copy these images. Use them only as visual reference for accuracy of real-world objects, landmarks, and subjects:' });
    for (const img of referenceImages) {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64,
        },
      });
      if (img.description) {
        parts.push({ text: `(Reference: ${img.description})` });
      }
    }
    parts.push({ text: '---\nNow generate the infographic based on the following prompt:\n' });
  }

  parts.push({ text: fullPrompt });

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': getApiKey(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini image generation error (${res.status}): ${err}`);
  }

  const data = await res.json();
  for (const candidate of data.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }
  }
  throw new Error('No image data in Gemini response');
}

// ── Provenance helpers ─────────────────────────────────────────

function generateSeed(): string {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join('');
  return `ZG-${hex}`;
}

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 12);
}

// ── Reference file loader ──────────────────────────────────────

const REFS_DIR = path.join(process.cwd(), 'src', 'lib', 'references');

async function loadRef(relativePath: string): Promise<string> {
  try {
    return await readFile(path.join(REFS_DIR, relativePath), 'utf-8');
  } catch {
    return '';
  }
}

// ── Pipeline stages ────────────────────────────────────────────

async function analyzeContent(
  content: string,
  preset?: string,
  userLayout?: string,
  userStyle?: string,
): Promise<ContentAnalysis> {
  if (preset && preset !== 'auto' && PRESETS[preset]) {
    const p = PRESETS[preset];
    let topics: string[] = [];
    let contentSources: string[] = [];
    try {
      const extractResponse = await geminiGenerate(TEXT_MODEL, `Analyze this content and extract two things:
1. "topics": 3-6 topic keywords (lowercase strings)
2. "sources": Any URLs, authors, publications, organizations, or data sources cited in the content. If none found, return empty array.

Respond as JSON only (no markdown fences):
{"topics": ["keyword1", "keyword2"], "sources": ["source1", "source2"]}

CONTENT:
${content.slice(0, 3000)}`);
      const jsonMatch = extractResponse.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch?.[0] || '{}');
      topics = parsed.topics || [];
      contentSources = parsed.sources || [];
    } catch { /* fallback to empty */ }
    return {
      contentType: preset,
      layout: userLayout || p.layout,
      style: userStyle || p.style,
      tone: p.tone,
      sectionCount: 5,
      topics,
      contentSources,
    };
  }

  const layoutList = LAYOUT_IDS.join(', ');
  const styleList = STYLE_IDS.join(', ');

  const response = await geminiGenerate(TEXT_MODEL, `Analyze this content and recommend the best infographic layout and style.

AVAILABLE LAYOUTS: ${layoutList}
AVAILABLE STYLES: ${styleList}

Respond in JSON only (no markdown fences):
{
  "content_type": "timeline|comparison|hierarchy|process|overview|narrative|metrics|concept",
  "layout": "best-layout-id",
  "style": "best-style-id",
  "tone": "professional|academic|playful|technical|editorial",
  "section_count": 5,
  "topics": ["keyword1", "keyword2", "keyword3"],
  "sources": ["any cited URLs, authors, publications, or data sources"]
}

CONTENT:
${content.slice(0, 3000)}`);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] || '{}');
    return {
      contentType: parsed.content_type || 'overview',
      layout: userLayout || parsed.layout || 'bento-grid',
      style: userStyle || parsed.style || 'corporate-memphis',
      tone: parsed.tone || 'professional',
      sectionCount: parsed.section_count || 5,
      topics: parsed.topics || [],
      contentSources: parsed.sources || [],
    };
  } catch {
    return {
      contentType: 'overview',
      layout: userLayout || 'bento-grid',
      style: userStyle || 'corporate-memphis',
      tone: 'professional',
      sectionCount: 5,
      topics: [],
      contentSources: [],
    };
  }
}

// ── Research stage (Exa web search) ───────────────────────────

async function researchContent(
  topics: string[],
  contentSnippet: string,
): Promise<ResearchResult> {
  const empty: ResearchResult = { findings: [], verifiedFacts: [], sourceUrls: [], searchQueries: [] };
  const exaApiKey = process.env.EXA_API_KEY;
  if (!exaApiKey || topics.length === 0) return empty;

  try {
    const Exa = (await import('exa-js')).default;
    const exa = new Exa(exaApiKey);

    const primaryQuery = topics.slice(0, 3).join(' ') + ' facts statistics';
    const queries = [primaryQuery];
    if (topics.length > 3) {
      queries.push(topics.slice(3, 6).join(' ') + ' research data');
    }

    const allFindings: string[] = [];
    const allUrls: string[] = [];

    const results = await Promise.all(
      queries.map(q =>
        exa.searchAndContents(q, {
          numResults: 3,
          text: { maxCharacters: 500 },
          type: 'auto' as const,
        }).catch(() => null)
      )
    );

    for (const result of results) {
      if (!result?.results) continue;
      for (const r of result.results) {
        if (r.text) {
          const excerpt = r.text.slice(0, 200).trim();
          if (excerpt.length > 30) allFindings.push(excerpt);
        }
        if (r.url) allUrls.push(r.url);
      }
    }

    const uniqueUrls = [...new Set(allUrls)];

    // Extract verified facts from raw findings via Gemini
    let verifiedFacts: string[] = [];
    if (allFindings.length > 0) {
      try {
        const factPrompt = `Given these research excerpts about "${topics.join(', ')}":

${allFindings.map((f, i) => `[${i + 1}] ${f}`).join('\n\n')}

Extract 3-5 verified factual statements (statistics, dates, named entities, specific claims). Return as JSON array of strings only (no markdown fences):
["fact 1", "fact 2", "fact 3"]`;
        const factResponse = await geminiGenerate(TEXT_MODEL, factPrompt);
        const jsonMatch = factResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) verifiedFacts = JSON.parse(jsonMatch[0]);
      } catch { /* fact extraction failed — still return raw findings */ }
    }

    return {
      findings: allFindings.slice(0, 6),
      verifiedFacts: verifiedFacts.slice(0, 5),
      sourceUrls: uniqueUrls.slice(0, 8),
      searchQueries: queries,
    };
  } catch (err) {
    console.error('[Research] Exa search failed:', err instanceof Error ? err.message : err);
    return empty;
  }
}

// ── Reference images (Apify Google Images) ────────────────────

async function fetchReferenceImages(
  topics: string[],
): Promise<ReferenceImage[]> {
  const apifyToken = process.env.APIFY_TOKEN;
  if (!apifyToken || topics.length === 0) return [];

  try {
    // Build clean, focused search queries from topics only
    const primaryQuery = topics.slice(0, 3).join(' ');
    const queries = [primaryQuery];
    if (topics.length > 2) {
      // Add a second, more specific query for better coverage
      queries.push(`${topics[0]} ${topics[1]} photo`);
    }

    const actorUrl = 'https://api.apify.com/v2/acts/hooli~google-images-scraper/run-sync-get-dataset-items';

    const res = await fetch(`${actorUrl}?token=${apifyToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queries,
        maxItems: 5,
        countryCode: 'us',
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.error(`[RefImages] Apify returned ${res.status}`);
      return [];
    }

    const items: any[] = await res.json();
    if (!Array.isArray(items) || items.length === 0) return [];

    const imageItems = items
      .filter((item: any) => item.imageUrl && item.imageUrl.startsWith('http'))
      .slice(0, 3);

    const images = await Promise.all(
      imageItems.map(async (item: any): Promise<ReferenceImage | null> => {
        try {
          const imgRes = await fetch(item.imageUrl, {
            signal: AbortSignal.timeout(8000),
          });
          if (!imgRes.ok) return null;

          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          if (!contentType.includes('image/')) return null;

          const buffer = await imgRes.arrayBuffer();
          if (buffer.byteLength > 2 * 1024 * 1024) return null; // Cap at 2MB

          const base64 = Buffer.from(buffer).toString('base64');
          const mimeType = contentType.includes('png') ? 'image/png'
            : contentType.includes('webp') ? 'image/webp'
            : 'image/jpeg';

          return {
            base64,
            mimeType,
            sourceUrl: item.imageUrl,
            description: item.title || item.description || '',
          };
        } catch {
          return null;
        }
      })
    );

    return images.filter((img): img is ReferenceImage => img !== null);
  } catch (err) {
    console.error('[RefImages] Apify fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

// ── Pipeline stages ────────────────────────────────────────────

async function structureContent(
  content: string,
  analysis: ContentAnalysis,
  research?: ResearchResult,
): Promise<StructuredContent> {
  const isCleanStyle = ['executive-institutional', 'ui-wireframe'].includes(analysis.style);
  const isDeconstructStyle = analysis.style === 'deconstruct';
  const isAerialStyle = analysis.style === 'aerial-explainer';

  let sectionCount = analysis.sectionCount;
  if (isAerialStyle) sectionCount = Math.max(sectionCount, 8);
  else if (['winding-roadmap', 'linear-progression', 'story-mountain'].includes(analysis.layout)) {
    sectionCount = Math.max(sectionCount, 6);
  }

  const shortTextStyle = isDeconstructStyle || isAerialStyle;

  const response = await geminiGenerate(TEXT_MODEL, `Structure this content for a ${analysis.layout} infographic in ${analysis.style} style.

Create ${sectionCount} sections. Each section needs: heading (CAPS, max 5 words), key_concept (one sentence), content (bullet points), visual_element (what to illustrate), labels (callout text).
${shortTextStyle ? 'CRITICAL: Keep text ultra-short. Max 2 content items per section, each under 20 words.' : ''}
${isCleanStyle ? 'Visual elements should be clean data visualizations (charts, KPI numbers, diagrams), NOT illustrated scenes.' : ''}

Also provide: subtitle, stats_bar (4-6 key metrics), design_notes.

Respond in JSON only (no markdown fences):
{
  "title": "MAIN TITLE IN CAPS",
  "subtitle": "Hook sentence",
  "sections": [{"heading":"","key_concept":"","content":[""],"visual_element":"","labels":[""]}],
  "stats_bar": [{"label":"METRIC","value":"value"}],
  "design_notes": "visual direction"
}

CONTENT TYPE: ${analysis.contentType}
LAYOUT: ${analysis.layout}
STYLE: ${analysis.style}
${research && research.verifiedFacts.length > 0 ? `
RESEARCH CONTEXT — Use these verified facts for accuracy:
${research.verifiedFacts.map(f => `- ${f}`).join('\n')}
` : ''}
CONTENT:
${content.slice(0, 8000)}`);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] || '{}');
    const sections = (parsed.sections || []).map((s: any) => ({
      heading: s.heading || '',
      keyConcept: s.key_concept || '',
      content: s.content || [],
      visualElement: s.visual_element || '',
      labels: s.labels || [],
    }));

    // Enforce text density limits to prevent garbled text from overloaded prompts
    for (const section of sections) {
      if (section.content.length > 3) section.content = section.content.slice(0, 3);
      section.content = section.content.map((c: string) => c.length > 80 ? c.slice(0, 77) + '...' : c);
      if (section.labels.length > 4) section.labels = section.labels.slice(0, 4);
      section.labels = section.labels.map((l: string) => l.length > 30 ? l.slice(0, 27) + '...' : l);
    }

    return {
      title: parsed.title || 'Infographic',
      subtitle: parsed.subtitle || '',
      sections,
      statsBar: (parsed.stats_bar || []).map((s: any) => ({
        label: s.label || '',
        value: s.value || '',
      })),
      designNotes: parsed.design_notes || '',
    };
  } catch {
    return {
      title: 'Infographic',
      subtitle: '',
      sections: [{ heading: 'Overview', keyConcept: '', content: [content.slice(0, 300)], visualElement: '', labels: [] }],
      statsBar: [],
      designNotes: '',
    };
  }
}

// ── Compliance agent (Stage 02.5) ─────────────────────────────

function applyCorrection(obj: any, dotPath: string, value: string): void {
  const parts = dotPath.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = /^\d+$/.test(parts[i]) ? parseInt(parts[i]) : parts[i];
    current = current[key];
    if (!current) return;
  }
  const finalKey = /^\d+$/.test(parts[parts.length - 1])
    ? parseInt(parts[parts.length - 1])
    : parts[parts.length - 1];
  current[finalKey] = value;
}

async function validateContent(
  structured: StructuredContent,
): Promise<{ cleaned: StructuredContent; report: ComplianceReport }> {
  // Collect ALL text elements into a flat manifest
  const textManifest: { path: string; text: string }[] = [];
  textManifest.push({ path: 'title', text: structured.title });
  textManifest.push({ path: 'subtitle', text: structured.subtitle });

  structured.sections.forEach((s, i) => {
    textManifest.push({ path: `sections[${i}].heading`, text: s.heading });
    textManifest.push({ path: `sections[${i}].keyConcept`, text: s.keyConcept });
    s.content.forEach((c, j) => {
      textManifest.push({ path: `sections[${i}].content[${j}]`, text: c });
    });
    s.labels.forEach((l, j) => {
      textManifest.push({ path: `sections[${i}].labels[${j}]`, text: l });
    });
  });

  structured.statsBar.forEach((s, i) => {
    textManifest.push({ path: `statsBar[${i}].label`, text: s.label });
    textManifest.push({ path: `statsBar[${i}].value`, text: s.value });
  });

  const manifestJson = JSON.stringify(textManifest, null, 2);

  const compliancePrompt = `You are a text quality compliance agent for an AI image generator.

The image generator often garbles long or complex words when rendering them as image text. Your job is to check and simplify ALL text BEFORE it gets sent to the image model.

Here is the text manifest that will be rendered as image text:

${manifestJson}

For EACH text entry, check:

A. SPELLING: Fix any misspelled words.
B. SIMPLIFICATION: Replace words longer than 12 characters with shorter synonyms that preserve meaning. Examples:
   - "multidisciplinary" -> "cross-field"
   - "implementation" -> "rollout"
   - "comprehensive" -> "complete"
   - "infrastructure" -> "systems"
   - "transformation" -> "shift"
   - "organizational" -> "org-level"
   - "communication" -> "comms"
   - "approximately" -> "about"
   - "sustainability" -> "green goals"
   - "accountability" -> "ownership"
   - "technological" -> "tech"
   - "revolutionary" -> "ground-breaking"
   - "philosophical" -> "thought-based"
   Keep proper nouns and well-known technical terms intact.
C. FACT CHECK: If any statistics or numbers seem clearly implausible (e.g., "500% market share"), flag them.
D. LENGTH RISK: Flag any remaining words >12 characters that could NOT be simplified.

Respond in JSON only (no markdown fences):
{
  "corrections": [
    {"path": "sections[0].heading", "original": "ORGANIZATIONAL TRANSFORMATION", "corrected": "ORG-LEVEL SHIFT", "reason": "simplification"}
  ],
  "risk_words": ["Mediterranean"],
  "fact_flags": ["Market share of 500% is implausible"],
  "score": 85
}

If everything is fine: {"corrections": [], "risk_words": [], "fact_flags": [], "score": 100}`;

  try {
    const response = await geminiGenerate(TEXT_MODEL, compliancePrompt);
    // Strip markdown fences if present
    const stripped = response.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '');
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Compliance] No JSON found in response:', response.slice(0, 200));
      return {
        cleaned: structured,
        report: { corrections: [], riskWords: [], factFlags: [], score: 0 },
      };
    }
    const parsed = JSON.parse(jsonMatch[0]);

    const corrections: ComplianceReport['corrections'] = (parsed.corrections || []).map((c: any) => ({
      field: c.path || '',
      original: c.original || '',
      corrected: c.corrected || '',
      reason: c.reason || 'spelling',
    }));

    const report: ComplianceReport = {
      corrections,
      riskWords: parsed.risk_words || [],
      factFlags: parsed.fact_flags || [],
      score: typeof parsed.score === 'number' ? parsed.score : 100,
    };

    // Apply corrections to a deep copy
    const cleaned = JSON.parse(JSON.stringify(structured)) as StructuredContent;
    for (const correction of corrections) {
      applyCorrection(cleaned, correction.field, correction.corrected);
    }

    return { cleaned, report };
  } catch (err) {
    console.error('[Compliance] Validation failed:', err instanceof Error ? err.message : err);
    return {
      cleaned: structured,
      report: { corrections: [], riskWords: [], factFlags: [], score: 0 },
    };
  }
}

function buildContentSection(structured: StructuredContent, styleFamily: string): string {
  let out = `# ${structured.title}\n`;
  if (structured.subtitle) out += `## ${structured.subtitle}\n\n`;

  const labelMap: Record<string, { section: string; visual: string }> = {
    clean: { section: 'SECTION', visual: 'Data Visualization' },
    deconstruct: { section: 'COMPONENT', visual: 'Component Description' },
    aerial: { section: 'ZONE', visual: 'Aerial View Description' },
    illustrated: { section: 'MILESTONE', visual: 'Illustrated Scene' },
  };
  const { section: sectionLabel, visual: visualLabel } = labelMap[styleFamily] || labelMap.illustrated;

  for (let i = 0; i < structured.sections.length; i++) {
    const s = structured.sections[i];
    out += `### ${sectionLabel} ${i + 1}: ${s.heading}\n`;
    out += `**Key Concept:** ${s.keyConcept}\n`;
    out += `**Content:**\n`;
    for (const p of s.content) out += `- ${p}\n`;
    out += `**${visualLabel}:** ${s.visualElement}\n`;
    if (s.labels.length) out += `**Callout Labels:** ${s.labels.join(', ')}\n`;
    out += '\n';
  }

  if (structured.statsBar.length > 0) {
    out += `## Bottom Stats Bar\nRender as a horizontal footer strip:\n`;
    for (const stat of structured.statsBar) out += `| ${stat.label}: ${stat.value} `;
    out += `|\n\n`;
  }

  if (structured.designNotes) out += `## Design Notes\n${structured.designNotes}\n`;
  return out;
}

async function assemblePrompt(
  structured: StructuredContent,
  analysis: ContentAnalysis,
  aspectRatio: string,
  language: string,
  research?: ResearchResult,
): Promise<string> {
  const [basePrompt, layoutDef, styleDef] = await Promise.all([
    loadRef('base-prompt.md'),
    loadRef(`layouts/${analysis.layout}.md`),
    loadRef(`styles/${analysis.style}.md`),
  ]);

  const isCleanStyle = ['executive-institutional', 'ui-wireframe'].includes(analysis.style);
  const isDeconstructStyle = analysis.style === 'deconstruct';
  const isAerialStyle = analysis.style === 'aerial-explainer';
  const styleFamily = isAerialStyle ? 'aerial' : isDeconstructStyle ? 'deconstruct' : isCleanStyle ? 'clean' : 'illustrated';

  const contentSection = buildContentSection(structured, styleFamily);

  // Build explicit text labels block with exact verbatim copy instructions
  const sectionHeadings = structured.sections.map((s, i) => `${i + 1}. ${s.heading}`).join('\n');
  const annotationLabels = structured.sections.flatMap(s => s.labels).map(l => `- ${l}`).join('\n');
  const textLabels = `Title: ${structured.title}\nSubtitle: ${structured.subtitle}\n\nSection headings:\n${sectionHeadings}\n\nLabels and annotations:\n${annotationLabels}`;

  const aspectMap: Record<string, string> = {
    '9:16': 'portrait (9:16)',
    '16:9': 'landscape (16:9)',
    '1:1': 'square (1:1)',
  };

  let prompt = (basePrompt || 'Generate a publication-quality infographic image.\n\nLayout: {{LAYOUT}}\nStyle: {{STYLE}}\nAspect Ratio: {{ASPECT_RATIO}}\nLanguage: {{LANGUAGE}}\n\n{{LAYOUT_GUIDELINES}}\n\n{{STYLE_GUIDELINES}}\n\n{{CONTENT}}\n\nText labels (in {{LANGUAGE}}):\n{{TEXT_LABELS}}')
    .replace('{{LAYOUT}}', analysis.layout)
    .replace('{{STYLE}}', analysis.style)
    .replace(/\{\{ASPECT_RATIO\}\}/g, aspectMap[aspectRatio] || aspectRatio)
    .replace(/\{\{LANGUAGE\}\}/g, language)
    .replace('{{LAYOUT_GUIDELINES}}', layoutDef || `Layout: ${analysis.layout}`)
    .replace('{{STYLE_GUIDELINES}}', styleDef || `Style: ${analysis.style}`)
    .replace('{{CONTENT}}', contentSection)
    .replace('{{TEXT_LABELS}}', textLabels);

  // Inject research context if available
  let researchContext = 'No additional research available.';
  if (research && (research.verifiedFacts.length > 0 || research.findings.length > 0)) {
    const parts: string[] = [];
    if (research.verifiedFacts.length > 0) {
      parts.push('Verified facts to incorporate:\n' + research.verifiedFacts.map(f => `- ${f}`).join('\n'));
    }
    if (research.sourceUrls.length > 0) {
      parts.push(`Sources: ${research.sourceUrls.slice(0, 3).join(', ')}`);
    }
    researchContext = parts.join('\n\n');
  }
  prompt = prompt.replace('{{RESEARCH_CONTEXT}}', researchContext);

  return prompt;
}

// ── Main pipeline ──────────────────────────────────────────────

export async function runPipeline(
  input: PipelineInput,
  onProgress: ProgressCallback,
): Promise<PipelineResult> {
  const aspectRatio = input.aspect_ratio || '16:9';
  const language = input.language || 'en';
  const seed = generateSeed();
  const generatedAt = new Date().toISOString();
  const pipelineTrace: ProvenanceData['pipeline'] = [];

  // Content hash
  const contentHash = await hashContent(input.content);

  // Stage 1: Analyze content
  onProgress({ status: 'analyzing', progress: 10, message: 'Analyzing content structure...' });
  const analysis = await analyzeContent(input.content, input.preset, input.layout, input.style);
  pipelineTrace.push({ stage: '01', agent: 'Sentinel', result: `Extracted ${input.content.length} chars, type: ${analysis.contentType}` });
  onProgress({ status: 'analyzing', progress: 25, message: `Selected: ${analysis.layout} + ${analysis.style}` });

  // Stage 1.5: Research + Reference Images (PARALLEL)
  onProgress({ status: 'researching', progress: 15, message: 'Researching topics and finding references...' });
  const [research, referenceImages] = await Promise.all([
    researchContent(analysis.topics, input.content.slice(0, 500)),
    fetchReferenceImages(analysis.topics),
  ]);
  const researchSummary = research.findings.length > 0
    ? `${research.findings.length} findings, ${research.sourceUrls.length} sources`
    : 'No external research';
  pipelineTrace.push({
    stage: '01.5',
    agent: 'Oracle',
    result: `${researchSummary} | ${referenceImages.length} ref images`,
  });
  onProgress({
    status: 'researching',
    progress: 25,
    message: `Found ${research.sourceUrls.length} sources, ${referenceImages.length} reference images`,
  });

  // Stage 2: Structure content
  onProgress({ status: 'structuring', progress: 35, message: 'Building infographic sections...' });
  const structured = await structureContent(input.content, analysis, research);
  pipelineTrace.push({ stage: '02', agent: 'Architect', result: `${structured.sections.length} sections, tone: ${analysis.tone}` });
  onProgress({ status: 'structuring', progress: 50, message: `Created ${structured.sections.length} sections` });

  // Stage 2.5: Compliance validation
  onProgress({ status: 'validating', progress: 52, message: 'Running compliance checks...' });
  const { cleaned, report } = await validateContent(structured);
  pipelineTrace.push({ stage: '02.5', agent: 'Compliance', result: `Score: ${report.score}/100, ${report.corrections.length} fixes` });
  onProgress({ status: 'validating', progress: 55, message: `Compliance: ${report.corrections.length} corrections applied` });

  // Stage 3: Assemble prompt
  onProgress({ status: 'assembling', progress: 57, message: 'Assembling generation prompt...' });
  const prompt = await assemblePrompt(cleaned, analysis, aspectRatio, language, research);
  pipelineTrace.push({ stage: '03', agent: 'Architect', result: `${analysis.layout} layout, ${analysis.style} style` });

  // Collect reference files used
  const references = [
    'base-prompt.md',
    `layouts/${analysis.layout}.md`,
    `styles/${analysis.style}.md`,
  ];

  // Stage 4: Generate image
  onProgress({ status: 'generating', progress: 60, message: 'Rendering your infographic...' });
  const imageBase64 = await geminiGenerateImage(prompt, aspectRatio, referenceImages);
  pipelineTrace.push({ stage: '04', agent: 'Renderer', result: `${IMAGE_MODEL}, aspect: ${aspectRatio}` });
  onProgress({ status: 'generating', progress: 95, message: 'Finalizing...' });

  return {
    imageBase64,
    metadata: {
      layout: analysis.layout,
      style: analysis.style,
      preset: input.preset || 'auto',
      aspect_ratio: aspectRatio,
    },
    provenance: {
      seed,
      generatedAt,
      contentHash,
      models: {
        analysis: TEXT_MODEL,
        image: IMAGE_MODEL,
      },
      pipeline: pipelineTrace,
      references,
      topics: analysis.topics,
      contentSources: analysis.contentSources,
      compliance: {
        score: report.score,
        corrections: report.corrections.length,
        riskWords: report.riskWords,
        factFlags: report.factFlags,
      },
      research: {
        queriesRun: research.searchQueries.length,
        findingsCount: research.findings.length,
        verifiedFacts: research.verifiedFacts,
        sourceUrls: research.sourceUrls,
        referenceImages: referenceImages.length,
      },
    },
  };
}
