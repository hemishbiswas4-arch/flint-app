// src/app/api/posts/[postId]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import prisma from "@/lib/prisma";
import { initializeFirebaseAdmin } from "@/lib/firebase-admin";

initializeFirebaseAdmin();

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    console.log("[LIKE] Incoming request -> postId:", postId, "userId:", userId);

    // Check if like already exists
    const existing = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } }, // ✅ composite PK lookup
    });

    let result;
    if (existing) {
      // ✅ delete using composite PK
      result = await prisma.postLike.delete({
        where: { userId_postId: { userId, postId } },
      });
      console.log("[LIKE] Removed like:", result);
    } else {
      result = await prisma.postLike.create({
        data: {
          post: { connect: { id: postId } },
          user: { connect: { id: userId } },
        },
      });
      console.log("[LIKE] Added like:", result);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[LIKE] Error:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
