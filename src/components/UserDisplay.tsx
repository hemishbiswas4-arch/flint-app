"use client";

import { User } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface UserDisplayProps {
  user: User | null;
  loading?: boolean;
}

export default function UserDisplay({ user, loading = false }: UserDisplayProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        <div className="w-16 h-4 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href="/auth/signin">Sign In</a>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.photoURL || undefined} />
        <AvatarFallback>
          {user.email?.[0]?.toUpperCase() ?? "U"}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm">{user.email}</span>
      <Button variant="ghost" size="sm" asChild>
        <a href="/auth/signout">Sign Out</a>
      </Button>
    </div>
  );
}
