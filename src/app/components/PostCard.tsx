import Link from "next/link";
import { MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LikeButton from "./LikeButton";
import SafeImage from "@/components/SafeImage";

export type PostForFeed = {
  id: string;
  title: string;
  textContent: string;
  createdAt: string;
  author: {
    id: string;
    email: string;
  };
  images: string[];
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
  const isLikedByCurrentUser = post.likes.some(
    (like) => like.userId === currentUserId
  );

  const mainImage = post.images[0];

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow rounded-2xl">
      {/* ✅ Image */}
      {mainImage && (
        <Link
          href={`/community/posts/${post.id}`}
          className="block bg-black max-h-64 flex items-center justify-center"
        >
          <SafeImage
            src={mainImage}
            alt={post.title}
            className="w-full h-64 object-contain"
          />
        </Link>
      )}

      {/* ✅ Content */}
      <CardHeader>
        <CardTitle className="text-xl font-semibold leading-tight">
          <Link
            href={`/community/posts/${post.id}`}
            className="hover:text-primary transition-colors line-clamp-2"
          >
            {post.title}
          </Link>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Posted by {post.author.email}
        </p>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {post.textContent}
        </p>
      </CardContent>

      {/* ✅ Footer */}
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div className="flex items-center gap-4">
          <LikeButton
            postId={post.id}
            initialLikes={post._count.likes}
            isInitiallyLiked={isLikedByCurrentUser}
          />
          <Link
            href={`/community/posts/${post.id}#comments`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
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
