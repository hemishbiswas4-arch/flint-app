// File: src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;
  const authorizationHeader = request.headers.get("Authorization");

  // If neither a cookie nor a token header exists, the user is not logged in.
  if (!sessionCookie && !authorizationHeader) {
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
    const redirectUrl = new URL('/signin', request.url);

    if (isApiRoute) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    return NextResponse.redirect(redirectUrl);
  }

  // If a token or cookie exists, let the request proceed.
  // The actual verification will happen in the API route itself.
  return NextResponse.next();
}

// This config specifies which routes are protected by the middleware
export const config = {
  // This tells the middleware to run on all paths EXCEPT the ones inside the parentheses
  matcher: ["/((?!api|signin|_next/static|_next/image|favicon.ico).*)"],
};