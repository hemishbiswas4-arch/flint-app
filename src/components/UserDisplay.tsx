"use client";

import { User, GoogleAuthProvider, signInWithPopup, getAuth, signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { firebaseApp } from "@/lib/firebase";
import { useState } from "react";

interface UserDisplayProps {
  user: User | null;
  loading?: boolean;
}

export default function UserDisplay({ user, loading = false }: UserDisplayProps) {
  const [authLoading, setAuthLoading] = useState(false);
  const auth = getAuth(firebaseApp);

  const handleSignIn = async () => {
    try {
      setAuthLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Tell Next.js backend to set a session cookie
      await fetch("/api/auth/session-login", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
    } catch (err) {
      console.error("Sign-in error:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setAuthLoading(true);
      await signOut(auth);

      // Clear Next.js session cookie
      await fetch("/api/auth/session-logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Sign-out error:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        <div className="w-16 h-4 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={handleSignIn}>
        Sign In
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.photoURL || undefined} />
        <AvatarFallback>{user.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
      </Avatar>
      <span className="text-sm truncate max-w-[150px]">{user.email}</span>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
}
