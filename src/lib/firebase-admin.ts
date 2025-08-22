// File: src/lib/firebase-admin.ts

import admin from 'firebase-admin';

// This function needs to be exported so other files can use it.
export function initializeFirebaseAdmin() {
  // This prevents the app from being initialized multiple times
  if (!admin.apps.length) {
    // Load the secret key from your .env.local file
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin;
}