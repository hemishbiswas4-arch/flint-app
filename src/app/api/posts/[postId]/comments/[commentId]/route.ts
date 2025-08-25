import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import prisma from "@/lib/prisma";
import { initializeFirebaseAdmin } from "@/lib/firebase-admin";

initializeFirebaseAdmin();

// ✅ DELETE /api/posts/:postId/comments/:commentId
export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Ensure user exists (safety net)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: decodedToken.email ?? null,
        image: decodedToken.picture ?? null,
      },
    });

    const commentId = params.commentId;

    // ✅ Check ownership
    const existing = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE COMMENT] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
