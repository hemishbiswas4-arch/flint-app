//src/components/UserDisplay.tsx
"use client";

import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  signOut,
} from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { firebaseApp } from "@/lib/firebase";
import { useEffect, useState } from "react";

interface UserDisplayProps {
  user: User | null;
  loading?: boolean;
}

interface UserProfile {
  id: string;
  username?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function UserDisplay({ user, loading = false }: UserDisplayProps) {
  const [authLoading, setAuthLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const auth = getAuth(firebaseApp);

  // 🔑 Fetch DB profile when Firebase user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/users/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setProfile(await res.json());
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSignIn = async () => {
    try {
      setAuthLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

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

  // ✅ Prefer username + image, fallback to Firebase
  const displayName =
    profile?.username || user.displayName || user.email || "User";
  const displayImage = profile?.image || user.photoURL || undefined;
  const fallbackLetter =
    profile?.username?.[0]?.toUpperCase() ??
    user.email?.[0]?.toUpperCase() ??
    "U";

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={displayImage} />
        <AvatarFallback>{fallbackLetter}</AvatarFallback>
      </Avatar>
      <span className="text-sm truncate max-w-[150px]">{displayName}</span>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
}
