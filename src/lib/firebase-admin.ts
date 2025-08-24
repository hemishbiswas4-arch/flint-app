// File: src/lib/firebase-admin.ts
import admin from "firebase-admin";

export function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin;
}

// If you want to use admin directly too:
export { admin };
