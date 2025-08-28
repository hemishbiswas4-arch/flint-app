// src/app/api/posts/route.ts
// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initializeFirebaseAdmin } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";

interface PostRequestData {
  title: string;
  textContent: string;
  places?: {
    googlePlaceId: string;
    name: string;
    lat: number;
    lng: number;
    displayOrder: number;
  }[];
  images?: { imageUrl?: string | null }[] | string[];
}

// -------------------------------
// Helper: Get currently authenticated user
// -------------------------------
async function getAuthenticatedUser(request: NextRequest) {
  const adminApp = initializeFirebaseAdmin();

  // Session cookie first
  const sessionCookie =
    request.cookies.get("session")?.value ??
    request.cookies.get("__session")?.value;

  if (sessionCookie) {
    try {
      return await adminApp.auth().verifySessionCookie(sessionCookie, true);
    } catch {
      // ignore and fall through
    }
  }

  // Authorization header fallback
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

  return null;
}

// -------------------------------
// ✅ GET /api/posts
// -------------------------------
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
            username: true, // ✅ include username
            image: true,
          },
        },
        images: { select: { imageUrl: true } },
        likes: { select: { userId: true } },
        comments: {
          select: {
            id: true,
            text: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                email: true,
                username: true, // ✅ include username for comment authors
                image: true,
              },
            },
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const postsWithFlatImages = posts.map((post) => ({
      ...post,
      images: post.images.map((img) => img.imageUrl),
    }));

    return NextResponse.json(postsWithFlatImages, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts." },
      { status: 500 }
    );
  }
}

// -------------------------------
// ✅ POST /api/posts
// -------------------------------
export async function POST(request: NextRequest) {
  const decodedToken = await getAuthenticatedUser(request);

  if (!decodedToken?.uid) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const firebaseUid = decodedToken.uid;
  const email = decodedToken.email ?? "";

  // Safer extraction
  const picture =
    typeof (decodedToken as { picture?: unknown }).picture === "string"
      ? (decodedToken as { picture: string }).picture
      : null;

  try {
    // Ensure user exists or update
    const user = await prisma.user.upsert({
      where: { id: firebaseUid },
      update: { email, image: picture },
      create: { id: firebaseUid, email, image: picture },
    });

    const body: PostRequestData = await request.json();
    const { title, textContent, places = [], images = [] } = body;

    if (!title || !textContent) {
      return NextResponse.json(
        { error: "Title and text content are required." },
        { status: 400 }
      );
    }

    // Normalize images
    let validImages: string[] = [];
    if (Array.isArray(images)) {
      if (typeof images[0] === "string") {
        validImages = (images as string[]).filter((url) => !!url?.trim());
      } else {
        validImages = (images as { imageUrl?: string | null }[])
          .map((img) => img?.imageUrl?.trim())
          .filter((url): url is string => !!url && url.length > 0);
      }
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        textContent,
        authorId: user.id,
        places: {
          create: places.map((place) => ({
            googlePlaceId: place.googlePlaceId,
            name: place.name,
            lat: place.lat,
            lng: place.lng,
            displayOrder: place.displayOrder,
          })),
        },
        images: {
          create: validImages.map((url) => ({ imageUrl: url })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            username: true, // ✅ include username
            image: true,
          },
        },
        images: true,
        places: true,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("🔥 Failed to create post:", error);
    return NextResponse.json(
      { error: "Failed to create post." },
      { status: 500 }
    );
  }
}
