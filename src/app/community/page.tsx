'use client'; // Add this directive at the very top

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import PostCard, { PostForFeed } from '@/app/components/PostCard';
import { useState, useEffect } from 'react';

// This is where you would fetch your posts
async function getPosts() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data');
    }

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
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        const auth = getAuth(firebaseApp);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUserId(user.uid);
            } else {
                setCurrentUserId(null);
            }
            fetchPosts();
        });

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
            <h1 className="text-3xl font-bold mb-8">Community Feed</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={currentUserId}
                        />
                    ))
                ) : (
                    <p className="col-span-full text-center text-muted-foreground">
                        No posts found.
                    </p>
                )}
            </div>
        </div>
    );
}