import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — ZGNAL.AI',
  description: 'Terms and conditions for using ZGNAL.AI.',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
