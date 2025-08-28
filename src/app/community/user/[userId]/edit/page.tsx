// src/app/community/user/[userId]/edit/page.tsx
// src/app/community/user/[userId]/edit/page.tsx
"use client";

import { useState } from "react";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ProfileImageUploader from "@/app/components/profileimageuploader";

export default function EditProfilePage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const auth = getAuth(firebaseApp);
    const token = await auth.currentUser?.getIdToken();
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${auth.currentUser?.uid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          bio,
          image: avatarUrl ?? null,
          coverPhoto: coverUrl ?? null,
        }),
      });

      if (!res.ok) {
        console.error("❌ Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 pb-24 space-y-10">
      {/* Page title */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
          Edit Your Journey
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Update your profile and let the world know about your next adventure ✦
        </p>
      </div>

      {/* Cover Photo Section */}
      <div className="space-y-2">
        <p className="font-semibold text-gray-700">Cover Photo</p>
        <div className="rounded-2xl border bg-gradient-to-br from-sky-50 to-white shadow-sm p-4">
          <ProfileImageUploader
            label="Upload Cover Photo"
            onUploadComplete={(url) => setCoverUrl(url)}
          />
          {coverUrl && (
            <img
              src={coverUrl}
              alt="Cover Preview"
              className="mt-3 w-full h-40 sm:h-52 object-cover rounded-xl"
            />
          )}
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="space-y-2">
        <p className="font-semibold text-gray-700">Profile Picture</p>
        <div className="rounded-2xl border bg-gradient-to-br from-indigo-50 to-white shadow-sm p-4 flex flex-col items-center">
          <ProfileImageUploader
            label="Upload Profile Picture"
            onUploadComplete={(url) => setAvatarUrl(url)}
          />
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="Avatar Preview"
              className="mt-3 w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
            />
          )}
        </div>
      </div>

      {/* Profile fields */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            className="rounded-xl border-gray-200 shadow-sm focus:border-sky-500 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell your story... Where have you been? What’s next?"
            className="rounded-xl border-gray-200 shadow-sm focus:border-sky-500 focus:ring-sky-500 min-h-[100px]"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="pt-4">
        <Button
          className="w-full h-12 text-lg rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold shadow-md hover:opacity-90 transition"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
