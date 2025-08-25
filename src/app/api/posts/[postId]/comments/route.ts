import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import prisma from "@/lib/prisma";
import { initializeFirebaseAdmin } from "@/lib/firebase-admin";

initializeFirebaseAdmin();

// ✅ GET /api/posts/[postId]/comments
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, image: true } },
      },
    });

    return NextResponse.json({ data: comments }, { status: 200 });
  } catch (error) {
    console.error("[COMMENT GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// ✅ POST /api/posts/[postId]/comments
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;

    // 1. Auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(idToken);
    const userId = decoded.uid;

    // 2. Validate body
    const body = await req.json();
    if (!body.text || typeof body.text !== "string") {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    // 3. Ensure user exists
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: decoded.email ?? undefined,
        image: decoded.picture ?? undefined,
      },
      create: {
        id: userId,
        email: decoded.email ?? null,
        image: decoded.picture ?? null,
      },
    });

    // 4. Create comment
    const comment = await prisma.comment.create({
      data: {
        text: body.text,
        userId: user.id,
        postId,
      },
      include: {
        user: { select: { id: true, email: true, image: true } },
      },
    });

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    console.error("[COMMENT POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
