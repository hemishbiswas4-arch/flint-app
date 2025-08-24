// File: src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // The new design handles authentication at the component/action level.
  // The middleware's role is no longer to protect pages, so we can
  // simply let all requests pass through it. The API routes themselves
  // will still verify the user's token, ensuring security.
  return NextResponse.next();
}

export const config = {
  // We remove the matcher to stop the middleware from running on page routes.
  matcher: [], 
};