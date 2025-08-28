// src/components/CreatePost.tsx
"use client";

import { useState } from "react";
import ImageUploader from "@/app/components/ImageUploader";
import { auth } from "@/lib/firebase";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return alert("You must be logged in");

    const idToken = await user.getIdToken();

    const payload = {
      title,
      content, // ✅ renamed
      images: images.map((url) => ({ url })), // ✅ renamed
    };

    console.log("🚀 Sending post payload:", JSON.stringify(payload, null, 2));

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("📩 API Response:", data);

    if (!res.ok) {
      alert(`❌ Failed: ${data.error || "Unknown error"}`);
      return;
    }

    setTitle("");
    setContent("");
    setImages([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="border p-2 w-full"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
        className="border p-2 w-full"
      />

      {auth.currentUser && (
        <ImageUploader onUploadComplete={(urls: string[]) => setImages(urls)} />
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`preview-${i}`}
              className="w-40 h-40 object-cover rounded"
            />
          ))}
        </div>
      )}

      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Create Post
      </button>
    </form>
  );
}
