// src/app/components/LikeButton.tsx
'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
    postId: string;
    initialLikes: number;
    isInitiallyLiked: boolean;
}

const LikeButton = ({ postId, initialLikes, isInitiallyLiked }: LikeButtonProps) => {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(isInitiallyLiked);
    const [isLoading, setIsLoading] = useState(false);

    const handleLike = async () => {
        if (isLoading) return;

        setIsLoading(true);

        const newIsLiked = !isLiked;
        const newLikes = newIsLiked ? likes + 1 : likes - 1;

        setIsLiked(newIsLiked);
        setLikes(newLikes);

        try {
            await fetch(`/api/posts/${postId}/like`, {
                method: 'POST',
                // No need for a body, the user is authenticated via the session
            });
        } catch (error) {
            console.error('Failed to update like status:', error);
            // Revert on error
            setIsLiked(isInitiallyLiked);
            setLikes(initialLikes);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            className="flex items-center gap-1 text-sm transition-colors"
            disabled={isLoading}
        >
            <Heart
                size={16}
                className={isLiked ? 'fill-primary text-primary' : 'text-muted-foreground hover:fill-primary/50 hover:text-primary'}
            />
            <span className={isLiked ? 'text-primary' : 'text-muted-foreground'}>
                {likes}
            </span>
        </button>
    );
};

export default LikeButton;