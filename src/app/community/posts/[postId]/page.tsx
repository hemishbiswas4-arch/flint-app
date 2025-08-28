// src/app/community/posts/[postId]/page.tsx
// src/app/community/posts/[postId]/page.tsx
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeletePostButton from '@/app/components/DeletePostButton';
import CommentSection from '@/components/CommentSection';
import SafeImage from "@/components/SafeImage";

async function getPost(postId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, username: true, email: true, image: true } },
        images: { select: { imageUrl: true } },
        places: { orderBy: { displayOrder: 'asc' } },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { id: true, username: true, email: true, image: true },
            },
          },
        },
      },
    });

    if (!post) return null;

    return {
      ...post,
      images: post.images.map((img) => img.imageUrl),
      comments: post.comments.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
      createdAt: post.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("❌ Error fetching post:", error);
    return null;
  }
}

type PostWithRelations = NonNullable<Awaited<ReturnType<typeof getPost>>>;

export default async function SinglePostPage(
  props: { params: Promise<{ postId: string }> }
) {
  const { postId } = await props.params;
  const post = await getPost(postId);

  if (!post) return notFound();
  if (!post.author?.id) return notFound();

  const authorId = post.author.id;
  const mainImage: string | undefined = post.images[0];
  const galleryImages: string[] = post.images.slice(1);

  return (
    <div className="container max-w-5xl py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
        {/* Left: main content */}
        <div className="lg:col-span-2">
          {/* ✅ Main Image */}
          {mainImage && (
            <div className="mb-6 rounded-xl overflow-hidden shadow-md">
              <SafeImage
                src={mainImage}
                alt={post.title}
                className="w-full max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* ✅ Gallery */}
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className="rounded-lg overflow-hidden shadow-sm"
                >
                  <SafeImage
                    src={img}
                    alt={`Gallery image ${idx + 1}`}
                    className="w-full h-40 object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Title + Delete */}
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {post.title}
            </h1>
            <DeletePostButton postId={post.id} authorId={authorId} />
          </div>

          {/* Author + Date (Clickable Profile) */}
          <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
            <Link
              href={`/community/user/${post.author.id}`}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author.image || undefined} />
                <AvatarFallback>
                  {post.author.username?.[0]?.toUpperCase() ??
                   post.author.email?.[0]?.toUpperCase() ??
                   "U"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {post.author.username || post.author.email}
              </span>
            </Link>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed">
            <p>{post.textContent}</p>
          </div>

          {/* Comments */}
          <div className="mt-12 border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">
              Comments ({post.comments.length})
            </h2>

            {/* ✅ CommentSection already receives user info */}
            <CommentSection postId={post.id} initialComments={post.comments} />
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="lg:col-span-1 mt-12 lg:mt-0">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="text-primary" />
                  Trip Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="relative space-y-6">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  {post.places.map((place, index) => (
                    <li key={place.id} className="flex items-start gap-4 relative z-10">
                      <div className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{place.name}</p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            place.name
                          )}&query_place_id=${place.googlePlaceId ?? ""}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                        >
                          Open in Maps <ExternalLink size={12} />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
