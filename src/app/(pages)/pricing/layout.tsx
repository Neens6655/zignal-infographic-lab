import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — ZGNAL.AI",
  description:
    "Start generating consulting-grade infographics for free. Full pipeline access during public preview.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
