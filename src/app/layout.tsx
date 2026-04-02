import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

const BASE_URL = "https://zgnal.ai";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ZGNAL Infographic Lab — The AI Infographic Engine",
    template: "%s | ZGNAL",
  },
  description:
    "Turn complexity into clarity. Research-backed, consulting-grade infographics in 60 seconds. 20 layouts, 20 styles, 22 trusted sources. Powered by a seven-stage AI pipeline.",
  keywords: [
    "infographic generator",
    "AI infographic engine",
    "consulting infographic",
    "executive summary",
    "visual communication",
    "ZGNAL",
    "research-backed visuals",
    "AI visualization",
    "data visualization",
  ],
  authors: [{ name: "ZGNAL" }],
  creator: "ZGNAL",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "ZGNAL Infographic Lab",
    title: "ZGNAL Infographic Lab — The AI Infographic Engine",
    description:
      "Turn complexity into clarity. Research-backed, consulting-grade infographics in 60 seconds.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZGNAL Infographic Lab — AI-generated consulting-grade infographic",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZGNAL Infographic Lab — The AI Infographic Engine",
    description:
      "Research-backed, consulting-grade infographics in 60 seconds. 20 layouts, 20 styles, 22 sources.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ZGNAL Infographic Lab",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    url: BASE_URL,
    description:
      "AI-powered infographic engine that generates research-backed, consulting-grade infographics in 60 seconds.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "20 professional layouts",
      "20 visual styles",
      "22 trusted research sources",
      "Seven-stage AI pipeline",
      "Compliance and fact-checking",
      "Provenance tracking",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ZGNAL",
    url: BASE_URL,
    logo: `${BASE_URL}/og-image.png`,
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@zgnal.ai",
      contactType: "customer service",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ZGNAL Infographic Lab",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/chat?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
