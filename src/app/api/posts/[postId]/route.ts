// src/app/api/posts/[postId]/route.ts
// src/app/api/posts/[postId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { initializeFirebaseAdmin } from "@/lib/firebase-admin";

async function getAuthenticatedUser(request: NextRequest) {
  const adminApp = initializeFirebaseAdmin();

  // Authorization header
  const authorization =
    request.headers.get("authorization") ?? request.headers.get("Authorization");

  if (authorization?.startsWith("Bearer ")) {
    const idToken = authorization.slice("Bearer ".length);
    try {
      return await adminApp.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error("❌ Error verifying Bearer token:", error);
      return null;
    }
  }

  // Session cookie fallback
  const sessionCookie =
    request.cookies.get("session")?.value ??
    request.cookies.get("__session")?.value;

  if (sessionCookie) {
    try {
      return await adminApp.auth().verifySessionCookie(sessionCookie, true);
    } catch (error) {
      console.error("❌ Error verifying session cookie:", error);
      return null;
    }
  }

  return null;
}

// -------------------------------
// ✅ DELETE /api/posts/[postId]
// -------------------------------
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;
  const decodedToken = await getAuthenticatedUser(request);

  if (!decodedToken?.uid) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.authorId !== decodedToken.uid) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id: postId } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to delete post:", error);
    return NextResponse.json(
      { error: "Failed to delete post." },
      { status: 500 }
    );
  }
}
