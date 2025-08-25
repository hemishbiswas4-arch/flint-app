// src/lib/firebase-admin.ts
import * as admin from "firebase-admin";

let adminApp: admin.app.App | null = null;

export function initializeFirebaseAdmin() {
  if (adminApp) return adminApp;

  if (!admin.apps.length) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY env variable");
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // keep using firebasestorage.app
    });
  } else {
    adminApp = admin.app();
  }

  return adminApp;
}
