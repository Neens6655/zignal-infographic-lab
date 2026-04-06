/**
 * Content analysis — domain detection, intent classification, research planning.
 */
import type { ContentAnalysis } from './types';
import { PRESETS } from './types';
import { geminiGenerate, TEXT_MODEL } from './gemini';
import { LAYOUT_IDS, STYLE_IDS } from '../chat-types';

// ── Content domain detection (semantic style inference) ──────

type ContentDomain = 'business' | 'finance' | 'technology' | 'science' | 'education' | 'creative' | 'editorial' | 'general';

const DOMAIN_PATTERNS: Record<ContentDomain, RegExp> = {
  business: /\b(strategy|market\s*share|revenue|CEO|stakeholder|M&A|ROI|competitive|enterprise|B2B|B2C|supply\s*chain|quarterly|annual\s*report|board|investor|corporate|business\s*model|McKinsey|BCG|consulting|executive|SWOT|value\s*prop|go.to.market|positioning|brand\s*strategy|growth|profit|margin|EBITDA|IPO)\b/i,
  finance: /\b(GDP|inflation|interest\s*rate|bonds?|equit(?:y|ies)|stock|portfolio|Sharpe|drawdown|treasury|central\s*bank|Fed|ECB|fiscal|monetary|forex|FX|derivatives|hedge\s*fund|PE\s*ratio|valuation|dividend|yield|debt.to.equity|balance\s*sheet|P&L|cash\s*flow|capital\s*markets)\b/i,
  technology: /\b(API|SDK|cloud|Kubernetes|Docker|microservices?|frontend|backend|database|deployment|CI\/CD|DevOps|architecture|stack|framework|React|Python|machine\s*learning|AI|neural|LLM|blockchain|crypto|Web3|SaaS|platform|infrastructure|scalab|latency|throughput|endpoint)\b/i,
  science: /\b(hypothesis|experiment|peer.review|journal|clinical|genome|molecule|species|ecosystem|biodiversity|carbon|emission|renewable|nuclear|quantum|particle|gravity|evolution|DNA|RNA|vaccine|pathogen|cell|atom|photosynthesis|chemical|physics|biology|geology|astronomy)\b/i,
  education: /\b(curriculum|pedagogy|learning|student|teacher|university|degree|enrollment|literacy|STEM|scholarship|academic|semester|campus|education|school|K-?12|tutoring|course|lecture|exam|grade|GPA)\b/i,
  creative: /\b(design|aesthetic|typography|Bauhaus|palette|visual|branding|logo|illustration|photography|cinema|film|music|art|gallery|exhibition|creative\s*direction|UX|UI|animation|motion|color\s*theory)\b/i,
  editorial: /\b(opinion|analysis|perspective|debate|policy|geopolitics?|conflict|diplomacy|legislation|regulation|reform|social\s*impact|inequality|demographic|migration|human\s*rights|governance|democracy|election|political)\b/i,
  general: /^/, // always matches — fallback
};

/** Domain × Intent → optimal style. Default: executive-institutional (consulting-grade). */
const DOMAIN_INTENT_STYLES: Record<ContentDomain, Record<string, string>> = {
  business:   { ranking: 'executive-institutional', comparison: 'executive-institutional', metrics: 'executive-institutional', process: 'executive-institutional', overview: 'executive-institutional' },
  finance:    { ranking: 'executive-institutional', comparison: 'executive-institutional', metrics: 'executive-institutional', process: 'executive-institutional', overview: 'executive-institutional' },
  technology: { ranking: 'executive-institutional', comparison: 'executive-institutional', metrics: 'executive-institutional', process: 'technical-schematic',     overview: 'executive-institutional' },
  science:    { ranking: 'executive-institutional', comparison: 'executive-institutional', metrics: 'executive-institutional', process: 'executive-institutional', overview: 'executive-institutional' },
  education:  { ranking: 'executive-institutional', comparison: 'executive-institutional', metrics: 'executive-institutional', process: 'executive-institutional', overview: 'executive-institutional' },
  creative:   { ranking: 'executive-institutional', comparison: 'executive-institutional', metrics: 'executive-institutional', process: 'executive-institutional', overview: 'executive-institutional' },
  editorial:  { ranking: 'executive-institutional', comparison: 'executive-institutional', metrics: 'executive-institutional', process: 'executive-institutional', overview: 'executive-institutional' },
  general:    { ranking: 'executive-institutional', comparison: 'executive-institutional', metrics: 'executive-institutional', process: 'executive-institutional', overview: 'executive-institutional' },
};

