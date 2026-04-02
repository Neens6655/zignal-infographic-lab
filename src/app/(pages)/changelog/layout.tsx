import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog — ZGNAL.AI",
  description:
    "Version history and updates for ZGNAL.AI Infographic Lab.",
};

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
