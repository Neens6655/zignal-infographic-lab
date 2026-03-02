import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ZIGNAL Infographic Lab — The AI Infographic Engine",
  description:
    "Turn complexity into clarity. Research-backed, consulting-grade infographics in 60 seconds. 20 layouts, 20 styles, 22 trusted sources. Powered by a seven-stage AI pipeline.",
  keywords: [
    "infographic generator",
    "AI infographic engine",
    "consulting infographic",
    "executive summary",
    "visual communication",
    "ZIGNAL",
    "research-backed visuals",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-(--z-gold) focus:text-(--z-bg) focus:font-mono focus:text-sm focus:font-bold"
        >
          Skip to main content
        </a>
        <div className="noise" />
        {children}
      </body>
    </html>
  );
}
