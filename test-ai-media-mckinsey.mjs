/**
 * AI Media Disruption — McKinsey style
 */
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const OUTPUT_DIR = 'C:/Users/ziadm/OneDrive/Desktop/infographic-test-outputs';
const MODEL = 'gemini-3-pro-image-preview';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const envFile = fs.readFileSync('.env.local', 'utf-8');
for (const line of envFile.split('\n')) {
  const [key, ...val] = line.split('=');
  if (key?.trim() === 'GOOGLE_API_KEY') {
    process.env.GOOGLE_API_KEY = val.join('=').trim().replace(/^["']|["']$/g, '');
  }
}

const PROMPT = `Create a McKinsey Global Institute strategy slide (16:9 landscape) analyzing how AI will disrupt the media industry and the strategic playbook for reinvention.

This should look EXACTLY like a slide from a McKinsey partner presentation to a media CEO. White background. Navy header. Helvetica typography. Clinical precision. Data-driven. Zero decoration.

HEADER BAR (navy #0F172A, full width):
Title in white bold: "AI DISRUPTION IN MEDIA: THREAT LANDSCAPE & REINVENTION PLAYBOOK"
Subtitle in light gray: "Strategic analysis of value destruction, emerging models, and the path to AI-native media"
Right-aligned: "March 2026 | Confidential"

MAIN BODY — flows left to right as a strategic narrative across 3 zones:

ZONE 1 — "VALUE AT RISK" (left third)
A clean waterfall chart showing cumulative value destruction:
Starting bar: "Traditional Media Revenue $500B"
Drop 1: "Print decline -$85B" (red)
Drop 2: "Ad migration -$40B" (red)
Drop 3: "AI content substitution -$35B" (red)
Drop 4: "Audience fragmentation -$25B" (red)
End bar: "Remaining $315B" (navy, shorter)
Below the chart: a single bold callout: "37% of traditional media value at risk by 2028"

ZONE 2 — "REINVENTION VECTORS" (center third)
A 2x2 strategic matrix with clean thin borders:
Y-axis: "AI Integration Depth" (Low → High)
X-axis: "Revenue Model Innovation" (Low → High)

Quadrant bottom-left: "DECLINE — Legacy publishers. Print-first, ad-dependent. Shrinking audience."
Quadrant bottom-right: "PIVOT — New revenue models but manual operations. Subscriptions, events."
Quadrant top-left: "AUTOMATE — AI-powered but same business model. Cost cutting, not reinvention."
Quadrant top-right (highlighted in blue): "REINVENT — AI-native media. Hyper-personalization, creator platforms, immersive formats."

A bold arrow points to the top-right quadrant: "Target state"

ZONE 3 — "THE PLAYBOOK" (right third)
Five numbered strategic moves, each as a clean card with a thin blue left border:

1. "Deploy AI copilots in newsrooms" — Cut production costs 60%, maintain editorial quality
2. "Build personalization engines" — 3x engagement lift from algorithmic content curation
3. "Launch creator infrastructure" — $120B creator economy by 2028, capture platform fees
4. "Invest in trust & provenance" — Content authentication as competitive moat
5. "Shift from ads to outcomes" — Performance-based revenue replaces impression-based

Each card: bold title line, one-line explanation in gray beneath.

BOTTOM STATS BAR (thin navy strip, white text):
Value at Risk: $185B (37%) | Production Cost Reduction: 60% | Engagement Uplift: 3x | Creator Economy: $120B by 2028 | Deepfake Growth: 900% in 3 years | AI Content Share: 30% by 2026

TYPOGRAPHY: Helvetica or Inter. Title 24pt white on navy. Chart labels 11pt. Matrix text 10pt. Insight cards: title 12pt bold, body 10pt gray. Numbers always bold navy or bold blue (#2563EB). Zero ornament, zero illustrations, zero icons. Only data, charts, matrices, and text. This is a board-level strategy document.

Do NOT render any zone labels, structural markers, axis instruction text, or composition directions as visible text. Render only the actual content that would appear in a real McKinsey slide.`;

async function generate() {
  console.log('Generating: AI Media — McKinsey Style (Pro)...');
  const start = Date.now();

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: PROMPT }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'], temperature: 0.7 },
    }),
  });

  if (!res.ok) { console.error(`HTTP ${res.status}: ${await res.text()}`); return; }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      const buf = Buffer.from(part.inlineData.data, 'base64');
      const outPath = path.join(OUTPUT_DIR, 'pro-ai-media-mckinsey.png');
      fs.writeFileSync(outPath, buf);
      const elapsed = ((Date.now() - start) / 1000).toFixed(0);
      console.log(`Saved: pro-ai-media-mckinsey.png (${(buf.length/1024).toFixed(0)}KB, ${elapsed}s)`);
      exec(`start "" "${outPath}"`);
      return;
    }
  }
  console.error('No image in response');
}

generate().catch(console.error);
