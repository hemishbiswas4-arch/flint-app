// src/app/components/DeletePostButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react';

interface DeletePostButtonProps {
  postId: string;
  authorId: string;
}

export default function DeletePostButton({ postId, authorId }: DeletePostButtonProps) {
  const [isCurrentUserAuthor, setIsCurrentUserAuthor] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsCurrentUserAuthor(user?.uid === authorId);
    });
    return () => unsubscribe();
  }, [auth, authorId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const user = auth.currentUser;
    if (!user) {
      alert("You must be signed in to delete a post.");
      setIsDeleting(false);
      return;
    }
    
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` },
      });

      if (!response.ok) throw new Error("Failed to delete the post.");
      
      router.push('/community');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting the post.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isCurrentUserAuthor) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" /> Delete Post
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your post.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Yes, delete it"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
