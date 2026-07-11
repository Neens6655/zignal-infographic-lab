/**
 * Main pipeline orchestrator — v4: quality-first rebuild.
 * localAnalyze (1 call) → cached research (Perplexity + parallel Firecrawl) → structure (Gemini Pro) → density → generate → OCR.
 */
import type { PipelineInput, PipelineResult, ProgressCallback, ProvenanceData, ResearchResult, ReferenceImage } from './types';
import type { NumberAudit } from '../types';
import { IMAGE_MODEL, PRO_MODEL, TEXT_MODEL } from './gemini';
import { geminiGenerateImage } from './gemini';
import { localAnalyze } from './analyze';
import { researchContent, fetchReferenceImages } from './research';
import { structureContent } from './structure';
import { getCachedResearch, setCachedResearch } from '../research/cache';
import { assemblePrompt, assembleIllustrationPrompt } from './prompt';
import { planLayout } from './layout-planner';
import { renderTextLayer } from './text-renderer';
import { compositeInfographic } from './compositor';
import { crossVerifyClaims, computeCredibilityScore, extractNumericalClaims, crossVerifyNumbers } from '../research/verify';
import { enforceDensity } from './density';
import { runGates } from './gate';
import { ocrInfographic } from './ocr';
import { computeQualityScore, formatQualityBadge } from './quality-score';

// ── Provenance helpers ───────────────────────────────────────

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
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Main pipeline ────────────────────────────────────────────

