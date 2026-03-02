import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are supported' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ZgnalBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL (${response.status})` },
        { status: 422 },
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      // Try plain text
      if (contentType.includes('text/plain') || contentType.includes('application/json')) {
        const text = await response.text();
        return NextResponse.json({
          text: text.slice(0, 15000),
          title: parsedUrl.hostname,
          source: url,
        });
      }
      return NextResponse.json(
        { error: 'URL does not point to a readable web page' },
        { status: 422 },
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove noise elements
    $('script, style, nav, footer, header, aside, iframe, noscript, svg, [role="navigation"], [role="banner"], .sidebar, .nav, .footer, .header, .ad, .advertisement, .social-share, .comments').remove();

    // Extract title
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      $('h1').first().text().trim() ||
      parsedUrl.hostname;

    // Extract description
    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    // Extract main content — try article/main first, fallback to body
    let mainContent = '';

    const contentSelectors = ['article', 'main', '[role="main"]', '.post-content', '.article-content', '.entry-content', '.content'];
    for (const sel of contentSelectors) {
      const el = $(sel);
      if (el.length && el.text().trim().length > 200) {
        mainContent = el.text().trim();
        break;
      }
    }

    if (!mainContent) {
      mainContent = $('body').text().trim();
    }

    // Clean up whitespace
    const text = mainContent
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 15000);

    if (text.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract enough readable content from this URL' },
        { status: 422 },
      );
    }

    const result = [
      title ? `Title: ${title}` : '',
      description ? `Summary: ${description}` : '',
      '',
      text,
    ].filter(Boolean).join('\n');

    return NextResponse.json({ text: result, title, source: url });
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out. The URL took too long to respond.' }, { status: 408 });
    }
    return NextResponse.json({ error: 'Failed to extract content from URL' }, { status: 500 });
  }
}
