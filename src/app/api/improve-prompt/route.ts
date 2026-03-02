import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are an infographic brief writer for an AI infographic generation engine. Transform the user's rough idea into a structured, detailed content brief that will produce a high-quality infographic.

Rules:
- Keep the user's original topic and intent exactly
- Write 4-6 clearly labeled sections that the infographic should cover
- Include specific statistics, data points, numbers, or facts in each section (use real approximate data)
- Suggest a narrative flow — what the viewer sees first through last
- Mention the target audience or tone if relevant (professional, educational, editorial)
- Stay under 400 words total — this is a content brief, not an essay
- Output plain text only — no markdown headers, no bullet symbols, no asterisks
- Use line breaks between sections for readability
- Do NOT add meta-commentary like "Here's your improved prompt" or "This brief covers..."
- Start directly with the topic statement`;

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GOOGLE_API_KEY not configured' },
      { status: 500 },
    );
  }

  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      return NextResponse.json(
        { error: 'Prompt must be at least 10 characters' },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(prompt.trim());
    const improved = result.response.text();

    return NextResponse.json({ improved });
  } catch (err: any) {
    console.error('Improve prompt error:', err.message);
    return NextResponse.json(
      { error: 'Failed to improve prompt' },
      { status: 500 },
    );
  }
}
