import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — ZGNAL.AI',
  description:
    'We transform complex information into publication-ready visual intelligence. One studio. Seven stages. Consulting-grade output.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
