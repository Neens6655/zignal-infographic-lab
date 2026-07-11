/**
 * Content structuring + compliance validation.
 */
import type { ContentAnalysis, StructuredContent, ComplianceReport, ResearchResult } from './types';
import { geminiGenerate, TEXT_MODEL, PRO_MODEL } from './gemini';

// ── Structure content ─────────────────────────────────────────

export async function structureContent(
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
  const isEntityBased = ['ranking', 'comparison'].includes(analysis.intent);
  const hasEntities = analysis.entities.length > 0;

  // Sparse data guard
  if (isEntityBased && hasEntities && research && research.findings.length > 0) {
    const researchText = research.findings.join(' ').toLowerCase();
    const coveredEntities = analysis.entities.filter(e =>
      researchText.includes(e.toLowerCase())
    );
    const coverage = coveredEntities.length / analysis.entities.length;
    if (coverage < 0.5 && coveredEntities.length >= 1) {
      console.log(`[Structure] Sparse data: ${coveredEntities.length}/${analysis.entities.length} entities covered. Reducing sections.`);
      analysis.entities = coveredEntities;
      sectionCount = Math.max(coveredEntities.length, 3);
    }
  }

  // Build intent-specific instruction block
  const isExecutiveStyle = analysis.style === 'executive-institutional';
  let intentInstruction = '';
  if (analysis.intent === 'ranking' && hasEntities) {
    intentInstruction = `
RANKING MODE — CRITICAL:
This is a RANKED LIST infographic. You MUST:
1. Create EXACTLY ${sectionCount} sections, one per ranked entity
2. Use THESE entities in this order: ${analysis.entities.map((e, i) => `#${i + 1} ${e}`).join(', ')}
3. Each section heading = ${isExecutiveStyle ? 'rank number + narrative insight (e.g., "#1 Spain — Dominates with 45% of Global Production")' : 'rank number + entity name (e.g., "#1 SPAIN", "#2 ITALY")'}
4. Each section's content = ALL metrics the user requested for that entity. Look at the original CONTENT to identify every metric asked for (exports, production, GDP, population, etc.) and include ALL of them.
5. Each section's labels = the key metric values as numbers (e.g., "1.3M TONNES", "~400K TONNES"). Show GLOBAL totals, not bilateral trade to a specific country.
6. Do NOT add narrative sections about geopolitics, market context, or analysis
7. The "title" MUST be a clean ranking title. Do NOT use a narrative headline.
8. The "subtitle" MUST be a meaningful summary sentence (8-15 words). NOT a single word.

DATA ACCURACY RULES:
9. Prefer numbers from RESEARCH DATA below. Use research data as your primary source.
10. If RESEARCH DATA provides a number, use that exact number. Do NOT round or adjust it.
11. If RESEARCH DATA does not cover an entity but the entity is well-known, you MAY include it with general context — do NOT leave sections empty or write "DATA NOT AVAILABLE". A complete ranking with qualitative insights is better than a partial ranking with only numbers.
12. For subjective rankings (quality of life, best cities, etc.): use research findings as primary data, supplemented by well-known facts. Always create ALL requested sections.
13. NEVER generate a section about "data unavailability" or "methodology gaps" — that is not content the user asked for.
`;
  } else if (analysis.intent === 'comparison' && hasEntities) {
    intentInstruction = `
COMPARISON MODE:
Create one section per item being compared: ${analysis.entities.join(', ')}
Each section should highlight the strengths, metrics, and distinguishing features of that item.
The "title" should clearly state what is being compared.
${isExecutiveStyle ? 'Each section heading must be a narrative insight (8-15 words, title case) stating the key differentiator.' : ''}

DATA ACCURACY: Use ONLY numbers from RESEARCH DATA. Do NOT substitute with training knowledge.
`;
  } else if (analysis.intent === 'process') {
    intentInstruction = `
PROCESS/FLOW/TIMELINE MODE:
Create sections as sequential steps or chronological milestones. Each section = one stage/era/event.
${isExecutiveStyle ? 'Heading = narrative insight about this stage (8-15 words, title case).' : 'Heading = step name or date.'} Content = what happens at this stage and why it matters.

DATA ACCURACY: Use ONLY numbers from RESEARCH DATA. Do NOT substitute with training knowledge.
`;
  } else {
    intentInstruction = `
If the content mentions multiple items (countries, companies, products, etc.), create a section for EACH item. Do not skip or merge items.
${isExecutiveStyle ? 'Each section heading must be a narrative insight (8-15 words, title case) stating the key executive takeaway.' : ''}

DATA ACCURACY: Use ONLY numbers from RESEARCH DATA when available. Do NOT substitute with training knowledge for statistics.`;
  }

  // Detect if content is self-contained
  const isSelfContainedContent = content.trim().length > 300 && (
    (content.match(/\d+/g)?.length || 0) > 5 ||
    content.split(/\n/).filter(l => l.trim().length > 10).length > 3
  );

  const textPreservation = isSelfContainedContent ? `
TEXT PRESERVATION — CRITICAL:
The user has provided detailed content below. You MUST:
1. Use the EXACT terms, names, phrases, and terminology from the user's content. Do NOT rephrase, substitute, or invent new terms.
2. If the user wrote "Operating Model", do NOT change it to "Operational Framework" or any synonym.
3. If the user listed specific items, headings, or categories, use those EXACT names in section headings and content.
4. You are STRUCTURING the user's content for visual layout — NOT rewriting or paraphrasing it.
5. Every heading, bullet point, and label should use words that APPEAR in the original content.
` : '';

  // Use Gemini Pro for executive-grade structuring, fall back to Flash if Pro fails
  let response: string;
  try {
    response = await geminiGenerate(PRO_MODEL, `Structure this content for a ${analysis.layout} infographic in ${analysis.style} style.

${intentInstruction}
${textPreservation}
Create ${sectionCount} sections${isEntityBased && hasEntities ? ` (one per entity: ${analysis.entities.join(', ')})` : ' (increase if needed to cover all items)'}. Each section needs: ${isExecutiveStyle ? 'heading (title case, 8-15 words — a narrative insight that states the KEY finding of this section, like a McKinsey slide title. Example: "Spain Commands 45% of Global Olive Oil Production")' : 'heading (CAPS, max 5 words)'}, key_concept (one sentence), content (bullet points), visual_element (what to illustrate), labels (callout text).
${shortTextStyle ? 'CRITICAL: Keep text ultra-short. Max 2 content items per section, each under 20 words.' : ''}
${isCleanStyle ? 'Visual elements should be clean data visualizations (charts, KPI numbers, diagrams), NOT illustrated scenes.' : ''}

Also provide: subtitle, stats_bar (4-6 key metrics), design_notes, source_attribution.
IMPORTANT: "source_attribution" must list the 3-4 most authoritative sources used for the data. Format: "Sources: domain1 · domain2 · domain3". Use only reputable institutional sources. If no sources available, use "Sources: Research data".

Respond in JSON only (no markdown fences):
{
  "title": "MAIN TITLE IN CAPS",
  "subtitle": "Hook sentence",
  "sections": [{"heading":"","key_concept":"","content":[""],"visual_element":"","labels":[""]}],
  "stats_bar": [{"label":"METRIC","value":"value"}],
  "source_attribution": "Sources: reuters.com · worldbank.org · eia.gov",
  "design_notes": "visual direction"
}

INTENT: ${analysis.intent}
LAYOUT: ${analysis.layout}
STYLE: ${analysis.style}
${research && (research.verifiedFacts.length > 0 || research.findings.length > 0) ? `
RESEARCH DATA — THIS IS YOUR SOLE SOURCE OF TRUTH. Use ONLY these numbers. Do NOT substitute with your training data:
${research.verifiedFacts.map(f => `- ${f}`).join('\n')}
${research.findings.map(f => `- ${f.slice(0, 800)}`).join('\n')}
` : ''}
CONTENT:
${content.slice(0, 8000)}`);
    console.log(`[Structure] Using ${PRO_MODEL} for executive-grade structuring`);
  } catch (proError) {
    console.warn(`[Structure] ${PRO_MODEL} failed, falling back to ${TEXT_MODEL}:`, proError instanceof Error ? proError.message : proError);
    response = await geminiGenerate(TEXT_MODEL, `Structure this content for a ${analysis.layout} infographic in ${analysis.style} style.
${intentInstruction}
${textPreservation}
Create ${sectionCount} sections${isEntityBased && hasEntities ? ` (one per entity: ${analysis.entities.join(', ')})` : ' (increase if needed to cover all items)'}. Each section needs: heading, key_concept, content (bullet points), visual_element, labels.

Respond in JSON only (no markdown fences):
{"title":"","subtitle":"","sections":[{"heading":"","key_concept":"","content":[""],"visual_element":"","labels":[""]}],"stats_bar":[{"label":"","value":""}],"source_attribution":"","design_notes":""}

INTENT: ${analysis.intent}
${research && research.findings.length > 0 ? `RESEARCH DATA:\n${research.findings.map(f => `- ${f.slice(0, 500)}`).join('\n')}` : ''}
CONTENT:
${content.slice(0, 6000)}`);
  }

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`[Structure] No JSON found in response. First 500 chars: ${response.slice(0, 500)}`);
    }
    const parsed = JSON.parse(jsonMatch?.[0] || '{}');
    console.log(`[Structure] Parsed: ${parsed.sections?.length || 0} sections, title="${(parsed.title || '').slice(0, 50)}"`);
    const sections = (parsed.sections || []).map((s: any) => ({
      heading: s.heading || '',
      keyConcept: s.key_concept || '',
      content: s.content || [],
      visualElement: s.visual_element || '',
      labels: s.labels || [],
    }));

    // Enforce text density limits
    for (const section of sections) {
      if (section.content.length > 5) section.content = section.content.slice(0, 5);
      section.content = section.content.map((c: string) => c.length > 120 ? c.slice(0, 117) + '...' : c);
      if (section.labels.length > 6) section.labels = section.labels.slice(0, 6);
      section.labels = section.labels.map((l: string) => l.length > 80 ? l.slice(0, 77) + '...' : l);
    }

    let subtitle = parsed.subtitle || '';
    if (subtitle.split(/\s+/).length < 3) subtitle = '';

    // Filter out truly empty placeholder sections (only remove explicit "no data" placeholders)
    const validSections = sections.filter((s: any) => {
      // A section is valid if it has a heading OR any content OR any labels
      if (s.heading && s.heading.length > 2) return true;
      if (s.labels.some((l: string) => l.length > 2)) return true;
      // Only filter if ALL content items are explicit placeholders
      const allPlaceholder = s.content.length === 0 || s.content.every((c: string) =>
        c.toLowerCase().includes('no specific') || c.toLowerCase().includes('data not available') || c.toLowerCase().includes('no data') || c.toLowerCase().includes('n/a')
      );
      return !allPlaceholder;
    });
    console.log(`[Structure] ${sections.length} raw sections -> ${validSections.length} valid sections`);

    return {
      title: parsed.title || 'Infographic',
      subtitle,
      sections: validSections.length >= 2 ? validSections : sections,
      statsBar: (parsed.stats_bar || []).map((s: any) => ({
        label: s.label || '',
        value: s.value || '',
      })),
      designNotes: parsed.design_notes || '',
      sourceAttribution: parsed.source_attribution || '',
    };
  } catch (err) {
    console.error(`[Structure] JSON parse failed:`, err instanceof Error ? err.message : err);
    console.error(`[Structure] Raw response (first 500 chars): ${response.slice(0, 500)}`);
    return {
      title: 'Infographic',
      subtitle: '',
      sections: [{ heading: 'Overview', keyConcept: '', content: [content.slice(0, 300)], visualElement: '', labels: [] }],
      statsBar: [],
      designNotes: '',
      sourceAttribution: '',
    };
  }
}

// ── Compliance agent ─────────────────────────────────────────

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

export async function validateContent(
  structured: StructuredContent,
): Promise<{ cleaned: StructuredContent; report: ComplianceReport }> {
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
