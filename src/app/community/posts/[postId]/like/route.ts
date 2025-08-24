import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { auth } from 'firebase-admin';
import prisma from '@/lib/prisma'; // Use the default import

// Helper function to get the authenticated user
async function getAuthenticatedUser(request: NextRequest): Promise<auth.DecodedIdToken | null> {
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

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
    await initializeFirebaseAdmin();
    const decodedToken = await getAuthenticatedUser(request);

    if (!decodedToken || !decodedToken.uid) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const { postId } = params;
    const userId = decodedToken.uid;

    try {
        // Check if the like already exists
        const existingLike = await prisma.postLike.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        // If it exists, it's an "unlike" request
        if (existingLike) {
            await prisma.postLike.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });
            return NextResponse.json({ message: "Post unliked successfully." }, { status: 200 });
        } else {
            // If it doesn't exist, create a new like
            await prisma.postLike.create({
                data: {
                    userId,
                    postId,
                },
            });
            return NextResponse.json({ message: "Post liked successfully." }, { status: 201 });
        }
    } catch (error) {
        console.error("Failed to process like request:", error);
        return NextResponse.json({ error: "Operation failed." }, { status: 500 });
    }
}