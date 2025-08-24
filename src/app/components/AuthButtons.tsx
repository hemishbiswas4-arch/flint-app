'use client';

import React from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

const auth = getAuth(firebaseApp);

export function UserDisplay({ user }: { user: User | null }) {
  const handleSignOut = () => {
    signOut(auth);
  };

  const handleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <div className="flex items-center">
      {user ? (
        <div className="flex items-center gap-4">
          <img src={user.photoURL || 'default-avatar.png'} alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-primary" />
          <Button onClick={handleSignOut} variant="ghost" size="sm">Sign Out</Button>
        </div>
      ) : (
        <Button onClick={handleSignIn}>Sign In</Button>
      )}
    </div>
  );
}