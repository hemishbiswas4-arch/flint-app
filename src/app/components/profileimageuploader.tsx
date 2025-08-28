// src/app/components/ProfileImageUploader.tsx
// src/app/components/ProfileImageUploader.tsx
"use client";

import { useState, useCallback } from "react";
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
import Cropper from "react-easy-crop";

interface ProfileImageUploaderProps {
  label: string;
  onUploadComplete: (url: string) => void;
}

export default function ProfileImageUploader({
  label,
  onUploadComplete,
}: ProfileImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // crop mode
  const [cropMode, setCropMode] = useState<"circle" | "square" | "rect">(
    "circle"
  );

  const auth = getAuth(firebaseApp);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("❌ File too large (max 5MB).");
      return;
    }
    setSelectedFile(file);
  };

  // turn cropped area into a Blob
  async function getCroppedImg(imageSrc: string, crop: any) {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((res) => (image.onload = res));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    });
  }

  const uploadCroppedImage = async () => {
    if (!selectedFile || !croppedAreaPixels) return;

    const user = auth.currentUser;
    if (!user) {
      alert("❌ You must be signed in to upload images.");
      return;
    }

    const imageDataUrl = URL.createObjectURL(selectedFile);
    const croppedBlob = await getCroppedImg(imageDataUrl, croppedAreaPixels);
    if (!croppedBlob) return;

    const fileId = nanoid();
    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `profile/${user.uid}/${fileId}.jpg`);

    const uploadTask = uploadBytesResumable(storageRef, croppedBlob);
    setUploading(true);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(pct);
      },
      (error) => {
        console.error("🔥 Upload failed:", error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setUploadedUrl(downloadURL);
        setSelectedFile(null);
        setUploading(false);
        setProgress(100);
        onUploadComplete(downloadURL);
      }
    );
  };

  const removeImage = () => {
    setUploadedUrl(null);
    setSelectedFile(null);
    setProgress(0);
    onUploadComplete("");
  };

  // aspect ratio based on mode
  const aspect = cropMode === "circle" || cropMode === "square" ? 1 : 16 / 9;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>

      {!uploadedUrl && !selectedFile && (
        <label
          htmlFor={`file-upload-${label}`}
          className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer bg-gradient-to-br from-secondary/60 to-secondary hover:from-primary/5 hover:to-primary/10 transition-all shadow-sm hover:shadow-md"
        >
          <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground font-medium">
            Drag & drop or <span className="text-primary">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">JPG, PNG, GIF up to 5MB</p>
          <input
            id={`file-upload-${label}`}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      )}

      {selectedFile && !uploadedUrl && (
        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
          <Cropper
            image={URL.createObjectURL(selectedFile)}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropMode === "circle" ? "round" : "rect"}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />

          {/* controls */}
          <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center gap-2 px-2">
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCropMode("circle")}
                className={`px-2 py-1 text-xs rounded ${
                  cropMode === "circle"
                    ? "bg-primary text-white"
                    : "bg-gray-200"
                }`}
              >
                Circle
              </button>
              <button
                type="button"
                onClick={() => setCropMode("square")}
                className={`px-2 py-1 text-xs rounded ${
                  cropMode === "square"
                    ? "bg-primary text-white"
                    : "bg-gray-200"
                }`}
              >
                Square
              </button>
              <button
                type="button"
                onClick={() => setCropMode("rect")}
                className={`px-2 py-1 text-xs rounded ${
                  cropMode === "rect"
                    ? "bg-primary text-white"
                    : "bg-gray-200"
                }`}
              >
                16:9
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={uploadCroppedImage}
                className="px-3 py-1 bg-primary text-white rounded-full shadow"
              >
                Save
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="px-3 py-1 bg-gray-500 text-white rounded-full shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadedUrl && (
        <div className="relative w-fit mx-auto">
          <img
            src={uploadedUrl}
            alt="Uploaded preview"
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-md"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 shadow transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {uploading && (
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
