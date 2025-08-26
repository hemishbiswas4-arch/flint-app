"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PostCard, { PostForFeed } from "@/app/components/PostCard";
import DeletePostButton from "@/app/components/DeletePostButton";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";

interface UserProfile {
  id: string;
  email: string | null;
  image: string | null;
}

export default function UserProfilePage() {
  const params = useParams<{ userId: string }>();
  const { userId } = params;
  const [posts, setPosts] = useState<PostForFeed[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUserId(firebaseUser ? firebaseUser.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // get user info
        const userRes = await fetch(`/api/users/${userId}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        // get posts
        const postsRes = await fetch(`/api/users/${userId}/posts`);
        if (postsRes.ok) {
          const data = await postsRes.json();
          setPosts(data);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading)
    return <p className="p-6 text-center text-muted-foreground">Loading profile...</p>;
  if (!user)
    return <p className="p-6 text-center text-muted-foreground">User not found.</p>;

  return (
    <div className="container max-w-3xl py-6 sm:py-10 px-4">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <img
          src={user.image || "/default-avatar.png"}
          alt={user.email || "User"}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border shadow-md object-cover"
        />
        <h1 className="mt-4 text-xl sm:text-2xl font-bold">
          {user.email ?? "Unnamed User"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl bg-muted/30">
          <p className="text-muted-foreground">
            {user.email ?? "This user"} hasn’t posted anything yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="relative">
              <PostCard post={post} currentUserId={currentUserId} />
              {currentUserId === userId && (
                <div className="absolute top-2 right-2">
                  <DeletePostButton postId={post.id} authorId={userId} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
