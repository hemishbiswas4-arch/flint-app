// src/app/community/user/[userId]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PostCard, { PostForFeed } from "@/app/components/PostCard";

interface RawPost {
  id: string;
  title?: string | null;
  caption?: string | null;
  textContent?: string | null;
  createdAt?: string;
  images?: Array<{ url?: string | null } | { imageUrl?: string | null } | string>;
}

interface UserProfile {
  id: string;
  email: string | null;
  image: string | null;
  username?: string | null;
  bio?: string | null;
  coverPhoto?: string | null;
  _count?: { followers: number; following: number };
  isFollowing?: boolean;
}

export default function UserProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const router = useRouter();

  const [viewerId, setViewerId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<RawPost[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const isOwnProfile = useMemo(() => viewerId === userId, [viewerId, userId]);

  // 🔑 Auth
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsub = onAuthStateChanged(auth, (u) => setViewerId(u?.uid ?? null));
    return () => unsub();
  }, []);

  // 📄 Load Profile
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingProfile(true);
        const auth = getAuth(firebaseApp);
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`/api/users/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (res.ok) setProfile(await res.json());
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, [userId]);

  // 📝 Load Posts
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingPosts(true);
        const res = await fetch(`/api/users/${userId}/posts`);
        if (res.ok) setPosts(await res.json());
      } finally {
        setLoadingPosts(false);
      }
    };
    load();
  }, [userId]);

  // 👥 Follow / Unfollow
  const toggleFollow = async () => {
    if (!viewerId || !profile || followBusy) return;
    try {
      setFollowBusy(true);
      const token = await getAuth(firebaseApp).currentUser?.getIdToken();
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: !prev.isFollowing,
                _count: {
                  followers:
                    (prev._count?.followers ?? 0) +
                    (prev.isFollowing ? -1 : 1),
                  following: prev._count?.following ?? 0,
                },
              }
            : prev
        );
      }
    } finally {
      setFollowBusy(false);
    }
  };

  // ❌ Delete account
  const handleDeleteAccount = async () => {
    if (!viewerId || !isOwnProfile) return;
    if (!confirm("Are you sure you want to delete your account?")) return;
    try {
      setDeleteBusy(true);
      const token = await getAuth(firebaseApp).currentUser?.getIdToken();
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        alert("Account deleted.");
        router.push("/");
      }
    } finally {
      setDeleteBusy(false);
    }
  };

  /* ---------------- UI ---------------- */
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center text-muted-foreground">
        {loadingProfile ? "Loading..." : "Unable to load profile."}
      </div>
    );
  }

  const displayName = profile.username?.trim() || profile.email || "Traveler";
  const followers = profile._count?.followers ?? 0;
  const following = profile._count?.following ?? 0;

  return (
    <div className="max-w-3xl mx-auto pb-20 px-3 sm:px-6">
      {/* Cover */}
      <section className="relative">
        <div className="aspect-[3/1] w-full overflow-hidden bg-muted rounded-b-2xl">
          {profile.coverPhoto ? (
            <img
              src={profile.coverPhoto}
              alt="Cover photo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-50 to-sky-50" />
          )}
        </div>

        <div className="px-2 sm:px-6">
          {/* Avatar + name */}
          <div className="relative -mt-10 sm:-mt-14 flex items-end gap-3 sm:gap-4 flex-wrap">
            <img
              src={profile.image || "/default-avatar.png"}
              alt={displayName}
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-background shadow-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-semibold truncate">
                {displayName}
              </h1>
              {profile.bio && (
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
              {!isOwnProfile ? (
                <Button
                  onClick={toggleFollow}
                  disabled={followBusy}
                  className="rounded-full w-full sm:w-auto"
                  variant={profile.isFollowing ? "destructive" : "default"}
                >
                  {profile.isFollowing ? "Unfollow" : "Follow"}
                </Button>
              ) : (
                <>
                  <Link
                    href={`/community/user/${userId}/edit`}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="secondary"
                      className="rounded-full w-full sm:w-auto"
                    >
                      Edit Profile
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="rounded-full w-full sm:w-auto"
                    onClick={handleDeleteAccount}
                    disabled={deleteBusy}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <Card className="mt-3 sm:mt-4 p-3 sm:p-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-base sm:text-lg font-semibold">
                  {followers}
                </div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-semibold">
                  {following}
                </div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-semibold">
                  {posts.length}
                </div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Posts feed */}
      <section className="mt-6">
        {loadingPosts ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground border rounded-xl">
            No journeys shared yet.
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((raw) => {
              const mapped: PostForFeed = {
                id: raw.id,
                title:
                  raw.title ??
                  raw.caption ??
                  raw.textContent ??
                  "Untitled",
                textContent: raw.textContent ?? raw.caption ?? "",
                createdAt: raw.createdAt ?? new Date().toISOString(),
                author: {
                  id: profile.id,
                  email: profile.email ?? "Unknown",
                },
                images: raw.images?.map((img) => {
                  if (typeof img === "string") return img;
                  if (img && typeof img === "object") {
                    if ("url" in img) return (img as any).url ?? "";
                    if ("imageUrl" in img) return (img as any).imageUrl ?? "";
                  }
                  return "";
                }),
                _count: { likes: 0, comments: 0 },
                likes: [],
              };

              return (
                <PostCard
                  key={mapped.id}
                  post={mapped}
                  currentUserId={viewerId}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
