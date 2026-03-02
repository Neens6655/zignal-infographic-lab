import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth disabled for local development.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
