/**
 * prepBrief — the style-agnostic prep, run ONCE per brief.
 *
 * analyze -> research (cached / self-contained aware) -> structure -> density ->
 * number-guard. The output feeds all four style renders, so the expensive work
 * happens once instead of four times.
 */
import { localAnalyze } from "../pipeline/analyze";
import { researchContent } from "../pipeline/research";
import { structureContent } from "../pipeline/structure";
import { enforceDensity } from "../pipeline/density";
import { getCachedResearch, setCachedResearch } from "../research/cache";
import { extractNumericalClaims, crossVerifyNumbers } from "../research/verify";
import type { ResearchResult, NumberAudit } from "../pipeline/types";
import type { StructuredBrief } from "./types";

async function hashContent(content: string): Promise<string> {
  const data = new TextEncoder().encode(content);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface PrepOptions {
  aspectRatio?: string;
  language?: string;
  /** Progress 0-40 is the prep budget; render fan-out owns 40-100. */
  onProgress?: (progress: number, message: string) => void;
}

export async function prepBrief(
  content: string,
  opts: PrepOptions = {},
): Promise<StructuredBrief> {
  const aspectRatio = opts.aspectRatio || "16:9";
  const language = opts.language || "en";
  const emit = opts.onProgress ?? (() => {});

  const contentHash = await hashContent(content);

  // Stage 0 — analyze (regex + single Flash call). Style is chosen per-render, not here.
  emit(6, "Analyzing content structure...");
  const analysis = await localAnalyze(content);

  // Stage 1 — research (skip when the content is self-contained; cache otherwise).
  const contentLength = content.trim().length;
  const hasUserNumbers = (content.match(/\d+/g)?.length || 0) >= 2;
  const hasStructuredLines =
    content.split(/\n/).filter((l) => l.trim().length > 10).length > 2;
  const isSelfContained =
    hasUserNumbers || (contentLength > 200 && hasStructuredLines);

  let research: ResearchResult;
  if (isSelfContained) {
    emit(16, "Content is self-contained — skipping research");
    research = {
      findings: [content.slice(0, 6000)],
      verifiedFacts: [],
      sourceUrls: [],
      searchQueries: [],
      citations: [],
    };
  } else {
    emit(10, "Researching topics...");
    const cached = await getCachedResearch(content, analysis.intent);
    if (cached) {
      research = {
        findings: cached.findings,
        verifiedFacts: [],
        sourceUrls: cached.citations.map((c) => c.url),
        searchQueries: analysis.topics,
        citations: cached.citations,
      };
    } else {
      research = await researchContent(
        analysis.topics,
        content.slice(0, 2000),
        analysis.intent,
        analysis.entities,
      );
      if (research.findings.join(" ").length > 300) {
        setCachedResearch(content, analysis.intent, {
          findings: research.findings,
          citations: research.citations,
          sourceUrls: research.sourceUrls,
          cachedAt: new Date().toISOString(),
        });
      }
    }
  }

  // Stage 2 — structure into sections.
  emit(26, "Building infographic sections...");
  let structured = await structureContent(content, analysis, research);

  // Content gate — never send garbage to render; retry once with enriched input.
  const thin =
    structured.sections.length < 3 ||
    structured.sections.filter(
      (s) =>
        s.content.some((c) => c.length > 5) ||
        s.labels.some((l) => l.length > 3),
    ).length < 2;
  if (thin) {
    emit(30, "Content thin — enriching...");
    const enriched = `${content}\n\n--- RESEARCH CONTEXT ---\n${research.findings
      .join("\n")
      .slice(0, 4000)}`;
    structured = await structureContent(enriched, analysis, research);
  }

  // Stage 2.6 — density enforcement.
  emit(34, "Enforcing content density...");
  const { content: densified } = enforceDensity(structured, analysis.intent);

  // Stage 2.7 — number guard (only meaningful when research supplements user data).
  let numberAudit: NumberAudit | undefined;
  if (!isSelfContained && research.findings.length > 0) {
    emit(38, "Cross-verifying numbers...");
    const [contentNumbers, researchNumbers] = await Promise.all([
      extractNumericalClaims(
        densified.sections.map((s) => s.content.join(" ")).join(" ") +
          " " +
          densified.statsBar.map((s) => `${s.label}: ${s.value}`).join(" "),
      ),
      extractNumericalClaims(research.findings.join("\n\n")),
    ]);
    if (contentNumbers.length > 0 && researchNumbers.length > 0) {
      numberAudit = crossVerifyNumbers(contentNumbers, researchNumbers);
    }
  }

  emit(40, "Brief ready — rendering four styles...");

  return {
    structured: densified,
    analysis,
    research,
    numberAudit,
    aspectRatio,
    language,
    contentHash,
  };
}
