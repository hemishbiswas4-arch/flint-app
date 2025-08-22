// Location: src/app/auth/signin/page.tsx
'use client';
import { signIn } from 'next-auth/react';
import styles from '@/app/Home.module.css';
import MapComponent from '@/app/components/MapComponent';
import React, { useEffect, useState } from 'react';

export default function SignInPage() {
  const [isMapsScriptLoaded, setMapsScriptLoaded] = useState(false);

  useEffect(() => {
    // This is a simplified script loader for the map on the sign-in page
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
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className={styles.sparkButton}
            >
                Sign in with Google
            </button>
        </div>
      </div>
    </main>
  );
}