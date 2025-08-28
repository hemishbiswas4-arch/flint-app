"use client";

import { useState } from "react";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

interface FollowButtonProps {
  targetUserId: string;
  isInitiallyFollowing: boolean;
}

export default function FollowButton({ targetUserId, isInitiallyFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async () => {
    try {
      setLoading(true);
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();

      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Request failed");
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("❌ Follow toggle failed:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={toggleFollow}
      disabled={loading}
      variant={isFollowing ? "secondary" : "default"}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
