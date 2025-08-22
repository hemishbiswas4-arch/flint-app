// File: src/app/api/auth/session-logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 1. Create a response object.
  const response = NextResponse.json({ status: 'success' }, { status: 200 });

  // 2. Set the cookie on the response with an expiration date in the past to delete it.
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: true,
    expires: new Date(0), // Set expiration to a time in the past
  });

  // 3. Return the response.
  return response;
}