export function detectContentDomain(content: string): ContentDomain {
  const scores: Partial<Record<ContentDomain, number>> = {};
  for (const [domain, pattern] of Object.entries(DOMAIN_PATTERNS)) {
    if (domain === 'general') continue;
    const matches = content.match(new RegExp(pattern, 'gi'));
    if (matches && matches.length > 0) {
      scores[domain as ContentDomain] = matches.length;
    }
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0 && sorted[0][1] >= 2) {
    return sorted[0][0] as ContentDomain;
  }
  return 'general';
}

export function getStyleForDomainIntent(domain: ContentDomain, intent: string): string {
  return DOMAIN_INTENT_STYLES[domain]?.[intent] || DOMAIN_INTENT_STYLES.general[intent] || 'executive-institutional';
}

// ── Intent taxonomy ──────────────────────────────────────────

type IntentConfig = {
  layout: string;
  minSections: number;
  defaultStyle: string;
  regex: RegExp | null;
  styleOptions: [string, string, string, string];
};

const INTENT_DEFAULTS: Record<string, IntentConfig> = {
  ranking: {
    layout: 'linear-progression', // Was bento-grid — storytelling flow, not random boxes
    minSections: 4,
    defaultStyle: 'executive-institutional',
    regex: /top\s+\d+|largest|biggest|best\s+\d+|ranking|most\s+\w+\s+countries|highest|lowest|richest|poorest|fastest|leading/i,
    styleOptions: ['executive-institutional', 'bold-graphic', 'deconstruct', 'aerial-explainer'],
  },
  comparison: {
    layout: 'binary-comparison',
    minSections: 2,
    defaultStyle: 'executive-institutional',
    regex: /\bvs\.?\b|versus|compared?\s+to|difference\s+between|pros?\s+(and|&)\s+cons?/i,
    styleOptions: ['executive-institutional', 'deconstruct', 'bold-graphic', 'aerial-explainer'],
  },
  metrics: {
    layout: 'linear-progression', // Was dashboard — flow, not tiles
    minSections: 4,
    defaultStyle: 'executive-institutional',
    regex: /revenue|Q[1-4]\b|KPI|financial|earnings|quarterly|annual\s+report|dashboard|budget|forecast/i,
    styleOptions: ['executive-institutional', 'bold-graphic', 'deconstruct', 'aerial-explainer'],
  },
  process: {
    layout: 'winding-roadmap',
    minSections: 4,
    defaultStyle: 'executive-institutional',
    regex: /how\s+(does|do|to)|step.by.step|process|lifecycle|workflow|supply\s*chain|timeline|history\s+of|evolution\s+of|phases?\s+of/i,
    styleOptions: ['executive-institutional', 'aged-academia', 'deconstruct', 'aerial-explainer'],
  },
  overview: {
    layout: 'hub-spoke', // Was bento-grid — centered narrative, not random boxes
    minSections: 4,
    defaultStyle: 'executive-institutional',
    regex: null,
    styleOptions: ['executive-institutional', 'aerial-explainer', 'bold-graphic', 'deconstruct'],
  },
};

export function detectIntentByRegex(query: string): string | null {
  for (const [intent, config] of Object.entries(INTENT_DEFAULTS)) {
    if (config.regex && config.regex.test(query)) return intent;
  }
  return null;
}

// ── Main analysis function ───────────────────────────────────

