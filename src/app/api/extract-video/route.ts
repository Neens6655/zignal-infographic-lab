import { NextResponse } from 'next/server';
import { isPrivateUrl } from '@/lib/url-validator';
import { enforceRateLimit } from '@/lib/request-utils';

/**
 * Extract video transcript from YouTube, Vimeo, or Loom.
 * For YouTube: uses the innertube captions endpoint (no API key needed).
 * For Vimeo/Loom: fetches the page and extracts OG metadata as a content brief.
 */

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pat of patterns) {
    const match = url.match(pat);
    if (match) return match[1];
  }
  return null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

async function fetchYouTubeTranscript(videoId: string): Promise<{ title: string; text: string }> {
  // Step 1: Get video page to extract captions track URL
  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ZgnalBot/1.0)',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(10000),
  });
  const pageHtml = await pageRes.text();

  // Extract title
  const titleMatch = pageHtml.match(/"title":"(.*?)"/);
  const title = titleMatch ? titleMatch[1].replace(/\\u0026/g, '&').replace(/\\"/g, '"') : `YouTube ${videoId}`;

  // Extract captions URL from ytInitialPlayerResponse
  const captionsMatch = pageHtml.match(/"captionTracks":\s*(\[.*?\])/);
  if (!captionsMatch) {
    // No captions — fall back to description
    const descMatch = pageHtml.match(new RegExp('"shortDescription":"(.*?)(?<!\\\\)"', 's'));
    const desc = descMatch
      ? descMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\u0026/g, '&')
      : '';

    if (desc.length < 30) {
      throw new Error('No captions or description available for this video');
    }

    return {
      title,
      text: `Video: ${title}\n\nDescription:\n${desc.slice(0, 8000)}`,
    };
  }

  const tracks = JSON.parse(captionsMatch[1].replace(/\\"/g, '"').replace(/\\u0026/g, '&'));

  // Prefer English, fall back to first available
  const enTrack = tracks.find((t: any) => t.languageCode === 'en' || t.languageCode?.startsWith('en'));
  const track = enTrack || tracks[0];

  if (!track?.baseUrl) {
    throw new Error('Could not find caption track URL');
  }

  // Step 2: Fetch captions XML
  const captionsRes = await fetch(track.baseUrl, { signal: AbortSignal.timeout(10000) });
  const captionsXml = await captionsRes.text();

  // Parse XML captions — extract text from <text> elements
  const textSegments: string[] = [];
  const textRegex = new RegExp('<text[^>]*>(.*?)</text>', 'gs');
  let match;
  while ((match = textRegex.exec(captionsXml)) !== null) {
    const decoded = match[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]*>/g, '')
      .trim();
    if (decoded) textSegments.push(decoded);
  }

  if (textSegments.length === 0) {
    throw new Error('Captions track was empty');
  }

  const transcript = textSegments.join(' ').slice(0, 12000);

  return {
    title,
    text: `Video: ${title}\n\nTranscript:\n${transcript}`,
  };
}

async function fetchVimeoInfo(vimeoId: string): Promise<{ title: string; text: string }> {
  const res = await fetch(`https://vimeo.com/api/v2/video/${vimeoId}.json`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error('Could not fetch Vimeo video info');

  const data = await res.json();
  const video = data[0];

  return {
    title: video.title || `Vimeo ${vimeoId}`,
    text: [
      `Video: ${video.title}`,
      video.description ? `\nDescription:\n${video.description}` : '',
      video.tags ? `\nTags: ${video.tags}` : '',
      `\nDuration: ${Math.round(video.duration / 60)} minutes`,
      `\nBy: ${video.user_name}`,
    ].filter(Boolean).join('\n').slice(0, 8000),
  };
}

async function fetchGenericVideoPage(url: string): Promise<{ title: string; text: string }> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ZgnalBot/1.0)' },
    signal: AbortSignal.timeout(10000),
  });
  const html = await res.text();

  const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/) ||
                     html.match(/<title>([^<]*)<\/title>/);
  const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/);

  const title = titleMatch?.[1] || new URL(url).hostname;
  const desc = descMatch?.[1] || '';

  if (!desc || desc.length < 20) {
    throw new Error('Could not extract video content. Try pasting the transcript directly.');
  }

  return {
    title,
    text: `Video: ${title}\n\nDescription:\n${desc}`,
  };
}

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    // SSRF protection for generic video page fetches
    if (isPrivateUrl(url)) {
      return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
    }

    const youtubeId = extractYouTubeId(url);
    const vimeoId = extractVimeoId(url);

    let result: { title: string; text: string };

    if (youtubeId) {
      result = await fetchYouTubeTranscript(youtubeId);
    } else if (vimeoId) {
      result = await fetchVimeoInfo(vimeoId);
    } else {
      // Try generic (Loom, etc.)
      result = await fetchGenericVideoPage(url);
    }

    if (result.text.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract enough content from this video' },
        { status: 422 },
      );
    }

    return NextResponse.json({ text: result.text, title: result.title, source: url });
  } catch (err: unknown) {
    console.error('[extract-video]', err);
    return NextResponse.json({ error: 'Failed to extract video content. Please try again.' }, { status: 422 });
  }
}
