//src/app/community/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import ImageUploader from "@/app/components/ImageUploader";
import PathBuilder, { PathPlace } from "@/app/components/PathBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Image as ImageIcon,
  Map,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import SignInModal from "@/app/components/SignInModal";

export default function CreatePostPage() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
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
    const script = document.createElement("script");
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

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          title,
          textContent,
          places: placesWithOrder,
          images: imageUrls.filter((url) => url.trim() !== ""),
        }),
      });

      if (!res.ok)
        throw new Error((await res.json()).error || "Failed to create post");

      const newPost = await res.json();
      router.push(`/community/posts/${newPost.id}`);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingUser)
    return (
      <div className="flex h-screen items-center justify-center">
        Verifying access...
      </div>
    );

  return (
    <>
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSuccess={() => setUser(auth.currentUser)}
      />

      <div className="max-w-6xl mx-auto px-3 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 bg-muted/30 rounded-xl">
        {/* Left: Composer */}
        <form
          onSubmit={handleSubmit}
          className="col-span-1 lg:col-span-8 space-y-4"
        >
          {step === 1 && (
            <Card className="p-4 space-y-3 rounded-xl shadow-sm">
              <Label className="text-sm flex items-center gap-2 font-medium">
                <Map size={16} /> Where did you go?
              </Label>
              <PathBuilder
                onPathChange={setPath}
                isMapsScriptLoaded={isMapsScriptLoaded}
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setStep(2)} className="rounded-full">
                  Next <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-4 space-y-3 rounded-xl shadow-sm">
              <Label
                htmlFor="title"
                className="flex items-center gap-2 font-medium text-sm"
              >
                <FileText size={16} /> Trip Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., My Goa Escape"
                required
              />

              <Label htmlFor="textContent" className="font-medium text-sm">
                Your Story
              </Label>
              <Textarea
                id="textContent"
                rows={5}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Share your adventure..."
                required
              />

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="rounded-full"
                >
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button size="sm" onClick={() => setStep(3)} className="rounded-full">
                  Next <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-4 space-y-3 rounded-xl shadow-sm">
              <Label className="flex items-center gap-2 font-medium text-sm">
                <ImageIcon size={16} /> Add Photos
              </Label>
              <ImageUploader onUploadComplete={setImageUrls} />

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(2)}
                  className="rounded-full"
                >
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="rounded-full"
                >
                  {isSubmitting ? "Publishing..." : "Publish Post"}
                </Button>
              </div>

              {error && (
                <p className="text-red-500 text-xs font-medium">{error}</p>
              )}
            </Card>
          )}
        </form>

        {/* Right: Live Preview */}
        <div className="hidden lg:block col-span-4 sticky top-20">
          <Card className="p-4 rounded-xl shadow-sm">
            <h2 className="text-base font-semibold mb-2">Live Preview</h2>
            <h3 className="font-bold text-lg mb-1">
              {title || "Your Trip Title"}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-5">
              {textContent || "Your story preview will appear here..."}
            </p>
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="preview"
                    className="rounded-md object-cover"
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
