/**
 * Template router — selects the right template based on intent.
 */
import type { TemplateData } from './types';
import { rankingTemplate } from './ranking';
import { processTemplate } from './process';
import { comparisonTemplate } from './comparison';
import { overviewTemplate } from './overview';
import { metricsTemplate } from './metrics';

export type { TemplateData } from './types';
export { EXECUTIVE_DARK, TYPE, LAYOUT } from './types';

export function selectTemplate(intent: string, data: TemplateData): any {
  switch (intent) {
    case 'ranking':    return rankingTemplate(data);
    case 'process':    return processTemplate(data);
    case 'comparison': return comparisonTemplate(data);
    case 'metrics':    return metricsTemplate(data);
    case 'overview':
    default:           return overviewTemplate(data);
  }
}