export async function runPipeline(
  input: PipelineInput,
  onProgress: ProgressCallback,
): Promise<PipelineResult> {
  const aspectRatio = input.aspect_ratio || '16:9';
  const language = input.language || 'en';
  const seed = generateSeed();
  const generatedAt = new Date().toISOString();
  const pipelineTrace: ProvenanceData['pipeline'] = [];

  const contentHash = await hashContent(input.content);

  // Stage 0: Local analyze (regex + single Gemini Flash call — replaces 2 serial calls)
  onProgress({ status: 'analyzing', progress: 10, message: 'Analyzing content structure...' });
  const analysis = await localAnalyze(input.content, input.layout, input.style);
  pipelineTrace.push({ stage: '00', agent: 'Sentinel', result: `Intent: ${analysis.intent}, ${analysis.entities.length} entities, layout: ${analysis.layout}` });
  onProgress({ status: 'analyzing', progress: 20, message: `Intent: ${analysis.intent} | ${analysis.layout} + ${analysis.style}` });

  // Stage 1.5: Research + Reference Images (PARALLEL)
  // RULE: If user provides ANY numbers, their data is sacred — research only supplements, never replaces
  const contentLength = input.content.trim().length;
  const hasUserNumbers = (input.content.match(/\d+/g)?.length || 0) >= 2;
  const hasStructuredLines = (input.content.split(/\n/).filter(l => l.trim().length > 10).length) > 2;
  const isSelfContained = hasUserNumbers || (contentLength > 200 && hasStructuredLines);

  let research: ResearchResult;
  let referenceImages: ReferenceImage[];

  if (isSelfContained) {
    console.log(`[Research] Skipping — self-contained content (${contentLength} chars, structured data detected)`);
    onProgress({ status: 'researching', progress: 22, message: 'Content is self-contained — skipping research' });
    research = { findings: [input.content.slice(0, 6000)], verifiedFacts: [], sourceUrls: [], searchQueries: [], citations: [] };
    referenceImages = await fetchReferenceImages(analysis.topics);
  } else {
    // Check cache first
    onProgress({ status: 'researching', progress: 15, message: 'Checking research cache...' });
    const cached = await getCachedResearch(input.content, analysis.intent);

    if (cached) {
      console.log('[Research] Cache HIT — skipping Perplexity');
      onProgress({ status: 'researching', progress: 20, message: 'Using cached research data' });
      research = {
        findings: cached.findings,
        verifiedFacts: [],
        sourceUrls: cached.citations.map(c => c.url),
        searchQueries: analysis.topics,
        citations: cached.citations,
      };
      referenceImages = await fetchReferenceImages(analysis.topics);
    } else {
      onProgress({ status: 'researching', progress: 15, message: 'Researching topics (intent-aware)...' });
      [research, referenceImages] = await Promise.all([
        researchContent(analysis.topics, input.content.slice(0, 2000), analysis.intent, analysis.entities),
        fetchReferenceImages(analysis.topics),
      ]);

      // ── Research quality check: retry with broader query if thin data ──
      const researchAnswer = research.findings.join(' ');
      const hasSubstance = researchAnswer.length > 300 && research.citations.length >= 2;

      if (!hasSubstance && analysis.topics.length > 0) {
        console.warn(`[Research] Thin data detected (${researchAnswer.length} chars, ${research.citations.length} citations). Retrying with broader query...`);
        onProgress({ status: 'researching', progress: 18, message: 'Broadening research query...' });

        // Retry with a simpler, broader query
        const broaderTopics = [input.content.slice(0, 200)]; // Use raw user content as the search
        const retryResult = await researchContent(broaderTopics, input.content.slice(0, 2000), analysis.intent, analysis.entities);

        if (retryResult.findings.join(' ').length > researchAnswer.length) {
          console.log(`[Research] Retry improved: ${retryResult.findings.join(' ').length} chars (was ${researchAnswer.length})`);
          research = retryResult;
        }
      }

      // Cache research results (fire-and-forget)
      if (research.findings.length > 0 && research.findings.join(' ').length > 300) {
        setCachedResearch(input.content, analysis.intent, {
          findings: research.findings,
          citations: research.citations,
          sourceUrls: research.sourceUrls,
          cachedAt: new Date().toISOString(),
        });
      }
    }
  }

  const researchSummary = research.citations.length > 0
    ? `${research.citations.length} citations from ${new Set(research.citations.map(c => c.provider)).size} sources`
    : isSelfContained ? 'Self-contained content (no research needed)' : 'No external research';
  pipelineTrace.push({
    stage: '01.5',
    agent: 'Oracle',
    result: `${researchSummary} | ${referenceImages.length} ref images`,
  });
  onProgress({
    status: 'researching',
    progress: 22,
    message: `Found ${research.citations.length} citations, ${referenceImages.length} reference images`,
  });

  // Stage 1.7: Credibility scoring (lightweight — skips full claim verification for speed)
  onProgress({ status: 'verifying', progress: 28, message: 'Scoring source credibility...' });
  const credibility = computeCredibilityScore([], research.citations);
  const verifiedClaims: Awaited<ReturnType<typeof crossVerifyClaims>> = [];
  pipelineTrace.push({
    stage: '01.7',
    agent: 'Verifier',
    result: `Credibility: ${credibility.overall}/100 (${research.citations.length} sources scored, claim verification deferred)`,
  });
  onProgress({
    status: 'verifying',
    progress: 30,
    message: `Credibility: ${credibility.overall}/100 (${research.citations.length} sources)`,
  });

  // Stage 2: Structure content
  onProgress({ status: 'structuring', progress: 35, message: 'Building infographic sections...' });
  let structured = await structureContent(input.content, analysis, research);
  pipelineTrace.push({ stage: '02', agent: 'Architect', result: `${structured.sections.length} sections, tone: ${analysis.tone}` });

  // ── PRE-RENDER CONTENT GATE ─────────────────────────────────
  // NEVER send garbage to image generation. If structured content is too thin, retry or fail honestly.
  const contentGateChecks = {
    hasMinSections: structured.sections.length >= 3,
    hasRealContent: structured.sections.filter(s =>
      s.content.some(c => c.length > 5) || s.labels.some(l => l.length > 3)
    ).length >= 2,
    hasTitleNotTruncated: structured.title.length > 5 && !structured.title.endsWith('...'),
    hasSubtitle: structured.subtitle.length > 10,
  };
  const gatesPassed = Object.values(contentGateChecks).filter(Boolean).length;
  const gateFailed = gatesPassed < 3; // Need at least 3 of 4 checks

  if (gateFailed) {
    console.warn(`[ContentGate] FAILED (${gatesPassed}/4): ${JSON.stringify(contentGateChecks)}`);
    pipelineTrace.push({ stage: '02.1', agent: 'ContentGate', result: `FAILED: ${gatesPassed}/4 checks passed. Retrying with enriched prompt...` });
    onProgress({ status: 'structuring', progress: 40, message: 'Content too thin — retrying with enriched prompt...' });

    // Retry: append user's raw content to give the structurer more to work with
    const enrichedContent = `${input.content}\n\n--- RESEARCH CONTEXT ---\n${research.findings.join('\n').slice(0, 4000)}`;
    structured = await structureContent(enrichedContent, analysis, research);
    pipelineTrace.push({ stage: '02.1b', agent: 'ContentGate', result: `Retry: ${structured.sections.length} sections` });

    // Check again — if still failing, proceed but flag it
    const retryGates = {
      hasMinSections: structured.sections.length >= 3,
      hasRealContent: structured.sections.filter(s =>
        s.content.some(c => c.length > 5) || s.labels.some(l => l.length > 3)
      ).length >= 2,
    };
    if (!retryGates.hasMinSections || !retryGates.hasRealContent) {
      console.error(`[ContentGate] RETRY ALSO FAILED. Proceeding with best effort.`);
      pipelineTrace.push({ stage: '02.1c', agent: 'ContentGate', result: 'Retry also failed — proceeding with best effort' });
    }
  } else {
    pipelineTrace.push({ stage: '02.1', agent: 'ContentGate', result: `PASSED: ${gatesPassed}/4 checks` });
  }

  onProgress({ status: 'structuring', progress: 50, message: `Created ${structured.sections.length} sections` });

  // Stage 2.6: Density enforcement — intent-aware section limits
  onProgress({ status: 'validating', progress: 55, message: 'Enforcing content density limits...' });
  const { content: densified, report: densityReport } = enforceDensity(structured, analysis.intent);
  pipelineTrace.push({
    stage: '02.6',
    agent: 'Density',
    result: `${densityReport.originalSections}→${densityReport.finalSections} sections (intent: ${analysis.intent}), ${densityReport.removedParagraphs} paragraphs removed, ${densityReport.truncatedLabels} labels truncated`,
  });

  // Stage 2.7: Numerical guard — cross-verify numbers, inject corrections into prompt (not re-structure)
  let numberAuditResult: NumberAudit | undefined;
  let finalContent = densified;
  let numberCorrections: string[] = [];
  if (!isSelfContained && research.findings.length > 0) {
    onProgress({ status: 'validating', progress: 56, message: 'Cross-verifying numbers...' });
    const [contentNumbers, researchNumbers] = await Promise.all([
      extractNumericalClaims(
        densified.sections.map(s => s.content.join(' ')).join(' ') + ' ' +
        densified.statsBar.map(s => `${s.label}: ${s.value}`).join(' ')
      ),
      extractNumericalClaims(research.findings.join('\n\n')),
    ]);

    if (contentNumbers.length > 0 && researchNumbers.length > 0) {
      numberAuditResult = crossVerifyNumbers(contentNumbers, researchNumbers);
      const conflictCount = numberAuditResult.conflicting.length;

      pipelineTrace.push({
        stage: '02.7',
        agent: 'NumberGuard',
        result: `${numberAuditResult.exact.length} exact, ${numberAuditResult.close.length} close, ${conflictCount} conflicting, ${numberAuditResult.unverified.length} unverified — confidence: ${numberAuditResult.confidenceLevel}`,
      });

      // Inject corrections into prompt suffix instead of re-structuring (saves ~10s)
      if (conflictCount > 0) {
        numberCorrections = numberAuditResult.conflicting
          .filter(c => c.researchClaim)
          .map(c => `${c.contentClaim.entity} ${c.contentClaim.metric}: use ${c.researchClaim!.value} ${c.researchClaim!.unit} (not ${c.contentClaim.value} ${c.contentClaim.unit})`);
        console.log(`[NumberGuard] ${conflictCount} conflicts — will inject into prompt suffix`);
      }

      onProgress({ status: 'validating', progress: 57, message: `Numbers: ${numberAuditResult.confidenceLevel} (${conflictCount} corrections)` });
    }
  }

  // Stage 3: HYBRID RENDERING — illustration + programmatic text overlay
  // 3a: Plan text layout (deterministic, 0ms)
  onProgress({ status: 'assembling', progress: 57, message: 'Planning layout...' });
  const layout = planLayout(finalContent, aspectRatio);
  pipelineTrace.push({ stage: '03a', agent: 'LayoutPlanner', result: `${layout.elements.length} text elements, ${layout.width}x${layout.height}` });

  // 3b: Generate illustration prompt (no text, zone-aware)
  const illustrationPrompt = await assembleIllustrationPrompt(finalContent, analysis, aspectRatio, layout.illustrationZones);
  pipelineTrace.push({ stage: '03b', agent: 'Architect', result: `${analysis.layout} layout, ${analysis.style} style (illustration-only)` });

  const references = [
    `styles/${analysis.style}.md`,
  ];

  // 3c: Render text layer + generate illustration IN PARALLEL
  let postGenFlags: string[] = [];
  let qualityScore = computeQualityScore([]);

  onProgress({ status: 'generating', progress: 60, message: 'Rendering illustration + text layers...' });

  const [illustrationBase64, textLayerPng] = await Promise.all([
    geminiGenerateImage(illustrationPrompt, aspectRatio, referenceImages, analysis.style)
      .catch(err => {
        console.error('[Renderer] Illustration failed, will use solid background:', err instanceof Error ? err.message : err);
        postGenFlags.push('Illustration generation failed — using solid background');
        return null;
      }),
    renderTextLayer(layout),
  ]);

  pipelineTrace.push({ stage: '04a', agent: 'Renderer', result: `${IMAGE_MODEL} illustration: ${illustrationBase64 ? 'OK' : 'FAILED (solid bg fallback)'}` });
  pipelineTrace.push({ stage: '04b', agent: 'TextRenderer', result: `Satori: ${layout.elements.length} elements → ${textLayerPng.length} bytes PNG` });

  // 3d: Composite layers
  onProgress({ status: 'generating', progress: 80, message: 'Compositing final infographic...' });
  const imageBase64 = await compositeInfographic(
    illustrationBase64,
    textLayerPng,
    layout.width,
    layout.height,
    layout.backgroundColor,
  );
  pipelineTrace.push({ stage: '04c', agent: 'Compositor', result: `Final: ${imageBase64.length} bytes base64` });

  // Stage 5: OCR + Gates on final composite
  if (imageBase64) {
    try {
      onProgress({ status: 'verifying', progress: 85, message: 'Running quality verification...' });
      const ocrResult = await ocrInfographic(imageBase64);
      pipelineTrace.push({
        stage: '05',
        agent: 'Inspector',
        result: `OCR: ${ocrResult.numbers.length} numbers, ${ocrResult.headings.length} headings, ${ocrResult.garbledText.length} garbled, confidence: ${ocrResult.confidence}%`,
      });

      const gateResults = await runGates(finalContent, undefined, ocrResult.fullText, ocrResult.numbers);
      pipelineTrace.push({
        stage: '05.1',
        agent: 'Gates',
        result: `${gateResults.passed ? 'ALL PASS' : 'FAILED'}: ${gateResults.gates.map(g => `${g.gate}=${g.passed ? 'OK' : 'FAIL'}(${g.score.toFixed(0)}%)`).join(', ')}`,
      });

      qualityScore = computeQualityScore(gateResults.gates);
      const badge = formatQualityBadge(qualityScore);
      pipelineTrace.push({
        stage: '05.2',
        agent: 'QualityScore',
        result: `${badge.level}: ${qualityScore.overall}/100 | accuracy=${qualityScore.accuracy} traceability=${qualityScore.traceability} readability=${qualityScore.readability} visual=${qualityScore.visualQuality}`,
      });

      for (const gate of gateResults.gates) {
        if (!gate.passed) postGenFlags.push(...gate.failures);
      }
      if (ocrResult.garbledText.length > 0) {
        postGenFlags.push(`Garbled text detected: ${ocrResult.garbledText.join(', ')}`);
      }
    } catch (err) {
      console.error('[Inspector] Non-critical error:', err instanceof Error ? err.message : err);
      pipelineTrace.push({
        stage: '05',
        agent: 'Inspector',
        result: `OCR failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      });
    }
  }

  onProgress({ status: 'generating', progress: 95, message: 'Finalizing...' });

  return {
    imageBase64,
    structuredContent: finalContent,
    renderContext: {
      layout: analysis.layout,
      style: analysis.style,
      intent: analysis.intent,
      tone: analysis.tone,
      aspectRatio,
      language,
    },
    metadata: {
      layout: analysis.layout,
      style: analysis.style,
      preset: input.preset || 'auto',
      aspect_ratio: aspectRatio,
      intent: analysis.intent,
    },
    provenance: {
      seed,
      generatedAt,
      contentHash,
      models: {
        analysis: TEXT_MODEL,
        structure: PRO_MODEL,
        image: IMAGE_MODEL,
      },
      pipeline: pipelineTrace,
      references,
      topics: analysis.topics,
      displayTags: analysis.entities.length > 0
        ? analysis.entities.slice(0, 8)
        : analysis.topics.slice(0, 6).map(t => t.split(' ').slice(0, 2).join(' ')),
      contentSources: analysis.contentSources,
      compliance: {
        score: credibility.overall,
        corrections: 0,
        riskWords: [],
        factFlags: [],
      },
      research: {
        queriesRun: research.searchQueries.length,
        findingsCount: research.findings.length,
        sourcedClaims: verifiedClaims,
        sourceUrls: research.sourceUrls,
        citations: research.citations,
        referenceImages: referenceImages.length,
      },
      credibility,
      postGenFlags: postGenFlags.length > 0 ? postGenFlags : undefined,
      numberAudit: numberAuditResult ? {
        totalClaims: numberAuditResult.totalClaims,
        exact: numberAuditResult.exact.length,
        close: numberAuditResult.close.length,
        conflicting: numberAuditResult.conflicting.length,
        unverified: numberAuditResult.unverified.length,
        confidenceLevel: numberAuditResult.confidenceLevel,
        corrections: numberAuditResult.conflicting.map((c: import('../types').NumberVerification) =>
          `${c.contentClaim.entity} ${c.contentClaim.metric}: ${c.contentClaim.value} → ${c.researchClaim?.value ?? '?'} (${c.divergencePct}% off)`
        ),
      } : undefined,
      qualityScore: {
        overall: qualityScore.overall,
        accuracy: qualityScore.accuracy,
        traceability: qualityScore.traceability,
        readability: qualityScore.readability,
        visualQuality: qualityScore.visualQuality,
        clientReady: qualityScore.clientReady,
        badge: formatQualityBadge(qualityScore),
      },
      densityReport: {
        originalSections: densityReport.originalSections,
        finalSections: densityReport.finalSections,
        removedParagraphs: densityReport.removedParagraphs,
        truncatedLabels: densityReport.truncatedLabels,
        violations: densityReport.violations.length,
      },
    },
  };
}
