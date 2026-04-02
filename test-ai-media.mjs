/**
 * AI Disruption of Media Industry — scene-based prompt, Pro model
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

const PROMPT = `Create a breathtaking, cinematic infographic showing how AI is disrupting the media industry and how we can reinvent it. This should feel like a flagship visual from a Deloitte or WEF future-of-media report.

COMPOSITION: A dramatic split-screen panorama (16:9). The LEFT half shows the old media world CRUMBLING. The RIGHT half shows the reinvented future RISING. A bold vertical dividing line in the center — a lightning bolt or fracture line — separates destruction from creation. The eye travels from chaos to opportunity.

THE VISUAL SCENE:

LEFT HALF — "THE DISRUPTION" (dark, dramatic, things falling apart):

A crumbling traditional media empire. Newspaper printing presses grinding to a halt, their gears rusting. TV broadcast towers tilting. Film reels unspooling. Radio antennas going dark. The atmosphere is smoky, industrial-age decay.

Embedded in this landscape, bold data callouts:
• "73% of newsrooms have cut staff since 2020" — shown on a cracked screen
• "$40B+ in ad revenue shifted from traditional to digital" — money symbols flowing away
• "AI generates 30% of online content by 2026" — robotic arms typing on keyboards
• "Deepfakes grew 900% in 3 years" — distorted faces on screens

The mood: sepia-toned, shadows, urgency. This world is ending whether we like it or not.

CENTER DIVIDING LINE — THE TRANSFORMATION:
A dramatic vertical fracture or lightning bolt splitting the image. At its core, a glowing AI neural network symbol — the catalyst of change. Text along the fracture: "THE INFLECTION POINT"

RIGHT HALF — "THE REINVENTION" (bright, ambitious, things being built):

A luminous new media landscape emerging from the fracture. Everything is brighter, more colorful, forward-looking.

Visual zones within the right half:
• HYPER-PERSONALIZED CONTENT — A viewer surrounded by holographic content streams tailored to them. Label: "AI curates, humans create"
• AI-AUGMENTED JOURNALISM — A journalist working alongside an AI copilot, fact-checking in real time. Screens showing verified sources. Label: "Accuracy at machine speed"
• IMMERSIVE STORYTELLING — VR/AR environments, volumetric video, spatial computing. People stepping INTO stories. Label: "From watching to experiencing"
• CREATOR ECONOMY 2.0 — Individual creators with AI production tools rivaling studio quality. One person, entire production pipeline. Label: "Every creator becomes a studio"
• TRUST & PROVENANCE — Blockchain verification stamps, content authenticity badges, AI-detection watermarks. Label: "Verified truth in an AI world"

Data callouts on the right:
• "$120B creator economy by 2028"
• "AI tools cut production costs 60%"
• "Personalized content increases engagement 3x"

BOTTOM STATS BAR (gradient from dark charcoal left to electric blue right):
Newsroom Jobs Lost: 30%+ | Ad Revenue Shift: $40B+ | AI Content: 30% by 2026 | Creator Economy: $120B by 2028 | Production Cost Cut: 60% | Engagement Lift: 3x

TITLE (top, massive, spanning full width): "AI & MEDIA: DESTRUCTION MEETS REINVENTION"
SUBTITLE: "How artificial intelligence is dismantling the old media order — and the blueprint for what comes next"

STYLE: Cinematic, high-contrast. Left side uses warm decay colors (amber, rust, smoke gray). Right side uses cool future colors (electric blue, white, cyan, gold accents). The transition across the center should feel like stepping from an old photograph into a hologram. Professional editorial illustration quality — every element specific and meaningful, zero generic clip art. Think: Wired magazine cover meets McKinsey Quarterly visualization.

Do NOT render any structural labels, composition directions, column markers, or prompt instructions as visible text. Only render the actual content: title, subtitle, data callouts, zone labels, and stats bar.`;

async function generate() {
  console.log('Generating: AI Media Disruption (Pro model)...');
  const start = Date.now();

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: PROMPT }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'], temperature: 1.0 },
    }),
  });

  if (!res.ok) { console.error(`HTTP ${res.status}: ${await res.text()}`); return; }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      const buf = Buffer.from(part.inlineData.data, 'base64');
      const outPath = path.join(OUTPUT_DIR, 'pro-ai-media-disruption.png');
      fs.writeFileSync(outPath, buf);
      const elapsed = ((Date.now() - start) / 1000).toFixed(0);
      console.log(`Saved: pro-ai-media-disruption.png (${(buf.length/1024).toFixed(0)}KB, ${elapsed}s)`);
      exec(`start "" "${outPath}"`);
      return;
    }
  }
  console.error('No image in response');
}

generate().catch(console.error);
