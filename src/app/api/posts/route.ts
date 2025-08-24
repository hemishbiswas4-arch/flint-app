import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { auth } from 'firebase-admin';
import prisma from '@/lib/prisma';

// Helper to get current user
async function getAuthenticatedUser(request: NextRequest): Promise<auth.DecodedIdToken | null> {
  await initializeFirebaseAdmin();
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

// ✅ GET /api/posts -> fetch posts for community feed
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, email: true } },
        images: { select: { imageUrl: true } },
        likes: { select: { userId: true } },
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts." }, { status: 500 });
  }
}

// ✅ POST /api/posts -> create new post
export async function POST(request: NextRequest) {
  const decodedToken = await getAuthenticatedUser(request);

  if (!decodedToken || !decodedToken.uid) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  const { uid: firebaseUid, email, picture } = decodedToken;

  try {
    const user = await prisma.user.upsert({
      where: { id: firebaseUid },
      update: { email: email!, image: picture },
      create: { id: firebaseUid, email: email!, image: picture },
    });

    const body = await request.json();
    const { title, textContent, places = [], images = [] } = body;

    if (!title || !textContent) {
      return NextResponse.json({ error: "Title and text content are required." }, { status: 400 });
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        textContent,
        authorId: user.id,
        places: {
          create: places.map((place: any) => ({
            googlePlaceId: place.googlePlaceId,
            name: place.name,
            lat: place.lat,
            lng: place.lng,
            displayOrder: place.displayOrder,
          })),
        },
        images: {
          create: images.map((image: any) => ({
            imageUrl: image.imageUrl,
          })),
        },
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
}
