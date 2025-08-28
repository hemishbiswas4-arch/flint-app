//src/app/components/PostCard.tsx
import Link from "next/link";
import { MessageSquare, Share2, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import LikeButton from "./LikeButton";
import SafeImage from "@/components/SafeImage";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export type PostForFeed = {
  id: string;
  title: string;
  textContent: string;
  createdAt: string;
  author: {
    id: string;
    email: string;
    username?: string | null;
    image?: string | null;
  };
  images?: { imageUrl: string }[] | string[];
  _count?: {
    likes: number;
    comments?: number;
  };
  likes?: { userId: string }[];
};

interface PostCardProps {
  post: PostForFeed;
  currentUserId?: string | null;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const likesArray = post.likes ?? [];
  const commentsCount = post._count?.comments ?? 0;
  const likesCount = post._count?.likes ?? likesArray.length;
  const isLikedByCurrentUser = likesArray.some(
    (like) => like.userId === currentUserId
  );

  const normalizedImages =
    Array.isArray(post.images) && post.images.length > 0
      ? (post.images as any[]).map((img) =>
          typeof img === "string" ? img : img.imageUrl
        )
      : [];

  const mainImage = normalizedImages[0];
  const displayName = post.author.username || post.author.email;
  const avatarFallback =
    post.author.username?.[0]?.toUpperCase() ??
    post.author.email?.[0]?.toUpperCase() ??
    "U";

  const handleShare = async () => {
    const url = `${window.location.origin}/community/posts/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.textContent,
          url,
        });
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <Card className="overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 backdrop-blur-md flex flex-col">
      {/* Author strip */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-transparent border-b border-slate-200 dark:border-slate-800">
        <Link
          href={`/community/user/${post.author.id}`}
          className="flex items-center gap-3 group"
        >
          <Avatar className="h-10 w-10 ring-2 ring-primary/30 group-hover:ring-primary transition">
            <AvatarImage src={post.author.image || undefined} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm group-hover:text-primary transition">
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock size={12} />{" "}
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </Link>
      </div>

      {/* Image */}
      {mainImage && (
        <Link
          href={`/community/posts/${post.id}`}
          className="block w-full relative group"
        >
          <SafeImage
            src={mainImage}
            alt={post.title}
            className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3">
            <h2 className="text-base sm:text-lg font-semibold text-white drop-shadow line-clamp-2">
              {post.title}
            </h2>
          </div>
        </Link>
      )}

      {/* Header (title if no image) */}
      <CardHeader className="pb-2">
        {!mainImage && (
          <h2 className="text-base sm:text-lg font-semibold mb-1">
            <Link
              href={`/community/posts/${post.id}`}
              className="hover:text-primary transition-colors line-clamp-2"
            >
              {post.title}
            </Link>
          </h2>
        )}
      </CardHeader>

      {/* Text Content */}
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
          {post.textContent}
        </p>
      </CardContent>

      {/* Footer Actions */}
      <CardFooter className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialLikes={likesCount}
            isInitiallyLiked={isLikedByCurrentUser}
          />
          <Link
            href={`/community/posts/${post.id}#comments`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageSquare size={16} />
            <span>{commentsCount > 0 ? commentsCount : "Comment"}</span>
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
