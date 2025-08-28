// file: src/app/api/conversations/[id]/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "firebase-admin/auth";
import { initializeFirebaseAdmin } from "@/lib/firebase-admin";

const adminApp = initializeFirebaseAdmin();

// ✅ GET: Fetch messages in a conversation
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await getAuth(adminApp).verifyIdToken(token);

    // Confirm user is in conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: { users: true },
    });

    if (!conversation || !conversation.users.some(u => u.id === decoded.uid)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: "asc" },
      include: { sender: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ POST: Send a new message
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await getAuth(adminApp).verifyIdToken(token);

    const { text } = await req.json();

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: { users: true },
    });

    if (!conversation || !conversation.users.some(u => u.id === decoded.uid)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        text,
        senderId: decoded.uid,
        conversationId: params.id,
      },
      include: { sender: true },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
