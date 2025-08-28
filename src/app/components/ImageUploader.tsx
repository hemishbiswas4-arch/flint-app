// src/app/components/ImageUploader.tsx
"use client";

import { useState, useEffect } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import { nanoid } from "nanoid";
import { UploadCloud, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
}

export default function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, number>>(
    {}
  );
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const auth = getAuth(firebaseApp);

  // ✅ Sync uploadedUrls → parent safely
  useEffect(() => {
    onUploadComplete(uploadedUrls);
  }, [uploadedUrls, onUploadComplete]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const user = auth.currentUser;
    if (!user) {
      alert("❌ You must be signed in to upload images.");
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`❌ File ${file.name} is too large (max 5MB).`);
        return;
      }

      const fileId = nanoid();
      const storage = getStorage(firebaseApp);
      const storageRef = ref(
        storage,
        `posts/${user.uid}/${fileId}-${file.name}`
      );

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadingFiles((prev) => ({ ...prev, [fileId]: progress }));
        },
        (error) => {
          console.error("🔥 Upload failed:", error);
          setUploadingFiles((prev) => {
            const newState = { ...prev };
            delete newState[fileId];
            return newState;
          });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadedUrls((prev) => [...prev, downloadURL]);
            setUploadingFiles((prev) => {
              const newState = { ...prev };
              delete newState[fileId];
              return newState;
            });
          } catch (err) {
            console.error("🔥 Failed to get download URL:", err);
          }
        }
      );
    });
  };

  const removeImage = (url: string) => {
    setUploadedUrls((prev) => prev.filter((u) => u !== url));
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Upload Images</Label>

      {/* Upload dropzone */}
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer bg-gradient-to-br from-secondary/60 to-secondary hover:from-primary/5 hover:to-primary/10 transition-all shadow-sm hover:shadow-md"
      >
        <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground font-medium">
          Drag & drop or <span className="text-primary">browse files</span>
        </p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, GIF up to 5MB each
        </p>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>

      {/* Progress bars */}
      {Object.entries(uploadingFiles).map(([id, progress]) => (
        <div key={id} className="space-y-1">
          <p className="text-xs text-muted-foreground">Uploading… {progress.toFixed(0)}%</p>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ))}

      {/* Preview gallery */}
      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
          {uploadedUrls.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden shadow-sm group"
            >
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 shadow transition"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
