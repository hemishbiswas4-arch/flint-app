// src/lib/firebase-admin.ts
import * as admin from "firebase-admin";

let adminApp: admin.app.App | null = null;

export function initializeFirebaseAdmin() {
  if (adminApp) return adminApp;

  if (!admin.apps.length) {
    adminApp = admin.initializeApp({
      // 🔑 For production: set GOOGLE_APPLICATION_CREDENTIALS env var
      // or use admin.credential.cert(serviceAccountJson)
      credential: admin.credential.applicationDefault(),
    });
  } else {
    adminApp = admin.app();
  }

  return adminApp;
}
