// src/app/api/feed/following/route.ts
// src/app/api/feed/following/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "firebase-admin/auth";
import { initializeFirebaseAdmin } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const adminApp = initializeFirebaseAdmin();
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const currentUserId = decoded.uid;

    // ✅ get list of users I'm following
    const following = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    if (followingIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // ✅ fetch posts only from followed users
    const posts = await prisma.post.findMany({
      where: { authorId: { in: followingIds } },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            image: true,
          },
        },
        images: { select: { imageUrl: true } },
        likes: { select: { userId: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    // ✅ flatten images for frontend
    const postsWithFlatImages = posts.map((post) => ({
      ...post,
      images: post.images.map((img) => img.imageUrl),
    }));

    return NextResponse.json(postsWithFlatImages, { status: 200 });
  } catch (err) {
    console.error("❌ Error generating feed:", err);
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 });
  }
}
