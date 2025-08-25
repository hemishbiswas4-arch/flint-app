// src/app/components/ImageUploader.tsx
"use client";

import { useState, useEffect } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import { nanoid } from "nanoid";
import { UploadCloud, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
}

export default function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, number>>({});
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
      console.error("Upload aborted: no authenticated user.");
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`❌ File ${file.name} is too large (max 5MB).`);
        console.error("File too large:", file.name, file.size);
        return;
      }

      const fileId = nanoid();
      const storage = getStorage(firebaseApp);
      const storageRef = ref(storage, `posts/${user.uid}/${fileId}-${file.name}`);
      console.log("Starting upload:", storageRef.fullPath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Uploading ${file.name}: ${progress.toFixed(2)}%`);
          setUploadingFiles((prev) => ({ ...prev, [fileId]: progress }));
        },
        (error) => {
          console.error("🔥 Upload failed:", error.code, error.message);
          alert(`Failed to upload ${file.name}: ${error.message}`);
          setUploadingFiles((prev) => {
            const newState = { ...prev };
            delete newState[fileId];
            return newState;
          });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("✅ File uploaded, available at:", downloadURL);

            setUploadedUrls((prev) => [...prev, downloadURL]); // ✅ only update child state

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
    <div className="space-y-2">
      <Label>Images</Label>

      {/* Upload box */}
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-accent"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 5MB)</p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* Progress bars */}
      {Object.entries(uploadingFiles).map(([id, progress]) => (
        <div key={id} className="text-sm text-muted-foreground">
          Uploading... {progress.toFixed(0)}%
          <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ))}

      {/* Preview of uploaded images */}
      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 pt-2">
          {uploadedUrls.map((url, index) => (
            <div key={index} className="relative aspect-square group">
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
