import type { Metadata } from 'next';
import DocsClient from './DocsClient';

export const metadata: Metadata = {
  title: 'Documentation — ZGNAL.AI',
  description:
    'Getting started with the ZGNAL.AI Infographic Lab — pipeline architecture, input formats, and API reference.',
};

export default function DocsPage() {
  return <DocsClient />;
}
