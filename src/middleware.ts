// Location: src/middleware.ts

import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

// ✅ REVERT THIS BACK TO USING THE LIGHTWEIGHT authConfig
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  // This is a more streamlined way to handle the logic
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  console.log('MIDDLEWARE SESSION:', req.auth);
  
  if (!isLoggedIn && pathname !== "/auth/signin") {
    return Response.redirect(new URL("/auth/signin", req.nextUrl));
  }
});

// This config prevents the middleware from running on auth API routes and static files.
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|auth/signin).*)",
  ],
}