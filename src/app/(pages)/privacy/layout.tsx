import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — ZGNAL.AI',
  description: 'How ZGNAL.AI handles your data.',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
