'use client';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import PostCard, { PostForFeed } from '@/app/components/PostCard';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

async function getPosts(): Promise<PostForFeed[]> {
  const res = await fetch('/api/posts', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<PostForFeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        setIsLoading(false);
      }
    };

    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user ? user.uid : null);
    });

    fetchPosts();
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20">Loading feed...</div>;
  }

  if (error) {
    return <div className="flex justify-center py-20 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b py-3 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Community</h1>
        <Link href="/community/create">
          <Button className="rounded-full flex items-center gap-2">
            <PlusCircle size={18} /> Post
          </Button>
        </Link>
      </div>

      {/* Feed */}
      {posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No posts yet — be the first to share your trip ✈️
          <div className="mt-4">
            <Link href="/community/create">
              <Button>Create Post</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}
