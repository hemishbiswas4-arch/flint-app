import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
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
        author: { select: { id: true, email: true, image: true } },
        images: { select: { imageUrl: true } },
        places: { orderBy: { displayOrder: 'asc' } },
        comments: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { email: true, image: true } } },
        },
      },
    });

    if (!post) return null;

    return {
      ...post,
      images: post.images.map((img: { imageUrl: string }) => img.imageUrl),
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
        <div className="lg:col-span-2">
          {/* ✅ Main Image */}
          {mainImage && (
            <div className="mb-6 bg-black rounded-xl overflow-hidden flex items-center justify-center">
              <SafeImage
                src={mainImage}
                alt={post.title}
                className="w-full max-h-[500px] object-contain"
              />
            </div>
          )}

          {/* ✅ Gallery */}
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {galleryImages.map((img: string, idx: number) => (
                <div
                  key={idx}
                  className="bg-black rounded-lg overflow-hidden flex items-center justify-center"
                >
                  <SafeImage
                    src={img}
                    alt={`Gallery image ${idx + 1}`}
                    className="w-full h-48 object-contain"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Title + Delete */}
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {post.title}
            </h1>
            <DeletePostButton postId={post.id} authorId={authorId} />
          </div>

          {/* Author + Date */}
          <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author.image || undefined} />
                <AvatarFallback>
                  {post.author.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{post.author.email}</span>
            </div>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>{post.textContent}</p>
          </div>

          {/* Comments */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Comments</h2>
            <CommentSection postId={post.id} initialComments={post.comments} />
          </div>
        </div>

        {/* Places Sidebar */}
        <div className="lg:col-span-1 mt-12 lg:mt-0">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="text-primary" />
                  The Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border -z-10" />
                  <ul className="space-y-4">
                    {post.places.map(
                      (
                        place: PostWithRelations["places"][number],
                        index: number
                      ) => (
                        <li key={place.id} className="flex items-center gap-4">
                          <div className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center font-bold z-10 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-grow">
                            <p className="font-semibold">{place.name}</p>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                place.name
                              )}&query_place_id=${place.googlePlaceId ?? ""}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                            >
                              Open in Maps <ExternalLink size={12} />
                            </a>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
