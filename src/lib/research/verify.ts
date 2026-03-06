/**
 * Cross-verification engine.
 * Extracts claims from content and triangulates them against multiple sources.
 * Produces a deterministic credibility score — no model self-evaluation.
 */
import type { SourceCitation, VerifiedClaim, CredibilityScore } from '../types';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const TEXT_MODEL = 'gemini-2.5-flash';

async function geminiExtract(prompt: string): Promise<string> {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return '';

  const res = await fetch(`${GEMINI_BASE}/models/${TEXT_MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!res.ok) return '';

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textPart = parts.find((p: any) => p.text && !p.thought) || parts.find((p: any) => p.text);
  return textPart?.text || '';
}

/**
 * Extract factual claims from content using Gemini.
 * Returns an array of specific, verifiable statements.
 */
export async function extractClaims(content: string): Promise<string[]> {
  try {
    const response = await geminiExtract(`Extract the top 5 verifiable factual claims from this content.
Focus on: statistics, dates, percentages, named entities, quantitative data.
Return ONLY a JSON array of short strings, nothing else:
["claim 1", "claim 2"]

CONTENT:
${content.slice(0, 3000)}`);

    // Strip markdown fences if present (Gemini sometimes wraps JSON in ```json ... ```)
    let cleaned = response.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();
    // Try to repair truncated JSON — if starts with [ but no closing ]
    let jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch && cleaned.includes('[')) {
      // Truncated: find last complete "string", entry and close the array
      const truncated = cleaned.slice(cleaned.indexOf('['));
      // Find last complete string that ends with ",\n or "\n
      const lastCompleteEntry = truncated.lastIndexOf('",');
      const lastEntry = truncated.lastIndexOf('"');
      const cutPoint = lastCompleteEntry > 0 ? lastCompleteEntry + 1 : lastEntry > 0 ? lastEntry + 1 : -1;
      if (cutPoint > 1) {
        cleaned = truncated.slice(0, cutPoint) + ']';
        // Remove trailing comma before ]
        cleaned = cleaned.replace(/,\s*\]/, ']');
        try {
          JSON.parse(cleaned); // validate
          jsonMatch = cleaned.match(/\[[\s\S]*\]/);
          console.log('[Verify] Repaired truncated JSON array');
        } catch {
          console.log('[Verify] JSON repair failed, trying line-by-line');
          // Fallback: extract individual quoted strings
          const strings = truncated.match(/"([^"]+)"/g);
          if (strings && strings.length > 0) {
            cleaned = '[' + strings.join(',') + ']';
            jsonMatch = cleaned.match(/\[[\s\S]*\]/);
            console.log('[Verify] Extracted', strings.length, 'claims via regex');
          }
        }
      }
    }
    if (!jsonMatch) {
      console.log('[Verify] No JSON array found in response');
      return [];
    }
    const claims = JSON.parse(jsonMatch[0]);
    return Array.isArray(claims) ? claims.slice(0, 10) : [];
  } catch (err) {
    console.error('[Verify] extractClaims error:', err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * Cross-verify claims against collected source citations.
 * Uses Gemini to check semantic agreement between claims and source snippets.
 */
export async function crossVerifyClaims(
  claims: string[],
  sources: SourceCitation[],
): Promise<VerifiedClaim[]> {
  if (claims.length === 0) return [];
  if (sources.length === 0) {
    // No sources — all claims are unverified
    return claims.map(claim => ({
      claim,
      sources: [],
      agreement: 0,
      confidence: 'low' as const,
    }));
  }

  try {
    // Build source context for verification
    const sourceContext = sources
      .filter(s => s.snippet || s.title)
      .map((s, i) => `[Source ${i + 1}] ${s.title} (${s.provider}): ${s.snippet || 'No excerpt available'}`)
      .join('\n');

    const claimList = claims.map((c, i) => `[Claim ${i + 1}] ${c}`).join('\n');

    const response = await geminiExtract(`You are a fact-verification assistant. For each claim below, check if any of the provided sources support, contradict, or are unrelated to it.

SOURCES:
${sourceContext}

CLAIMS:
${claimList}

For each claim, respond with which source numbers (if any) support it.
Return as JSON (no markdown fences):
[
  {"claim_index": 0, "supporting_sources": [1, 3], "contradicted": false},
  {"claim_index": 1, "supporting_sources": [], "contradicted": false}
]`);

    const cleanedResponse = response.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '');
    const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return claims.map(claim => ({
        claim,
        sources: [],
        agreement: 0,
        confidence: 'low' as const,
      }));
    }

    const verifications = JSON.parse(jsonMatch[0]);

    return claims.map((claim, i) => {
      const verification = verifications.find((v: any) => v.claim_index === i);
      const supportingIndices: number[] = verification?.supporting_sources || [];
      const matchedSources = supportingIndices
        .filter(idx => idx >= 1 && idx <= sources.length)
        .map(idx => sources[idx - 1]);

      const sourceCount = matchedSources.length;
      let agreement: number;
      if (sourceCount === 0) agreement = 0;
      else if (sourceCount === 1) agreement = 0.5;
      else if (sourceCount === 2) agreement = 0.8;
      else agreement = 1.0;

      // Penalize contradicted claims
      if (verification?.contradicted) agreement = Math.max(0, agreement - 0.5);

      const confidence: 'high' | 'medium' | 'low' =
        agreement >= 0.8 ? 'high' : agreement >= 0.5 ? 'medium' : 'low';

      return {
        claim,
        sources: matchedSources,
        agreement,
        confidence,
      };
    });
  } catch (err) {
    console.error('[Verify] Cross-verification failed:', err instanceof Error ? err.message : err);
    return claims.map(claim => ({
      claim,
      sources: [],
      agreement: 0,
      confidence: 'low' as const,
    }));
  }
}

/**
 * Compute a deterministic credibility score from verified claims.
 * Formula: (crossVerifiedRatio * 0.5) + (avgSourceCount * 0.3) + (recencyBonus * 0.2)
 * Scale: 0-100
 */
export function computeCredibilityScore(
  verifiedClaims: VerifiedClaim[],
  sources: SourceCitation[],
): CredibilityScore {
  if (verifiedClaims.length === 0) {
    return {
      overall: 0,
      breakdown: { sourceCount: 0, crossVerified: 0, recency: 0 },
      claimsTotal: 0,
      claimsCrossVerified: 0,
    };
  }

  // Verified ratio (claims with 1+ sources) — cross-verified = 2+ sources
  const verified = verifiedClaims.filter(c => c.sources.length >= 1).length;
  const crossVerified = verifiedClaims.filter(c => c.sources.length >= 2).length;
  const verifiedRatio = verified / verifiedClaims.length;

  // Average source count per claim (normalized to 0-1, cap at 3 sources)
  const totalSources = verifiedClaims.reduce((sum, c) => sum + c.sources.length, 0);
  const avgSourceCount = Math.min(totalSources / verifiedClaims.length / 3, 1);

  // Recency bonus — how many sources have recent dates
  let recencyScore = 0.5; // Default neutral
  const datedSources = sources.filter(s => s.publishedDate);
  if (datedSources.length > 0) {
    const now = Date.now();
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const recentCount = datedSources.filter(s => {
      const pubDate = new Date(s.publishedDate!).getTime();
      return now - pubDate < oneYearMs;
    }).length;
    recencyScore = recentCount / datedSources.length;
  }

  // Score: verified ratio (40%) + multi-source bonus (25%) + source depth (20%) + recency (15%)
  const crossVerifiedRatio = crossVerified / verifiedClaims.length;
  const overall = Math.round(
    (verifiedRatio * 0.4 + crossVerifiedRatio * 0.25 + avgSourceCount * 0.2 + recencyScore * 0.15) * 100
  );

  return {
    overall: Math.max(0, Math.min(100, overall)),
    breakdown: {
      sourceCount: Math.round(avgSourceCount * 100),
      crossVerified: Math.round(crossVerifiedRatio * 100),
      recency: Math.round(recencyScore * 100),
    },
    claimsTotal: verifiedClaims.length,
    claimsCrossVerified: crossVerified,
  };
}
