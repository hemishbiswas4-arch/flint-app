"use client";

import styles from '@/app/Home.module.css';
import { signIn } from 'next-auth/react';
import { Sparkles } from 'lucide-react';

export default function SignInPage() {
  return (
    <main className={styles.page}>
      <div className={styles.panel} style={{ width: '400px' }}>
        <div className={styles.viewActive}>
          <div className={styles.header}>
            <h1 className={styles.title}>Flint</h1>
            <p className={styles.subtitle}>Please sign in to continue.</p>
          </div>
          <button 
            onClick={() => signIn('google', { callbackUrl: '/' })} 
            className={styles.sparkButton}
          >
            <Sparkles size={20} />
            Sign in with Google
          </button>
        </div>
      </div>
    </main>
  );
}