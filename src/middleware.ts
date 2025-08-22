import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from './lib/firebase-admin';
import { auth } from 'firebase-admin';

async function verifyToken(token: string, isCookie: boolean) {
  try {
    const adminAuth = auth();
    if (isCookie) {
      // Verify the session cookie from the browser
      return await adminAuth.verifySessionCookie(token, true);
    } else {
      // Verify the ID token from the mobile app
      return await adminAuth.verifyIdToken(token, true);
    }
  } catch (e) {
    // Token is invalid
    return null;
  }
}

export async function middleware(request: NextRequest) {
  await initializeFirebaseAdmin();

  // 1. Check for the session cookie (for the website)
  const sessionCookie = request.cookies.get("session")?.value;

  // 2. Check for the Authorization header (for the mobile app)
  const authorizationHeader = request.headers.get("Authorization");
  const idToken = authorizationHeader?.split("Bearer ")[1];

  let decodedToken = null;

  if (sessionCookie) {
    decodedToken = await verifyToken(sessionCookie, true);
  } else if (idToken) {
    decodedToken = await verifyToken(idToken, false);
  }

  // 3. If no valid token is found, redirect to the sign-in page
  if (!decodedToken) {
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
    const redirectUrl = new URL('/auth/signin', request.url);

    if (isApiRoute) {
      // For API routes, return an "Unauthorized" error
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    // For regular pages, redirect to the sign-in page
    return NextResponse.redirect(redirectUrl);
  }

  // 4. If the token is valid, allow the request to continue
  return NextResponse.next();
}

// This config specifies which routes are protected by the middleware
export const config = {
  matcher: ["/((?!auth/signin|_next/static|_next/image|favicon.ico).*)"],
};