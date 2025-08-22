// Location: FLINT-APP/src/app/api/auth/mobile-signin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/auth'; // Assuming your auth.ts is correctly aliased
import { AuthError } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    const { id_token } = await req.json();

    if (!id_token) {
      return NextResponse.json({ error: 'Missing id_token' }, { status: 400 });
    }

    // This is the magic part. We are manually triggering the NextAuth sign-in
    // process with the Google token from the mobile app.
    // Because the session strategy is 'jwt', this will return the session token.
    const session = await signIn('google', {
      id_token,
      redirect: false, // IMPORTANT: We don't want a redirect, we want the session data
    });

    return NextResponse.json(session);

  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    // Handle other potential errors
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}