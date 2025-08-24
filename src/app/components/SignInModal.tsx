'use client';

import React from 'react';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SignInModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

// FIX: This is the new, multi-colored Google logo SVG
const GoogleIcon = () => (
    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, 27.009001, -27.009001)">
            <g transform="matrix(0.045, 0, 0, 0.045, -27.009001, 27.009001)">
                <path d="M488,261.8C488,403.3,381.5,512,244,512C110.3,512,0,401.7,0,265.9C0,141.2,110.3,32,244,32 C321.4,32,387.6,62.2,433.8,104.4L368.2,169.1C340.7,145.4,297.9,121.3,244,121.3C156.4,121.3,86.1,190.5,86.1,277.9 C86.1,365.3,156.4,434.5,244,434.5C305.8,434.5,348.2,409.8,372.4,386.5C391.3,368.2,404.6,342.6,411.1,308.6L244,308.6 L244,225.9L479.9,225.9C482.3,238.9,488,261.8,488,261.8" fill="#4285F4" fillRule="evenodd"/>
                <path d="M488,261.8C488,403.3,381.5,512,244,512C110.3,512,0,401.7,0,265.9C0,141.2,110.3,32,244,32 C321.4,32,387.6,62.2,433.8,104.4L368.2,169.1C340.7,145.4,297.9,121.3,244,121.3C156.4,121.3,86.1,190.5,86.1,277.9 C86.1,365.3,156.4,434.5,244,434.5C305.8,434.5,348.2,409.8,372.4,386.5C391.3,368.2,404.6,342.6,411.1,308.6L244,308.6 L244,225.9L479.9,225.9C482.3,238.9,488,261.8,488,261.8Z" fill="none"/>
            </g>
        </g>
    </svg>
);


export default function SignInModal({ isOpen, onClose, onSuccess }: SignInModalProps) {
  const auth = getAuth(firebaseApp);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      await fetch('/api/auth/session-login', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      onSuccess();
      onClose();

    } catch (error) {
      console.error("Firebase sign-in error:", error);
      alert("Sign-in failed. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Almost there!</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to spark your itinerary and join the community.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Button onClick={handleSignIn} className="w-full" size="lg" variant="outline">
            <GoogleIcon />
            Sign in with Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}