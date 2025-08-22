// File: src/app/api/auth/session-login/route.ts

import { auth } from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  await initializeFirebaseAdmin();

  const authorization = request.headers.get("Authorization");
  if (authorization?.startsWith("Bearer ")) {
    const idToken = authorization.split("Bearer ")[1];

    try {
      const decodedToken = await auth().verifyIdToken(idToken);

      if (decodedToken) {
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const sessionCookie = await auth().createSessionCookie(idToken, { expiresIn });
        
        const response = NextResponse.json({ status: 'success' }, { status: 200 });
        
        response.cookies.set("session", sessionCookie, {
          maxAge: expiresIn,
          httpOnly: true,
          secure: true,
        });

        return response;
      }
    } catch (error) {
        console.error("Error verifying token:", error);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.json({ error: 'No token provided' }, { status: 400 });
}