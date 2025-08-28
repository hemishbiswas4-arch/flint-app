// src/app/api/auth/sync/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "firebase-admin/auth";
import { initializeFirebaseAdmin } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const adminApp = initializeFirebaseAdmin();
    const decoded = await getAuth(adminApp).verifyIdToken(token);

    // 👇 Upsert the user into Prisma DB
    const user = await prisma.user.upsert({
      where: { id: decoded.uid },
      update: {
        email: decoded.email,
        username: decoded.name ?? null,   // 👈 sync Google displayName
        image: decoded.picture ?? null,   // 👈 sync Google profile picture
      },
      create: {
        id: decoded.uid,
        email: decoded.email,
        username: decoded.name ?? null,
        image: decoded.picture ?? null,
      },
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error("❌ Error syncing user:", err);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
