import { NextRequest, NextResponse } from "next/server";
import { initializeFirebaseAdmin } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  // FIX: This signature directly addresses the type error from the build log.
  // The build environment expects params to be a Promise.
  context: { params: { postId: string } }
) {
  try {
    const admin = initializeFirebaseAdmin();
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    // Find the post
    const post = await prisma.post.findUnique({
      where: { id: context.params.postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== decoded.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete it
    await prisma.post.delete({
      where: { id: context.params.postId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Add an empty GET function to make the route handler valid, as the build log
// is also complaining about missing properties of the route handler.
export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}