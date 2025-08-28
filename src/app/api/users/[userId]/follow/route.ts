
// src/app/api/users/[userId]/follow/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { initializeFirebaseAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function POST(
  req: Request,
  context: { params: Promise<{ userId: string }> } // 👈 mark as Promise
) {
  try {
    const { userId } = await context.params; // 👈 await here

    // ✅ Verify auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const adminApp = initializeFirebaseAdmin();
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const currentUserId = decoded.uid;

    if (currentUserId === userId) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    // ✅ Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    let following: boolean;

    if (existing) {
      // ✅ Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });
      following = false;
    } else {
      // ✅ Follow
      await prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: userId,
        },
      });
      following = true;
    }

    // ✅ Return updated follower count + user info
    const followerCount = await prisma.follow.count({
      where: { followingId: userId },
    });

    const followedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({
      user: {
        ...followedUser,
        displayName: followedUser?.username || followedUser?.email,
      },
      following,
      followerCount,
    });
  } catch (err) {
    console.error("❌ Follow toggle failed:", err);
    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    );
  }
}
