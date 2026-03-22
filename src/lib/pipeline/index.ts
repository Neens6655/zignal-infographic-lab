/**
 * Pipeline module — re-exports for backward compatibility.
 * Import from '@/lib/pipeline' continues to work.
 */
export type {
  ContentAnalysis,
  StructuredContent,
  RenderContext,
  PipelineInput,
  PipelineResult,
  ProgressCallback,
  ComplianceReport,
  ResearchResult,
  ReferenceImage,
} from './types';

export { analyzeContent } from './analyze';
export { geminiGenerate, geminiGenerateImage, TEXT_MODEL, IMAGE_MODEL } from './gemini';
export { researchContent, fetchReferenceImages, classifySourceTier } from './research';
export { structureContent, validateContent } from './structure';
export { assemblePrompt, applyStructureEdit } from './prompt';
export { runPipeline } from './run';
