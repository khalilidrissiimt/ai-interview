import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/interview')) {
    const token = request.cookies.get('interviewToken');
    if (!token) {
      return NextResponse.redirect(new URL('/upload-resume', request.url));
    }
  }
  return NextResponse.next();
} 