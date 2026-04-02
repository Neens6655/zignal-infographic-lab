/**
 * Main pipeline orchestrator — coordinates all stages.
 * v2: 8-agent architecture with density enforcement, quality gates, OCR verification.
 */
import type { PipelineInput, PipelineResult, ProgressCallback, ProvenanceData, ResearchResult, ReferenceImage } from './types';
import type { NumberAudit } from '../types';
import { IMAGE_MODEL, TEXT_MODEL } from './gemini';
import { geminiGenerateImage } from './gemini';
import { analyzeContent } from './analyze';
import { researchContent, fetchReferenceImages } from './research';
import { structureContent, validateContent } from './structure';
import { assemblePrompt } from './prompt';
import { extractClaims, crossVerifyClaims, computeCredibilityScore, extractNumericalClaims, crossVerifyNumbers } from '../research/verify';
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

  // Stage 1: Analyze content
  onProgress({ status: 'analyzing', progress: 10, message: 'Analyzing content structure...' });
  const analysis = await analyzeContent(input.content, input.preset, input.layout, input.style);
  pipelineTrace.push({ stage: '01', agent: 'Sentinel', result: `Intent: ${analysis.intent}, ${analysis.entities.length} entities, layout: ${analysis.layout}` });
  onProgress({ status: 'analyzing', progress: 25, message: `Intent: ${analysis.intent} | ${analysis.layout} + ${analysis.style}` });

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
    onProgress({ status: 'researching', progress: 15, message: 'Researching topics and finding references...' });
    [research, referenceImages] = await Promise.all([
      researchContent(analysis.topics, input.content.slice(0, 2000)),
      fetchReferenceImages(analysis.topics),
    ]);
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

  // Stage 1.7: Cross-verify claims
  onProgress({ status: 'verifying', progress: 25, message: 'Verifying claims against sources...' });
  const verifiableContent = research.findings.join('\n\n') || research.citations.map(c => c.snippet).filter(Boolean).join('\n');
  const claims = await extractClaims(verifiableContent);
  const verifiedClaims = await crossVerifyClaims(claims, research.citations);
  const credibility = computeCredibilityScore(verifiedClaims, research.citations);
  pipelineTrace.push({
    stage: '01.7',
    agent: 'Verifier',
    result: `${credibility.claimsCrossVerified}/${credibility.claimsTotal} claims verified, score: ${credibility.overall}/100`,
  });
  onProgress({
    status: 'verifying',
    progress: 32,
    message: `Credibility: ${credibility.overall}/100 (${credibility.claimsCrossVerified}/${credibility.claimsTotal} claims verified)`,
  });

  // Stage 2: Structure content
  onProgress({ status: 'structuring', progress: 35, message: 'Building infographic sections...' });
  const structured = await structureContent(input.content, analysis, research);
  pipelineTrace.push({ stage: '02', agent: 'Architect', result: `${structured.sections.length} sections, tone: ${analysis.tone}` });
  onProgress({ status: 'structuring', progress: 50, message: `Created ${structured.sections.length} sections` });

  // Stage 2.5: Compliance validation
  onProgress({ status: 'validating', progress: 52, message: 'Running compliance checks...' });
  const { cleaned, report } = await validateContent(structured);
  pipelineTrace.push({ stage: '02.5', agent: 'Compliance', result: `${report.corrections.length} text fixes, credibility: ${credibility.overall}/100` });
  onProgress({ status: 'validating', progress: 55, message: `Compliance: ${report.corrections.length} corrections applied` });

  // Stage 2.6: Density enforcement — reduce text for better rendering
  onProgress({ status: 'validating', progress: 55, message: 'Enforcing content density limits...' });
  const { content: densified, report: densityReport } = enforceDensity(cleaned);
  pipelineTrace.push({
    stage: '02.6',
    agent: 'Density',
    result: `${densityReport.originalSections}→${densityReport.finalSections} sections, ${densityReport.removedParagraphs} paragraphs removed, ${densityReport.truncatedLabels} labels truncated`,
  });

  // Stage 2.7: Numerical guard — cross-verify numbers between content and research
  let numberAuditResult: NumberAudit | undefined;
  let finalContent = densified;
  if (!isSelfContained && research.findings.length > 0) {
    onProgress({ status: 'validating', progress: 56, message: 'Cross-verifying numbers...' });
    const [contentNumbers, researchNumbers] = await Promise.all([
      extractNumericalClaims(
        cleaned.sections.map(s => s.content.join(' ')).join(' ') + ' ' +
        cleaned.statsBar.map(s => `${s.label}: ${s.value}`).join(' ')
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

      if (conflictCount > 0) {
        const corrections = numberAuditResult.conflicting
          .filter(c => c.researchClaim)
          .map(c => `CORRECT: ${c.contentClaim.entity} ${c.contentClaim.metric} should be ${c.researchClaim!.value} ${c.researchClaim!.unit}, not ${c.contentClaim.value} ${c.contentClaim.unit} (${c.divergencePct}% divergence)`);

        console.log(`[NumberGuard] ${conflictCount} conflicting numbers detected, re-structuring with corrections:`, corrections);

        // Re-run structuring with correction instructions appended to content
        const correctionBlock = '\n\n--- NUMBER CORRECTIONS (MANDATORY) ---\n' + corrections.join('\n');
        finalContent = await structureContent(input.content + correctionBlock, analysis, research);

        pipelineTrace.push({
          stage: '02.7b',
          agent: 'NumberGuard',
          result: `Re-structured with ${corrections.length} number corrections`,
        });
      }

      onProgress({ status: 'validating', progress: 57, message: `Numbers: ${numberAuditResult.confidenceLevel} (${conflictCount} corrections)` });
    }
  }

  // Stage 3: Assemble prompt
  onProgress({ status: 'assembling', progress: 57, message: 'Assembling generation prompt...' });
  const prompt = await assemblePrompt(finalContent, analysis, aspectRatio, language, research, numberAuditResult);
  pipelineTrace.push({ stage: '03', agent: 'Architect', result: `${analysis.layout} layout, ${analysis.style} style` });

  const references = [
    'base-prompt.md',
    `layouts/${analysis.layout}.md`,
    `styles/${analysis.style}.md`,
  ];

  // Stage 4: Generate + Verify + Retry Loop (max 2 retries)
  const MAX_RETRIES = 2;
  let bestImage = '';
  let postGenFlags: string[] = [];
  let qualityScore = computeQualityScore([]);
  let currentContent = finalContent;
  let currentPrompt = prompt;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const isRetry = attempt > 0;
    const progressBase = isRetry ? 70 + attempt * 8 : 60;

    onProgress({
      status: 'generating',
      progress: progressBase,
      message: isRetry
        ? `Retry ${attempt}/${MAX_RETRIES} — regenerating with reduced density...`
        : 'Rendering your infographic...',
    });

    const imageBase64 = await geminiGenerateImage(currentPrompt, aspectRatio, referenceImages, analysis.style);
    pipelineTrace.push({
      stage: isRetry ? `04.R${attempt}` : '04',
      agent: 'Renderer',
      result: `${IMAGE_MODEL}, aspect: ${aspectRatio}${isRetry ? ` (retry ${attempt})` : ''}`,
    });

    if (!imageBase64) break;
    bestImage = imageBase64;

    // OCR + Gates
    try {
      onProgress({ status: 'verifying', progress: progressBase + 20, message: 'Running OCR verification...' });
      const ocrResult = await ocrInfographic(imageBase64);
      pipelineTrace.push({
        stage: isRetry ? `04.5.R${attempt}` : '04.5',
        agent: 'Inspector',
        result: `OCR: ${ocrResult.numbers.length} numbers, ${ocrResult.headings.length} headings, ${ocrResult.garbledText.length} garbled, confidence: ${ocrResult.confidence}%`,
      });

      onProgress({ status: 'verifying', progress: progressBase + 25, message: 'Running quality gates...' });
      const gateResults = await runGates(currentContent, undefined, ocrResult.fullText, ocrResult.numbers);
      pipelineTrace.push({
        stage: isRetry ? `04.6.R${attempt}` : '04.6',
        agent: 'Gates',
        result: `${gateResults.passed ? 'ALL PASS' : 'FAILED'}: ${gateResults.gates.map(g => `${g.gate}=${g.passed ? 'OK' : 'FAIL'}(${g.score.toFixed(0)}%)`).join(', ')}`,
      });

      qualityScore = computeQualityScore(gateResults.gates);
      const badge = formatQualityBadge(qualityScore);
      pipelineTrace.push({
        stage: isRetry ? `04.7.R${attempt}` : '04.7',
        agent: 'QualityScore',
        result: `${badge.level}: ${qualityScore.overall}/100 | accuracy=${qualityScore.accuracy} traceability=${qualityScore.traceability} readability=${qualityScore.readability} visual=${qualityScore.visualQuality}`,
      });

      postGenFlags = [];
      for (const gate of gateResults.gates) {
        if (!gate.passed) postGenFlags.push(...gate.failures);
      }
      if (ocrResult.garbledText.length > 0) {
        postGenFlags.push(`Garbled text detected: ${ocrResult.garbledText.join(', ')}`);
      }

      // If all gates pass, we're done
      if (gateResults.passed) {
        console.log(`[Pipeline] All gates passed on attempt ${attempt + 1}`);
        break;
      }

      // If this was the last retry, keep best attempt
      if (attempt >= MAX_RETRIES) {
        console.log(`[Pipeline] Max retries reached. Returning best attempt (score: ${qualityScore.overall})`);
        postGenFlags.push(`Quality warning: returned after ${MAX_RETRIES} retries`);
        break;
      }

      // Diagnostic retry: fix the SPECIFIC failure
      const failedGates = gateResults.gates.filter(g => !g.passed);
      const failReasons = failedGates.map(g => g.gate);
      console.log(`[Pipeline] Failed gates: ${failReasons.join(', ')} — applying targeted fix for retry ${attempt + 1}...`);

      // Strategy per failure type
      if (failReasons.includes('readability') || ocrResult.garbledText.length > 0) {
        // Text too dense → remove 1 section + shorten remaining labels
        if (currentContent.sections.length > 3) {
          currentContent = {
            ...currentContent,
            sections: currentContent.sections.slice(0, currentContent.sections.length - 1),
          };
        }
        // Truncate remaining labels more aggressively
        currentContent.sections = currentContent.sections.map(s => ({
          ...s,
          labels: s.labels.slice(0, 3).map(l => l.length > 20 ? l.slice(0, 17) + '...' : l),
          content: s.content.slice(0, 1).map(c => c.length > 30 ? c.slice(0, 27) + '...' : c),
        }));
      }

      if (failReasons.includes('data-integrity')) {
        // Hallucinated numbers → add explicit "ONLY these numbers" to prompt suffix
        const knownNumbers = [
          ...currentContent.statsBar.map(s => s.value),
          ...currentContent.sections.flatMap(s => s.labels),
        ].filter(Boolean);
        const numberConstraint = `\n\nCRITICAL — ONLY render these exact numbers and labels. Do NOT invent, estimate, or add any number not listed here:\n${knownNumbers.join('\n')}`;
        currentPrompt = await assemblePrompt(currentContent, analysis, aspectRatio, language, research, numberAuditResult);
        currentPrompt += numberConstraint;
        continue; // skip the re-assemble below
      }

      // Re-assemble prompt with reduced content
      currentPrompt = await assemblePrompt(currentContent, analysis, aspectRatio, language, research, numberAuditResult);

    } catch (err) {
      console.error('[Inspector] Non-critical error:', err instanceof Error ? err.message : err);
      pipelineTrace.push({
        stage: isRetry ? `04.5.R${attempt}` : '04.5',
        agent: 'Inspector',
        result: `OCR failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      });
      break; // Don't retry on OCR infrastructure failure
    }
  }

  const imageBase64 = bestImage;

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
        corrections: report.corrections.length,
        riskWords: report.riskWords,
        factFlags: report.factFlags,
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
