// src/app/community/feed/page.tsx
// src/app/community/feed/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import PostCard, { PostForFeed } from "@/app/components/PostCard";
import Link from "next/link";
import {
  Home,
  PlusSquare,
  Newspaper,
  User as UserIcon,
  Map as MapIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function FollowFeedPage() {
  const [posts, setPosts] = useState<PostForFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setCurrentUserId(u?.uid ?? null);
      if (u) {
        const idToken = await u.getIdToken();
        try {
          const res = await fetch("/api/feed", {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (res.ok) {
            const rawPosts = await res.json();
            const normalized = rawPosts.map((raw: any) => {
              const author =
                raw.author ??
                raw.user ?? // some APIs use "user"
                raw.createdBy ?? // some APIs use "createdBy"
                null;

              return {
                ...raw,
                title: raw.title ?? raw.caption ?? raw.textContent ?? "Untitled",
                textContent: raw.textContent ?? raw.caption ?? "",
                author: author
                  ? {
                      id: author.id ?? "no-id",
                      email:
                        author.username ??
                        author.email ??
                        "Anonymous Traveler",
                    }
                  : {
                      id: "no-id",
                      email: "Anonymous Traveler",
                    },
                likes: raw.likes ?? [],
              } as PostForFeed;
            });
            setPosts(normalized);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const navItems = [
    { name: "Feed", href: "/community", icon: Home },
    { name: "My Feed", href: "/community/feed", icon: Newspaper, authOnly: true },
    { name: "Create", href: "/community/create", icon: PlusSquare, authOnly: true },
    { name: "Profile", href: currentUserId ? `/community/user/${currentUserId}` : "/signin", icon: UserIcon, authOnly: true },
    { name: "Plan", href: "/community/plan", icon: MapIcon },
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 pb-20 pt-4">
      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-64 rounded-xl bg-muted/40"
            />
          ))}
        </div>
      )}

      {/* Not signed in */}
      {!loading && !currentUserId && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            Please{" "}
            <a href="/signin" className="text-primary hover:underline">
              sign in
            </a>{" "}
            to see your personalized feed.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && posts.length === 0 && currentUserId && (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center border rounded-xl bg-muted/30">
          <p className="text-base font-medium">Your feed is empty</p>
          <p className="text-sm text-muted-foreground mt-1">
            You’re not following anyone yet. Browse the{" "}
            <a href="/community" className="text-primary hover:underline">
              global feed
            </a>{" "}
            to discover travelers.
          </p>
        </div>
      )}

      {/* Feed grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      {/* Bottom Navigation Bar - only on phones */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-around py-2 sm:hidden">
        {navItems.map((item) => {
          if (item.authOnly && !currentUserId) return null;
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon size={22} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