export async function analyzeContent(
  content: string,
  preset?: string,
  userLayout?: string,
  userStyle?: string,
): Promise<ContentAnalysis> {
  // ── Preset path (user chose a specific preset) ──
  if (preset && preset !== 'auto' && PRESETS[preset]) {
    const p = PRESETS[preset];
    let topics: string[] = [];
    let entities: string[] = [];
    let contentSources: string[] = [];
    try {
      const extractResponse = await geminiGenerate(TEXT_MODEL, `Analyze this content and extract:
1. "entities": Specific named entities (countries, companies, people, cities, products). List each as a separate string.
2. "topics": Search-optimized queries for each entity (e.g., "Ecuador banana exports tonnes 2024"). 4-12 topics.
3. "sources": Any URLs, authors, publications, or data sources cited. Empty array if none.

Respond as JSON only (no markdown fences):
{"entities": ["Ecuador", "Philippines"], "topics": ["Ecuador banana exports", "Philippines banana exports"], "sources": []}

CONTENT:
${content.slice(0, 6000)}`);
      const jsonMatch = extractResponse.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch?.[0] || '{}');
      entities = parsed.entities || [];
      topics = parsed.topics || [];
      contentSources = parsed.sources || [];
    } catch { /* fallback to empty */ }
    return {
      contentType: preset,
      intent: 'overview',
      layout: userLayout || p.layout,
      style: userStyle || p.style,
      tone: p.tone,
      sectionCount: 5,
      topics,
      entities,
      metrics: [],
      contentSources,
    };
  }

  const styleList = STYLE_IDS.join(', ');

  // ── STEP 0.5: Detect content domain for style inference ──
  const detectedDomain = detectContentDomain(content);
  console.log(`[Intent] Content domain: ${detectedDomain}`);
  const effectiveUserStyle = userStyle;

  // ── STEP 1: Intent Classification ──
  const regexIntent = detectIntentByRegex(content);

  let intent = regexIntent || 'overview';
  let entityType = 'concept';
  let metrics: string[] = [];
  let count = 0;
  let style = 'executive-institutional';
  let tone = 'professional';

  if (regexIntent) {
    console.log(`[Intent] Regex matched: ${regexIntent}`);
  }

  // LLM: Combined intent classification + research plan (single call, saves ~3s round-trip)
  const combinedResponse = await geminiGenerate(TEXT_MODEL, `You are an intent classifier AND research planner for an infographic engine. Do BOTH tasks in ONE response.

═══ TASK 1: INTENT CLASSIFICATION ═══

Classify this query into ONE intent and extract metadata.

INTENTS:
- "ranking" — Top N lists, best/worst/largest. E.g. "top 10 GDP economies"
- "comparison" — Side-by-side 2-4 items. E.g. "iPhone vs Samsung"
- "metrics" — Data dashboard, KPIs. E.g. "Q4 revenue breakdown"
- "process" — Step-by-step, timelines, supply chains. E.g. "how vaccines work"
- "overview" — General knowledge (catch-all). E.g. "the future of AI"

═══ TASK 2: RESEARCH PLAN ═══

Based on your classification:
- For ranking/comparison/metrics: List the ACTUAL top entities by the primary metric. Generate ONE search topic per entity combining ALL metrics.
- For process/overview: Generate 4-8 search-optimized topic phrases for research.
- Extract any sources cited in the query.

═══ RESPONSE FORMAT ═══

Respond in JSON only (no markdown fences):
{
  "intent": "ranking|comparison|metrics|process|overview",
  "entity_type": "country|company|person|product|event|concept",
  "metrics": ["primary metric with units", "secondary metric"],
  "count": 10,
  "style": "pick from: ${styleList}",
  "tone": "professional|academic|technical|editorial",
  "entities": ["Entity1", "Entity2"],
  "topics": ["Entity1 metric data year", "Entity2 metric data year"],
  "sources": ["any cited URLs or publications"]
}

RULES:
- "metrics": Be specific (include units like "volume", "tonnes", "USD"). Always include at least one.
- "count": For rankings, use the number specified (e.g., "top 5" → 5). Default to 10. For comparisons, count items. For others, use 0.
- "entities": For rankings, list the ACTUAL top entities based on your knowledge. Do NOT guess.
- "topics": ONE topic per entity combining ALL metrics. For process/overview, 4-8 descriptive phrases.

QUERY:
${content.slice(0, 4000)}`);

  let entities: string[] = [];
  let topics: string[] = [];
  let contentSources: string[] = [];

  try {
    const jsonMatch = combinedResponse.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] || '{}');

    // Extract intent classification
    if (!regexIntent && parsed.intent && INTENT_DEFAULTS[parsed.intent]) {
      intent = parsed.intent;
    }
    entityType = parsed.entity_type || 'concept';
    metrics = Array.isArray(parsed.metrics) ? parsed.metrics : (parsed.metric ? [parsed.metric] : []);
    count = parsed.count || 0;
    style = parsed.style && STYLE_IDS.includes(parsed.style) ? parsed.style : INTENT_DEFAULTS[intent].defaultStyle;
    tone = parsed.tone || 'professional';

    // Extract research plan
    entities = parsed.entities || [];
    topics = parsed.topics || [];
    contentSources = parsed.sources || [];
  } catch { /* defaults already set */ }

  const defaults = INTENT_DEFAULTS[intent];
  const sectionCount = count > 0 ? count : defaults.minSections;
  const layout = userLayout || defaults.layout;

  console.log(`[Intent+Research] ${intent} | entities: ${entityType} (${entities.length}) | metrics: ${metrics.join(', ')} | count: ${sectionCount} | layout: ${layout} | topics: ${topics.length}`);

  const contentTypeMap: Record<string, string> = {
    ranking: 'comparison',
    comparison: 'comparison',
    metrics: 'metrics',
    process: 'process',
    overview: 'overview',
  };

  const finalStyle = effectiveUserStyle || getStyleForDomainIntent(detectedDomain, intent) || style;
  console.log(`[Style] UI="${userStyle || 'none'}" | domain="${detectedDomain}" | domain×intent="${getStyleForDomainIntent(detectedDomain, intent)}" | LLM="${style}" | FINAL="${finalStyle}"`);

  return {
    contentType: contentTypeMap[intent] || 'overview',
    intent,
    layout,
    style: finalStyle,
    tone,
    sectionCount,
    topics,
    entities,
    metrics,
    contentSources,
  };
}
