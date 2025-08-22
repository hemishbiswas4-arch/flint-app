// File: src/app/(auth)/signin/page.tsx
'use client';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import styles from '@/app/Home.module.css';
import MapComponent from '@/app/components/MapComponent';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [isMapsScriptLoaded, setMapsScriptLoaded] = useState(false);
  const router = useRouter();
  const auth = getAuth(firebaseApp);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // 1. This now calls the Firebase Sign-in popup
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // 2. It sends the token to our new Firebase backend route
      await fetch('/api/auth/session-login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      // 3. Then it redirects to the homepage
      router.push('/');

    } catch (error) {
      console.error("Firebase sign-in error:", error);
      alert("Sign-in failed. Please try again.");
    }
  };

  useEffect(() => {
    if (window.google) {
      setMapsScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.mapContainer}>
        {isMapsScriptLoaded ? (
          <MapComponent stops={[]} selectedStopIndex={null} onMarkerClick={() => {}} />
        ) : (
          <div className={styles.mapLoading}>Loading Map...</div>
        )}
      </div>
      <div className={styles.panel}>
        <div className={styles.viewActive}>
            <div className={styles.header}>
                <h1 className={styles.title}>Outplann</h1>
                <p className={styles.subtitle}>Spark your next adventure.</p>
            </div>
            <button 
                onClick={handleSignIn}
                className={styles.sparkButton}
            >
                Sign in with Google
            </button>
        </div>
      </div>
    </main>
  );
}