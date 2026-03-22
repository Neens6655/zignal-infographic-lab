/* ═══════════════════════════════════════════════════════════════
   Edit Intent Classifier — pure client-side regex, zero LLM cost
   ═══════════════════════════════════════════════════════════════ */

import { STYLE_CATALOG, LAYOUT_IDS } from './chat-types';

// Human-friendly layout aliases → layout IDs
const LAYOUT_ALIASES: Record<string, string> = {
  'hub spoke': 'hub-spoke',
  'hub and spoke': 'hub-spoke',
  'bento': 'bento-grid',
  'bento grid': 'bento-grid',
  'grid': 'bento-grid',
  'timeline': 'winding-roadmap',
  'roadmap': 'winding-roadmap',
  'funnel': 'funnel',
  'iceberg': 'iceberg',
  'bridge': 'bridge',
  'venn': 'venn-diagram',
  'venn diagram': 'venn-diagram',
  'periodic table': 'periodic-table',
  'comic': 'comic-strip',
  'comic strip': 'comic-strip',
  'comparison': 'comparison-matrix',
  'matrix': 'comparison-matrix',
  'tree': 'tree-branching',
  'hierarchy': 'hierarchical-layers',
  'dashboard': 'dashboard',
  'circular': 'circular-flow',
  'jigsaw': 'jigsaw',
  'story': 'story-mountain',
};

export type EditIntent =
  | { type: 'style_change'; styleId: string }
  | { type: 'aspect_change'; aspectRatio: '16:9' | '9:16' | '1:1' }
  | { type: 'layout_change'; layoutId: string }
  | { type: 'content_edit'; editInstruction: string }
  | { type: 'new_query' };

export function classifyEdit(message: string, hasActiveResult: boolean): EditIntent {
  if (!hasActiveResult) return { type: 'new_query' };

  const lower = message.toLowerCase().trim();

  // ── Style change detection ──
  // Match exact style IDs
  for (const style of STYLE_CATALOG) {
    if (lower.includes(style.id)) {
      return { type: 'style_change', styleId: style.id };
    }
  }
  // Match style labels (case-insensitive)
  for (const style of STYLE_CATALOG) {
    if (lower.includes(style.label.toLowerCase())) {
      return { type: 'style_change', styleId: style.id };
    }
  }
  // Common style keywords
  const STYLE_KEYWORDS: Record<string, string> = {
    'executive': 'executive-institutional',
    'mckinsey': 'executive-institutional',
    'institutional': 'executive-institutional',
    'memphis': 'corporate-memphis',
    'bold': 'bold-graphic',
    'swiss poster': 'bold-graphic',
    'schematic': 'technical-schematic',
    'blueprint': 'technical-schematic',
    'technical': 'technical-schematic',
    'aerial': 'aerial-explainer',
    'isometric': 'aerial-explainer',
    'wireframe': 'ui-wireframe',
    'knolling': 'knolling',
    'flat lay': 'knolling',
    'subway': 'subway-map',
    'metro': 'subway-map',
    'chalkboard': 'chalkboard',
    'chalk': 'chalkboard',
    'academia': 'aged-academia',
    'academic': 'aged-academia',
    'sepia': 'aged-academia',
    'ikea': 'ikea-manual',
    'manual': 'ikea-manual',
    'deconstruct': 'deconstruct',
    'exploded': 'deconstruct',
  };
  for (const [keyword, styleId] of Object.entries(STYLE_KEYWORDS)) {
    const re = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    if (re.test(lower)) {
      return { type: 'style_change', styleId };
    }
  }

  // ── Aspect ratio change ──
  if (/\b(landscape|16[:\-x]9|widescreen|horizontal)\b/.test(lower)) {
    return { type: 'aspect_change', aspectRatio: '16:9' };
  }
  if (/\b(portrait|9[:\-x]16|vertical|mobile|tall)\b/.test(lower)) {
    return { type: 'aspect_change', aspectRatio: '9:16' };
  }
  if (/\b(square|1[:\-x]1)\b/.test(lower)) {
    return { type: 'aspect_change', aspectRatio: '1:1' };
  }

  // ── Layout change ──
  for (const [alias, layoutId] of Object.entries(LAYOUT_ALIASES)) {
    if (lower.includes(alias)) {
      return { type: 'layout_change', layoutId };
    }
  }
  for (const layoutId of LAYOUT_IDS) {
    if (lower.includes(layoutId)) {
      return { type: 'layout_change', layoutId };
    }
  }

  // ── Content edit patterns ──
  const CONTENT_EDIT_PATTERNS = [
    /change\s+(the\s+)?title/,
    /rename/,
    /title\s+should\s+be/,
    /add\s+(a\s+)?section/,
    /remove\s+(the\s+)?section/,
    /delete\s+(the\s+)?section/,
    /simplif/,
    /make\s+it\s+simpler/,
    /less\s+detail/,
    /more\s+detail/,
    /expand/,
    /elaborate/,
    /change\s+.+\s+to\s+/,
    /update\s+(the\s+)?/,
    /replace\s+/,
    /modify\s+/,
    /edit\s+(the\s+)?/,
    /rewrite\s+/,
    /rephrase\s+/,
    /include\s+/,
    /remove\s+/,
  ];

  for (const pattern of CONTENT_EDIT_PATTERNS) {
    if (pattern.test(lower)) {
      return { type: 'content_edit', editInstruction: message };
    }
  }

  // ── Fallback: if short message with active result, treat as content edit ──
  // Messages under 100 chars after an image are likely edits, not new queries
  if (lower.length < 100 && hasActiveResult) {
    return { type: 'content_edit', editInstruction: message };
  }

  return { type: 'new_query' };
}
