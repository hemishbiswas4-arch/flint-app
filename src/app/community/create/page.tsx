// src/app/community/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import ImageUploader from '@/app/components/ImageUploader';
import PathBuilder, { PathPlace } from '@/app/components/PathBuilder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FileText, Image as ImageIcon, Map, ArrowRight, ArrowLeft } from 'lucide-react';
import SignInModal from '@/app/components/SignInModal';

const ProgressStep = ({ step, title, currentStep, setStep }: { step: number; title: string; currentStep: number; setStep: (step: number) => void }) => {
    const isActive = step === currentStep;
    const isCompleted = step < currentStep;
    return (
        <div className="flex items-center cursor-pointer" onClick={() => setStep(step)}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${isActive ? 'bg-primary text-primary-foreground' : isCompleted ? 'bg-primary/50 text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                {isCompleted ? '✔' : step}
            </div>
            <span className={`ml-3 font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</span>
        </div>
    );
};

export default function CreatePostPage() {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [textContent, setTextContent] = useState('');
    const [path, setPath] = useState<PathPlace[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMapsScriptLoaded, setMapsScriptLoaded] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

    const auth = getAuth(firebaseApp);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setIsSignInModalOpen(true);
            }
            setIsLoadingUser(false);
        });
        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        const scriptId = "google-maps-script";
        if (window.google?.maps) {
            setMapsScriptLoaded(true);
            return;
        }
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
            existingScript.addEventListener('load', () => setMapsScriptLoaded(true));
            return;
        }
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setMapsScriptLoaded(true);
        document.head.appendChild(script);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setIsSignInModalOpen(true);
            return;
        }
        setIsSubmitting(true);
        setError(null);

        const idToken = await user.getIdToken();

        const placesWithOrder = path.map((place, index) => ({
            ...place,
            displayOrder: index,
        }));

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    title,
                    textContent,
                    places: placesWithOrder,
                    // ✅ only send real URLs
                    images: imageUrls.filter((url) => url && url.trim() !== ""),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create post.');
            }

            const newPost = await response.json();
            router.push(`/community/posts/${newPost.id}`);

        } catch (err: unknown) {
            let errorMessage = "An unexpected error occurred. Please try again.";
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            console.error("Failed to create post:", err);
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingUser) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Verifying access...</p>
            </div>
        );
    }

    return (
        <>
            <SignInModal
                isOpen={isSignInModalOpen}
                onClose={() => {
                    setIsSignInModalOpen(false);
                    if (!auth.currentUser) {
                        router.push('/');
                    }
                }}
                onSuccess={() => {
                    setIsSignInModalOpen(false);
                    setUser(auth.currentUser);
                }}
            />
            <div className="container max-w-4xl py-4 sm:py-8">
                <div className="flex justify-between items-center mb-8 p-2 bg-secondary rounded-full">
                    <ProgressStep step={1} title="Path" currentStep={step} setStep={setStep} />
                    <div className="flex-grow h-px bg-border mx-2 sm:mx-4" />
                    <ProgressStep step={2} title="Story" currentStep={step} setStep={setStep} />
                    <div className="flex-grow h-px bg-border mx-2 sm:mx-4" />
                    <ProgressStep step={3} title="Images" currentStep={step} setStep={setStep} />
                </div>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardContent className="pt-8 min-h-[400px]">
                            {step === 1 && (
                                <div className="space-y-2 animate-in fade-in-50">
                                    <Label className="text-lg flex items-center gap-2"><Map size={16} /> Where did you go?</Label>
                                    <PathBuilder onPathChange={setPath} isMapsScriptLoaded={isMapsScriptLoaded} />
                                </div>
                            )}
                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in-50">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-lg flex items-center gap-2"><FileText size={16} /> Title</Label>
                                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., A Weekend Getaway in the Mountains" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="textContent" className="text-lg">Your Story</Label>
                                        <Textarea id="textContent" value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="Tell us about your trip, what you loved, and any tips you have!" required rows={12} />
                                    </div>
                                </div>
                            )}
                            {step === 3 && user && (
                                <div className="space-y-2 animate-in fade-in-50">
                                    <Label className="text-lg flex items-center gap-2">
                                        <ImageIcon size={16} /> Add Photos
                                    </Label>
                                    <ImageUploader 
                                        onUploadComplete={(urls) => setImageUrls(urls)} 
                                    />
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 bg-secondary/50 py-4 px-6 rounded-b-lg">
                            <div>
                                {error && <p className="text-sm text-destructive">{error}</p>}
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button variant="outline" type="button" onClick={() => setStep(s => Math.max(s - 1, 1))} disabled={step === 1} className="w-full sm:w-auto">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                                </Button>
                                {step < 3 && (
                                    <Button type="button" onClick={() => setStep(s => Math.min(s + 1, 3))} className="w-full sm:w-auto">
                                        Next <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                                {step === 3 && user &&(
                                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                        {isSubmitting ? 'Publishing...' : 'Publish Post'}
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </>
    );
}
