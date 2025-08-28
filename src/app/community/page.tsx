//src/app/community/page.tsx
// src/app/community/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import PostCard, { PostForFeed } from "@/app/components/PostCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  PlusSquare,
  Newspaper,
  User as UserIcon,
  Map as MapIcon,
} from "lucide-react";

interface UserProfile {
  id: string;
  username?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function CommunityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostForFeed[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔑 Listen for Firebase user + fetch DB profile
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const res = await fetch(`/api/users/${firebaseUser.uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            setProfile(await res.json());
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      } else {
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 📄 Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // ✅ Safe display helpers (prefer DB values first)
  const displayName =
    profile?.username || user?.displayName || user?.email || "User";
  const displayImage = profile?.image || user?.photoURL || undefined;
  const fallbackLetter =
    profile?.username?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    "U";

  return (
    <div className="relative min-h-screen container py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* -------- Left Sidebar (Desktop) -------- */}
      <aside className="hidden lg:flex lg:flex-col gap-4 col-span-2">
        <Card className="p-4 space-y-3 rounded-2xl shadow-sm">
          <Link
            href="/community"
            className="flex items-center gap-2 text-sm font-medium hover:text-primary"
          >
            <Home size={18} />
            Global Feed
          </Link>

          {user && (
            <>
              <Link
                href="/community/feed"
                className="flex items-center gap-2 text-sm font-medium hover:text-primary"
              >
                <Newspaper size={18} />
                My Feed
              </Link>
              <Link
                href="/community/create"
                className="flex items-center gap-2 text-sm font-medium hover:text-primary"
              >
                <PlusSquare size={18} />
                Create Post
              </Link>
              <Link
                href={`/community/user/${user.uid}`}
                className="flex items-center gap-2 text-sm font-medium hover:text-primary"
              >
                <UserIcon size={18} />
                My Profile
              </Link>
            </>
          )}

          <div className="pt-3 mt-3 border-t">
            <Link
              href="/community/plan"
              className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <MapIcon size={18} />
              Plan Trip
            </Link>
            <p className="ml-6 text-xs text-muted-foreground">
              Create & share itineraries
            </p>
          </div>
        </Card>
      </aside>

      {/* -------- Main Feed -------- */}
      <main className="col-span-1 lg:col-span-7 space-y-6 pb-20 lg:pb-6">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No posts yet. Be the first to share!
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.uid ?? null}
              />
            ))}
          </div>
        )}
      </main>

      {/* -------- Right Sidebar (Desktop) -------- */}
      <aside className="hidden lg:block col-span-3 space-y-6">
        {user && (
          <Card className="p-6 flex flex-col items-center text-center rounded-2xl shadow-md">
            <Avatar className="h-16 w-16 mb-3">
              <AvatarImage src={displayImage} />
              <AvatarFallback>{fallbackLetter}</AvatarFallback>
            </Avatar>
            <h2 className="font-semibold">{displayName}</h2>
            <div className="mt-4 w-full flex flex-col gap-2">
              <Link href="/community/create">
                <Button variant="outline" className="w-full rounded-full">
                  New Post
                </Button>
              </Link>
              <Link href="/community/feed">
                <Button variant="ghost" className="w-full rounded-full">
                  My Feed
                </Button>
              </Link>
              <Link href={`/community/user/${user.uid}`}>
                <Button variant="ghost" className="w-full rounded-full">
                  My Profile
                </Button>
              </Link>
            </div>
          </Card>
        )}

        <Card className="p-4 text-sm text-muted-foreground rounded-2xl">
          <p>Suggested connections coming soon</p>
        </Card>
      </aside>

      {/* -------- Mobile Bottom Nav -------- */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around items-center h-14 lg:hidden z-50">
        <Link href="/community" className="flex flex-col items-center text-xs">
          <Home size={20} />
          Feed
        </Link>
        {user && (
          <Link
            href="/community/feed"
            className="flex flex-col items-center text-xs"
          >
            <Newspaper size={20} />
            My Feed
          </Link>
        )}
        {user && (
          <Link
            href="/community/create"
            className="flex flex-col items-center text-xs"
          >
            <PlusSquare size={20} />
            Create
          </Link>
        )}
        {user && (
          <Link
            href={`/community/user/${user.uid}`}
            className="flex flex-col items-center text-xs"
          >
            <UserIcon size={20} />
            Profile
          </Link>
        )}
        <Link
          href="/community/plan"
          className="flex flex-col items-center text-xs"
        >
          <MapIcon size={20} />
          Plan
        </Link>
      </nav>
    </div>
  );
}
