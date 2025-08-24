'use client';

import { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { nanoid } from 'nanoid';
import { UploadCloud } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
}

export default function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, number>>({});
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const auth = getAuth(firebaseApp);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const user = auth.currentUser;
    if (!user) {
        alert("You must be signed in to upload images.");
        return;
    }

    files.forEach(file => {
      const fileId = nanoid();
      const storage = getStorage(firebaseApp);
      const storageRef = ref(storage, `posts/${user.uid}/${fileId}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadingFiles(prev => ({ ...prev, [fileId]: progress }));
        },
        (error) => {
          console.error("Upload failed:", error);
          setUploadingFiles(prev => {
            const newState = { ...prev };
            delete newState[fileId];
            return newState;
          });
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadedUrls(prev => {
            const newUrls = [...prev, downloadURL];
            onUploadComplete(newUrls); // Notify parent
            return newUrls;
          });
          setUploadingFiles(prev => {
            const newState = { ...prev };
            delete newState[fileId];
            return newState;
          });
        }
      );
    });
  };

  return (
    <div className="space-y-2">
      <Label>Images</Label>
        <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-accent">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 5MB)</p>
                </div>
                <input id="file-upload" type="file" className="hidden" multiple onChange={handleFileChange} accept="image/*" />
            </label>
        </div> 
        
        {Object.entries(uploadingFiles).map(([id, progress]) => (
            <div key={id} className="text-sm text-muted-foreground">
                Uploading...
                <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        ))}

        {uploadedUrls.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 pt-2">
                {uploadedUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                        <img src={url} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}