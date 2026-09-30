import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' https://va.vercel-scripts.com 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.exa.ai https://api.apify.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // `ignoreBuildErrors: true` was removed 2026-09-30. It is why a broken test suite
  // (vitest uninstalled, 4 unresolved imports) never surfaced in a build.
  outputFileTracingIncludes: {
    // Satori fonts + resvg WASM must be traced into every function that typesets text.
    // `/api/jobs/**` used to be listed here and was a dead stub; `/api/studio/**` runs
    // the real renderer and was missing.
    "/api/generate": [
      "./src/lib/fonts/**/*",
      "./node_modules/@resvg/resvg-wasm/index_bg.wasm",
    ],
    "/api/studio/**": [
      "./src/lib/fonts/**/*",
      "./node_modules/@resvg/resvg-wasm/index_bg.wasm",
    ],
    "/api/regenerate": [
      "./src/lib/fonts/**/*",
      "./node_modules/@resvg/resvg-wasm/index_bg.wasm",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
