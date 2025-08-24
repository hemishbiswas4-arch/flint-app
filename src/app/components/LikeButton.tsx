'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { getAuth } from 'firebase/auth';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  isInitiallyLiked: boolean;
}

export default function LikeButton({ postId, initialLikes, isInitiallyLiked }: LikeButtonProps) {
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
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const idToken = await user.getIdToken();
      await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
    } catch (error) {
      console.error('Failed to update like status:', error);
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
        className={
          isLiked
            ? 'fill-primary text-primary'
            : 'text-muted-foreground hover:fill-primary/50 hover:text-primary'
        }
      />
      <span className={isLiked ? 'text-primary' : 'text-muted-foreground'}>
        {likes}
      </span>
    </button>
  );
}
