// src/app/api/users/[userId]/route.ts
// src/app/api/users/[userId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { initializeFirebaseAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

// ✅ GET: Fetch user profile + posts + follower info
export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // ✅ Determine current logged-in user (optional, for isFollowing)
    let currentUserId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = await getAuth(initializeFirebaseAdmin()).verifyIdToken(token);
        currentUserId = decoded.uid;
      } catch {
        console.warn("⚠️ Invalid or missing auth token in GET /users/[userId]");
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        bio: true,
        image: true,
        coverPhoto: true,
        email: true,
        posts: {
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
            _count: { select: { likes: true, comments: true } },
          },
        },
        _count: { select: { followers: true, following: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ check if current user is following this profile
    let isFollowing = false;
    if (currentUserId) {
      const existing = await prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: currentUserId, followingId: userId },
        },
      });
      isFollowing = !!existing;
    }

    // ✅ normalize posts (flatten images + add displayName)
    const posts = user.posts.map((p) => ({
      ...p,
      images: p.images.map((img) => img.imageUrl),
      createdAt: p.createdAt.toISOString(),
      author: {
        ...p.author,
        displayName: p.author.username || p.author.email,
      },
    }));

    return NextResponse.json({ ...user, posts, isFollowing });
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// ✅ PUT: Update user profile
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();

    const { username, bio, image, coverPhoto } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        bio,
        image,
        coverPhoto,
      },
      select: {
        id: true,
        username: true,
        bio: true,
        image: true,
        coverPhoto: true,
        email: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("❌ Error updating user:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
