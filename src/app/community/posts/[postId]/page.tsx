// src/app/community/posts/[postId]/page.tsx
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeletePostButton from '@/components/DeletePostButton';

async function getPost(postId: string) {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
            author: { select: { id: true, email: true, image: true } },
            images: { select: { imageUrl: true } },
            places: { orderBy: { displayOrder: 'asc' } },
        },
    });
    return post;
}

export default async function SinglePostPage({ params }: { params: { postId: string } }) {
    // FIX: Changed from params.postId to props.params.postId to fix the async warning
    const post = await getPost(params.postId);

    if (!post) {
        notFound();
    }
    
    // Check if authorId is available. This is a common point of error.
    if (!post.author || !post.author.id) {
        console.error('Post author or author ID not found');
        return notFound();
    }
    
    // You must also include 'authorId' in the prisma query to use it here.
    const authorId = post.author.id;

    const mainImage = post.images[0];
    const galleryImages = post.images.slice(1);

    return (
        <div className="container max-w-6xl py-8 sm:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
                <div className="lg:col-span-2">
                    {mainImage && (
                        <div className="mb-8">
                            <img src={mainImage.imageUrl} alt={post.title} className="w-full aspect-[16/9] object-cover rounded-lg shadow-lg" />
                        </div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
                        <DeletePostButton postId={post.id} authorId={authorId} /> {/* FIX: Use the correct variable */}
                    </div>
                    <div className="flex items-center gap-4 mb-8 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={post.author.image || undefined} />
                                <AvatarFallback>{post.author.email?.[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{post.author.email}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <p>{post.textContent}</p>
                    </div>
                </div>
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
                                        {post.places.map((place, index) => (
                                            <li key={place.id} className="flex items-center gap-4">
                                                <div className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center font-bold z-10 flex-shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="font-semibold">{place.name}</p>
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.googlePlaceId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                                                    >
                                                        Open in Maps <ExternalLink size={12} />
                                                    </a>
                                                </div>
                                            </li>
                                        ))}
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