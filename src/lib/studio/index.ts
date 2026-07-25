/**
 * ZGNAL Studio v3 — engine barrel.
 * The 4-up, quality-gated, self-correcting infographic engine.
 */
export * from "./types";
export { STUDIO_STYLES, STUDIO_STYLE_LIST, getStudioStyle } from "./styles";
export { prepBrief } from "./prep";
export type { PrepOptions } from "./prep";
export { scoreRender } from "./judge";
export { renderStyleGated, editVariantImage } from "./render";
export type { RenderStyleOptions } from "./render";
export { runStudio } from "./generate";
export type { StudioRunOptions, StudioRunResult } from "./generate";
