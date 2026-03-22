/**
 * Post-Generation OCR via Gemini Vision — ZGNAL Infographic Lab v2
 *
 * Sends generated infographic image to Gemini for text extraction,
 * enabling post-gen quality gates (readability + data integrity).
 */

export type OcrResult = {
  fullText: string;
  numbers: string[];
  headings: string[];
  statsFound: string[];
  garbledText: string[];
  confidence: number;
};

const GEMINI_OCR_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const OCR_PROMPT = `You are an OCR system analyzing an infographic image. Extract ALL visible text from this image.

Return a JSON object with exactly these fields:
{
  "fullText": "all visible text concatenated with newlines between sections",
  "headings": ["each heading or title text found"],
  "stats": ["each statistic or number+label pair found, e.g. '45% Growth Rate'"],
  "garbledText": ["any text that appears illegible, overlapping, cut off, or corrupted"],
  "textClarity": number between 0-100 indicating overall text readability quality
}

Rules:
- Include EVERY piece of text visible in the image
- For stats, preserve the exact number and its associated label
- Flag as garbled: overlapping text, partially rendered characters, text extending beyond boundaries
- Flag as garbled: any sequence that looks like random characters or encoding artifacts
- textClarity 90-100 = all text crisp and readable, 70-89 = mostly readable with minor issues, below 70 = significant readability problems

Return ONLY valid JSON, no markdown fences.`;

function extractNumbers(text: string): string[] {
  const matches = text.match(/[\d,]+\.?\d*%?/g) || [];
  // Deduplicate and filter trivial matches
  const seen = new Set<string>();
  return matches.filter((m) => {
    const cleaned = m.replace(/,/g, '');
    if (cleaned.length < 1) return false;
    if (seen.has(cleaned)) return false;
    seen.add(cleaned);
    return true;
  });
}

function detectGarbled(text: string): string[] {
  const garbled: string[] = [];
  // Split into words and check for consonant-heavy sequences
  const words = text.split(/\s+/);
  for (const word of words) {
    if (word.length < 3) continue;
    const lower = word.toLowerCase().replace(/[^a-z]/g, '');
    if (lower.length < 3) continue;
    // 3+ consecutive consonants with no vowels in the whole word
    const vowelCount = (lower.match(/[aeiou]/g) || []).length;
    const consonantRuns = lower.match(/[bcdfghjklmnpqrstvwxyz]{3,}/g) || [];
    if (vowelCount === 0 && lower.length >= 3) {
      garbled.push(word);
    } else if (consonantRuns.some((r) => r.length >= 5)) {
      garbled.push(word);
    }
  }
  return garbled;
}

export async function ocrInfographic(imageBase64: string): Promise<OcrResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('[ocr] GOOGLE_API_KEY not set');
  }

  console.log('[ocr] Sending image to Gemini Vision for text extraction...');

  // Strip data URI prefix if present
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  const requestBody = {
    contents: [
      {
        parts: [
          { text: OCR_PROMPT },
          {
            inline_data: {
              mime_type: 'image/png',
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
    },
  };

  const response = await fetch(`${GEMINI_OCR_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[ocr] Gemini API error: ${response.status} — ${errorText}`);
    throw new Error(`Gemini OCR failed: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  console.log('[ocr] Received Gemini response, parsing...');

  // Parse JSON response — handle possible markdown fencing
  let parsed: {
    fullText?: string;
    headings?: string[];
    stats?: string[];
    garbledText?: string[];
    textClarity?: number;
  } = {};

  try {
    const jsonStr = rawText.replace(/^```json?\s*/, '').replace(/\s*```$/, '').trim();
    parsed = JSON.parse(jsonStr);
  } catch {
    console.warn('[ocr] Failed to parse Gemini JSON response, using raw text fallback');
    parsed = { fullText: rawText };
  }

  const fullText = parsed.fullText ?? '';
  const numbers = extractNumbers(fullText);

  // Combine model-detected garbled text with our heuristic detection
  const modelGarbled = parsed.garbledText ?? [];
  const heuristicGarbled = detectGarbled(fullText);
  const allGarbled = [...new Set([...modelGarbled, ...heuristicGarbled])];

  const confidence = parsed.textClarity ?? 80;

  const result: OcrResult = {
    fullText,
    numbers,
    headings: parsed.headings ?? [],
    statsFound: parsed.stats ?? [],
    garbledText: allGarbled,
    confidence,
  };

  console.log(`[ocr] Extracted: ${numbers.length} numbers, ${result.headings.length} headings, ${allGarbled.length} garbled, confidence=${confidence}`);

  return result;
}
