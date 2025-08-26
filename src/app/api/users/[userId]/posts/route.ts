// src/app/api/users/[userId]/posts/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params; // ✅ await

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: { select: { id: true, email: true } },
        images: { select: { imageUrl: true } },
        _count: { select: { likes: true } },
        likes: { select: { userId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      posts.map((p) => ({
        ...p,
        images: p.images.map((img) => img.imageUrl),
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error("❌ Error fetching user posts:", err);
    return NextResponse.json(
      { error: "Failed to fetch user posts" },
      { status: 500 }
    );
  }
}
