import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let text = '';

    if (name.endsWith('.pdf')) {
      text = await extractPdf(buffer);
    } else if (name.endsWith('.docx')) {
      text = await extractDocx(buffer);
    } else if (name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.csv')) {
      text = buffer.toString('utf-8');
    } else if (name.endsWith('.json')) {
      text = buffer.toString('utf-8');
    } else if (name.endsWith('.pptx')) {
      text = await extractPptx(buffer);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Supported: PDF, DOCX, PPTX, TXT, MD, CSV, JSON' },
        { status: 400 },
      );
    }

    // Clean up
    text = text.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, 15000);

    if (text.length < 20) {
      return NextResponse.json(
        { error: 'Could not extract readable content from this file' },
        { status: 422 },
      );
    }

    return NextResponse.json({ text, title: file.name, source: file.name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to parse file' }, { status: 500 });
  }
}

async function extractPdf(buffer: Buffer): Promise<string> {
  // pdf-parse has a dynamic require issue in Next.js edge runtime
  // Import it dynamically to ensure it runs in Node.js runtime
  const pdfParseModule = await import('pdf-parse');
  const pdfParse = (pdfParseModule as any).default || pdfParseModule;
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractPptx(buffer: Buffer): Promise<string> {
  // PPTX files are zip archives with XML slides
  // We'll use a lightweight approach: unzip and extract text from slide XML
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(buffer);

  const slides: string[] = [];
  const slideFiles = Object.keys(zip.files)
    .filter(f => f.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort();

  for (const slidePath of slideFiles) {
    const xml = await zip.files[slidePath].async('text');
    // Extract text from <a:t> tags (PowerPoint text runs)
    const texts: string[] = [];
    const regex = new RegExp('<a:t>(.*?)</a:t>', 'gs');
    let match;
    while ((match = regex.exec(xml)) !== null) {
      const decoded = match[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      if (decoded) texts.push(decoded);
    }
    if (texts.length > 0) {
      slides.push(texts.join(' '));
    }
  }

  return slides.join('\n\n');
}
