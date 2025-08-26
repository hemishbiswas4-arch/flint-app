'use client';

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PostCard, { PostForFeed } from "@/app/components/PostCard";
import DeletePostButton from "@/app/components/DeletePostButton";

export default function MyAccountPage() {
  const [posts, setPosts] = useState<PostForFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/home"); // redirect if not logged in
      } else {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const fetchPosts = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/posts`, {
          cache: "no-store",
        });
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Error loading user posts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  if (loading) return <div className="flex justify-center py-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground">You haven’t posted anything yet.</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="relative">
              <PostCard post={post} currentUserId={userId} />
              <div className="absolute top-2 right-2">
                <DeletePostButton postId={post.id} authorId={userId!} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
