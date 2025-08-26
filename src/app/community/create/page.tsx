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
import { Card } from '@/components/ui/card';
import { FileText, Image as ImageIcon, Map, ArrowRight, ArrowLeft } from 'lucide-react';
import SignInModal from '@/app/components/SignInModal';

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
      if (!currentUser) setIsSignInModalOpen(true);
      setIsLoadingUser(false);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (window.google?.maps) {
      setMapsScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setIsSignInModalOpen(true);

    setIsSubmitting(true);
    setError(null);

    try {
      const idToken = await user.getIdToken();
      const placesWithOrder = path.map((place, index) => ({
        ...place,
        displayOrder: index,
      }));

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          title,
          textContent,
          places: placesWithOrder,
          images: imageUrls.filter((url) => url.trim() !== ""),
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create post');

      const newPost = await res.json();
      router.push(`/community/posts/${newPost.id}`);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingUser) return <div className="flex h-screen items-center justify-center">Verifying access...</div>;

  return (
    <>
      <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} onSuccess={() => setUser(auth.currentUser)} />
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left = Editor */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          {step === 1 && (
            <Card className="p-6 space-y-4">
              <Label className="text-lg flex items-center gap-2"><Map size={18}/> Where did you go?</Label>
              <PathBuilder onPathChange={setPath} isMapsScriptLoaded={isMapsScriptLoaded} />
              <Button className="mt-4" onClick={() => setStep(2)}>Next <ArrowRight size={16}/></Button>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-6 space-y-4">
              <Label htmlFor="title" className="flex items-center gap-2"><FileText size={18}/> Trip Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., My Goa Escape" required />
              <Label htmlFor="textContent">Your Story</Label>
              <Textarea id="textContent" rows={8} value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="Share your adventure..." required />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft size={16}/> Back</Button>
                <Button onClick={() => setStep(3)}>Next <ArrowRight size={16}/></Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-6 space-y-4">
              <Label className="flex items-center gap-2"><ImageIcon size={18}/> Add Photos</Label>
              <ImageUploader onUploadComplete={setImageUrls}/>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft size={16}/> Back</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Publishing..." : "Publish Post"}</Button>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </Card>
          )}
        </form>

        {/* Right = Live Preview */}
        <div className="hidden lg:block flex-1 sticky top-20">
          <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
          <Card className="p-6 space-y-3">
            <h3 className="font-bold text-xl">{title || "Your Trip Title"}</h3>
            <p className="text-sm text-muted-foreground">{textContent || "Your story preview will appear here..."}</p>
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {imageUrls.map((url, i) => <img key={i} src={url} alt="preview" className="rounded-lg object-cover"/>)}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
