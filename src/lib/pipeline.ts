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
const IMAGE_MODEL = 'gemini-2.5-flash-image';

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
  const textPart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
  return textPart?.text || '';
}

async function geminiGenerateImage(prompt: string, aspectRatio: string): Promise<string> {
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

  const body = {
    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
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
    // Still extract topics even with preset
    let topics: string[] = [];
    try {
      const topicResponse = await geminiGenerate(TEXT_MODEL, `Extract 3-6 topic keywords from this content. Respond as a JSON array of lowercase strings only (no markdown fences):\n\n${content.slice(0, 2000)}`);
      const topicMatch = topicResponse.match(/\[[\s\S]*\]/);
      topics = JSON.parse(topicMatch?.[0] || '[]');
    } catch { /* fallback to empty */ }
    return {
      contentType: preset,
      layout: userLayout || p.layout,
      style: userStyle || p.style,
      tone: p.tone,
      sectionCount: 5,
      topics,
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
  "topics": ["keyword1", "keyword2", "keyword3"]
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
    };
  } catch {
    return {
      contentType: 'overview',
      layout: userLayout || 'bento-grid',
      style: userStyle || 'corporate-memphis',
      tone: 'professional',
      sectionCount: 5,
      topics: [],
    };
  }
}

async function structureContent(
  content: string,
  analysis: ContentAnalysis,
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

  // Stage 2: Structure content
  onProgress({ status: 'structuring', progress: 35, message: 'Building infographic sections...' });
  const structured = await structureContent(input.content, analysis);
  pipelineTrace.push({ stage: '02', agent: 'Oracle', result: `${structured.sections.length} sections, tone: ${analysis.tone}` });
  onProgress({ status: 'structuring', progress: 50, message: `Created ${structured.sections.length} sections` });

  // Stage 3: Assemble prompt
  onProgress({ status: 'assembling', progress: 55, message: 'Assembling generation prompt...' });
  const prompt = await assemblePrompt(structured, analysis, aspectRatio, language);
  pipelineTrace.push({ stage: '03', agent: 'Architect', result: `${analysis.layout} layout, ${analysis.style} style` });

  // Collect reference files used
  const references = [
    'base-prompt.md',
    `layouts/${analysis.layout}.md`,
    `styles/${analysis.style}.md`,
  ];

  // Stage 4: Generate image
  onProgress({ status: 'generating', progress: 60, message: 'Rendering your infographic...' });
  const imageBase64 = await geminiGenerateImage(prompt, aspectRatio);
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
    },
  };
}
