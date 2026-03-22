/**
 * Prompt assembly + structure editing for iterative chat edits.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ContentAnalysis, StructuredContent, ResearchResult, NumberAudit } from './types';
import { geminiGenerate, TEXT_MODEL } from './gemini';

// ── Reference file loader ──────────────────────────────────────

const REFS_DIR = path.join(process.cwd(), 'src', 'lib', 'references');

async function loadRef(relativePath: string): Promise<string> {
  try {
    return await readFile(path.join(REFS_DIR, relativePath), 'utf-8');
  } catch {
    return '';
  }
}

// ── Content section builder ────────────────────────────────────

function buildContentSection(structured: StructuredContent, styleFamily: string): string {
  let out = `# ${structured.title}\n`;
  if (structured.subtitle) out += `## ${structured.subtitle}\n\n`;

  for (let i = 0; i < structured.sections.length; i++) {
    const s = structured.sections[i];
    out += `### ${i + 1}. ${s.heading}\n`;
    out += `${s.keyConcept}\n`;
    for (const p of s.content) out += `- ${p}\n`;
    if (s.visualElement) out += `Visual: ${s.visualElement}\n`;
    if (s.labels.length) out += `Labels: ${s.labels.join(', ')}\n`;
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

// ── Prompt assembly ────────────────────────────────────────────

export async function assemblePrompt(
  structured: StructuredContent,
  analysis: ContentAnalysis,
  aspectRatio: string,
  language: string,
  research?: ResearchResult,
  numberAudit?: NumberAudit,
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

  const sectionHeadings = structured.sections.map((s, i) => `${i + 1}. ${s.heading}`).join('\n');
  const annotationLabels = structured.sections.flatMap(s => s.labels).map(l => `- ${l}`).join('\n');

  let sourceAttribution = structured.sourceAttribution || '';
  if (!sourceAttribution && research && research.citations.length > 0) {
    const topSources = research.citations
      .filter(c => (c.tier || 3) <= 2)
      .slice(0, 4)
      .map(c => c.title.replace(/^www\./, ''));
    if (topSources.length > 0) {
      sourceAttribution = `Sources: ${topSources.join(' · ')}`;
    }
  }

  const statsBarText = structured.statsBar.length > 0
    ? `\n\nStats bar (render at bottom as key figures — copy EXACTLY):\n${structured.statsBar.map(s => `${s.label}: ${s.value}`).join(' | ')}`
    : '';
  const textLabels = `Title: ${structured.title}\nSubtitle: ${structured.subtitle}\n\nSection headings:\n${sectionHeadings}\n\nLabels and annotations:\n${annotationLabels}${statsBarText}${sourceAttribution ? `\n\nSource attribution (render at bottom of infographic in small text):\n${sourceAttribution}` : ''}`;

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

  // Inject research context
  let researchContext = 'No additional research available.';
  if (research && (research.verifiedFacts.length > 0 || research.findings.length > 0)) {
    const parts: string[] = [];
    if (research.verifiedFacts.length > 0) {
      parts.push('VERIFIED DATA — use these exact figures:\n' + research.verifiedFacts.map(f => `- ${f}`).join('\n'));
    }
    if (research.findings.length > 0) {
      parts.push('Research findings:\n' + research.findings.slice(0, 6).map(f => `- ${f.slice(0, 200)}`).join('\n'));
    }
    if (research.sourceUrls.length > 0) {
      parts.push(`Sources: ${research.sourceUrls.slice(0, 5).join(', ')}`);
    }
    researchContext = parts.join('\n\n');
  }
  prompt = prompt.replace('{{RESEARCH_CONTEXT}}', researchContext);

  // Executive style override — suppress illustration-heavy base prompt directives
  if (analysis.style === 'executive-institutional') {
    prompt += `\n\n## EXECUTIVE STYLE OVERRIDE — HIGHEST PRIORITY

This is a strategic research brief on a DARK NAVY canvas with WHITE content cards. Follow these rules absolutely:

1. **DARK BACKGROUND (#0F172A)** with WHITE content cards in a grid. This is NOT a white-background document.
2. **The title is a strategic research headline** — e.g., "Which Professions Face the Highest AI Exposure?" — NEVER use "Infographic", "Overview", "Summary", or any generic label.
3. **Each white card = one strategic insight.** Card heading is a finding statement (e.g., "Software Developers Face 85% Automation Risk"), NOT a category label (NOT "Software Developer", NOT "Overview").
4. **NO cartoon characters, illustrated people, robots, or figures.** Zero. Cards contain: text, numbers, and clean data charts ONLY.
5. **NO instruction leakage.** Do NOT render these words as visible text: "Narrative insight:", "SECTION", "Key Concept:", "Data Visualization:", "LABEL | VALUE", "Callout Labels:". These are internal formatting — render the actual content only.
6. **Colors**: Dark navy background, white cards, charcoal text on cards, institutional blue (#2563EB) for key numbers and chart data, gold (#B8860B) hairline accent.
7. **This should look like a Goldman Sachs or McKinsey strategy slide** — dark, authoritative, data-driven.
8. **MINIMUM FONT SIZE: 18pt body, 24pt headings, 36pt+ for key statistics.** If content doesn't fit at this size, use FEWER cards with LESS text. Never shrink text — remove content instead. Readability is non-negotiable.`;
  }

  // Data confidence watermark — rendered on the infographic itself
  if (numberAudit) {
    if (numberAudit.confidenceLevel === 'verified') {
      prompt += `\n\n## DATA CONFIDENCE BADGE
Render a small "DATA VERIFIED" badge in the bottom-right corner of the infographic.
Style: muted green background, white text, 10pt font, pill-shaped.
This indicates all statistics have been cross-verified against multiple authoritative sources.`;
    } else if (numberAudit.confidenceLevel === 'estimates') {
      prompt += `\n\n## DATA CONFIDENCE NOTICE
Render a small disclaimer bar at the very bottom of the infographic:
"Data shown as estimates — some figures could not be independently verified"
Style: muted gray background, 9pt text, full-width thin bar. Keep it subtle but visible.`;
    }
    // 'partially_verified' — no badge needed, middle ground
  }

  return prompt;
}

// ── Structure editing (for iterative chat edits) ───────────────

export async function applyStructureEdit(
  existing: StructuredContent,
  editInstruction: string,
): Promise<StructuredContent> {
  const response = await geminiGenerate(TEXT_MODEL, `You are editing an infographic's content structure. Apply ONLY the change described below. Do not modify anything else.

CURRENT STRUCTURE (JSON):
${JSON.stringify(existing, null, 2)}

USER'S EDIT REQUEST:
"${editInstruction.replace(/"/g, '\\"').slice(0, 500)}"

RULES:
1. Apply ONLY the described change — preserve everything else exactly as-is
2. If the user says "change title to X", only update the "title" field
3. If "add a section about X", append ONE new section with heading, key_concept, content, visual_element, labels
4. If "remove section about X", remove only that section
5. If "simplify" or "less detail", condense each section's content array to 1-2 items
6. If "more detail" or "expand", add more bullet points to each section
7. Preserve all existing data, style notes, and source attributions
8. Return the COMPLETE modified JSON (not just the changed parts)

Respond in JSON only (no markdown fences):
${JSON.stringify({ title: '', subtitle: '', sections: [{ heading: '', key_concept: '', content: [''], visual_element: '', labels: [''] }], stats_bar: [{ label: '', value: '' }], design_notes: '', source_attribution: '' })}`);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] || '{}');
    return {
      title: parsed.title || existing.title,
      subtitle: parsed.subtitle || existing.subtitle,
      sections: (parsed.sections || existing.sections).map((s: any) => ({
        heading: s.heading || '',
        keyConcept: s.key_concept || s.keyConcept || '',
        content: s.content || [],
        visualElement: s.visual_element || s.visualElement || '',
        labels: s.labels || [],
      })),
      statsBar: (parsed.stats_bar || parsed.statsBar || existing.statsBar).map((s: any) => ({
        label: s.label || '',
        value: s.value || '',
      })),
      designNotes: parsed.design_notes || parsed.designNotes || existing.designNotes,
      sourceAttribution: parsed.source_attribution || parsed.sourceAttribution || existing.sourceAttribution,
    };
  } catch {
    console.error('[applyStructureEdit] Failed to parse response, returning existing content');
    return existing;
  }
}
