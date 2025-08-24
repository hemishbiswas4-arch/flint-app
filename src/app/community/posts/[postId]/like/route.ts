// src/app/community/posts/[postId]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initializeFirebaseAdmin } from "@/lib/firebase-admin";
import { auth } from "firebase-admin";
import prisma from "@/lib/prisma";

// Helper function to get the authenticated user
async function getAuthenticatedUser(
  request: NextRequest
): Promise<auth.DecodedIdToken | null> {
  const authorization = request.headers.get("Authorization");
  if (authorization?.startsWith("Bearer ")) {
    const idToken = authorization.split("Bearer ")[1];
    try {
      return await auth().verifyIdToken(idToken);
    } catch (error) {
      console.error("Error verifying token:", error);
      return null;
    }
  }
  return null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> } // 👈 fix type
) {
  await initializeFirebaseAdmin();
  const decodedToken = await getAuthenticatedUser(request);

  if (!decodedToken || !decodedToken.uid) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { postId } = await context.params; // 👈 must await
  const userId = decodedToken.uid;

  try {
    // Check if the like already exists
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike request
      await prisma.postLike.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      return NextResponse.json(
        { message: "Post unliked successfully." },
        { status: 200 }
      );
    } else {
      // New like
      await prisma.postLike.create({
        data: {
          userId,
          postId,
        },
      });
      return NextResponse.json(
        { message: "Post liked successfully." },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Failed to process like request:", error);
    return NextResponse.json({ error: "Operation failed." }, { status: 500 });
  }
}
