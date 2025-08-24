'use client';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import PostCard, { PostForFeed } from '@/app/components/PostCard';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

async function getPosts(): Promise<PostForFeed[]> {
  const res = await fetch('/api/posts', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}

function EmptyFeed() {
  return (
    <div className="flex justify-center items-center py-20">
      <Card className="w-full max-w-md text-center rounded-2xl">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-2">No posts yet</h2>
          <p className="text-muted-foreground mb-6">
            Be the first to share your adventure with the community!
          </p>
          <Link href="/community/create">
            <Button size="lg" className="rounded-xl">Create Your First Post</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
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
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
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
    return (
      <div className="container max-w-7xl py-8">
        <p>Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl py-8">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Community Feed</h1>
        <Link href="/community/create">
          <Button className="rounded-xl">Create Post</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <EmptyFeed />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}