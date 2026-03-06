import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

/**
 * Check rate limit and return a 429 response if exceeded.
 * Returns null if the request is allowed.
 * Default limit: 10/hr (secondary routes).
 */
export function enforceRateLimit(
  request: Request,
  { limit = 10 }: { limit?: number } = {}
): NextResponse | null {
  const ip = getClientIp(request);
  const result = checkRateLimit(ip, false, limit);

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': '3600',
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  return null;
}
