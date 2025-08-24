import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LikeButton } from './LikeButton'; // Correctly import as a named export

export type PostForFeed = {
  id: string;
  title: string;
  textContent: string;
  createdAt: string;
  author: {
    id: string;
    email: string;
  };
  images: { imageUrl: string }[];
  _count: {
    likes: number;
  };
  likes: { userId: string }[];
};

interface PostCardProps {
  post: PostForFeed;
  currentUserId?: string | null;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const isLikedByCurrentUser = post.likes.some(like => like.userId === currentUserId);

  return (
    <Card className="overflow-hidden flex flex-col">
      {post.images[0] && (
        <Link href={`/community/posts/${post.id}`} className="block aspect-video overflow-hidden">
          <img
            src={post.images[0].imageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </Link>
      )}
      <CardHeader>
        <CardTitle>
          <Link href={`/community/posts/${post.id}`} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground pt-1">
          Posted by {post.author.email}
        </p>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {post.textContent}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <LikeButton
            postId={post.id}
            initialLikes={post._count.likes}
            isInitiallyLiked={isLikedByCurrentUser}
          />
          <Link href={`/community/posts/${post.id}#comments`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            <MessageSquare size={16} />
            <span>Comment</span>
          </Link>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </CardFooter>
    </Card>
  );
}